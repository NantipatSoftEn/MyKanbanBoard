import { supabase } from "./supabase"

// Re-export the shared supabase client for backward compatibility
export { supabase }

export interface Todo {
  id: string
  user_id: string | null
  title: string
  description?: string | null
  completed: boolean
  created_at: string
  updated_at: string
  is_public?: boolean // Make optional for backward compatibility
  tags?: string[] // Add tags support
}

export interface TodoTag {
  id: string
  name: string
  color: string
  icon?: string
  created_at: string
}

export interface TodoFilters {
  search?: string
  completed?: boolean | null
  page?: number
  limit?: number
  showOnlyMine?: boolean
  tags?: string[] // Add tag filtering
}

export interface TodoResponse {
  todos: Todo[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const todoOperations = {
  // Check if is_public column exists
  async checkPublicColumnExists(): Promise<boolean> {
    try {
      // Try to select is_public column specifically
      const { data, error } = await supabase.from("todos").select("is_public").limit(1)

      // If no error, column exists
      return !error
    } catch (error) {
      // If error contains "column does not exist", column doesn't exist
      return false
    }
  },

  // Check if tags column exists
  async checkTagsColumnExists(): Promise<boolean> {
    try {
      // Try to select tags column specifically
      const { data, error } = await supabase.from("todos").select("tags").limit(1)

      // If no error, column exists
      return !error
    } catch (error) {
      // If error contains "column does not exist", column doesn't exist
      return false
    }
  },

  // Get todos with pagination and search (public + user's own)
  async getTodos(filters: TodoFilters = {}): Promise<TodoResponse> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const page = filters.page || 1
    const limit = filters.limit || 10
    const offset = (page - 1) * limit

    // Check if columns exist
    const [hasPublicColumn, hasTagsColumn] = await Promise.all([
      this.checkPublicColumnExists(),
      this.checkTagsColumnExists(),
    ])

    let query = supabase.from("todos").select("*", { count: "exact" })

    // Apply user filter based on whether is_public column exists
    if (hasPublicColumn) {
      if (user && filters.showOnlyMine) {
        // Show only user's own todos
        query = query.eq("user_id", user.id)
      } else if (user) {
        // Show public todos + user's own todos
        query = query.or(`is_public.eq.true,user_id.eq.${user.id}`)
      } else {
        // Show only public todos for non-authenticated users
        query = query.eq("is_public", true)
      }
    } else {
      // Fallback: if no is_public column, show all todos for authenticated users, none for non-authenticated
      if (user) {
        if (filters.showOnlyMine) {
          query = query.eq("user_id", user.id)
        }
        // If not showOnlyMine, show all todos (backward compatibility)
      } else {
        // For non-authenticated users, show all todos (backward compatibility)
        // This will be updated once the migration is run
      }
    }

    // Apply search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.trim()
      if (hasTagsColumn) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
      } else {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      }
    }

