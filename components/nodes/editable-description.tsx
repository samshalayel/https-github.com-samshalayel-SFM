"use client"

import type React from "react"
import { useState } from "react"
import { Pencil, Check, X } from "lucide-react"

interface EditableDescriptionProps {
  description: string
  onChange: (description: string) => void
  placeholder?: string
  className?: string
}

export default function EditableDescription({
  description,
  onChange,
  placeholder = "Add description...",
  className = "",
}: EditableDescriptionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(description)

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditValue(description)
    setIsEditing(true)
  }

  const handleSave = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    onChange(editValue.trim())
    setIsEditing(false)
  }

  const handleCancel = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setEditValue(description)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel()
    }
    // Allow Ctrl+Enter or Cmd+Enter to save
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSave()
    }
  }

  if (isEditing) {
    return (
      <div className={`space-y-1.5 ${className}`} onClick={(e) => e.stopPropagation()}>
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          onFocus={(e) => e.stopPropagation()}
          autoFocus
          rows={3}
          placeholder={placeholder}
          className="w-full text-xs px-2 py-1.5 border border-blue-300 rounded resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => handleCancel(e)}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            title="Cancel (Esc)"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => handleSave(e)}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
            title="Save (Ctrl+Enter)"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`group relative ${className}`} onClick={(e) => e.stopPropagation()}>
      {description ? (
        <p className="text-xs text-gray-600 leading-relaxed text-center">{description}</p>
      ) : (
        <p className="text-xs text-gray-400 italic text-center">{placeholder}</p>
      )}
      <button
        onClick={(e) => handleStartEdit(e)}
        className="absolute -top-1 -right-1 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        title="Edit description"
      >
        <Pencil className="h-3 w-3" />
      </button>
    </div>
  )
}
