"use client"

import type React from "react"
import { useState } from "react"
import { Plus, X, Pencil, Check } from "lucide-react"

interface EditablePointsListProps {
  points: string[]
  onChange: (points: string[]) => void
  placeholder?: string
  maxItems?: number
  className?: string
}

export default function EditablePointsList({
  points,
  onChange,
  placeholder = "Add point...",
  maxItems = 10,
  className = "",
}: EditablePointsListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState("")
  const [newValue, setNewValue] = useState("")

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (newValue.trim() && points.length < maxItems) {
      onChange([...points, newValue.trim()])
      setNewValue("")
    }
  }

  const handleRemove = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    onChange(points.filter((_, i) => i !== index))
  }

  const handleStartEdit = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    setEditingIndex(index)
    setEditValue(points[index])
  }

  const handleSaveEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (editingIndex !== null && editValue.trim()) {
      const newPoints = [...points]
      newPoints[editingIndex] = editValue.trim()
      onChange(newPoints)
    }
    setEditingIndex(null)
    setEditValue("")
  }

  const handleKeyDown = (e: React.KeyboardEvent, action: "add" | "edit") => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (action === "add") {
        handleAdd()
      } else {
        handleSaveEdit()
      }
    }
    if (e.key === "Escape") {
      setEditingIndex(null)
      setEditValue("")
      setNewValue("")
    }
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Existing points */}
      <ul className="space-y-1">
        {points.map((point, index) => (
          <li key={index} className="flex items-start gap-1.5 group">
            <span className="text-gray-400 text-xs mt-0.5">•</span>
            {editingIndex === index ? (
              <div className="flex-1 flex items-center gap-1">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, "edit")}
                  onBlur={handleSaveEdit}
                  autoFocus
                  className="flex-1 text-xs px-1.5 py-0.5 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white"
                />
                <button
                  onClick={(e) => handleSaveEdit(e)}
                  className="p-0.5 text-green-600 hover:bg-green-50 rounded"
                >
                  <Check className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <>
                <span className="flex-1 text-xs text-gray-700 leading-relaxed">{point}</span>
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                  <button
                    onClick={(e) => handleStartEdit(e, index)}
                    className="p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit"
                  >
                    <Pencil className="h-2.5 w-2.5" />
                  </button>
                  <button
                    onClick={(e) => handleRemove(e, index)}
                    className="p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Remove"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Add new point */}
      {points.length < maxItems && (
        <div className="flex items-center gap-1 mt-2" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, "add")}
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            placeholder={placeholder}
            className="flex-1 text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-300 text-gray-900 bg-white"
          />
          <button
            onClick={handleAdd}
            disabled={!newValue.trim()}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Add point"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
