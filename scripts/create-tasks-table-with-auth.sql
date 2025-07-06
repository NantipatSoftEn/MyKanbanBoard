-- Enable Row Level Security
ALTER TABLE IF EXISTS tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing table if it exists (for clean setup)
DROP TABLE IF EXISTS tasks CASCADE;

-- Create the tasks table for the Kanban board with user authentication
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('todo', 'inprogress', 'done')) DEFAULT 'todo',
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date DATE,
  assignee TEXT,
  position INTEGER DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at when a task is modified
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security policies
-- Users can only see and modify their own tasks
CREATE POLICY "Users can view their own tasks" ON tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Insert some sample tasks for the authenticated user
-- Note: These will only be visible to the user who creates them
INSERT INTO tasks (user_id, title, description, status, priority, due_date, assignee, position) VALUES
(auth.uid(), 'Design new landing page', 'Create a modern, responsive landing page with hero section and call-to-action buttons', 'todo', 'high', CURRENT_DATE + INTERVAL '7 days', 'John Doe', 1),
(auth.uid(), 'Fix login authentication bug', 'Users are unable to login with Google OAuth. Debug the authentication flow and fix redirect issues', 'todo', 'medium', CURRENT_DATE + INTERVAL '3 days', 'Jane Smith', 2),
(auth.uid(), 'Update API documentation', 'Update the REST API documentation with new endpoints, request/response examples, and authentication details', 'todo', 'low', CURRENT_DATE + INTERVAL '14 days', NULL, 3),
(auth.uid(), 'Implement user dashboard', 'Create a comprehensive user dashboard showing analytics, recent activity, and user preferences', 'inprogress', 'high', CURRENT_DATE + INTERVAL '5 days', 'Mike Johnson', 1),
(auth.uid(), 'Setup CI/CD pipeline', 'Configure GitHub Actions for automated testing, building, and deployment to production', 'inprogress', 'medium', CURRENT_DATE + INTERVAL '10 days', 'Sarah Wilson', 2),
(auth.uid(), 'Setup project structure', 'Initialize the project with proper folder structure, dependencies, and development environment', 'done', 'low', CURRENT_DATE - INTERVAL '5 days', 'John Doe', 1),
(auth.uid(), 'Create initial UI components', 'Build the basic UI components using shadcn/ui library with proper styling and accessibility', 'done', 'medium', CURRENT_DATE - INTERVAL '2 days', 'Jane Smith', 2);
