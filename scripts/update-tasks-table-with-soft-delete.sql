-- Add soft delete column to existing tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for soft delete queries
CREATE INDEX IF NOT EXISTS tasks_deleted_at_idx ON tasks(deleted_at);

-- Update the RLS policies to exclude soft deleted tasks
DROP POLICY IF EXISTS "Anyone can view public tasks" ON tasks;

-- Policy to allow anyone to view public tasks that are not soft deleted
CREATE POLICY "Anyone can view public tasks" ON tasks
  FOR SELECT USING ((is_public = true OR auth.uid() = user_id) AND deleted_at IS NULL);

-- Create a function to soft delete tasks
CREATE OR REPLACE FUNCTION soft_delete_task(task_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tasks 
  SET deleted_at = NOW(), updated_at = NOW()
  WHERE id = task_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to restore soft deleted tasks
CREATE OR REPLACE FUNCTION restore_task(task_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tasks 
  SET deleted_at = NULL, updated_at = NOW()
  WHERE id = task_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to permanently delete old soft deleted tasks (optional cleanup)
CREATE OR REPLACE FUNCTION cleanup_deleted_tasks(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM tasks 
  WHERE deleted_at IS NOT NULL 
    AND deleted_at < NOW() - INTERVAL '1 day' * days_old;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
