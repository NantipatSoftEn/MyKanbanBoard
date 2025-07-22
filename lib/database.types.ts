export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      todos: {
        Row: {
          id: string
          user_id: string | null
          title: string
          description: string | null
          completed: boolean
          created_at: string
          updated_at: string
          is_public: boolean | null
          tags: string[] | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          description?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
          is_public?: boolean | null
          tags?: string[] | null
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          description?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
          is_public?: boolean | null
          tags?: string[] | null
        }
        Relationships: []
      }
      todo_tags: {
        Row: {
          id: string
          name: string
          color: string
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          icon?: string | null
          created_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          user_id: string | null
          title: string
          description: string | null
          status: "todo" | "inprogress" | "done"
          priority: "low" | "medium" | "high"
          created_at: string
          updated_at: string
          due_date: string | null
          assignee: string | null
          position: number
          is_public: boolean | null
          deleted_at: string | null
          is_deleted: boolean | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          description?: string | null
          status?: "todo" | "inprogress" | "done"
          priority?: "low" | "medium" | "high"
          created_at?: string
          updated_at?: string
          due_date?: string | null
          assignee?: string | null
          position?: number
          is_public?: boolean | null
          deleted_at?: string | null
          is_deleted?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          description?: string | null
          status?: "todo" | "inprogress" | "done"
          priority?: "low" | "medium" | "high"
          created_at?: string
          updated_at?: string
          due_date?: string | null
          assignee?: string | null
          position?: number
          is_public?: boolean | null
          deleted_at?: string | null
          is_deleted?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
