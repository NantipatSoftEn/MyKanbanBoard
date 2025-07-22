# Supabase TypeScript Setup Guide

This guide shows how to set up proper TypeScript types for your Supabase project.

## 1. Install Supabase CLI (Recommended)

### Install globally:
```bash
npm install -g supabase
```

### Or install as dev dependency:
```bash
npm install --save-dev supabase
```

## 2. Generate Types from Your Database

### Option A: Using Supabase CLI (Automatic - Recommended)
```bash
# Login to Supabase
supabase login

# Generate types from your project
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
```

### Option B: Using Environment Variables
```bash
# Set your project reference (found in your Supabase dashboard URL)
npx supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > lib/database.types.ts
```

### Option C: Using Direct Database Connection
```bash
# If you have direct database access
npx supabase gen types typescript --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" > lib/database.types.ts
```

## 3. Manual Type Generation (Current Setup)

We've created a manual `database.types.ts` file based on your current schema. This includes:

- `todos` table with all columns (id, user_id, title, description, completed, created_at, updated_at, is_public, tags)
- `todo_tags` table (id, name, color, icon, created_at)  
- `tasks` table (your Kanban board tasks)

## 4. Usage Examples

### Basic Query with Types
```typescript
import { supabase } from './lib/supabase'
import type { Tables } from './lib/database.types'

// Fully typed response
const { data: todos, error } = await supabase
  .from('todos')
  .select('*')
  
// todos is now typed as Tables<'todos'>[]
```

### Insert with Types
```typescript
import type { TablesInsert } from './lib/database.types'

const newTodo: TablesInsert<'todos'> = {
  title: 'New Task',
  description: 'Task description',
  completed: false,
  is_public: true,
  tags: ['work', 'urgent']
}

const { data, error } = await supabase
  .from('todos')
  .insert(newTodo)
  .select()
  .single()
```

### Update with Types
```typescript
import type { TablesUpdate } from './lib/database.types'

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
```

### Specific Column Selection with Types
```typescript
// Only select specific columns - TypeScript will infer the correct type
const { data: todoStats, error } = await supabase
  .from('todos')
  .select('id, title, completed, user_id')

// todoStats is typed as Pick<Tables<'todos'>, 'id' | 'title' | 'completed' | 'user_id'>[]
```

## 5. Benefits of Proper Typing

✅ **No more `GenericStringError[]`** - TypeScript knows exactly what columns you're selecting
✅ **IntelliSense** - Auto-completion for column names and types
✅ **Compile-time error checking** - Catch typos and type mismatches before runtime  
✅ **Safer refactoring** - TypeScript will warn you if you change column names
✅ **Better developer experience** - Clear contracts for your database operations

## 6. Keeping Types Updated

### Automatic (Recommended)
Add to your `package.json` scripts:
```json
{
  "scripts": {
    "types:generate": "supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts"
  }
}
```

Then run: `npm run types:generate` whenever your database schema changes.

### Manual Updates
When you add/modify database tables or columns, update the `database.types.ts` file accordingly.

## 7. Common Patterns

### Conditional Column Selection
```typescript
// Instead of dynamic string building (causes type issues):
// const cols = "id, title" + (includeDesc ? ", description" : "")

// Use conditional logic:
const query = includeDescription 
  ? supabase.from('todos').select('id, title, description')
  : supabase.from('todos').select('id, title')
```

### Complex Queries with Joins
```typescript
// For complex queries with joins, you might need custom types
type TodoWithTags = Tables<'todos'> & {
  todo_tags: Tables<'todo_tags'>[]
}

const { data, error } = await supabase
  .from('todos')
  .select(`
    *,
    todo_tags (*)
  `)
```

## Your Current Setup

✅ Created `lib/database.types.ts` with your database schema
✅ Updated `lib/supabase.ts` to use `createClient<Database>()`
✅ Updated `lib/todo-supabase.ts` to use proper types
✅ Fixed the `GenericStringError[]` issue in `getTodoStats()`

Your Supabase client is now fully typed and will provide better IntelliSense and error checking!
