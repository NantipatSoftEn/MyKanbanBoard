-- Create the tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('todo', 'inprogress', 'done')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date DATE,
  assignee TEXT
);

-- Create an index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Insert some sample data
INSERT INTO tasks (title, description, status, priority, due_date) VALUES
('Design new landing page', 'Create a modern, responsive landing page with hero section and call-to-action', 'todo', 'high', '2024-01-15'),
('Fix login bug', 'Users are unable to login with Google OAuth. Need to debug the authentication flow', 'todo', 'medium', '2024-01-10'),
('Update documentation', 'Update the API documentation with new endpoints and examples', 'todo', 'low', '2024-01-20'),
('Implement user dashboard', 'Create a comprehensive dashboard showing user analytics and recent activity', 'inprogress', 'high', '2024-01-12'),
('Setup CI/CD pipeline', 'Configure GitHub Actions for automated testing and deployment', 'inprogress', 'medium', '2024-01-18'),
('Setup project structure', 'Initialize the project with proper folder structure and dependencies', 'done', 'low', '2024-01-05'),
('Create initial components', 'Build the basic UI components using shadcn/ui', 'done', 'medium', '2024-01-08');
