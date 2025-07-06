"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import { useAuth } from "../contexts/supabase-auth-context"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { SupabaseAuthLogin } from "./supabase-auth-login"

export function FloatingLoginButton() {
  const { user } = useAuth()
  const [showLogin, setShowLogin] = useState(false)

  if (user) return null

  return (
    <>
      <Button
        onClick={() => setShowLogin(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
        size="lg"
      >
        <LogIn className="h-6 w-6" />
      </Button>

      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none">
          <SupabaseAuthLogin />
        </DialogContent>
      </Dialog>
    </>
  )
}
