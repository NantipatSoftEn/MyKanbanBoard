"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  User,
  Lock,
  LogIn,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/supabase-auth-context"
import { AuthModal } from "./auth-modal"

export function LayoutNavbar() {
  const { user, signOut } = useAuth()
  const isAuthenticated = !!user
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const navigation = [
    { name: 'Kanban Board', href: '/', current: pathname === '/' },
    { name: 'Notes', href: '/notes', current: pathname === '/notes' },
  ]

  const handleMobileNavChange = (href: string) => {
    router.push(href)
  }

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-3xl font-bold text-gray-900">Army Kanban Board</h1>
              
              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      item.current
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Mobile Navigation */}
              <div className="md:hidden">
                <select
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  value={pathname}
                  onChange={(e) => handleMobileNavChange(e.target.value)}
                >
                  {navigation.map((item) => (
                    <option key={item.name} value={item.href}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Auth Status */}
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

              {/* Auth Actions */}
              {isAuthenticated ? (
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="h-3 w-3 mr-1" />
                  Logout
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsAuthModalOpen(true)}>
                  <LogIn className="h-3 w-3 mr-1" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  )
}
