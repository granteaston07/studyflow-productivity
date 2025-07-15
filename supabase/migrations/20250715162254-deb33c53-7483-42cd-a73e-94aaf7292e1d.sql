-- Enable pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the cleanup function to run every Sunday at midnight
SELECT cron.schedule(
  'cleanup-completed-tasks-weekly',
  '0 0 * * 0', -- Every Sunday at midnight
  $$
  SELECT
    net.http_post(
        url:='https://kofbhggloaapndnuhmsc.supabase.co/functions/v1/cleanup-completed-tasks',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZmJoZ2dsb2FhcG5kbnVobXNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDcxMDYsImV4cCI6MjA2ODA4MzEwNn0.ORLPL24zaSFTpzLiOIBuuDTkpMX8jsbqfb4JpAaZ8-A"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);