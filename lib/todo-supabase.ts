import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Todo {
  id: string
  user_id: string
  title: string
  description?: string | null
  completed: boolean
  created_at: string
  updated_at: string
}

export interface TodoFilters {
  search?: string
  completed?: boolean | null
  page?: number
  limit?: number
}

export interface TodoResponse {
  todos: Todo[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const todoOperations = {
  // Get todos with pagination and search
  async getTodos(filters: TodoFilters = {}): Promise<TodoResponse> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Authentication required to view todos")
    }

    const page = filters.page || 1
    const limit = filters.limit || 10
    const offset = (page - 1) * limit

    let query = supabase.from("todos").select("*", { count: "exact" }).eq("user_id", user.id)

    // Apply search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.trim()
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    }

    // Apply completion filter
    if (filters.completed !== null && filters.completed !== undefined) {
      query = query.eq("completed", filters.completed)
    }

    // Apply pagination and ordering
    query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Failed to fetch todos: ${error.message}`)
    }

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    return {
      todos: data || [],
      total,
      page,
      limit,
      totalPages,
    }
  },

  // Get all todos for the authenticated user (legacy method)
  async getAllTodos(): Promise<Todo[]> {
    const response = await this.getTodos({ limit: 1000 })
    return response.todos
  },

  // Create a new todo
  async createTodo(todo: {
    title: string
    description?: string
  }): Promise<Todo> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Authentication required to create todos")
    }

    const { data, error } = await supabase
      .from("todos")
      .insert([
        {
          ...todo,
          user_id: user.id,
          completed: false,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Failed to create todo: ${error.message}`)
    }

    return data
  },

  // Update a todo
  async updateTodo(id: string, updates: Partial<Todo>): Promise<Todo> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Authentication required to update todos")
    }

    const { data, error } = await supabase
      .from("todos")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Failed to update todo: ${error.message}`)
    }

    return data
  },

  // Delete a todo
  async deleteTodo(id: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Authentication required to delete todos")
    }

    const { error } = await supabase.from("todos").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Failed to delete todo: ${error.message}`)
    }
  },

  // Toggle todo completion status
  async toggleTodo(id: string, completed: boolean): Promise<Todo> {
    return this.updateTodo(id, { completed })
  },

  // Get todo statistics
  async getTodoStats(): Promise<{
    total: number
    completed: number
    pending: number
  }> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Authentication required to view stats")
    }

    const { data, error } = await supabase.from("todos").select("completed").eq("user_id", user.id)

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Failed to fetch stats: ${error.message}`)
    }

    const total = data?.length || 0
    const completed = data?.filter((todo) => todo.completed).length || 0
    const pending = total - completed

    return { total, completed, pending }
  },
}
