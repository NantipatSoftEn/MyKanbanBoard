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
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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
  User,
  Globe,
  Lock,
  AlertCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { todoOperations, type TodoResponse, type TodoFilters, type TodoTag } from "@/lib/todo-supabase"
import { useAuth } from "@/contexts/supabase-auth-context"
import { TagSelector } from "@/components/tag-selector"
import { TagFilter } from "@/components/tag-filter"
import { SupabaseAuthProvider } from "@/contexts/supabase-auth-context"

function TodoList() {
  const [todoResponse, setTodoResponse] = useState<TodoResponse>({
    todos: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })
  const [tags, setTags] = useState<TodoTag[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCompleted, setFilterCompleted] = useState<string>("all")
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [showOnlyMine, setShowOnlyMine] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [hasPublicColumn, setHasPublicColumn] = useState(false)
  const [hasTagsColumn, setHasTagsColumn] = useState(false)
  const { toast } = useToast()
  const { user, signOut } = useAuth()

  // Check if database has been migrated
  const checkDatabaseMigration = useCallback(async () => {
    try {
      const [hasPublic, hasTags] = await Promise.all([
        todoOperations.checkPublicColumnExists(),
        todoOperations.checkTagsColumnExists(),
      ])
      setHasPublicColumn(hasPublic)
      setHasTagsColumn(hasTags)
      return { hasPublic, hasTags }
    } catch (error) {
      console.error("Error checking database migration:", error)
      setHasPublicColumn(false)
      setHasTagsColumn(false)
      return { hasPublic: false, hasTags: false }
    }
  }, [])

  // Load tags
  const loadTags = useCallback(async () => {
    try {
      const tagsData = await todoOperations.getAllTags()
      setTags(tagsData)
    } catch (error) {
      console.error("Error loading tags:", error)
      // Set fallback tags
      setTags([
        { id: "1", name: "youtube", color: "#ff0000", icon: "📺", created_at: "2024-01-01T00:00:00Z" },
        { id: "2", name: "facebook", color: "#1877f2", icon: "📘", created_at: "2024-01-01T00:00:00Z" },
        { id: "3", name: "book", color: "#8b5cf6", icon: "📚", created_at: "2024-01-01T00:00:00Z" },
        { id: "4", name: "anime", color: "#f59e0b", icon: "🎌", created_at: "2024-01-01T00:00:00Z" },
        { id: "5", name: "read", color: "#10b981", icon: "📖", created_at: "2024-01-01T00:00:00Z" },
        { id: "6", name: "watch", color: "#ef4444", icon: "👀", created_at: "2024-01-01T00:00:00Z" },
        { id: "7", name: "learn", color: "#3b82f6", icon: "🎓", created_at: "2024-01-01T00:00:00Z" },
        { id: "8", name: "work", color: "#6b7280", icon: "💼", created_at: "2024-01-01T00:00:00Z" },
      ])
    }
  }, [])

  // Load todos with current filters
  const loadTodos = useCallback(
    async (filters?: Partial<TodoFilters>) => {
      try {
        setLoading(true)
        const todoFilters: TodoFilters = {
          search: searchTerm,
          completed: filterCompleted === "all" ? null : filterCompleted === "completed",
          page: currentPage,
          limit: itemsPerPage,
          showOnlyMine: user ? showOnlyMine : false,
          tags: filterTags.length > 0 ? filterTags : undefined,
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
    [searchTerm, filterCompleted, currentPage, itemsPerPage, showOnlyMine, filterTags, user, toast],
  )

  // Load todos on component mount and when filters change
  useEffect(() => {
    const initializeData = async () => {
      await checkDatabaseMigration()
      await loadTags()
      await loadTodos()
    }
    initializeData()
  }, [checkDatabaseMigration, loadTags, loadTodos])

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

  // Handle show only mine toggle
  const handleShowOnlyMineChange = (checked: boolean) => {
    setShowOnlyMine(checked)
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

  // Handle tag filter change
  const handleTagFilterChange = (tags: string[]) => {
    setFilterTags(tags)
    setCurrentPage(1)
  }

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setShowAuthModal(true)
      return
    }

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
        is_public: hasPublicColumn ? isPublic : undefined,
        tags: hasTagsColumn ? selectedTags : undefined,
      })

      setTitle("")
      setDescription("")
      setIsPublic(true)
      setSelectedTags([])

      // Reload todos and tags to show the new ones
      await Promise.all([loadTodos(), loadTags()])

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
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to modify todos",
        variant: "destructive",
      })
      return
    }

    try {
      const canModify = await todoOperations.canModifyTodo(id)
      if (!canModify) {
        toast({
          title: "Permission Denied",
          description: "You can only modify your own todos",
          variant: "destructive",
        })
        return
      }

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
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to delete todos",
        variant: "destructive",
      })
      return
    }

    try {
      const canModify = await todoOperations.canModifyTodo(id)
      if (!canModify) {
        toast({
          title: "Permission Denied",
          description: "You can only delete your own todos",
          variant: "destructive",
        })
        return
      }

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

  const handleCreateTag = async (tagData: { name: string; color: string; icon?: string }) => {
    try {
      const newTag = await todoOperations.createTag(tagData)
      setTags((prev) => [...prev, newTag])
      toast({
        title: "Success",
        description: `Tag "${tagData.name}" created successfully!`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create tag",
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

  const isOwner = (todo: any) => {
    return user && todo.user_id === user.id
  }

  // Generate pagination buttons
  const generatePaginationButtons = () => {
    const buttons = []
    const { page, totalPages } = todoResponse

    // First page
    buttons.push(
      <Button
        key="first"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(1)}
        disabled={page === 1}
        className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
      >
        <ChevronsLeft className="w-4 h-4" />
      </Button>,
    )

    // Previous page
    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
        className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>,
    )

    // Page numbers
    const startPage = Math.max(1, page - 2)
    const endPage = Math.min(totalPages, page + 2)

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={i === page ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className={
            i === page
              ? "bg-white/30 backdrop-blur-sm text-white"
              : "bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
          }
        >
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
        className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
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
        className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
      >
        <ChevronsRight className="w-4 h-4" />
      </Button>,
    )

    return buttons
  }

  const { todos, total, page, totalPages } = todoResponse
  const completedCount = todos.filter((todo) => todo.completed).length

  return (
    <div
      className="min-h-screen p-4 relative overflow-hidden"
      style={{ fontFamily: "K2D, sans-serif", fontWeight: 400 }}
    >
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="fixed top-0 left-0 w-full h-full object-cover -z-10 ">
        <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/git-blob/prj_i7dyLy8i8ztystF0OGq5i7lxX8Fb/rnhgi9A9DQBkzXjdzvAXdU/public/loop.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Background overlay for better readability */}
      <div className="fixed top-0 left-0 w-full h-full bg-black/30 -z-5"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Database Migration Warning */}
        {(!hasPublicColumn || !hasTagsColumn) && (
          <Card className="mb-6 bg-orange-500/20 backdrop-blur-lg rounded-xl border border-orange-300/40 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-orange-100">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <p className="font-semibold text-white drop-shadow-sm">Database Migration Required</p>
                  <p className="text-sm text-orange-100/90">
                    Please run the migration script{" "}
                    <code className="bg-white/20 px-1 rounded text-white">add-tags-to-todos.sql</code> to enable
                    {!hasPublicColumn && " public/private"}
                    {!hasPublicColumn && !hasTagsColumn && " and"}
                    {!hasTagsColumn && " tagging"} features.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="text-center mb-8 bg-white/15 backdrop-blur-lg rounded-xl p-6 border border-white/30 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div></div>
            <h1
              className="text-4xl font-bold text-white drop-shadow-lg"
              style={{ fontFamily: "K2D, sans-serif", fontWeight: 400 }}
            >
              {hasPublicColumn ? "จำไม่หมดจดกันเถอะ" : "จำไม่หมดจดกันเถอะ"}
            </h1>
            <div className="flex items-center gap-2">{/* Auth controls can be added here if needed */}</div>
          </div>
          <p className="text-white/90 drop-shadow-sm">
            {hasPublicColumn
              ? user
                ? ""
                : ""
              : user
                ? "Manage your personal todos!"
                : "View todos. Sign in to add your own!"}
          </p>

          {total > 0 && (
            <div className="flex justify-center gap-4 mt-4">
              <Badge variant="outline" className="text-sm bg-white/20 backdrop-blur-sm border-white/40 text-white">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                {completedCount} completed
              </Badge>
              <Badge variant="outline" className="text-sm bg-white/20 backdrop-blur-sm border-white/40 text-white">
                <Circle className="w-4 h-4 mr-1" />
                {todos.length - completedCount} on this page
              </Badge>
              <Badge variant="secondary" className="text-sm bg-white/25 backdrop-blur-sm border-white/40 text-white">
                Total: {total} todos
              </Badge>
            </div>
          )}
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-6 bg-white/15 backdrop-blur-lg rounded-xl border border-white/30 shadow-xl">
          <CardHeader>
            <CardTitle
              className="flex items-center gap-2 text-white drop-shadow-sm"
              style={{ fontFamily: "K2D, sans-serif", fontWeight: 400 }}
            >
              <Search className="w-5 h-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search todos by title, description, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/20 backdrop-blur-sm border-white/40 text-white placeholder:text-white/70"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterCompleted} onValueChange={handleFilterChange}>
                    <SelectTrigger className="w-40 bg-white/20 backdrop-blur-sm border-white/40 text-white">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/90 backdrop-blur-lg border-white/50">
                      <SelectItem value="all">All Todos</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="submit"
                    variant="default"
                    className="bg-white/30 backdrop-blur-sm text-white hover:bg-white/40"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>

              {/* Tag Filter */}
              {hasTagsColumn && (
                <div>
                  <TagFilter availableTags={tags} selectedTags={filterTags} onTagsChange={handleTagFilterChange} />
                </div>
              )}

              {user && hasPublicColumn && (
                <div className="flex items-center space-x-2">
                  <Switch id="show-only-mine" checked={showOnlyMine} onCheckedChange={handleShowOnlyMineChange} />
                  <Label htmlFor="show-only-mine" className="text-sm text-white drop-shadow-sm">
                    Show only my todos
                  </Label>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Create Todo Form */}
        <Card className="mb-8 bg-white/15 backdrop-blur-lg rounded-xl border border-white/30 shadow-xl">
          <CardHeader>
            <CardTitle
              className="flex items-center gap-2 text-white drop-shadow-sm"
              style={{ fontFamily: "K2D, sans-serif", fontWeight: 400 }}
            >
              <Plus className="w-5 h-5" />
              Add New Notes
              {!user && (
                <Badge variant="secondary" className="ml-2 bg-white/25 backdrop-blur-sm border-white/40 text-white">
                  Sign in required
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTodo} className="space-y-4">
              <div>
                <Input
                  placeholder={user ? "What needs to be done?" : "Sign in to add todos..."}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg bg-white/20 backdrop-blur-sm border-white/40 text-white placeholder:text-white/70"
                  disabled={creating || !user}
                />
              </div>
              <div>
                <Textarea
                  placeholder={user ? "Add a description (optional)" : "Sign in to add todos..."}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  disabled={creating || !user}
                  className="bg-white/20 backdrop-blur-sm border-white/40 text-white placeholder:text-white/70"
                />
              </div>

              {/* Tag Selector */}
              {user && hasTagsColumn && (
                <div>
                  <Label className="text-sm font-medium text-white drop-shadow-sm">Tags</Label>
                  <div className="text-xs text-white/80 mb-2">
                    Select existing tags or type new ones to create them automatically
                  </div>
                  <TagSelector
                    selectedTags={selectedTags}
                    availableTags={tags}
                    onTagsChange={setSelectedTags}
                    onCreateTag={handleCreateTag}
                    allowCustomTags={true}
                  />
                </div>
              )}

              {user && hasPublicColumn && (
                <div className="flex items-center space-x-2">
                  <Switch id="is-public" checked={isPublic} onCheckedChange={setIsPublic} />
                  <Label htmlFor="is-public" className="text-sm flex items-center gap-1 text-white drop-shadow-sm">
                    {isPublic ? (
                      <>
                        <Globe className="w-4 h-4" />
                        Public (visible to everyone)
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Private (only visible to you)
                      </>
                    )}
                  </Label>
                </div>
              )}
              <Button
                type="submit"
                disabled={creating || !title.trim() || !user}
                className="w-full bg-white/30 backdrop-blur-sm text-white hover:bg-white/40"
              >
                {!user ? "Sign in to add todos" : creating ? "Adding..." : "Add Todo"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Pagination Controls - Top */}
        {totalPages > 1 && (
          <Card className="mb-6 bg-white/15 backdrop-blur-lg rounded-xl border border-white/30 shadow-xl">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/90">Items per page:</span>
                  <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                    <SelectTrigger className="w-20 bg-white/20 backdrop-blur-sm border-white/40 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white/90 backdrop-blur-lg border-white/50">
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/90">
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
          <div className="text-center py-12 bg-white/15 backdrop-blur-lg rounded-xl border border-white/30 shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/60 mx-auto"></div>
            <p className="text-white/90 mt-4 drop-shadow-sm">Loading todos...</p>
          </div>
        ) : todos.length === 0 ? (
          <Card className="text-center py-12 bg-white/15 backdrop-blur-lg rounded-xl border border-white/30 shadow-xl">
            <CardContent>
              <Circle className="w-16 h-16 text-white/60 mx-auto mb-4" />
              <h3
                className="text-xl font-semibold text-white drop-shadow-sm mb-2"
                style={{ fontFamily: "K2D, sans-serif", fontWeight: 400 }}
              >
                {searchTerm || filterCompleted !== "all" || filterTags.length > 0 ? "No todos found" : "No todos yet"}
              </h3>
              <p className="text-white/80">
                {searchTerm || filterCompleted !== "all" || filterTags.length > 0
                  ? "Try adjusting your search or filter criteria"
                  : user
                    ? "Create your first todo to get started!"
                    : "No todos have been created yet. Sign in to add the first one!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {todos.map((todo) => (
              <Card
                key={todo.id}
                className={`transition-all duration-300 hover:shadow-xl bg-white/15 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg ${
                  todo.completed ? "bg-green-500/15 border-green-300/40" : ""
                } ${isOwner(todo) ? "border-l-4 border-l-blue-400/80" : ""}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => handleToggleTodo(todo.id, todo.completed)}
                      className="mt-1"
                      disabled={!isOwner(todo)}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={`text-lg font-semibold ${
                            todo.completed ? "text-green-200 line-through drop-shadow-sm" : "text-white drop-shadow-sm"
                          }`}
                          style={{ fontFamily: "K2D, sans-serif", fontWeight: 400 }}
                        >
                          {todo.title}
                        </h3>
                        <div className="flex items-center gap-1">
                          {isOwner(todo) ? (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-blue-500/25 text-blue-200 border-blue-300/60 backdrop-blur-sm"
                            >
                              <User className="w-3 h-3 mr-1" />
                              Mine
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-xs bg-white/15 text-white/90 border-white/40 backdrop-blur-sm"
                            >
                              <Globe className="w-3 h-3 mr-1" />
                              {hasPublicColumn ? "Public" : "Shared"}
                            </Badge>
                          )}
                          {hasPublicColumn &&
                            (todo.is_public ? (
                              <span title="Public todo">
                                <Globe className="w-4 h-4 text-green-300" />
                              </span>
                            ) : (
                              <span title="Private todo">
                                <Lock className="w-4 h-4 text-white/70" />
                              </span>
                            ))}
                        </div>
                      </div>

                      {todo.description && (
                        <p
                          className={`mt-2 ${todo.completed ? "text-green-200 line-through" : "text-white/90"} drop-shadow-sm`}
                        >
                          {todo.description}
                        </p>
                      )}

                      {/* Tags Display */}
                      {hasTagsColumn && todo.tags && todo.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {todo.tags.map((tagName) => {
                            const tagInfo = tags.find((t) => t.name === tagName) || {
                              name: tagName,
                              color: "#6b7280",
                              icon: "🏷️",
                            }
                            return (
                              <Badge
                                key={tagName}
                                variant="secondary"
                                className="text-xs backdrop-blur-sm"
                                style={{
                                  backgroundColor: `${tagInfo.color}30`,
                                  color: tagInfo.color,
                                  borderColor: `${tagInfo.color}60`,
                                }}
                              >
                                {tagInfo.icon && <span className="mr-1">{tagInfo.icon}</span>}
                                {tagName}
                              </Badge>
                            )
                          })}
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-3 text-sm text-white/80">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Created: {formatDate(todo.created_at)}
                        </div>
                        {todo.updated_at !== todo.created_at && (
                          <div className="flex items-center gap-1">Updated: {formatDate(todo.updated_at)}</div>
                        )}
                      </div>
                    </div>

                    {isOwner(todo) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="text-red-300 hover:text-red-200 hover:bg-red-500/25 backdrop-blur-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination Controls - Bottom */}
        {totalPages > 1 && (
          <Card className="mt-6 bg-white/15 backdrop-blur-lg rounded-xl border border-white/30 shadow-xl">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-white/90">
                  Page {page} of {totalPages}
                </div>

                <div className="flex items-center gap-1">{generatePaginationButtons()}</div>

                <div className="text-sm text-white/90">Total: {total} todos</div>
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
