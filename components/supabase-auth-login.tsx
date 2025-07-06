"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  RotateCcw,
  Eye,
  EyeOff,
  Shield,
  AlertTriangle,
  CheckCircle,
  LogIn,
  UserPlus,
  Info,
  AlertCircle,
} from "lucide-react"
import { useAuth } from "../contexts/supabase-auth-context"

// Create 8x5 grid (40 cells total)
const GRID_ROWS = 5
const GRID_COLS = 8
const TOTAL_CELLS = GRID_ROWS * GRID_COLS

// Default email for authentication
const DEFAULT_EMAIL = "user@kanban.app"

// Demo password for testing
const DEMO_PASSWORD = "MySecure40CharPassword2024!@#$%^&*()_+"

// Password strength requirements
const PASSWORD_REQUIREMENTS = {
  length: 40,
  minUppercase: 3,
  minLowercase: 3,
  minNumbers: 3,
  minSpecialChars: 3,
  noRepeatingSequence: 3,
}

export function SupabaseAuthLogin() {
  const [password, setPassword] = useState<string[]>(Array(TOTAL_CELLS).fill(""))
  const [currentCell, setCurrentCell] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [strengthDetails, setStrengthDetails] = useState<any>({})
  const [activeTab, setActiveTab] = useState("signin")
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([])
  const { signIn, signUp } = useAuth()

  // Focus on current cell
  useEffect(() => {
    if (cellRefs.current[currentCell]) {
      cellRefs.current[currentCell]?.focus()
    }
  }, [currentCell])

  // Calculate password strength
  useEffect(() => {
    const passwordString = password.join("")
    const strength = calculatePasswordStrength(passwordString)
    setPasswordStrength(strength.score)
    setStrengthDetails(strength.details)
  }, [password])

  // Clear messages when switching tabs
  useEffect(() => {
    setError("")
    setSuccess("")
  }, [activeTab])

  const calculatePasswordStrength = (pwd: string) => {
    const details = {
      length: pwd.length,
      hasUppercase: (pwd.match(/[A-Z]/g) || []).length,
      hasLowercase: (pwd.match(/[a-z]/g) || []).length,
      hasNumbers: (pwd.match(/[0-9]/g) || []).length,
      hasSpecialChars: (pwd.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g) || []).length,
      hasRepeatingChars: checkRepeatingChars(pwd),
      entropy: calculateEntropy(pwd),
    }

    let score = 0

    // Length requirement (40 characters) - 30 points
    score += Math.min((details.length / PASSWORD_REQUIREMENTS.length) * 30, 30)

    // Character variety - 60 points total
    score += Math.min((details.hasUppercase / PASSWORD_REQUIREMENTS.minUppercase) * 15, 15)
    score += Math.min((details.hasLowercase / PASSWORD_REQUIREMENTS.minLowercase) * 15, 15)
    score += Math.min((details.hasNumbers / PASSWORD_REQUIREMENTS.minNumbers) * 15, 15)
    score += Math.min((details.hasSpecialChars / PASSWORD_REQUIREMENTS.minSpecialChars) * 15, 15)

    // Penalty for repeating characters - 10 points
    if (!details.hasRepeatingChars) {
      score += 10
    }

    return {
      score: Math.round(score),
      details,
      isSecure: score >= 90 && details.length === PASSWORD_REQUIREMENTS.length,
    }
  }

  const checkRepeatingChars = (pwd: string) => {
    for (let i = 0; i <= pwd.length - PASSWORD_REQUIREMENTS.noRepeatingSequence; i++) {
      const char = pwd[i]
      let count = 1
      for (let j = i + 1; j < pwd.length && pwd[j] === char; j++) {
        count++
      }
      if (count >= PASSWORD_REQUIREMENTS.noRepeatingSequence) {
        return true
      }
    }
    return false
  }

  const calculateEntropy = (pwd: string) => {
    const charSet = new Set(pwd).size
    return pwd.length * Math.log2(charSet)
  }

  const handleCellClick = (cellIndex: number) => {
    setCurrentCell(cellIndex)
    setError("")
    setSuccess("")
  }

  const handleKeyPress = (e: React.KeyboardEvent, cellIndex: number) => {
    const key = e.key

    if (key === "Backspace") {
      e.preventDefault()
      const newPassword = [...password]
      newPassword[cellIndex] = ""
      setPassword(newPassword)

      if (cellIndex > 0) {
        setCurrentCell(cellIndex - 1)
      }
    } else if (key === "Delete") {
      e.preventDefault()
      const newPassword = [...password]
      newPassword[cellIndex] = ""
      setPassword(newPassword)
    } else if (key === "ArrowLeft") {
      e.preventDefault()
      if (cellIndex > 0) {
        setCurrentCell(cellIndex - 1)
      }
    } else if (key === "ArrowRight") {
      e.preventDefault()
      if (cellIndex < TOTAL_CELLS - 1) {
        setCurrentCell(cellIndex + 1)
      }
    } else if (key === "ArrowUp") {
      e.preventDefault()
      if (cellIndex >= GRID_COLS) {
        setCurrentCell(cellIndex - GRID_COLS)
      }
    } else if (key === "ArrowDown") {
      e.preventDefault()
      if (cellIndex < TOTAL_CELLS - GRID_COLS) {
        setCurrentCell(cellIndex + GRID_COLS)
      }
    } else if (key === "Enter") {
      e.preventDefault()
      handleAuth()
    } else if (key.length === 1 && /[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(key)) {
      e.preventDefault()
      const newPassword = [...password]
      newPassword[cellIndex] = key
      setPassword(newPassword)

      if (cellIndex < TOTAL_CELLS - 1) {
        setCurrentCell(cellIndex + 1)
      }
    }
  }

  const handleAuth = async () => {
    const passwordString = password.join("")

    if (passwordString.length !== PASSWORD_REQUIREMENTS.length) {
      setError(`Password must be exactly ${PASSWORD_REQUIREMENTS.length} characters long`)
      return
    }

    if (activeTab === "signup") {
      const strength = calculatePasswordStrength(passwordString)
      if (!strength.isSecure) {
        setError("Password does not meet security requirements")
        return
      }
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      if (activeTab === "signin") {
        await signIn(DEFAULT_EMAIL, passwordString)
        setSuccess("Successfully signed in!")
      } else {
        const result = await signUp(DEFAULT_EMAIL, passwordString)
        if (result?.user) {
          setSuccess("Account created successfully!")
        } else {
          setSuccess("Account created! Please check your email to confirm your account.")
        }
      }
    } catch (err: any) {
      console.error("Authentication error:", err)

      // Provide more specific error messages
      if (err.message.includes("Invalid login credentials")) {
        if (activeTab === "signin") {
          setError("Invalid password. Please check your password and try again, or create a new account.")
        } else {
          setError("Authentication failed. Please try again.")
        }
      } else if (err.message.includes("User already registered")) {
        setError("An account with this email already exists. Please sign in instead.")
      } else if (err.message.includes("Password should be at least")) {
        setError("Password does not meet Supabase requirements. Please ensure it's at least 6 characters.")
      } else {
        setError(err.message || "Authentication failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setPassword(Array(TOTAL_CELLS).fill(""))
    setCurrentCell(0)
    setError("")
    setSuccess("")
  }

  const loadDemoPassword = () => {
    setPassword(DEMO_PASSWORD.split(""))
    setCurrentCell(0)
    setError("")
    setSuccess("")
  }

  const generateSecurePassword = () => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const lowercase = "abcdefghijklmnopqrstuvwxyz"
    const numbers = "0123456789"
    const special = "!@#$%^&*()_+-=[]{}|;:,.<>?"

    let newPassword = ""

    // Ensure minimum requirements
    for (let i = 0; i < PASSWORD_REQUIREMENTS.minUppercase; i++) {
      newPassword += uppercase[Math.floor(Math.random() * uppercase.length)]
    }
    for (let i = 0; i < PASSWORD_REQUIREMENTS.minLowercase; i++) {
      newPassword += lowercase[Math.floor(Math.random() * lowercase.length)]
    }
    for (let i = 0; i < PASSWORD_REQUIREMENTS.minNumbers; i++) {
      newPassword += numbers[Math.floor(Math.random() * numbers.length)]
    }
    for (let i = 0; i < PASSWORD_REQUIREMENTS.minSpecialChars; i++) {
      newPassword += special[Math.floor(Math.random() * special.length)]
    }

    // Fill remaining characters
    const allChars = uppercase + lowercase + numbers + special
    while (newPassword.length < PASSWORD_REQUIREMENTS.length) {
      const char = allChars[Math.floor(Math.random() * allChars.length)]
      if (newPassword.length < 2 || newPassword.slice(-2) !== char + char) {
        newPassword += char
      }
    }

    // Shuffle the password
    const shuffled = newPassword
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("")

    setPassword(shuffled.split(""))
    setCurrentCell(0)
    setError("")
    setSuccess("")
  }

  const getPasswordString = () => {
    return password.join("")
  }

  const getStrengthColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    if (score >= 50) return "text-orange-600"
    return "text-red-600"
  }

  const getStrengthLabel = (score: number) => {
    if (score >= 90) return "Very Strong"
    if (score >= 70) return "Strong"
    if (score >= 50) return "Medium"
    if (score >= 30) return "Weak"
    return "Very Weak"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="bg-white shadow-xl border border-gray-200 max-w-4xl w-full">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-800">Secure Authentication</h1>
                <p className="text-gray-600 text-sm">40-character password with default email</p>
              </div>
            </div>

            <div className="border-t border-b border-gray-200 py-3 mb-6">
              <h2 className="text-xl text-gray-700 font-semibold">Default Email: {DEFAULT_EMAIL}</h2>
              <p className="text-gray-500 text-sm mt-1">Enter your 40-character password below</p>
            </div>
          </div>

          {/* Auth Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-blue-800">
                  <div className="font-medium">Returning User</div>
                  <div className="text-sm mt-1">
                    Enter your existing 40-character password to sign in with email: {DEFAULT_EMAIL}
                  </div>
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <UserPlus className="h-4 w-4" />
                <AlertDescription className="text-green-800">
                  <div className="font-medium">New User</div>
                  <div className="text-sm mt-1">Create a secure 40-character password for email: {DEFAULT_EMAIL}</div>
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>

          {/* Password Strength Indicator (only for signup) */}
          {activeTab === "signup" && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Password Strength:</label>
                <span className={`text-sm font-semibold ${getStrengthColor(passwordStrength)}`}>
                  {getStrengthLabel(passwordStrength)} ({passwordStrength}%)
                </span>
              </div>
              <Progress value={passwordStrength} className="h-3 mb-3" />

              {/* Strength Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div
                  className={`flex items-center gap-1 ${strengthDetails.length === 40 ? "text-green-600" : "text-red-600"}`}
                >
                  {strengthDetails.length === 40 ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  Length: {strengthDetails.length}/40
                </div>
                <div
                  className={`flex items-center gap-1 ${strengthDetails.hasUppercase >= 3 ? "text-green-600" : "text-red-600"}`}
                >
                  {strengthDetails.hasUppercase >= 3 ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  Uppercase: {strengthDetails.hasUppercase}/3+
                </div>
                <div
                  className={`flex items-center gap-1 ${strengthDetails.hasLowercase >= 3 ? "text-green-600" : "text-red-600"}`}
                >
                  {strengthDetails.hasLowercase >= 3 ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  Lowercase: {strengthDetails.hasLowercase}/3+
                </div>
                <div
                  className={`flex items-center gap-1 ${strengthDetails.hasNumbers >= 3 ? "text-green-600" : "text-red-600"}`}
                >
                  {strengthDetails.hasNumbers >= 3 ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  Numbers: {strengthDetails.hasNumbers}/3+
                </div>
                <div
                  className={`flex items-center gap-1 ${strengthDetails.hasSpecialChars >= 3 ? "text-green-600" : "text-red-600"}`}
                >
                  {strengthDetails.hasSpecialChars >= 3 ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  Special: {strengthDetails.hasSpecialChars}/3+
                </div>
                <div
                  className={`flex items-center gap-1 ${!strengthDetails.hasRepeatingChars ? "text-green-600" : "text-red-600"}`}
                >
                  {!strengthDetails.hasRepeatingChars ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  No Repeating
                </div>
              </div>
            </div>
          )}

          {/* Password Display */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">40-Character Password:</label>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                  {showPassword ? "Hide" : "Show"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadDemoPassword}
                  className="text-purple-500 hover:text-purple-700"
                >
                  Load Demo
                </Button>
                {activeTab === "signup" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={generateSecurePassword}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Generate Secure
                  </Button>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm min-h-[80px] flex items-center break-all">
              {showPassword ? (
                <span className="text-gray-800">{getPasswordString() || "Enter 40-character password..."}</span>
              ) : (
                <span className="text-gray-800 tracking-wider">
                  {"•".repeat(getPasswordString().length) || "Enter 40-character password..."}
                </span>
              )}
            </div>
          </div>

          {/* Password Grid */}
          <div className="mb-6">
            <div className="grid grid-cols-8 gap-1 p-4 bg-gray-50 rounded-lg border border-gray-200">
              {Array.from({ length: TOTAL_CELLS }).map((_, index) => {
                const isActive = currentCell === index
                const hasContent = password[index] !== ""

                return (
                  <button
                    key={index}
                    ref={(el) => (cellRefs.current[index] = el)}
                    onClick={() => handleCellClick(index)}
                    onKeyDown={(e) => handleKeyPress(e, index)}
                    className={`
                      aspect-square rounded border-2 transition-all duration-200 relative overflow-hidden
                      text-sm font-mono font-semibold flex items-center justify-center
                      ${
                        isActive
                          ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200"
                          : hasContent
                            ? "border-green-400 bg-green-50"
                            : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
                      }
                    `}
                    disabled={isLoading}
                    tabIndex={0}
                  >
                    <span className={`${hasContent ? "text-gray-800" : "text-gray-400"}`}>
                      {showPassword ? password[index] : password[index] ? "•" : ""}
                    </span>

                    {isActive && <div className="absolute inset-0 border-2 border-blue-500 rounded animate-pulse" />}

                    <span className="absolute top-0 left-0 text-xs text-gray-400 font-normal leading-none p-0.5">
                      {index + 1}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="flex justify-between items-center mt-4 text-sm">
              <div className="text-gray-600">
                Progress: {getPasswordString().length}/{TOTAL_CELLS} characters
              </div>
              <div className="text-gray-500">Use arrow keys to navigate, type to enter characters</div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-800">
                <div className="font-medium">Success!</div>
                <div className="text-sm mt-1">{success}</div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                <div className="font-medium">Authentication Error</div>
                <div className="text-sm mt-1">{error}</div>
                {error.includes("Invalid password") && activeTab === "signin" && (
                  <div className="text-sm mt-2">
                    <strong>Tip:</strong> If you haven't created an account yet, switch to the "Sign Up" tab.
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button onClick={handleReset} variant="outline" className="flex-1 bg-transparent" disabled={isLoading}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear All
            </Button>

            <Button
              onClick={handleAuth}
              disabled={
                getPasswordString().length !== TOTAL_CELLS ||
                (activeTab === "signup" && passwordStrength < 90) ||
                isLoading
              }
              className="flex-1 bg-blue-500 hover:bg-blue-600"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  {activeTab === "signin" ? "Signing In..." : "Creating Account..."}
                </>
              ) : (
                <>
                  {activeTab === "signin" ? <LogIn className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                  {activeTab === "signin" ? "Sign In" : "Create Account"}
                </>
              )}
            </Button>
          </div>

          {/* Demo Info */}
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="text-sm font-medium text-purple-800 mb-2 flex items-center gap-1">
                <Info className="h-4 w-4" />
                Quick Start Demo:
              </h4>
              <div className="text-xs text-purple-700 space-y-1">
                <div>1. Click "Load Demo" to fill in the demo password</div>
                <div>2. If you're new, switch to "Sign Up" tab first</div>
                <div>3. If you have an account, use "Sign In" tab</div>
                <div>
                  4. Demo password:{" "}
                  <Badge variant="outline" className="font-mono text-xs">
                    MySecure40CharPassword2024!@#$%^&*()_+
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Supabase Authentication:
              </h4>
              <div className="text-xs text-blue-700 space-y-1">
                <div>• Default email: {DEFAULT_EMAIL}</div>
                <div>• Secure password storage with bcrypt hashing</div>
                <div>• Session management with JWT tokens</div>
                <div>• 40-character passwords for maximum security</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
