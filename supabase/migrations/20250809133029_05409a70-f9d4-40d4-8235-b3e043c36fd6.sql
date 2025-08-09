-- Allow users to delete their own task feedback
CREATE POLICY "Users can delete their own task feedback"
ON public.task_feedback
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
