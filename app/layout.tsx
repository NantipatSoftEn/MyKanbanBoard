import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SupabaseAuthProvider } from "@/contexts/supabase-auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Simple Kanban Board",
  description: "A simple kanban board built with Next.js and Supabase",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=K2D:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SupabaseAuthProvider>{children}</SupabaseAuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
