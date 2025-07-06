import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Task {
  id: string
  title: string
  description?: string | null
  status: "todo" | "inprogress" | "done"
  priority: "low" | "medium" | "high"
  created_at: string
  updated_at: string
  due_date?: string | null
  assignee?: string | null
  position: number
}

export interface Column {
  id: string
  title: string
  tasks: Task[]
}

// Mock data for fallback
export const mockTasks: Task[] = [
  {
    id: "mock-1",
    title: "Design new landing page",
    description: "Create a modern, responsive landing page with hero section and call-to-action buttons",
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
    description: "Users are unable to login with Google OAuth. Debug the authentication flow and fix redirect issues",
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
    assignee: null,
    position: 3,
  },
  {
    id: "mock-4",
    title: "Implement user dashboard",
    description: "Create a comprehensive user dashboard showing analytics, recent activity, and user preferences",
    status: "inprogress",
    priority: "high",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    assignee: "Mike Johnson",
    position: 1,
  },
  {
    id: "mock-5",
    title: "Setup CI/CD pipeline",
    description: "Configure GitHub Actions for automated testing, building, and deployment to production",
    status: "inprogress",
    priority: "medium",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    assignee: "Sarah Wilson",
    position: 2,
  },
  {
    id: "mock-6",
    title: "Setup project structure",
    description: "Initialize the project with proper folder structure, dependencies, and development environment",
    status: "done",
    priority: "low",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    assignee: "John Doe",
    position: 1,
  },
  {
    id: "mock-7",
    title: "Create initial UI components",
    description: "Build the basic UI components using shadcn/ui library with proper styling and accessibility",
    status: "done",
    priority: "medium",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    assignee: "Jane Smith",
    position: 2,
  },
]

// Database operations with better error handling
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

  // Get all tasks
  async getAllTasks(): Promise<Task[]> {
    const { data, error } = await supabase.from("tasks").select("*").order("position", { ascending: true })

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Database error: ${error.message}`)
    }
    return data || []
  },

  // Create a new task
  async createTask(task: Omit<Task, "id" | "created_at" | "updated_at">): Promise<Task> {
    const { data, error } = await supabase.from("tasks").insert([task]).select().single()

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Failed to create task: ${error.message}`)
    }
    return data
  },

  // Update a task
  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase.from("tasks").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Failed to update task: ${error.message}`)
    }
    return data
  },

  // Delete a task
  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase.from("tasks").delete().eq("id", id)

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Failed to delete task: ${error.message}`)
    }
  },

  // Update task status (for drag and drop)
  async updateTaskStatus(id: string, status: Task["status"]): Promise<Task> {
    const { data, error } = await supabase
      .from("tasks")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Failed to update task status: ${error.message}`)
    }
    return data
  },
}
