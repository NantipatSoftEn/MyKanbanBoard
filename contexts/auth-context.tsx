"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  login: (pin: string) => boolean
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Default credentials - you can change these
const DEFAULT_PIN = "123456789"
const DEFAULT_PASSWORD = "HELLO123"
const SECURE_PASSWORD = "MySecure40CharPassword2024!@#$%^&*()_+"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is already logged in on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem("kanban-auth")
    if (savedAuth === "true") {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const login = (input: string): boolean => {
    if (
      input === DEFAULT_PIN ||
      input === "pattern-match" ||
      input === "password-match" ||
      input === "secure-password-match"
    ) {
      setIsAuthenticated(true)
      localStorage.setItem("kanban-auth", "true")
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("kanban-auth")
  }

  return <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
