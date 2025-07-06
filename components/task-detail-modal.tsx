"use client"

import { useState, useEffect } from "react"
import { Calendar, User, Clock, Flag } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Task } from "../lib/supabase"

interface TaskDetailModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSave: (task: Task) => void
  onDelete: (taskId: string) => void
  readOnly?: boolean
}

export function TaskDetailModal({ task, isOpen, onClose, onSave, onDelete, readOnly = false }: TaskDetailModalProps) {
  const [editedTask, setEditedTask] = useState<Task | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task })
      setIsEditing(false)
    }
  }, [task])

  if (!task || !editedTask) return null

  const handleSave = () => {
    onSave(editedTask)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this task?")) {
      onDelete(task.id)
      onClose()
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set"
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {isEditing && !readOnly ? (
              <Input
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="text-lg font-semibold"
              />
            ) : (
              <span>{task.title}</span>
            )}
            <div className="flex gap-2">
              {!readOnly && !isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              ) : !readOnly && isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    Save
                  </Button>
                </>
              ) : null}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label className="text-sm font-medium">Status</Label>
              {isEditing && !readOnly ? (
                <Select
                  value={editedTask.status}
                  onValueChange={(value: "todo" | "inprogress" | "done") =>
                    setEditedTask({ ...editedTask, status: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="inprogress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="mt-1">
                  <Badge variant="outline" className="capitalize">
                    {task.status === "inprogress" ? "In Progress" : task.status}
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex-1">
              <Label className="text-sm font-medium">Priority</Label>
              {isEditing && !readOnly ? (
                <Select
                  value={editedTask.priority}
                  onValueChange={(value: "low" | "medium" | "high") =>
                    setEditedTask({ ...editedTask, priority: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="mt-1">
                  <Badge variant="outline" className={getPriorityColor(task.priority)}>
                    <Flag className="h-3 w-3 mr-1" />
                    {task.priority}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium">Description</Label>
            {isEditing && !readOnly ? (
              <Textarea
                value={editedTask.description || ""}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                placeholder="Add a description..."
                className="mt-1 min-h-[100px]"
              />
            ) : (
              <div className="mt-1 p-3 bg-gray-50 rounded-md min-h-[100px]">
                {task.description || <span className="text-gray-500 italic">No description provided</span>}
              </div>
            )}
          </div>

          {/* Due Date and Assignee */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Due Date</Label>
              {isEditing && !readOnly ? (
                <Input
                  type="date"
                  value={editedTask.due_date || ""}
                  onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  {formatDate(task.due_date)}
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium">Assignee</Label>
              {isEditing && !readOnly ? (
                <Input
                  value={editedTask.assignee || ""}
                  onChange={(e) => setEditedTask({ ...editedTask, assignee: e.target.value })}
                  placeholder="Assign to..."
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  {task.assignee || "Unassigned"}
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Created: {formatDate(task.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Updated: {formatDate(task.updated_at)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            {!readOnly ? (
              <Button variant="destructive" onClick={handleDelete}>
                Delete Task
              </Button>
            ) : (
              <div></div>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