    // Apply tag filter
    if (hasTagsColumn && filters.tags && filters.tags.length > 0) {
      query = query.overlaps("tags", filters.tags)
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

    // Add default values for backward compatibility
    const todosWithDefaults = (data || []).map((todo) => ({
      ...todo,
      is_public: todo.is_public !== undefined ? todo.is_public : true,
      tags: todo.tags || [],
    }))

    return {
      todos: todosWithDefaults,
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

  // Create missing tags automatically
  async createMissingTags(tagNames: string[]): Promise<TodoTag[]> {
    if (!tagNames || tagNames.length === 0) return []

    try {
      // Get existing tags
      const { data: existingTags } = await supabase.from("todo_tags").select("name").in("name", tagNames)

      const existingTagNames = existingTags?.map((tag) => tag.name) || []
      const missingTagNames = tagNames.filter((name) => !existingTagNames.includes(name))

      if (missingTagNames.length === 0) return []

      // Create missing tags with random colors and default icon
      const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#6b7280", "#ec4899", "#06b6d4"]
      const newTags = missingTagNames.map((name) => ({
        name: name.toLowerCase().trim(),
        color: colors[Math.floor(Math.random() * colors.length)],
        icon: "🏷️",
      }))

      const { data: createdTags, error } = await supabase.from("todo_tags").insert(newTags).select()

      if (error) {
        console.error("Error creating tags:", error)
        return []
      }

      return createdTags || []
    } catch (error) {
      console.error("Error in createMissingTags:", error)
      return []
    }
  },

  // Create a new todo (requires authentication)
  async createTodo(todo: {
    title: string
    description?: string
    is_public?: boolean
    tags?: string[]
  }): Promise<Todo> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Authentication required to create todos")
    }

    // Check if columns exist
    const [hasPublicColumn, hasTagsColumn] = await Promise.all([
      this.checkPublicColumnExists(),
      this.checkTagsColumnExists(),
    ])

    // Auto-create missing tags if tags column exists and tags are provided
    if (hasTagsColumn && todo.tags && todo.tags.length > 0) {
      // Clean and normalize tag names
      const cleanTags = todo.tags
        .map((tag) => tag.toLowerCase().trim())
        .filter((tag) => tag.length > 0)
        .filter((tag, index, arr) => arr.indexOf(tag) === index) // Remove duplicates

      if (cleanTags.length > 0) {
        await this.createMissingTags(cleanTags)
        todo.tags = cleanTags
      }
    }

    const todoData: any = {
      title: todo.title,
      description: todo.description,
      user_id: user.id,
      completed: false,
    }

    // Only add columns that exist
    if (hasPublicColumn) {
      todoData.is_public = todo.is_public !== undefined ? todo.is_public : true
    }
    if (hasTagsColumn) {
      todoData.tags = todo.tags || []
    }

    const { data, error } = await supabase.from("todos").insert([todoData]).select().single()

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Failed to create todo: ${error.message}`)
    }

    // Add default values for backward compatibility
    return {
      ...data,
      is_public: data.is_public !== undefined ? data.is_public : true,
      tags: data.tags || [],
    }
  },

  // Update a todo (requires authentication and ownership)
  async updateTodo(id: string, updates: Partial<Todo>): Promise<Todo> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Authentication required to update todos")
    }

    // Auto-create missing tags if updating tags
    if (updates.tags && updates.tags.length > 0) {
      const hasTagsColumn = await this.checkTagsColumnExists()
      if (hasTagsColumn) {
        // Clean and normalize tag names
        const cleanTags = updates.tags
          .map((tag) => tag.toLowerCase().trim())
          .filter((tag) => tag.length > 0)
          .filter((tag, index, arr) => arr.indexOf(tag) === index) // Remove duplicates

        if (cleanTags.length > 0) {
          await this.createMissingTags(cleanTags)
          updates.tags = cleanTags
        }
      }
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

    // Add default values for backward compatibility
    return {
      ...data,
      is_public: data.is_public !== undefined ? data.is_public : true,
      tags: data.tags || [],
    }
  },

  // Delete a todo (requires authentication and ownership)
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

  // Toggle todo completion status (requires authentication and ownership)
  async toggleTodo(id: string, completed: boolean): Promise<Todo> {
    return this.updateTodo(id, { completed })
  },

  // Get all available tags
  async getAllTags(): Promise<TodoTag[]> {
    const { data, error } = await supabase.from("todo_tags").select("*").order("name")

    if (error) {
      console.error("Supabase error:", error)
      // Return predefined tags as fallback
      return [
        { id: "1", name: "youtube", color: "#ff0000", icon: "📺", created_at: "2024-01-01T00:00:00Z" },
        { id: "2", name: "facebook", color: "#1877f2", icon: "📘", created_at: "2024-01-01T00:00:00Z" },
        { id: "3", name: "book", color: "#8b5cf6", icon: "📚", created_at: "2024-01-01T00:00:00Z" },
        { id: "4", name: "anime", color: "#f59e0b", icon: "🎌", created_at: "2024-01-01T00:00:00Z" },
        { id: "5", name: "read", color: "#10b981", icon: "📖", created_at: "2024-01-01T00:00:00Z" },
        { id: "6", name: "watch", color: "#ef4444", icon: "👀", created_at: "2024-01-01T00:00:00Z" },
        { id: "7", name: "learn", color: "#3b82f6", icon: "🎓", created_at: "2024-01-01T00:00:00Z" },
        { id: "8", name: "work", color: "#6b7280", icon: "💼", created_at: "2024-01-01T00:00:00Z" },
      ]
    }
    return data || []
  },

  // Create a new tag (requires authentication)
  async createTag(tag: Omit<TodoTag, "id" | "created_at">): Promise<TodoTag> {
    const { data, error } = await supabase.from("todo_tags").insert([tag]).select().single()

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Failed to create tag: ${error.message}`)
    }
    return data
  },

  // Get todo statistics
  async getTodoStats(): Promise<{
    total: number
    completed: number
    pending: number
    myTodos: number
    publicTodos: number
  }> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Check if is_public column exists
    const hasPublicColumn = await this.checkPublicColumnExists()

    let query = supabase.from("todos").select("completed, user_id" + (hasPublicColumn ? ", is_public" : ""))

    if (hasPublicColumn) {
      if (user) {
        // Show public todos + user's own todos
        query = query.or(`is_public.eq.true,user_id.eq.${user.id}`)
      } else {
        // Show only public todos for non-authenticated users
        query = query.eq("is_public", true)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Failed to fetch stats: ${error.message}`)
    }

    const total = data?.length || 0
    const completed = data?.filter((todo) => todo.completed).length || 0
    const pending = total - completed
    const myTodos = user ? data?.filter((todo) => todo.user_id === user.id).length || 0 : 0
    const publicTodos = hasPublicColumn
      ? data?.filter((todo: any) => todo.is_public && todo.user_id !== user?.id).length || 0
      : 0

    return { total, completed, pending, myTodos, publicTodos }
  },

  // Check if user can modify a todo
  async canModifyTodo(todoId: string): Promise<boolean> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    const { data, error } = await supabase.from("todos").select("user_id").eq("id", todoId).single()

    if (error) return false

    return data.user_id === user.id
  },
}
