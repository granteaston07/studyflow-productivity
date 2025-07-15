import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  Calendar,
  BookOpen,
  RotateCcw
} from "lucide-react";

interface GoogleClassroomConnection {
  id: string;
  created_at: string;
  updated_at: string;
}

export function GoogleClassroomSync() {
  const [connection, setConnection] = useState<GoogleClassroomConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('google_classroom_connections')
        .select('id, created_at, updated_at')
        .single();

      if (!error && data) {
        setConnection(data);
        setLastSync(data.updated_at);
      }
    } catch (error) {
      // No connection exists, which is fine
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Generate Google OAuth URL
      const clientId = "YOUR_GOOGLE_CLIENT_ID"; // This should come from environment
      const redirectUri = `${window.location.origin}/auth/google-classroom`;
      const scope = "https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me.readonly";
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `access_type=offline&` +
        `prompt=consent`;

      // Open Google OAuth in new window
      const popup = window.open(authUrl, 'google-classroom-auth', 'width=600,height=600');
      
      // Listen for the authorization code
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          setIsConnecting(false);
          checkConnection(); // Check if connection was successful
        }
      }, 1000);

    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Google Classroom. Please try again.",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const handleSync = async () => {
    if (!connection) return;

    setIsSyncing(true);
    setSyncProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const { data, error } = await supabase.functions.invoke('google-classroom-sync', {
        body: { action: 'sync' }
      });

      clearInterval(progressInterval);
      setSyncProgress(100);

      if (error) throw error;

      toast({
        title: "Sync Completed",
        description: `Imported ${data.imported} new assignments from ${data.total} total assignments.`,
      });

      setLastSync(new Date().toISOString());
      
      // Reset progress after a short delay
      setTimeout(() => setSyncProgress(0), 1000);

    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync with Google Classroom. Please try again.",
        variant: "destructive",
      });
      setSyncProgress(0);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const { error } = await supabase
        .from('google_classroom_connections')
        .delete()
        .eq('id', connection?.id);

      if (error) throw error;

      setConnection(null);
      setLastSync(null);
      
      toast({
        title: "Disconnected",
        description: "Google Classroom has been disconnected from your account.",
      });
    } catch (error) {
      console.error('Disconnect error:', error);
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect Google Classroom. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Google Classroom Integration
        </CardTitle>
        <CardDescription>
          Import assignments from Google Classroom and sync them with your StudyFlow tasks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!connection ? (
          <div className="text-center space-y-4">
            <div className="p-6 border-2 border-dashed border-border rounded-lg">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-medium mb-2">Connect Google Classroom</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Import your assignments and keep them synced with StudyFlow
              </p>
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting}
                className="flex items-center gap-2"
              >
                {isConnecting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                {isConnecting ? 'Connecting...' : 'Connect Google Classroom'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="font-medium">Connected to Google Classroom</span>
              </div>
              <Badge variant="outline" className="text-success border-success/30">
                Active
              </Badge>
            </div>

            {lastSync && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Last synced: {new Date(lastSync).toLocaleString()}
              </div>
            )}

            {isSyncing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <RotateCcw className="h-4 w-4 animate-spin" />
                  Syncing assignments...
                </div>
                <Progress value={syncProgress} className="h-2" />
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleSync} 
                disabled={isSyncing}
                className="flex items-center gap-2"
              >
                {isSyncing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleDisconnect}
                className="flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Disconnect
              </Button>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Sync Settings</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Assignments are imported as StudyFlow tasks</p>
                <p>• Due dates and course names are preserved</p>
                <p>• Priority is automatically assigned based on due dates</p>
                <p>• Existing assignments won't be duplicated</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}