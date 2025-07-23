import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SupabaseAuthProvider } from "@/contexts/supabase-auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ArmyKanbanBoard",
  description: "A Kanban board for managing Army tasks",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=K2D:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SupabaseAuthProvider>{children}</SupabaseAuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
