"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TodoTag } from "@/lib/todo-supabase"

interface TagFilterProps {
  selectedTags: string[]
  availableTags: TodoTag[]
  onTagsChange: (tags: string[]) => void
}

export function TagFilter({ selectedTags, availableTags, onTagsChange }: TagFilterProps) {
  const [open, setOpen] = useState(false)

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

  const clearAllTags = () => {
    onTagsChange([])
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Filter by tags:</span>
        {selectedTags.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllTags} className="h-6 px-2 text-xs">
            Clear all
          </Button>
        )}
      </div>

      {/* Selected Tag Filters */}
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

        {/* Tag Filter Selector */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-6 px-2 text-xs bg-transparent">
              <Filter className="h-3 w-3 mr-1" />
              Add Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0">
            <Command>
              <CommandInput placeholder="Search tags..." />
              <CommandList>
                <CommandEmpty>
                  <div className="p-2">
                    <p className="text-sm text-gray-500">No tags found.</p>
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {availableTags.map((tag) => (
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
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
