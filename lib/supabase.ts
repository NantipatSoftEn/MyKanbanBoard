import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Task {
  id: string
  user_id?: string
  title: string
  description?: string | null
  status: "todo" | "inprogress" | "done"
  priority: "low" | "medium" | "high"
  created_at: string
  updated_at: string
  due_date?: string | null
  assignee?: string | null
  position: number
  is_public?: boolean
}

export interface Column {
  id: string
  title: string
  tasks: Task[]
}

// Mock data for fallback (same as database mock data)
export const mockTasks: Task[] = [
  {
    id: "mock-1",
    title: "Design new landing page",
    description:
      "Create a modern, responsive landing page with hero section, call-to-action buttons, and mobile optimization",
    status: "todo",
    priority: "high",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    assignee: "John Doe",
    position: 1,
  },
  {
    id: "mock-2",
    title: "Fix login authentication bug",
    description:
      "Users are unable to login with Google OAuth. Debug the authentication flow and fix redirect issues in production",
    status: "todo",
    priority: "medium",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    assignee: "Jane Smith",
    position: 2,
  },
  {
    id: "mock-3",
    title: "Update API documentation",
    description:
      "Update the REST API documentation with new endpoints, request/response examples, and authentication details",
    status: "todo",
    priority: "low",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    assignee: "Alex Johnson",
    position: 3,
  },
  {
    id: "mock-4",
    title: "Implement search functionality",
    description: "Add global search feature with filters, sorting, and real-time results across all content types",
    status: "todo",
    priority: "medium",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    assignee: "Sarah Wilson",
    position: 4,
  },
  {
    id: "mock-5",
    title: "Setup monitoring alerts",
    description:
      "Configure application monitoring with alerts for errors, performance issues, and downtime notifications",
    status: "todo",
    priority: "high",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    assignee: null,
    position: 5,
  },
  {
    id: "mock-6",
    title: "Implement user dashboard",
    description:
      "Create a comprehensive user dashboard showing analytics, recent activity, user preferences, and personalized content",
    status: "inprogress",
    priority: "high",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    assignee: "Mike Johnson",
    position: 1,
  },
  {
    id: "mock-7",
    title: "Setup CI/CD pipeline",
    description:
      "Configure GitHub Actions for automated testing, building, and deployment to staging and production environments",
    status: "inprogress",
    priority: "medium",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    due_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    assignee: "Sarah Wilson",
    position: 2,
  },
  {
    id: "mock-8",
    title: "Database optimization",
    description:
      "Optimize database queries, add proper indexing, and implement caching strategies for better performance",
    status: "inprogress",
    priority: "medium",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    due_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    assignee: "David Chen",
    position: 3,
  },
  {
    id: "mock-9",
    title: "Mobile app development",
    description: "Develop React Native mobile application with core features and offline synchronization capabilities",
    status: "inprogress",
    priority: "high",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    assignee: "Emily Rodriguez",
    position: 4,
  },
  {
    id: "mock-10",
    title: "Setup project structure",
    description:
      "Initialize the project with proper folder structure, dependencies, linting rules, and development environment",
    status: "done",
    priority: "low",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    assignee: "John Doe",
    position: 1,
  },
  {
    id: "mock-11",
    title: "Create initial UI components",
    description:
      "Build the basic UI components using shadcn/ui library with proper styling, accessibility, and documentation",
    status: "done",
    priority: "medium",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    assignee: "Jane Smith",
    position: 2,
  },
  {
    id: "mock-12",
    title: "Setup authentication system",
    description: "Implement user authentication with email/password, social login, and secure session management",
    status: "done",
    priority: "high",
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    due_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    assignee: "Mike Johnson",
    position: 3,
  },
]

// Database operations with user authentication
export const taskOperations = {
  // Check if the tasks table exists
  async checkTableExists(): Promise<boolean> {
    try {
      const { error } = await supabase.from("tasks").select("count").limit(1)
      return !error
    } catch {
      return false
    }
  },

  // Get all public tasks and user's private tasks
  async getAllTasks(): Promise<Task[]> {
    // This will get public tasks (is_public = true) and user's own tasks if authenticated
    const { data, error } = await supabase.from("tasks").select("*").order("position", { ascending: true })

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Database error: ${error.message}`)
    }
    return data || []
  },

  // Create a new task (requires authentication)
  async createTask(task: Omit<Task, "id" | "created_at" | "updated_at" | "user_id" | "is_public">): Promise<Task> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Authentication required to create tasks")
    }

    const taskWithUser = {
      ...task,
      user_id: user.id,
      is_public: false, // User tasks are private by default
    }

    const { data, error } = await supabase.from("tasks").insert([taskWithUser]).select().single()

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Failed to create task: ${error.message}`)
    }
    return data
  },

  // Update a task (requires authentication and ownership)
  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Authentication required to update tasks")
    }

    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Failed to update task: ${error.message}`)
    }
    return data
  },

  // Delete a task (requires authentication and ownership)
  async deleteTask(id: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Authentication required to delete tasks")
    }

    const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Failed to delete task: ${error.message}`)
    }
  },

  // Update task status (requires authentication and ownership)
  async updateTaskStatus(id: string, status: Task["status"]): Promise<Task> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Authentication required to update tasks")
    }

    const { data, error } = await supabase
      .from("tasks")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Failed to update task status: ${error.message}`)
    }
    return data
  },
}
