"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Unlock, RotateCcw, Eye, EyeOff } from "lucide-react"
import { useAuth } from "../contexts/auth-context"

// Create 8x5 grid (40 cells total)
const GRID_ROWS = 5
const GRID_COLS = 8
const TOTAL_CELLS = GRID_ROWS * GRID_COLS

// Default password pattern (you can change this)
const DEFAULT_PASSWORD = [0, 1, 8, 9, 16, 17, 24, 25] // Top-left 2x2 squares

export function CyberpunkLogin() {
  const [selectedCells, setSelectedCells] = useState<number[]>([])
  const [showPattern, setShowPattern] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [matrixLines, setMatrixLines] = useState<string[]>([])
  const { login } = useAuth()

  // Generate matrix effect
  useEffect(() => {
    const generateMatrixLine = () => {
      const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン"
      let line = ""
      for (let i = 0; i < 50; i++) {
        line += chars[Math.floor(Math.random() * chars.length)]
      }
      return line
    }

    const lines = Array.from({ length: 20 }, generateMatrixLine)
    setMatrixLines(lines)

    const interval = setInterval(() => {
      setMatrixLines((prev) => prev.map(() => generateMatrixLine()))
    }, 150)

    return () => clearInterval(interval)
  }, [])

  const handleCellClick = (cellIndex: number) => {
    setSelectedCells((prev) => {
      if (prev.includes(cellIndex)) {
        return prev.filter((index) => index !== cellIndex)
      } else {
        return [...prev, cellIndex]
      }
    })
    setError("")
  }

  const handleLogin = async () => {
    if (selectedCells.length === 0) {
      setError("Please select at least one cell")
      return
    }

    setIsLoading(true)
    setError("")

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if selected pattern matches default password
    const sortedSelected = [...selectedCells].sort((a, b) => a - b)
    const sortedDefault = [...DEFAULT_PASSWORD].sort((a, b) => a - b)

    const isMatch =
      sortedSelected.length === sortedDefault.length && sortedSelected.every((val, i) => val === sortedDefault[i])

    if (isMatch) {
      login("pattern-match")
    } else {
      setError("Invalid pattern. Access denied.")
      setSelectedCells([])
    }

    setIsLoading(false)
  }

  const handleReset = () => {
    setSelectedCells([])
    setError("")
  }

  const getCellPosition = (index: number) => {
    const row = Math.floor(index / GRID_COLS)
    const col = index % GRID_COLS
    return { row, col }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Matrix Background Effect */}
      <div className="absolute inset-0 opacity-20">
        {matrixLines.map((line, i) => (
          <div
            key={i}
            className="absolute text-green-400 text-xs font-mono whitespace-nowrap animate-pulse"
            style={{
              left: `${(i * 5) % 100}%`,
              top: `${(i * 3) % 100}%`,
              transform: `rotate(${(i * 2) % 360}deg)`,
              animationDelay: `${i * 0.1}s`,
            }}
          >
            {line}
          </div>
        ))}
      </div>

      {/* Animated Background Particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main Login Interface */}
      <Card className="relative bg-black/80 backdrop-blur-sm border-2 border-cyan-400/50 shadow-2xl shadow-cyan-400/20 max-w-2xl w-full">
        {/* Glowing Border Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-cyan-400/20 rounded-lg blur-sm animate-pulse" />

        <div className="relative p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
                <Lock className="h-6 w-6 text-black" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-cyan-400 font-mono tracking-wider">DEACATION-01</h1>
                <p className="text-cyan-300/70 text-sm font-mono">SECURITY PROTOCOL</p>
              </div>
            </div>

            <div className="border-t border-b border-cyan-400/30 py-3 mb-6">
              <h2 className="text-xl text-cyan-300 font-mono tracking-wide">PASSWORD MATRIX</h2>
              <p className="text-cyan-400/60 text-sm mt-1">Select pattern to authenticate</p>
            </div>
          </div>

          {/* Password Grid */}
          <div className="mb-6">
            <div className="grid grid-cols-8 gap-2 p-4 bg-black/50 rounded-lg border border-cyan-400/30">
              {Array.from({ length: TOTAL_CELLS }).map((_, index) => {
                const isSelected = selectedCells.includes(index)
                const { row, col } = getCellPosition(index)

                return (
                  <button
                    key={index}
                    onClick={() => handleCellClick(index)}
                    className={`
                      aspect-square rounded border-2 transition-all duration-200 relative overflow-hidden
                      ${
                        isSelected
                          ? "border-cyan-400 bg-cyan-400/30 shadow-lg shadow-cyan-400/50"
                          : "border-cyan-400/20 bg-black/30 hover:border-cyan-400/50 hover:bg-cyan-400/10"
                      }
                    `}
                    disabled={isLoading}
                  >
                    {/* Cell glow effect */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/40 to-blue-500/40 animate-pulse" />
                    )}

                    {/* Cell coordinates (optional, for debugging) */}
                    {showPattern && (
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-cyan-300 font-mono">
                        {index}
                      </span>
                    )}

                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Grid Info */}
            <div className="flex justify-between items-center mt-4 text-sm">
              <div className="text-cyan-400/70 font-mono">
                8 × 5 GRID • {selectedCells.length}/{TOTAL_CELLS} SELECTED
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPattern(!showPattern)}
                className="text-cyan-400/70 hover:text-cyan-400 font-mono"
              >
                {showPattern ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                {showPattern ? "HIDE" : "SHOW"} INDEX
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm font-mono text-center">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 font-mono bg-transparent"
              disabled={isLoading || selectedCells.length === 0}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              RESET
            </Button>

            <Button
              onClick={handleLogin}
              disabled={selectedCells.length === 0 || isLoading}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono font-bold"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4 mr-2" />
                  ACCESS SYSTEM
                </>
              )}
            </Button>
          </div>

          {/* Demo Info */}
          <div className="mt-6 text-center space-y-2">
            <Badge variant="outline" className="border-cyan-400/50 text-cyan-400 font-mono">
              DEMO MODE ACTIVE
            </Badge>
            <p className="text-xs text-cyan-400/60 font-mono">DEFAULT PATTERN: TOP-LEFT 2×2 SQUARE (CELLS 0,1,8,9)</p>
            <p className="text-xs text-cyan-400/40 font-mono">
              SELECT THE PATTERN AND CLICK ACCESS SYSTEM TO AUTHENTICATE
            </p>
          </div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-cyan-400/50" />
        <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-cyan-400/50" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-cyan-400/50" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-cyan-400/50" />
      </Card>
    </div>
  )
}
