"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TagSuggestion {
  label: string
  value: string
  type: string
  count?: number
}

interface TagAutocompleteInputProps {
  value: string
  onChange: (value: string) => void
  selectedTags: string[]
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
  placeholder?: string
  className?: string
}

export function TagAutocompleteInput({
  value,
  onChange,
  selectedTags,
  onAddTag,
  onRemoveTag,
  placeholder = "Type character or artist name...",
  className,
}: TagAutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch suggestions from Rule34 API
  useEffect(() => {
    const fetchSuggestions = async () => {
      const query = value.trim()
      if (query.length < 2) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/rule34-tags?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setSuggestions(data.tags || [])
        setShowSuggestions(true)
        setSelectedIndex(0)
      } catch (error) {
        console.error("Failed to fetch suggestions:", error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timeoutId)
  }, [value])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % suggestions.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (suggestions[selectedIndex]) {
        handleSelectTag(suggestions[selectedIndex].value)
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  const handleSelectTag = (tag: string) => {
    onAddTag(tag)
    onChange("")
    setSuggestions([])
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative flex-1">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true)
          }}
          placeholder={placeholder}
          className={cn("pr-8", className)}
        />
        {loading && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors gap-1"
              onClick={() => onRemoveTag(tag)}
            >
              {tag}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}

      {/* Autocomplete Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
        >
          <ScrollArea className="max-h-64">
            <div className="p-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.value}
                  type="button"
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    index === selectedIndex && "bg-accent text-accent-foreground",
                  )}
                  onClick={() => handleSelectTag(suggestion.value)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex-1 truncate">{suggestion.label}</span>
                    {suggestion.count && (
                      <span className="text-xs text-muted-foreground">{suggestion.count.toLocaleString()}</span>
                    )}
                    {suggestion.type && suggestion.type !== "tag" && (
                      <Badge variant="outline" className="text-xs">
                        {suggestion.type}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
