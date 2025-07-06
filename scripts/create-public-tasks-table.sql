-- Create tasks table that allows public viewing but requires auth for modifications
-- This version allows anyone to see tasks but only authenticated users can modify them

-- Drop existing table if it exists
DROP TABLE IF EXISTS tasks CASCADE;

-- Create the tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('todo', 'inprogress', 'done')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date DATE,
  assignee TEXT,
  position INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE -- Allow public viewing of demo tasks
);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view public tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;

-- Policy to allow anyone to view public tasks or their own tasks
CREATE POLICY "Anyone can view public tasks" ON tasks
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- Policy to allow users to insert their own tasks
CREATE POLICY "Users can insert their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own tasks
CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy to allow users to delete their own tasks
CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);
CREATE INDEX IF NOT EXISTS tasks_created_at_idx ON tasks(created_at);
CREATE INDEX IF NOT EXISTS tasks_is_public_idx ON tasks(is_public);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert demo/mock data that everyone can see
INSERT INTO tasks (title, description, status, priority, due_date, assignee, position, is_public) VALUES
-- To Do Tasks
('Design new landing page', 'Create a modern, responsive landing page with hero section, call-to-action buttons, and mobile optimization', 'todo', 'high', CURRENT_DATE + INTERVAL '7 days', 'John Doe', 1, true),
('Fix login authentication bug', 'Users are unable to login with Google OAuth. Debug the authentication flow and fix redirect issues in production', 'todo', 'medium', CURRENT_DATE + INTERVAL '3 days', 'Jane Smith', 2, true),
('Update API documentation', 'Update the REST API documentation with new endpoints, request/response examples, and authentication details', 'todo', 'low', CURRENT_DATE + INTERVAL '14 days', 'Alex Johnson', 3, true),
('Implement search functionality', 'Add global search feature with filters, sorting, and real-time results across all content types', 'todo', 'medium', CURRENT_DATE + INTERVAL '10 days', 'Sarah Wilson', 4, true),
('Setup monitoring alerts', 'Configure application monitoring with alerts for errors, performance issues, and downtime notifications', 'todo', 'high', CURRENT_DATE + INTERVAL '5 days', NULL, 5, true),

-- In Progress Tasks
('Implement user dashboard', 'Create a comprehensive user dashboard showing analytics, recent activity, user preferences, and personalized content', 'inprogress', 'high', CURRENT_DATE + INTERVAL '5 days', 'Mike Johnson', 1, true),
('Setup CI/CD pipeline', 'Configure GitHub Actions for automated testing, building, and deployment to staging and production environments', 'inprogress', 'medium', CURRENT_DATE + INTERVAL '8 days', 'Sarah Wilson', 2, true),
('Database optimization', 'Optimize database queries, add proper indexing, and implement caching strategies for better performance', 'inprogress', 'medium', CURRENT_DATE + INTERVAL '12 days', 'David Chen', 3, true),
('Mobile app development', 'Develop React Native mobile application with core features and offline synchronization capabilities', 'inprogress', 'high', CURRENT_DATE + INTERVAL '21 days', 'Emily Rodriguez', 4, true),

-- Done Tasks
('Setup project structure', 'Initialize the project with proper folder structure, dependencies, linting rules, and development environment', 'done', 'low', CURRENT_DATE - INTERVAL '5 days', 'John Doe', 1, true),
('Create initial UI components', 'Build the basic UI components using shadcn/ui library with proper styling, accessibility, and documentation', 'done', 'medium', CURRENT_DATE - INTERVAL '2 days', 'Jane Smith', 2, true),
('Setup authentication system', 'Implement user authentication with email/password, social login, and secure session management', 'done', 'high', CURRENT_DATE - INTERVAL '8 days', 'Mike Johnson', 3, true),
('Configure development environment', 'Setup development tools, environment variables, database connections, and local development workflow', 'done', 'low', CURRENT_DATE - INTERVAL '12 days', 'Alex Johnson', 4, true),
('Design system creation', 'Create comprehensive design system with colors, typography, spacing, and component guidelines', 'done', 'medium', CURRENT_DATE - INTERVAL '15 days', 'Emily Rodriguez', 5, true),
('Security audit', 'Conduct thorough security review, implement best practices, and fix identified vulnerabilities', 'done', 'high', CURRENT_DATE - INTERVAL '3 days', 'David Chen', 6, true);
