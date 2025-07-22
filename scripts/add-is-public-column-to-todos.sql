-- Add is_public column to existing todos table
ALTER TABLE todos ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Update existing todos to be public by default
UPDATE todos SET is_public = true WHERE is_public IS NULL;

-- Update RLS policies to handle public/private todos
DROP POLICY IF EXISTS "Users can view their own todos" ON todos;
DROP POLICY IF EXISTS "Users can insert their own todos" ON todos;
DROP POLICY IF EXISTS "Users can update their own todos" ON todos;
DROP POLICY IF EXISTS "Users can delete their own todos" ON todos;

-- Create new RLS policies for public/private todos
CREATE POLICY "Users can view public todos and their own todos" ON todos
    FOR SELECT USING (
        is_public = true OR 
        (auth.uid() IS NOT NULL AND user_id = auth.uid())
    );

CREATE POLICY "Authenticated users can insert todos" ON todos
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can update their own todos" ON todos
    FOR UPDATE USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
    WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can delete their own todos" ON todos
    FOR DELETE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Create index for better performance on public todos
CREATE INDEX IF NOT EXISTS idx_todos_is_public ON todos(is_public);
CREATE INDEX IF NOT EXISTS idx_todos_user_id_is_public ON todos(user_id, is_public);
