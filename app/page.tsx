"use client"

import { SupabaseAuthProvider } from "../contexts/supabase-auth-context"
import KanbanBoard from "../kanban-board"

export default function Page() {
  return (
    <SupabaseAuthProvider>
      <KanbanBoard />
    </SupabaseAuthProvider>
  )
}
