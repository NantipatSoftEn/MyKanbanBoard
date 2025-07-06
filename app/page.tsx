"use client"

import { SupabaseAuthProvider, useAuth } from "../contexts/supabase-auth-context"
import { SupabaseAuthLogin } from "../components/supabase-auth-login"
import KanbanBoard from "../kanban-board"

function AppContent() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <SupabaseAuthLogin />
  }

  return <KanbanBoard />
}

export default function Page() {
  return (
    <SupabaseAuthProvider>
      <AppContent />
    </SupabaseAuthProvider>
  )
}
