import { createClient } from "@supabase/supabase-js";
import type { Database, Tables } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Use the database types for consistency
export type Task = Tables<'tasks'>
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

// Mock data for fallback (same as database mock data)
export const mockTasks: Task[] = [
  {
    id: "mock-1",
    user_id: null,
    title: "Design new landing page",
    description:
      "Create a modern, responsive landing page with hero section, call-to-action buttons, and mobile optimization",
    status: "todo",
    priority: "high",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    assignee: "John Doe",
    position: 1,
    is_public: true,
    deleted_at: null,
    is_deleted: false,
  },
  {
    id: "mock-2",
    user_id: null,
    title: "Fix login authentication bug",
    description:
      "Users are unable to login with Google OAuth. Debug the authentication flow and fix redirect issues in production",
    status: "todo",
    priority: "medium",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    assignee: "Jane Smith",
    position: 2,
    is_public: true,
    deleted_at: null,
    is_deleted: false,
  },
  {
    id: "mock-3",
    user_id: null,
    title: "Update API documentation",
    description:
      "Update the REST API documentation with new endpoints, request/response examples, and authentication details",
    status: "todo",
    priority: "low",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    assignee: "Alex Johnson",
    position: 3,
    is_public: true,
    deleted_at: null,
    is_deleted: false,
  },
  {
    id: "mock-4",
    user_id: null,
    title: "Implement search functionality",
    description:
      "Add global search feature with filters, sorting, and real-time results across all content types",
    status: "todo",
    priority: "medium",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    assignee: "Sarah Wilson",
    position: 4,
    is_public: true,
    deleted_at: null,
    is_deleted: false,
  },
  {
    id: "mock-5",
    user_id: null,
    title: "Setup monitoring alerts",
    description:
      "Configure application monitoring with alerts for errors, performance issues, and downtime notifications",
    status: "todo",
    priority: "high",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    assignee: null,
    position: 5,
    is_public: true,
    deleted_at: null,
    is_deleted: false,
  },
  {
    id: "mock-6",
    user_id: null,
    title: "Implement user dashboard",
    description:
      "Create a comprehensive user dashboard showing analytics, recent activity, user preferences, and personalized content",
    status: "inprogress",
    priority: "high",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    assignee: "Mike Johnson",
    position: 1,
    is_public: true,
    deleted_at: null,
    is_deleted: false,
  },
  {
    id: "mock-7",
    user_id: null,
    title: "Setup CI/CD pipeline",
    description:
      "Configure GitHub Actions for automated testing, building, and deployment to staging and production environments",
    status: "inprogress",
    priority: "medium",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    due_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    assignee: "Sarah Wilson",
    position: 2,
    is_public: true,
    deleted_at: null,
    is_deleted: false,
  },
  {
    id: "mock-8",
    user_id: null,
    title: "Database optimization",
    description:
      "Optimize database queries, add proper indexing, and implement caching strategies for better performance",
    status: "inprogress",
    priority: "medium",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    due_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    assignee: "David Chen",
    position: 3,
    is_public: true,
    deleted_at: null,
    is_deleted: false,
  },
  {
    id: "mock-9",
    user_id: null,
    title: "Mobile app development",
    description:
      "Develop React Native mobile application with core features and offline synchronization capabilities",
    status: "inprogress",
    priority: "high",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    assignee: "Emily Rodriguez",
    position: 4,
    is_public: true,
    deleted_at: null,
    is_deleted: false,
  },
  {
    id: "mock-10",
    user_id: null,
    title: "Setup project structure",
    description:
      "Initialize the project with proper folder structure, dependencies, linting rules, and development environment",
    status: "done",
    priority: "low",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    assignee: "John Doe",
    position: 1,
    is_public: true,
    deleted_at: null,
    is_deleted: false,
  },
  {
    id: "mock-11",
    user_id: null,
    title: "Create initial UI components",
    description:
      "Build the basic UI components using shadcn/ui library with proper styling, accessibility, and documentation",
    status: "done",
    priority: "medium",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    assignee: "Jane Smith",
    position: 2,
    is_public: true,
    deleted_at: null,
    is_deleted: false,
  },
  {
    id: "mock-12",
    user_id: null,
    title: "Setup authentication system",
    description:
      "Implement user authentication with email/password, social login, and secure session management",
    status: "done",
    priority: "high",
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    due_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    assignee: "Mike Johnson",
    position: 3,
    is_public: true,
    deleted_at: null,
    is_deleted: false,
  },
];

