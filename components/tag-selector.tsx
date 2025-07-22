"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TodoTag } from "@/lib/todo-supabase"

interface TagSelectorProps {
  selectedTags: string[]
  availableTags: TodoTag[]
  onTagsChange: (tags: string[]) => void
  onCreateTag?: (tag: { name: string; color: string; icon?: string }) => void
  allowCustomTags?: boolean
}

export function TagSelector({
  selectedTags,
  availableTags,
  onTagsChange,
  onCreateTag,
  allowCustomTags = true,
}: TagSelectorProps) {
  const [open, setOpen] = useState(false)
  const [newTagName, setNewTagName] = useState("")
  const [showCreateTag, setShowCreateTag] = useState(false)

  const handleTagToggle = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onTagsChange(selectedTags.filter((t) => t !== tagName))
    } else {
      onTagsChange([...selectedTags, tagName])
    }
  }

  const handleRemoveTag = (tagName: string) => {
    onTagsChange(selectedTags.filter((t) => t !== tagName))
  }

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      const tagName = newTagName.trim().toLowerCase()

      // Check if tag already exists
      if (availableTags.some((tag) => tag.name === tagName) || selectedTags.includes(tagName)) {
        // If tag exists, just add it to selected tags
        if (!selectedTags.includes(tagName)) {
          onTagsChange([...selectedTags, tagName])
        }
      } else {
        // Add to selected tags immediately (will be created when todo is saved)
        onTagsChange([...selectedTags, tagName])

        // Optionally create the tag in the database immediately
        if (onCreateTag) {
          const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#6b7280", "#ec4899", "#06b6d4"]
          const randomColor = colors[Math.floor(Math.random() * colors.length)]

          onCreateTag({
            name: tagName,
            color: randomColor,
            icon: "🏷️",
          })
        }
      }

      setNewTagName("")
      setShowCreateTag(false)
      setOpen(false)
    }
  }

  const handleAddCustomTag = (tagName: string) => {
    const cleanTagName = tagName.trim().toLowerCase()
    if (cleanTagName && !selectedTags.includes(cleanTagName)) {
      onTagsChange([...selectedTags, cleanTagName])
    }
  }

  return (
    <div className="space-y-2">
      {/* Selected Tags */}
      <div className="flex flex-wrap gap-1">
        {selectedTags.map((tagName) => {
          const tagInfo = availableTags.find((t) => t.name === tagName) || {
            name: tagName,
            color: "#6b7280",
            icon: "🏷️",
          }
          return (
            <Badge
              key={tagName}
              variant="secondary"
              className="text-xs flex items-center gap-1"
              style={{
                backgroundColor: `${tagInfo.color}20`,
                color: tagInfo.color,
                borderColor: `${tagInfo.color}40`,
              }}
            >
              {tagInfo.icon && <span>{tagInfo.icon}</span>}
              {tagName}
              <Button
                variant="ghost"
                size="sm"
                className="h-3 w-3 p-0 hover:bg-transparent"
                onClick={() => handleRemoveTag(tagName)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )
        })}
      </div>

      {/* Tag Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 bg-transparent">
            <Plus className="h-3 w-3 mr-1" />
            Add Tags
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0">
          <Command>
            <CommandInput placeholder="Search or type new tag..." value={newTagName} onValueChange={setNewTagName} />
            <CommandList>
              <CommandEmpty>
                <div className="p-2">
                  {newTagName.trim() ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">No existing tags found.</p>
                      {allowCustomTags && (
                        <Button variant="outline" size="sm" onClick={handleCreateTag} className="w-full bg-transparent">
                          <Plus className="h-3 w-3 mr-1" />
                          Create "{newTagName.trim().toLowerCase()}"
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Type to search or create tags</p>
                  )}
                </div>
              </CommandEmpty>
              <CommandGroup>
                {availableTags
                  .filter((tag) => !newTagName.trim() || tag.name.toLowerCase().includes(newTagName.toLowerCase()))
                  .map((tag) => (
                    <CommandItem
                      key={tag.id}
                      onSelect={() => handleTagToggle(tag.name)}
                      className="flex items-center gap-2"
                    >
                      <Check className={cn("h-3 w-3", selectedTags.includes(tag.name) ? "opacity-100" : "opacity-0")} />
                      <span>{tag.icon}</span>
                      <span className="flex-1">{tag.name}</span>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                    </CommandItem>
                  ))}

                {/* Show create option if typing and tag doesn't exist */}
                {allowCustomTags &&
                  newTagName.trim() &&
                  !availableTags.some((tag) => tag.name.toLowerCase() === newTagName.toLowerCase()) && (
                    <CommandItem onSelect={handleCreateTag} className="flex items-center gap-2">
                      <Plus className="h-3 w-3" />
                      <span className="flex-1">Create "{newTagName.trim().toLowerCase()}"</span>
                      <div className="w-3 h-3 rounded-full bg-gray-400" />
                    </CommandItem>
                  )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
