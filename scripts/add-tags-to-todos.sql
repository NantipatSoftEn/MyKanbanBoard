-- Add tags functionality to todos table
-- This script adds tagging support with predefined tags and auto-creation capabilities

-- Step 1: Add tags column to todos table (if not exists)
DO $$ 
BEGIN
    -- Check if tags column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'todos' AND column_name = 'tags'
    ) THEN
        ALTER TABLE todos ADD COLUMN tags text[] DEFAULT '{}';
        
        -- Create index for efficient tag searching
        CREATE INDEX IF NOT EXISTS idx_todos_tags ON todos USING GIN (tags);
    END IF;
END $$;

-- Step 2: Create todo_tags table for tag management
CREATE TABLE IF NOT EXISTS todo_tags (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text UNIQUE NOT NULL,
    color text NOT NULL DEFAULT '#6b7280',
    icon text DEFAULT '🏷️',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 3: Insert predefined tags with exact specifications
INSERT INTO todo_tags (name, color, icon) VALUES
    ('youtube', '#ff0000', '📺'),
    ('facebook', '#1877f2', '📘'),
    ('book', '#8b5cf6', '📚'),
    ('anime', '#f59e0b', '🎌'),
    ('read', '#10b981', '📖'),
    ('watch', '#ef4444', '👀'),
    ('learn', '#3b82f6', '🎓'),
    ('work', '#6b7280', '💼')
ON CONFLICT (name) DO UPDATE SET
    color = EXCLUDED.color,
    icon = EXCLUDED.icon;

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_todo_tags_name ON todo_tags (name);

-- Step 5: Enable Row Level Security on todo_tags
ALTER TABLE todo_tags ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for todo_tags
-- Allow everyone to read tags
CREATE POLICY "Allow public read access to tags" ON todo_tags
    FOR SELECT USING (true);

-- Allow authenticated users to create new tags
CREATE POLICY "Allow authenticated users to create tags" ON todo_tags
    FOR INSERT TO authenticated WITH CHECK (true);

-- Step 7: Grant permissions
GRANT SELECT ON todo_tags TO anon, authenticated;
GRANT INSERT ON todo_tags TO authenticated;

-- Step 8: Create function to validate and normalize tags
CREATE OR REPLACE FUNCTION validate_todo_tags()
RETURNS TRIGGER AS $$
BEGIN
    -- Normalize tags: lowercase, trim whitespace, remove duplicates
    IF NEW.tags IS NOT NULL THEN
        NEW.tags := ARRAY(
            SELECT DISTINCT LOWER(TRIM(tag))
            FROM unnest(NEW.tags) AS tag
            WHERE TRIM(tag) != ''
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create trigger to automatically validate tags
DROP TRIGGER IF EXISTS validate_todo_tags_trigger ON todos;
CREATE TRIGGER validate_todo_tags_trigger
    BEFORE INSERT OR UPDATE ON todos
    FOR EACH ROW
    EXECUTE FUNCTION validate_todo_tags();

-- Step 10: Add helpful comments
COMMENT ON COLUMN todos.tags IS 'Array of tag names associated with this todo';
COMMENT ON TABLE todo_tags IS 'Master table of available tags with colors and icons';
COMMENT ON FUNCTION validate_todo_tags() IS 'Normalizes tag names to lowercase and removes duplicates';

-- Migration complete!
-- Users can now:
-- 1. Add tags to todos (existing or new tags will be auto-created)
-- 2. Filter todos by tags
-- 3. Search todos by tag names
-- 4. Create custom tags with random colors
-- 5. Use predefined tags with specific colors and icons
