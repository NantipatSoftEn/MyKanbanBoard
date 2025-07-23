"use client"

import {
  Database,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface KanbanStatusBarProps {
  isConnected: boolean
  usingMockData: boolean
  loading: boolean
  onRefresh: () => void
}

export function KanbanStatusBar({
  isConnected,
  usingMockData,
  loading,
  onRefresh,
}: KanbanStatusBarProps) {
  return (
    <div className="flex items-center justify-end mb-6 gap-3">
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

      <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
        <RefreshCw className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`} />
        Refresh
      </Button>
    </div>
  )
}
