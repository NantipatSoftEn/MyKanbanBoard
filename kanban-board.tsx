"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Plus,
  X,
  GripVertical,
  Eye,
  Database,
  Wifi,
  WifiOff,
  AlertTriangle,
  RefreshCw,
  Lock,
  LogIn,
  LogOut,
  User,
  Undo2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import {
  taskOperations,
  mockTasks,
  type Task,
  type Column,
} from "./lib/supabase";
import { TaskDetailModal } from "./components/task-detail-modal";
import { AuthModal } from "./components/auth-modal";
import { useAuth } from "./contexts/supabase-auth-context";

export default function KanbanBoard() {
  const { user, signOut } = useAuth();
  const isAuthenticated = !!user;

  const [columns, setColumns] = useState<Column[]>([
    { id: "todo", title: "To Do", tasks: [] },
    { id: "inprogress", title: "In Progress", tasks: [] },
    { id: "done", title: "Done", tasks: [] },
  ]);

  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const [recentlyDeleted, setRecentlyDeleted] = useState<Task | null>(null);

  // New task form state
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as Task["priority"],
    due_date: "",
    assignee: "",
  });

  // Load tasks on component mount and when user changes
  useEffect(() => {
    loadTasks();
  }, []); // Remove user dependency for initial load

  // Reload when user logs in/out to show their personal tasks vs all tasks
  useEffect(() => {
    if (user !== null) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Always try to load from database first, regardless of auth status
      const tableExists = await taskOperations.checkTableExists();

      if (tableExists) {
        try {
          const tasks = await taskOperations.getAllTasks();
          setIsConnected(true);
          setUsingMockData(false);

          // Group tasks by status
          const groupedTasks = tasks.reduce((acc, task) => {
            if (!acc[task.status]) acc[task.status] = [];
            acc[task.status].push(task);
            return acc;
          }, {} as Record<string, Task[]>);

          setColumns((prev) =>
            prev.map((column) => ({
              ...column,
              tasks: groupedTasks[column.id] || [],
            }))
          );
        } catch (dbError: any) {
          console.error("Database error, falling back to mock data:", dbError);
          loadMockData();
        }
      } else {
        // Table doesn't exist, use mock data
        setError("Database table not found. Showing demo data.");
        loadMockData();
      }
    } catch (err: any) {
      console.error("Error loading tasks:", err);
      setError(`Failed to connect to database: ${err.message}`);
      setIsConnected(false);
      // Always fall back to mock data so users can see the board
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    setUsingMockData(true);

    // Group mock tasks by status
    const groupedTasks = mockTasks.reduce((acc, task) => {
      if (!acc[task.status]) acc[task.status] = [];
      acc[task.status].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    setColumns((prev) =>
      prev.map((column) => ({
        ...column,
        tasks: groupedTasks[column.id] || [],
      }))
    );
  };

  const handleDragStart = (task: Task, columnId: string) => {
    if (!isAuthenticated) {
      // Don't show modal immediately, just prevent drag
      return;
    }
    setDraggedTask(task);
    setDraggedFrom(columnId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isAuthenticated) return;
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();

    if (
      !isAuthenticated ||
      !draggedTask ||
      !draggedFrom ||
      draggedFrom === targetColumnId
    ) {
      setDraggedTask(null);
      setDraggedFrom(null);
      return;
    }

    // Update local state immediately for better UX
    const updatedTask = {
      ...draggedTask,
      status: targetColumnId as Task["status"],
    };

    setColumns((prevColumns) => {
      const newColumns = prevColumns.map((column) => {
        if (column.id === draggedFrom) {
          return {
            ...column,
            tasks: column.tasks.filter((task) => task.id !== draggedTask.id),
          };
        }
        if (column.id === targetColumnId) {
          return {
            ...column,
            tasks: [...column.tasks, updatedTask],
          };
        }
        return column;
      });
      return newColumns;
    });

    // Try to update in database if connected
    if (isConnected && !usingMockData) {
      try {
        await taskOperations.updateTaskStatus(
          draggedTask.id,
          targetColumnId as Task["status"]
        );
        toast({
          title: "Task moved",
          description: `"${draggedTask.title}" moved to ${
            targetColumnId === "inprogress"
              ? "In Progress"
              : targetColumnId === "todo"
              ? "To Do"
              : "Done"
          }`,
        });
      } catch (err: any) {
        console.error("Error updating task:", err);
        setError("Failed to update task in database. Changes are temporary.");
        toast({
          title: "Error",
          description: "Failed to update task status in database",
          variant: "destructive",
        });
      }
    } else if (usingMockData) {
      toast({
        title: "Demo Mode",
        description: `Task moved to ${
          targetColumnId === "inprogress"
            ? "In Progress"
            : targetColumnId === "todo"
            ? "To Do"
            : "Done"
        } (demo only)`,
      });
    }

    setDraggedTask(null);
    setDraggedFrom(null);
  };

  const addTask = async (columnId: string) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!newTask.title.trim()) return;

    const taskData: Task = {
      id: `temp-${Date.now()}`, // Temporary ID for mock data
      title: newTask.title,
      description: newTask.description || null,
      status: columnId as Task["status"],
      priority: newTask.priority,
      due_date: newTask.due_date || null,
      assignee: newTask.assignee || null,
      position: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Try to create in database if connected
    if (isConnected && !usingMockData) {
      try {
        const createdTask = await taskOperations.createTask({
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          due_date: taskData.due_date,
          assignee: taskData.assignee,
          position: taskData.position,
        });
        taskData.id = createdTask.id;
        taskData.created_at = createdTask.created_at;
        taskData.updated_at = createdTask.updated_at;

        toast({
          title: "Task created",
          description: `"${taskData.title}" has been added to ${
            columnId === "inprogress"
              ? "In Progress"
              : columnId === "todo"
              ? "To Do"
              : "Done"
          }`,
        });
      } catch (err: any) {
        console.error("Error adding task:", err);
        setError("Failed to save task to database. Using temporary storage.");
        toast({
          title: "Error",
          description: "Failed to save task to database",
          variant: "destructive",
        });
      }
    }

    // Update local state
    setColumns((prevColumns) =>
      prevColumns.map((column) =>
        column.id === columnId
          ? { ...column, tasks: [...column.tasks, taskData] }
          : column
      )
    );

    // Reset form
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      due_date: "",
      assignee: "",
    });
    setShowAddTask(null);
  };

  const updateTask = async (updatedTask: Task) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    // Update local state immediately
    setColumns((prevColumns) =>
      prevColumns.map((column) => ({
        ...column,
        tasks: column.tasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        ),
      }))
    );

    setSelectedTask(updatedTask);

    // Try to update in database if connected
    if (isConnected && !usingMockData) {
      try {
        await taskOperations.updateTask(updatedTask.id, {
          title: updatedTask.title,
          description: updatedTask.description,
          status: updatedTask.status,
          priority: updatedTask.priority,
          due_date: updatedTask.due_date,
          assignee: updatedTask.assignee,
        });

        toast({
          title: "Task updated",
          description: `"${updatedTask.title}" has been updated`,
        });
      } catch (err: any) {
        console.error("Error updating task:", err);
        setError("Failed to update task in database. Changes are temporary.");
        toast({
          title: "Error",
          description: "Failed to update task in database",
          variant: "destructive",
        });
      }
    }
  };

  const deleteTask = async (task: Task) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    taskOperations.deleteTask(task)
  };

  const restoreTask = async (task: Task) => {
    if (!isAuthenticated) return;

    // Add task back to UI immediately
    setColumns((prevColumns) =>
      prevColumns.map((column) => {
        if (column.id === task.status) {
          return {
            ...column,
            tasks: [...column.tasks, task],
          };
        }
        return column;
      })
    );

    // Try to restore in database if connected
    if (isConnected && !usingMockData) {
      try {
        await taskOperations.restoreTask(task.id);
        toast({
          title: "Task restored",
          description: `"${task.title}" has been restored`,
        });
      } catch (err: any) {
        console.error("Error restoring task:", err);
        toast({
          title: "Error",
          description: "Failed to restore task from database",
          variant: "destructive",
        });
      }
    }

    setRecentlyDeleted(null);
  };

  const openTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleTaskClick = (task: Task) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Database className="h-6 w-6 animate-pulse" />
          <div className="text-lg">Loading your tasks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Kanban Board</h1>
          <div className="flex items-center gap-3">
            <Badge
              variant={
                isConnected
                  ? "default"
                  : usingMockData
                  ? "secondary"
                  : "destructive"
              }
              className="flex items-center gap-1"
            >
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3" />
                  Connected to Supabase
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

            <Button
              variant="outline"
              size="sm"
              onClick={loadTasks}
              disabled={loading}
            >
              <RefreshCw
                className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            {isAuthenticated ? (
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-3 w-3 mr-1" />
                Logout
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAuthModalOpen(true)}
              >
                <LogIn className="h-3 w-3 mr-1" />
                Login
              </Button>
            )}
          </div>
        </div>

        {!isAuthenticated && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Lock className="h-4 w-4" />
            <AlertDescription className="text-blue-800">
              <div className="font-medium">View-Only Mode</div>
              <div className="text-sm mt-1">
                You're viewing the board in read-only mode. Login to create,
                edit, or move tasks.
              </div>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-orange-800">
              <div className="font-medium">Database Connection Issue</div>
              <div className="text-sm mt-1">{error}</div>
              {error.includes("table not found") ||
              error.includes("does not exist") ? (
                <div className="text-sm mt-2">
                  <strong>Solution:</strong> Run the SQL script in your Supabase
                  dashboard to create the tasks table.
                </div>
              ) : null}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div
              key={column.id}
              className="bg-gray-100 rounded-lg p-4 min-h-[600px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-700 text-lg">
                  {column.title}
                </h2>
                <Badge variant="secondary" className="text-xs">
                  {column.tasks.length}
                </Badge>
              </div>

              <div className="space-y-3">
                {column.tasks.map((task:Task) => (
                  <Card
                    key={task.id}
                    className={`${
                      isAuthenticated
                        ? "cursor-move hover:shadow-md"
                        : "cursor-default hover:shadow-sm"
                    } transition-shadow bg-white ${
                      !isAuthenticated ? "opacity-95" : ""
                    }`}
                    draggable={isAuthenticated}
                    onDragStart={() => handleDragStart(task, column.id)}
                    onClick={() => !isAuthenticated && handleTaskClick(task)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <GripVertical
                            className={`h-4 w-4 ${
                              isAuthenticated
                                ? "text-gray-400"
                                : "text-gray-300"
                            }`}
                          />
                          <h3 className="font-medium text-sm leading-tight">
                            {task.title}
                          </h3>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-blue-100"
                            onClick={() => openTaskDetail(task)}
                          >
                            <Eye className="h-3 w-3 text-blue-500" />
                          </Button>
                          {isAuthenticated ? (
                            // <Button
                            //   variant="ghost"
                            //   size="sm"
                            //   className="h-6 w-6 p-0 hover:bg-red-100"
                            //   onClick={() => deleteTask(task.id)}
                            // >
                            //   <X className="h-3 w-3 text-red-500" />
                            // </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-red-100"
                              onClick={() =>   deleteTask(task)}
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-50 cursor-not-allowed"
                              onClick={() => setIsAuthModalOpen(true)}
                            >
                              <X className="h-3 w-3 text-gray-400" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </Badge>
                        {task.due_date && (
                          <span className="text-xs text-gray-500">
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      {task.assignee && (
                        <p className="text-xs text-blue-600 mt-1">
                          @{task.assignee}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {showAddTask === column.id && isAuthenticated ? (
                <div className="mt-3 space-y-3 p-3 bg-white rounded-lg border">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium">
                      Title *
                    </Label>
                    <Input
                      id="title"
                      placeholder="Enter task title..."
                      value={newTask.title}
                      onChange={(e) =>
                        setNewTask({ ...newTask, title: e.target.value })
                      }
                      autoFocus
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Add a description..."
                      value={newTask.description}
                      onChange={(e) =>
                        setNewTask({ ...newTask, description: e.target.value })
                      }
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="priority" className="text-sm font-medium">
                        Priority
                      </Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(value: "low" | "medium" | "high") =>
                          setNewTask({ ...newTask, priority: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="due_date" className="text-sm font-medium">
                        Due Date
                      </Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={newTask.due_date}
                        onChange={(e) =>
                          setNewTask({ ...newTask, due_date: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="assignee" className="text-sm font-medium">
                      Assignee
                    </Label>
                    <Input
                      id="assignee"
                      placeholder="Assign to..."
                      value={newTask.assignee}
                      onChange={(e) =>
                        setNewTask({ ...newTask, assignee: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => addTask(column.id)}
                      className="flex-1"
                      disabled={!newTask.title.trim()}
                    >
                      Add Task
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowAddTask(null);
                        setNewTask({
                          title: "",
                          description: "",
                          priority: "medium",
                          due_date: "",
                          assignee: "",
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : isAuthenticated ? (
                <Button
                  variant="ghost"
                  className="w-full mt-3 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  onClick={() => setShowAddTask(column.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add a task
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full mt-3 border-2 border-dashed border-gray-200 opacity-60 cursor-not-allowed"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Login to add tasks
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={updateTask}
        onDelete={deleteTask}
        readOnly={!isAuthenticated}
      />
    </div>
  );
}
