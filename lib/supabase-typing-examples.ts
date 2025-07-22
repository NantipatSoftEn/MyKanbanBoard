// TypeScript Supabase Typing Examples
// This file demonstrates the difference between untyped and typed Supabase queries

import { supabase } from './supabase'
import type { Database, Tables, TablesInsert, TablesUpdate } from './database.types'

// ❌ BEFORE: Untyped queries (causes GenericStringError[])
export async function getStatsUntyped() {
  const hasPublicColumn = true // Your column check logic here
  // This causes type issues because TypeScript can't infer the return type
  let query = supabase.from("todos").select("completed, user_id" + (hasPublicColumn ? ", is_public" : ""))
  
  const { data, error } = await query
  // data is typed as GenericStringError[] - not helpful!
  
  return data as any // Type assertion needed because of poor typing
}

// ✅ AFTER: Properly typed queries
export async function getStatsTyped() {
  const hasPublicColumn = true // Your column check logic here
  
  // Option 1: Conditional query building with static strings
  let query = hasPublicColumn 
    ? supabase.from("todos").select("completed, user_id, is_public")
    : supabase.from("todos").select("completed, user_id")
  
  const { data, error } = await query
  // data is now properly typed based on the selected columns!
  
  return data
}

// ✅ ALTERNATIVE: Using generic types for flexible queries
export async function getStatsGeneric<T extends keyof Tables<'todos'>>(
  columns: T[]
) {
  const { data, error } = await supabase
    .from('todos')
    .select(columns.join(', ') as any) // Type assertion needed for dynamic columns
  
  if (error) throw error
  return data as any // Return type would need manual typing for dynamic columns
}

// ✅ USAGE EXAMPLES:

// Example 1: Basic typed query
async function example1() {
  const { data: todos } = await supabase
    .from('todos')
    .select('id, title, completed')
  
  // todos is typed as Pick<Tables<'todos'>, 'id' | 'title' | 'completed'>[]
  todos?.forEach(todo => {
    console.log(todo.title) // ✅ TypeScript knows this exists
    // console.log(todo.description) // ❌ TypeScript error - not selected
  })
}

// Example 2: Full row selection
async function example2() {
  const { data: todos } = await supabase
    .from('todos')
    .select('*')
  
  // todos is typed as Tables<'todos'>[]
  todos?.forEach(todo => {
    console.log(todo.title) // ✅ All columns available
    console.log(todo.description) // ✅ All columns available
  })
}

// Example 3: Insert with types
async function example3() {
  const newTodo: TablesInsert<'todos'> = {
    title: 'New Task',
    description: 'Description',
    completed: false,
    is_public: true,
    tags: ['work']
  }
  
  const { data, error } = await supabase
    .from('todos')
    .insert(newTodo)
    .select()
    .single()
  
  // data is typed as Tables<'todos'>
}

// Example 4: Update with types  
async function example4(todoId: string) {
  const updates: TablesUpdate<'todos'> = {
    completed: true,
    updated_at: new Date().toISOString()
  }
  
  const { data, error } = await supabase
    .from('todos')
    .update(updates)
    .eq('id', todoId)
    .select()
    .single()
  
  // data is typed as Tables<'todos'>
}

// 🎯 KEY TAKEAWAYS:

// 1. Use static strings for .select() instead of dynamic concatenation
// 2. Import and use Database types with createClient<Database>()
// 3. Use Tables<'table_name'> for row types
// 4. Use TablesInsert<'table_name'> for insert operations
// 5. Use TablesUpdate<'table_name'> for update operations
// 6. TypeScript will automatically infer the correct return types
