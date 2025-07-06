-- Insert mock tasks into the tasks table for demonstration
-- These will be visible to everyone (no user_id specified for public viewing)

INSERT INTO tasks (title, description, status, priority, due_date, assignee, position) VALUES
-- To Do Tasks
('Design new landing page', 'Create a modern, responsive landing page with hero section, call-to-action buttons, and mobile optimization', 'todo', 'high', CURRENT_DATE + INTERVAL '7 days', 'John Doe', 1),
('Fix login authentication bug', 'Users are unable to login with Google OAuth. Debug the authentication flow and fix redirect issues in production', 'todo', 'medium', CURRENT_DATE + INTERVAL '3 days', 'Jane Smith', 2),
('Update API documentation', 'Update the REST API documentation with new endpoints, request/response examples, and authentication details', 'todo', 'low', CURRENT_DATE + INTERVAL '14 days', 'Alex Johnson', 3),
('Implement search functionality', 'Add global search feature with filters, sorting, and real-time results across all content types', 'todo', 'medium', CURRENT_DATE + INTERVAL '10 days', 'Sarah Wilson', 4),
('Setup monitoring alerts', 'Configure application monitoring with alerts for errors, performance issues, and downtime notifications', 'todo', 'high', CURRENT_DATE + INTERVAL '5 days', NULL, 5),

-- In Progress Tasks
('Implement user dashboard', 'Create a comprehensive user dashboard showing analytics, recent activity, user preferences, and personalized content', 'inprogress', 'high', CURRENT_DATE + INTERVAL '5 days', 'Mike Johnson', 1),
('Setup CI/CD pipeline', 'Configure GitHub Actions for automated testing, building, and deployment to staging and production environments', 'inprogress', 'medium', CURRENT_DATE + INTERVAL '8 days', 'Sarah Wilson', 2),
('Database optimization', 'Optimize database queries, add proper indexing, and implement caching strategies for better performance', 'inprogress', 'medium', CURRENT_DATE + INTERVAL '12 days', 'David Chen', 3),
('Mobile app development', 'Develop React Native mobile application with core features and offline synchronization capabilities', 'inprogress', 'high', CURRENT_DATE + INTERVAL '21 days', 'Emily Rodriguez', 4),

-- Done Tasks
('Setup project structure', 'Initialize the project with proper folder structure, dependencies, linting rules, and development environment', 'done', 'low', CURRENT_DATE - INTERVAL '5 days', 'John Doe', 1),
('Create initial UI components', 'Build the basic UI components using shadcn/ui library with proper styling, accessibility, and documentation', 'done', 'medium', CURRENT_DATE - INTERVAL '2 days', 'Jane Smith', 2),
('Setup authentication system', 'Implement user authentication with email/password, social login, and secure session management', 'done', 'high', CURRENT_DATE - INTERVAL '8 days', 'Mike Johnson', 3),
('Configure development environment', 'Setup development tools, environment variables, database connections, and local development workflow', 'done', 'low', CURRENT_DATE - INTERVAL '12 days', 'Alex Johnson', 4),
('Design system creation', 'Create comprehensive design system with colors, typography, spacing, and component guidelines', 'done', 'medium', CURRENT_DATE - INTERVAL '15 days', 'Emily Rodriguez', 5),
('Security audit', 'Conduct thorough security review, implement best practices, and fix identified vulnerabilities', 'done', 'high', CURRENT_DATE - INTERVAL '3 days', 'David Chen', 6);
