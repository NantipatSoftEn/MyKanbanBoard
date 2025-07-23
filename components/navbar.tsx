"use client"

import Link from "next/link"
import {
  Database,
  Wifi,
  WifiOff,
  RefreshCw,
  Lock,
  LogIn,
  LogOut,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface NavbarProps {
  isAuthenticated: boolean
  user: any
  isConnected: boolean
  usingMockData: boolean
  loading: boolean
  onRefresh: () => void
  onSignOut: () => void
  onOpenAuthModal: () => void
}

export function Navbar({
  isAuthenticated,
  user,
  isConnected,
  usingMockData,
  loading,
  onRefresh,
  onSignOut,
  onOpenAuthModal,
}: NavbarProps) {
  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 mb-6">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Army Kanban Board</h1>
          
          <div className="flex items-center gap-3">
            <Link href="/notes">
              <Button variant="outline" size="sm">
                Notes
              </Button>
            </Link>
            
            <Badge
              variant={isConnected ? "default" : usingMockData ? "secondary" : "destructive"}
              className="flex items-center gap-1"
            >
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3" />
                  Connected 
                </>
              ) : usingMockData ? (
                <>
                  <Database className="h-3 w-3" />
                  Using Demo Data
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  Database Disconnected
                </>
              )}
            </Badge>

            {isAuthenticated ? (
              <Badge variant="default" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {user?.email}
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                View Only
              </Badge>
            )}

            <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            {isAuthenticated ? (
              <Button variant="outline" size="sm" onClick={onSignOut}>
                <LogOut className="h-3 w-3 mr-1" />
                Logout
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={onOpenAuthModal}>
                <LogIn className="h-3 w-3 mr-1" />
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
