-- Add soft delete columns to existing tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Update existing tasks to set is_deleted = false where it's null
UPDATE tasks SET is_deleted = FALSE WHERE is_deleted IS NULL;

-- Create indexes for better performance on soft delete queries
CREATE INDEX IF NOT EXISTS tasks_is_deleted_idx ON tasks(is_deleted);
CREATE INDEX IF NOT EXISTS tasks_deleted_at_idx ON tasks(deleted_at);

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view public tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;

-- Create comprehensive RLS policies

-- 1. SELECT: Users can view public tasks and their own non-deleted tasks
CREATE POLICY "Users can view tasks" ON tasks
  FOR SELECT USING (
    (is_public = true AND (is_deleted = false OR is_deleted IS NULL)) 
    OR 
    (auth.uid() = user_id AND (is_deleted = false OR is_deleted IS NULL))
  );

-- 2. INSERT: Only authenticated users can create tasks
CREATE POLICY "Authenticated users can insert tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- 3. UPDATE: Only authenticated users can update their own tasks
CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- 4. DELETE: Only authenticated users can delete their own tasks (for hard delete if needed)
CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- Ensure RLS is enabled on the tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create a view for active (non-deleted) tasks
CREATE OR REPLACE VIEW active_tasks AS
SELECT * FROM tasks 
WHERE is_deleted = FALSE OR is_deleted IS NULL;

-- Grant permissions on the view
GRANT SELECT ON active_tasks TO authenticated;
GRANT SELECT ON active_tasks TO anon;

-- Create helper functions for soft delete operations
CREATE OR REPLACE FUNCTION soft_delete_task(task_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tasks 
  SET 
    is_deleted = TRUE,
    deleted_at = NOW(), 
    updated_at = NOW()
  WHERE id = task_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to restore soft deleted tasks
CREATE OR REPLACE FUNCTION restore_task(task_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tasks 
  SET 
    is_deleted = FALSE,
    deleted_at = NULL, 
    updated_at = NOW()
  WHERE id = task_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to permanently delete old soft deleted tasks (cleanup)
CREATE OR REPLACE FUNCTION cleanup_deleted_tasks(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM tasks 
  WHERE is_deleted = TRUE 
    AND deleted_at IS NOT NULL
    AND deleted_at < NOW() - INTERVAL '1 day' * days_old;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
