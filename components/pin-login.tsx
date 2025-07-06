"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Eye, EyeOff, Trash2 } from "lucide-react"
import { useAuth } from "../contexts/auth-context"

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export function PinLogin() {
  const [pin, setPin] = useState("")
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleNumberClick = (number: number) => {
    if (pin.length < 9) {
      setPin((prev) => prev + number.toString())
      setError("")
    }
  }

  const handleClear = () => {
    setPin("")
    setError("")
  }

  const handleLogin = async () => {
    if (pin.length === 0) {
      setError("Please enter a PIN")
      return
    }

    setIsLoading(true)
    setError("")

    // Simulate a small delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500))

    const success = login(pin)

    if (!success) {
      setError("Invalid PIN. Please try again.")
      setPin("")
    }

    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin()
    } else if (e.key === "Backspace") {
      setPin((prev) => prev.slice(0, -1))
      setError("")
    } else if (e.key >= "1" && e.key <= "9") {
      handleNumberClick(Number.parseInt(e.key))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Enter PIN</CardTitle>
          <p className="text-gray-600">Enter your 9-digit PIN to access the Kanban board</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* PIN Display */}
          <div className="relative">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="flex-1 text-center">
                {showPin ? (
                  <span className="text-2xl font-mono tracking-wider">{pin || "Enter PIN..."}</span>
                ) : (
                  <span className="text-2xl tracking-wider">{"•".repeat(pin.length) || "Enter PIN..."}</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowPin(!showPin)} className="h-8 w-8 p-0">
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-8 w-8 p-0"
                  disabled={pin.length === 0}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-right mt-1">
              <span className="text-xs text-gray-500">{pin.length}/9</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Number Grid */}
          <div className="grid grid-cols-3 gap-3" onKeyDown={handleKeyPress} tabIndex={0}>
            {numbers.map((number) => (
              <Button
                key={number}
                variant="outline"
                size="lg"
                className="h-16 text-xl font-semibold hover:bg-blue-50 hover:border-blue-300 transition-colors bg-transparent"
                onClick={() => handleNumberClick(number)}
                disabled={pin.length >= 9}
              >
                {number}
              </Button>
            ))}
          </div>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            disabled={pin.length === 0 || isLoading}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>

          {/* Demo Info */}
          <div className="text-center space-y-2">
            <Badge variant="secondary" className="text-xs">
              Demo Mode
            </Badge>
            <p className="text-xs text-gray-500">Default PIN: 123456789</p>
            <p className="text-xs text-gray-400">
              You can view the board without logging in, but editing requires authentication.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
