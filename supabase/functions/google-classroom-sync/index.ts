import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleClassroomAssignment {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  dueTime?: {
    hours: number;
    minutes: number;
  };
  courseName?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action } = await req.json();

    if (action === 'connect') {
      const { code } = await req.json();
      
      // Exchange authorization code for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: Deno.env.get('GOOGLE_CLIENT_ID') ?? '',
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '',
          redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-classroom-sync`,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        throw new Error(`Token exchange failed: ${tokenData.error_description}`);
      }

      // Store the connection
      const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
      
      const { error: connectionError } = await supabaseClient
        .from('google_classroom_connections')
        .upsert({
          user_id: user.id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: expiresAt.toISOString(),
          scope: tokenData.scope,
        });

      if (connectionError) {
        throw new Error(`Failed to store connection: ${connectionError.message}`);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'sync') {
      // Get the user's Google Classroom connection
      const { data: connection, error: connectionError } = await supabaseClient
        .from('google_classroom_connections')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (connectionError || !connection) {
        return new Response(JSON.stringify({ error: 'No Google Classroom connection found' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check if token needs refresh
      const now = new Date();
      const expiresAt = new Date(connection.expires_at);
      
      let accessToken = connection.access_token;
      
      if (now >= expiresAt) {
        // Refresh the token
        const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            refresh_token: connection.refresh_token,
            client_id: Deno.env.get('GOOGLE_CLIENT_ID') ?? '',
            client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '',
            grant_type: 'refresh_token',
          }),
        });

        const refreshData = await refreshResponse.json();
        
        if (!refreshResponse.ok) {
          throw new Error(`Token refresh failed: ${refreshData.error_description}`);
        }

        accessToken = refreshData.access_token;
        
        // Update the stored token
        await supabaseClient
          .from('google_classroom_connections')
          .update({
            access_token: accessToken,
            expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
          })
          .eq('user_id', user.id);
      }

      // Fetch courses from Google Classroom
      const coursesResponse = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const coursesData = await coursesResponse.json();
      
      if (!coursesResponse.ok) {
        throw new Error(`Failed to fetch courses: ${coursesData.error.message}`);
      }

      const assignments: GoogleClassroomAssignment[] = [];

      // Fetch assignments for each course
      for (const course of coursesData.courses || []) {
        const assignmentsResponse = await fetch(
          `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (assignmentsResponse.ok) {
          const assignmentsData = await assignmentsResponse.json();
          for (const assignment of assignmentsData.courseWork || []) {
            assignments.push({
              ...assignment,
              courseName: course.name,
            });
          }
        }
      }

      // Convert assignments to StudyFlow tasks
      const tasks = assignments.map((assignment) => {
        let dueDate: string | null = null;
        
        if (assignment.dueDate) {
          const date = new Date(
            assignment.dueDate.year,
            assignment.dueDate.month - 1,
            assignment.dueDate.day
          );
          
          if (assignment.dueTime) {
            date.setHours(assignment.dueTime.hours, assignment.dueTime.minutes);
          }
          
          dueDate = date.toISOString();
        }

        // Determine priority based on due date
        let priority = 'medium';
        if (dueDate) {
          const daysUntilDue = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          if (daysUntilDue <= 1) priority = 'urgent';
          else if (daysUntilDue <= 3) priority = 'high';
          else if (daysUntilDue <= 7) priority = 'medium';
          else priority = 'low';
        }

        return {
          user_id: user.id,
          title: assignment.title,
          subject: assignment.courseName || 'Google Classroom',
          description: assignment.description || null,
          due_date: dueDate,
          priority,
          status: 'pending',
          source: 'google_classroom',
          google_classroom_id: assignment.id,
          google_course_id: assignment.courseId,
        };
      });

      // Insert tasks that don't already exist
      const existingTasks = await supabaseClient
        .from('tasks')
        .select('google_classroom_id')
        .eq('user_id', user.id)
        .not('google_classroom_id', 'is', null);

      const existingIds = new Set(existingTasks.data?.map(t => t.google_classroom_id) || []);
      const newTasks = tasks.filter(task => !existingIds.has(task.google_classroom_id));

      if (newTasks.length > 0) {
        const { error: insertError } = await supabaseClient
          .from('tasks')
          .insert(newTasks);

        if (insertError) {
          throw new Error(`Failed to insert tasks: ${insertError.message}`);
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        imported: newTasks.length,
        total: assignments.length 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in google-classroom-sync function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});