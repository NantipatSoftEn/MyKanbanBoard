"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Trash2,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { todoOperations, type TodoResponse, type TodoFilters } from "@/lib/todo-supabase"
import { useAuth } from "@/contexts/supabase-auth-context"
import { AuthModal } from "@/components/auth-modal"
import { SupabaseAuthProvider } from "@/contexts/supabase-auth-context"

function TodoList() {
  const [todoResponse, setTodoResponse] = useState<TodoResponse>({
    todos: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCompleted, setFilterCompleted] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const { toast } = useToast()
  const { user } = useAuth()

  // Load todos with current filters
  const loadTodos = useCallback(
    async (filters?: Partial<TodoFilters>) => {
      if (!user) return

      try {
        setLoading(true)
        const todoFilters: TodoFilters = {
          search: searchTerm,
          completed: filterCompleted === "all" ? null : filterCompleted === "completed",
          page: currentPage,
          limit: itemsPerPage,
          ...filters,
        }

        const data = await todoOperations.getTodos(todoFilters)
        setTodoResponse(data)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load todos",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    },
    [user, searchTerm, filterCompleted, currentPage, itemsPerPage, toast],
  )

  // Load todos on component mount and when filters change
  useEffect(() => {
    if (user) {
      loadTodos()
    } else {
      setLoading(false)
    }
  }, [user, loadTodos])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadTodos({ page: 1 })
  }

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setFilterCompleted(value)
    setCurrentPage(1)
  }

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your todo",
        variant: "destructive",
      })
      return
    }

    try {
      setCreating(true)
      await todoOperations.createTodo({
        title: title.trim(),
        description: description.trim() || undefined,
      })

      setTitle("")
      setDescription("")

      // Reload todos to show the new one
      await loadTodos()

      toast({
        title: "Success",
        description: "Todo created successfully!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create todo",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const handleToggleTodo = async (id: string, completed: boolean) => {
    try {
      await todoOperations.toggleTodo(id, !completed)

      // Update the todo in the current list
      setTodoResponse((prev) => ({
        ...prev,
        todos: prev.todos.map((todo) =>
          todo.id === id ? { ...todo, completed: !completed, updated_at: new Date().toISOString() } : todo,
        ),
      }))

      toast({
        title: "Success",
        description: `Todo marked as ${!completed ? "completed" : "incomplete"}!`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update todo",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTodo = async (id: string) => {
    try {
      await todoOperations.deleteTodo(id)

      // Reload todos to update pagination
      await loadTodos()

      toast({
        title: "Success",
        description: "Todo deleted successfully!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete todo",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Generate pagination buttons
  const generatePaginationButtons = () => {
    const buttons = []
    const { page, totalPages } = todoResponse

    // First page
    buttons.push(
      <Button key="first" variant="outline" size="sm" onClick={() => handlePageChange(1)} disabled={page === 1}>
        <ChevronsLeft className="w-4 h-4" />
      </Button>,
    )

    // Previous page
    buttons.push(
      <Button key="prev" variant="outline" size="sm" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
        <ChevronLeft className="w-4 h-4" />
      </Button>,
    )

    // Page numbers
    const startPage = Math.max(1, page - 2)
    const endPage = Math.min(totalPages, page + 2)

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button key={i} variant={i === page ? "default" : "outline"} size="sm" onClick={() => handlePageChange(i)}>
          {i}
        </Button>,
      )
    }

    // Next page
    buttons.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(page + 1)}
        disabled={page === totalPages}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>,
    )

    // Last page
    buttons.push(
      <Button
        key="last"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(totalPages)}
        disabled={page === totalPages}
      >
        <ChevronsRight className="w-4 h-4" />
      </Button>,
    )

    return buttons
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: "K2D, sans-serif", fontWeight: 400 }}
            >
              Welcome to Todo List
            </CardTitle>
            <p className="text-gray-600 mt-2">Please sign in to manage your todos</p>
          </CardHeader>
          <CardContent>
            <AuthModal />
          </CardContent>
        </Card>
      </div>
    )
  }

  const { todos, total, page, totalPages } = todoResponse
  const completedCount = todos.filter((todo) => todo.completed).length

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
      style={{ fontFamily: "K2D, sans-serif", fontWeight: 400 }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: "K2D, sans-serif", fontWeight: 400 }}
          >
            My Todo List
          </h1>
          <p className="text-gray-600">Stay organized and get things done!</p>

          {total > 0 && (
            <div className="flex justify-center gap-4 mt-4">
              <Badge variant="outline" className="text-sm">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                {completedCount} completed
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Circle className="w-4 h-4 mr-1" />
                {todos.length - completedCount} on this page
              </Badge>
              <Badge variant="secondary" className="text-sm">
                Total: {total} todos
              </Badge>
            </div>
          )}
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ fontFamily: "K2D, sans-serif", fontWeight: 400 }}>
              <Search className="w-5 h-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search todos by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterCompleted} onValueChange={handleFilterChange}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Todos</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit" variant="default">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Create Todo Form */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ fontFamily: "K2D, sans-serif", fontWeight: 400 }}>
              <Plus className="w-5 h-5" />
              Add New Todo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTodo} className="space-y-4">
              <div>
                <Input
                  placeholder="What needs to be done?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg"
                  disabled={creating}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Add a description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  disabled={creating}
                />
              </div>
              <Button type="submit" disabled={creating || !title.trim()} className="w-full">
                {creating ? "Adding..." : "Add Todo"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Pagination Controls - Top */}
        {totalPages > 1 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Items per page:</span>
                  <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, total)} of {total} todos
                  </span>
                </div>

                <div className="flex items-center gap-1">{generatePaginationButtons()}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Todo List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your todos...</p>
          </div>
        ) : todos.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Circle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3
                className="text-xl font-semibold text-gray-700 mb-2"
                style={{ fontFamily: "K2D, sans-serif", fontWeight: 400 }}
              >
                {searchTerm || filterCompleted !== "all" ? "No todos found" : "No todos yet"}
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterCompleted !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first todo to get started!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {todos.map((todo) => (
              <Card
                key={todo.id}
                className={`shadow-md transition-all duration-200 hover:shadow-lg ${
                  todo.completed ? "bg-green-50 border-green-200" : "bg-white"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => handleToggleTodo(todo.id, todo.completed)}
                      className="mt-1"
                    />

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-lg font-semibold ${
                          todo.completed ? "text-green-700 line-through" : "text-gray-900"
                        }`}
                        style={{ fontFamily: "K2D, sans-serif", fontWeight: 400 }}
                      >
                        {todo.title}
                      </h3>

                      {todo.description && (
                        <p className={`mt-2 ${todo.completed ? "text-green-600 line-through" : "text-gray-600"}`}>
                          {todo.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Created: {formatDate(todo.created_at)}
                        </div>
                        {todo.updated_at !== todo.created_at && (
                          <div className="flex items-center gap-1">Updated: {formatDate(todo.updated_at)}</div>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination Controls - Bottom */}
        {totalPages > 1 && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </div>

                <div className="flex items-center gap-1">{generatePaginationButtons()}</div>

                <div className="text-sm text-gray-600">Total: {total} todos</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function TodoPage() {
  return (
    <SupabaseAuthProvider>
      <TodoList />
    </SupabaseAuthProvider>
  )
}