// Database operations with user authentication
export const taskOperations = {
  // Check if the tasks table exists
  async checkTableExists(): Promise<boolean> {
    try {
      const { error } = await supabase.from("tasks").select("count").limit(1);
      return !error;
    } catch {
      return false;
    }
  },

  // Check if soft delete columns exist
  async findTask(id: string): Promise<any> {
    console.log("Finding task with ID:", id);
    const query  =  supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
  
    console.log("Query:", query);
    const { data, error } = await query
    console.log("Data:", data);
    return data;
  },

  // Get all public tasks and user's private tasks (excluding soft deleted)
  async getAllTasks(): Promise<Task[]> {
    try {
      // Check if soft delete columns exist

      let query = supabase
        .from("tasks")
        .select("*")
        .is("deleted_at", null) // Exclude soft deleted tasks
        .order("position", { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }
      return data || [];
    } catch (err: any) {
      console.error("Supabase error:", err);
      throw new Error(`Database error: ${err.message}`);
    }
  },

  // Create a new task (requires authentication)
  async createTask(
    task: Omit<
      TaskInsert,
      | "id"
      | "created_at"
      | "updated_at"
      | "user_id"
      | "is_public"
      | "deleted_at"
    >
  ): Promise<Task> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Authentication required to create tasks");
    }

    // Check if soft delete columns exist

    const taskWithUser: any = {
      ...task,
      user_id: user.id,
      is_public: false, // User tasks are private by default
    };

    // Only add is_deleted if the column exists

    const { data, error } = await supabase
      .from("tasks")
      .insert([taskWithUser])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      throw new Error(`Failed to create task: ${error.message}`);
    }
    return data;
  },

  // Update a task (requires authentication and ownership)
  async updateTask(id: string, updates: TaskUpdate): Promise<Task> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Authentication required to update tasks");
    }

    // Remove fields that shouldn't be updated directly
    const { deleted_at, ...safeUpdates } = updates;

    const { data, error } = await supabase
      .from("tasks")
      .update({ ...safeUpdates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      throw new Error(`Failed to update task: ${error.message}`);
    }
    return data;
  },

  // Soft delete a task - sets is_deleted = true and deleted_at (requires authentication and ownership)
  async deleteTask(task: Task): Promise<void> {
    // Assuming you have already initialized your Supabase client


    // Define the type for your task (adjust according to your actual schema)
    type Task = {
      id: string;
      user_id: string;
   
      // Add other fields as needed
    };

    const _task = await this.findTask(task.id);
    console.log("find task:", _task);
    // Execute the update query
    const { data, error } = await supabase
      .from("tasks")
      .update({ deleted_at: new Date().toISOString()})
      .eq("id", task.id)
      .select();

    // Handle the result
    if (error) {
      console.error("Error updating task:", error);
    } else {
      console.log("Updated task:", data);
    }
  },

  // Update task status when moving between columns (requires authentication and ownership)
  async updateTaskStatus(
    id: string,
    status: Task["status"],
    position?: number
  ): Promise<Task> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Authentication required to update tasks");
    }

    const updates: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Update position if provided
    if (position !== undefined) {
      updates.position = position;
    }

    console.log(`Updating task status for ${id}:`, updates);

    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    console.log("Update task status result:", { data, error });

    if (error) {
      console.error("Supabase error:", error);
      throw new Error(`Failed to update task status: ${error.message}`);
    }
    return data;
  },

  // Restore a soft deleted task (requires authentication and ownership)
  async restoreTask(id: string): Promise<Task> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Authentication required to restore tasks");
    }

    const { data, error } = await supabase
      .from("tasks")
      .update({
        is_deleted: false,
        deleted_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      throw new Error(`Failed to restore task: ${error.message}`);
    }
    return data;
  },

  // Permanently delete a task (hard delete)
  async permanentlyDeleteTask(id: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Authentication required to permanently delete tasks");
    }

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Supabase error:", error);
      throw new Error(`Failed to permanently delete task: ${error.message}`);
    }
  },
};
