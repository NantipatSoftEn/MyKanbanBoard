"use client"

import { AuthProvider, useAuth } from "../contexts/auth-context"
import { NormalLogin } from "../components/normal-login"
import KanbanBoard from "../kanban-board"

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <NormalLogin />
  }

  return <KanbanBoard />
}

export default function Page() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
