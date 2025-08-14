export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      google_classroom_connections: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          refresh_token: string
          scope: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id?: string
          refresh_token: string
          scope: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          refresh_token?: string
          scope?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_calendar_goals: {
        Row: {
          color: string
          completed_dates: Json | null
          created_at: string
          description: string | null
          frequency: string
          id: string
          month_date: number | null
          repeat_count: number | null
          repeat_end_date: string | null
          repeat_interval: number | null
          target_value: number
          title: string
          unit: string
          updated_at: string
          user_id: string
          week_day: number | null
        }
        Insert: {
          color: string
          completed_dates?: Json | null
          created_at?: string
          description?: string | null
          frequency: string
          id?: string
          month_date?: number | null
          repeat_count?: number | null
          repeat_end_date?: string | null
          repeat_interval?: number | null
          target_value?: number
          title: string
          unit?: string
          updated_at?: string
          user_id: string
          week_day?: number | null
        }
        Update: {
          color?: string
          completed_dates?: Json | null
          created_at?: string
          description?: string | null
          frequency?: string
          id?: string
          month_date?: number | null
          repeat_count?: number | null
          repeat_end_date?: string | null
          repeat_interval?: number | null
          target_value?: number
          title?: string
          unit?: string
          updated_at?: string
          user_id?: string
          week_day?: number | null
        }
        Relationships: []
      }
      study_goals: {
        Row: {
          completed: boolean
          created_at: string
          current_progress: number
          description: string | null
          end_date: string | null
          id: string
          start_date: string
          target_period: string
          target_type: string
          target_value: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          current_progress?: number
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string
          target_period?: string
          target_type?: string
          target_value: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          current_progress?: number
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string
          target_period?: string
          target_type?: string
          target_value?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          break_time: number
          completed: boolean | null
          created_at: string
          duration: number
          focus_time: number
          id: string
          session_type: string | null
          task_id: string | null
          user_id: string
        }
        Insert: {
          break_time?: number
          completed?: boolean | null
          created_at?: string
          duration: number
          focus_time?: number
          id?: string
          session_type?: string | null
          task_id?: string | null
          user_id: string
        }
        Update: {
          break_time?: number
          completed?: boolean | null
          created_at?: string
          duration?: number
          focus_time?: number
          id?: string
          session_type?: string | null
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      study_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          streak_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          streak_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          streak_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suggestion_interactions: {
        Row: {
          created_at: string
          effectiveness_rating: number | null
          id: string
          suggestion_technique: string
          task_id: string | null
          user_id: string
          was_used: boolean | null
        }
        Insert: {
          created_at?: string
          effectiveness_rating?: number | null
          id?: string
          suggestion_technique: string
          task_id?: string | null
          user_id: string
          was_used?: boolean | null
        }
        Update: {
          created_at?: string
          effectiveness_rating?: number | null
          id?: string
          suggestion_technique?: string
          task_id?: string | null
          user_id?: string
          was_used?: boolean | null
        }
        Relationships: []
      }
      task_feedback: {
        Row: {
          completion_technique: string | null
          created_at: string
          difficulty_rating: number
          helpful_factors: string[] | null
          id: string
          subject: string | null
          task_id: string | null
          task_keywords: string[] | null
          time_taken_minutes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completion_technique?: string | null
          created_at?: string
          difficulty_rating: number
          helpful_factors?: string[] | null
          id?: string
          subject?: string | null
          task_id?: string | null
          task_keywords?: string[] | null
          time_taken_minutes: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completion_technique?: string | null
          created_at?: string
          difficulty_rating?: number
          helpful_factors?: string[] | null
          id?: string
          subject?: string | null
          task_id?: string | null
          task_keywords?: string[] | null
          time_taken_minutes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          google_classroom_id: string | null
          google_course_id: string | null
          id: string
          parent_task_id: string | null
          priority: string | null
          repeat_count: number | null
          repeat_end_date: string | null
          repeat_interval: number | null
          repeat_type: string | null
          sort_order: number | null
          source: string | null
          status: string | null
          subject: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          google_classroom_id?: string | null
          google_course_id?: string | null
          id?: string
          parent_task_id?: string | null
          priority?: string | null
          repeat_count?: number | null
          repeat_end_date?: string | null
          repeat_interval?: number | null
          repeat_type?: string | null
          sort_order?: number | null
          source?: string | null
          status?: string | null
          subject?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          google_classroom_id?: string | null
          google_course_id?: string | null
          id?: string
          parent_task_id?: string | null
          priority?: string | null
          repeat_count?: number | null
          repeat_end_date?: string | null
          repeat_interval?: number | null
          repeat_type?: string | null
          sort_order?: number | null
          source?: string | null
          status?: string | null
          subject?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_behavior_patterns: {
        Row: {
          avg_difficulty_rating: number | null
          avg_time_per_task: number | null
          created_at: string
          id: string
          last_analyzed_at: string
          optimal_study_times: number[] | null
          preferred_techniques: string[] | null
          subject: string | null
          success_patterns: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_difficulty_rating?: number | null
          avg_time_per_task?: number | null
          created_at?: string
          id?: string
          last_analyzed_at?: string
          optimal_study_times?: number[] | null
          preferred_techniques?: string[] | null
          subject?: string | null
          success_patterns?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_difficulty_rating?: number | null
          avg_time_per_task?: number | null
          created_at?: string
          id?: string
          last_analyzed_at?: string
          optimal_study_times?: number[] | null
          preferred_techniques?: string[] | null
          subject?: string | null
          success_patterns?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_goal_progress: {
        Args: { p_goal_type: string; p_increment?: number; p_user_id: string }
        Returns: undefined
      }
      update_study_streak: {
        Args: { p_streak_type?: string; p_user_id: string }
        Returns: undefined
      }
      update_user_behavior_patterns: {
        Args: { p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
