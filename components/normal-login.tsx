"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Unlock,
  RotateCcw,
  Eye,
  EyeOff,
  SkipBackIcon as Backspace,
  Shield,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { useAuth } from "../contexts/auth-context"

// Create 8x5 grid (40 cells total)
const GRID_ROWS = 5
const GRID_COLS = 8
const TOTAL_CELLS = GRID_ROWS * GRID_COLS

// Secure 40-character password (you can change this)
const DEFAULT_PASSWORD = "MySecure40CharPassword2024!@#$%^&*()_+"

// Password strength requirements
const PASSWORD_REQUIREMENTS = {
  length: 40,
  minUppercase: 3,
  minLowercase: 3,
  minNumbers: 3,
  minSpecialChars: 3,
  noRepeatingSequence: 3, // No more than 3 consecutive identical characters
}

export function NormalLogin() {
  const [password, setPassword] = useState<string[]>(Array(TOTAL_CELLS).fill(""))
  const [currentCell, setCurrentCell] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [strengthDetails, setStrengthDetails] = useState<any>({})
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([])
  const { login } = useAuth()

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
    const maxScore = 100

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
  }

  const handleKeyPress = (e: React.KeyboardEvent, cellIndex: number) => {
    const key = e.key

    if (key === "Backspace") {
      e.preventDefault()
      // Clear current cell and move to previous
      const newPassword = [...password]
      newPassword[cellIndex] = ""
      setPassword(newPassword)

      if (cellIndex > 0) {
        setCurrentCell(cellIndex - 1)
      }
    } else if (key === "Delete") {
      e.preventDefault()
      // Clear current cell
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
      handleLogin()
    } else if (key.length === 1 && /[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(key)) {
      e.preventDefault()
      // Add character to current cell
      const newPassword = [...password]
      newPassword[cellIndex] = key
      setPassword(newPassword)

      // Move to next cell
      if (cellIndex < TOTAL_CELLS - 1) {
        setCurrentCell(cellIndex + 1)
      }
    }
  }

  const handleLogin = async () => {
    const enteredPassword = password.join("")

    if (enteredPassword.length !== PASSWORD_REQUIREMENTS.length) {
      setError(`Password must be exactly ${PASSWORD_REQUIREMENTS.length} characters long`)
      return
    }

    const strength = calculatePasswordStrength(enteredPassword)
    if (!strength.isSecure) {
      setError("Password does not meet security requirements")
      return
    }

    setIsLoading(true)
    setError("")

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (enteredPassword === DEFAULT_PASSWORD) {
      login("secure-password-match")
    } else {
      setError("Invalid password. Please try again.")
    }

    setIsLoading(false)
  }

  const handleReset = () => {
    setPassword(Array(TOTAL_CELLS).fill(""))
    setCurrentCell(0)
    setError("")
  }

  const handleBackspace = () => {
    if (currentCell >= 0) {
      const newPassword = [...password]
      if (password[currentCell] !== "") {
        // Clear current cell
        newPassword[currentCell] = ""
        setPassword(newPassword)
      } else if (currentCell > 0) {
        // Move to previous cell and clear it
        newPassword[currentCell - 1] = ""
        setPassword(newPassword)
        setCurrentCell(currentCell - 1)
      }
    }
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
      // Avoid creating repeating sequences
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
      {/* Main Login Interface */}
      <Card className="bg-white shadow-xl border border-gray-200 max-w-4xl w-full">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-800">Secure 40-Character Login</h1>
                <p className="text-gray-600 text-sm">Enter a strong 40-character password</p>
              </div>
            </div>

            <div className="border-t border-b border-gray-200 py-3 mb-6">
              <h2 className="text-xl text-gray-700 font-semibold">Password Grid (8×5 = 40 characters)</h2>
              <p className="text-gray-500 text-sm mt-1">Fill all 40 cells with a secure password</p>
            </div>
          </div>

          {/* Password Strength Indicator */}
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

          {/* Password Display */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Password Preview:</label>
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
                  onClick={generateSecurePassword}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Generate Secure
                </Button>
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
                    {/* Cell content */}
                    <span className={`${hasContent ? "text-gray-800" : "text-gray-400"}`}>
                      {showPassword ? password[index] : password[index] ? "•" : ""}
                    </span>

                    {/* Active cell indicator */}
                    {isActive && <div className="absolute inset-0 border-2 border-blue-500 rounded animate-pulse" />}

                    {/* Cell position indicator (small) */}
                    <span className="absolute top-0 left-0 text-xs text-gray-400 font-normal leading-none p-0.5">
                      {index + 1}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Grid Info */}
            <div className="flex justify-between items-center mt-4 text-sm">
              <div className="text-gray-600">
                Progress: {getPasswordString().length}/{TOTAL_CELLS} characters
              </div>
              <div className="text-gray-500">Use arrow keys to navigate, type to enter characters</div>
            </div>
          </div>

          {/* Virtual Keyboard Helper */}
          <div className="mb-6">
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackspace}
                className="flex items-center gap-1 bg-transparent"
                disabled={isLoading}
              >
                <Backspace className="h-4 w-4" />
                Backspace
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button onClick={handleReset} variant="outline" className="flex-1 bg-transparent" disabled={isLoading}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear All
            </Button>

            <Button
              onClick={handleLogin}
              disabled={getPasswordString().length !== TOTAL_CELLS || passwordStrength < 90 || isLoading}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4 mr-2" />
                  Secure Login
                </>
              )}
            </Button>
          </div>

          {/* Security Requirements */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Security Requirements:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-700">
              <div>• Exactly 40 characters (fill all cells)</div>
              <div>• At least 3 uppercase letters (A-Z)</div>
              <div>• At least 3 lowercase letters (a-z)</div>
              <div>• At least 3 numbers (0-9)</div>
              <div>• At least 3 special characters (!@#$%^&*)</div>
              <div>• No more than 2 consecutive identical characters</div>
            </div>
          </div>

          {/* Demo Info */}
          <div className="mt-4 text-center space-y-2">
            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
              Demo Password Available
            </Badge>
            <p className="text-xs text-gray-500">
              Demo: <code className="bg-gray-100 px-1 rounded">MySecure40CharPassword2024!@#$%^&*()_+</code>
            </p>
            <p className="text-xs text-gray-400">Or click "Generate Secure" to create a random secure password</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
