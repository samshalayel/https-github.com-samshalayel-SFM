"use client"

import type React from "react"
import { Handle, Position } from "reactflow"
import { Trash2 } from "lucide-react"
import { useReactFlow } from "reactflow"

interface Stage0NodeProps {
  data: {
    label: string
    description?: string
    humanPercent?: number
    aiPercent?: number
  }
  id: string
}

export default function Stage0Node({ data, id }: Stage0NodeProps) {
  const humanPercent = data.humanPercent || 95
  const aiPercent = data.aiPercent || 5
  const { deleteElements } = useReactFlow()

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteElements({ nodes: [{ id }] })
  }

  return (
    <div className="shadow-lg rounded-2xl border-2 border-gray-200 bg-white min-w-[260px] max-w-[300px] overflow-hidden hover:shadow-xl transition-all duration-200 group">
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-blue-600 border-2 border-white" />

      {/* Top section with percentages and stage number */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-purple-600 text-xs font-semibold">AI:{aiPercent}%</span>
          <span className="text-blue-600 text-xs font-semibold">H:{humanPercent}%</span>
        </div>
        <span className="text-gray-500 text-xs font-medium">Stage 0</span>
      </div>

      {/* Main content area */}
      <div className="px-4 py-4 relative">
        <button
          onClick={handleDelete}
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 hover:bg-gray-100 rounded-lg"
          title="Delete node"
        >
          <Trash2 className="h-4 w-4 text-gray-600" />
        </button>

        <div className="font-bold text-base text-gray-900 mb-3 text-center">{data.label}</div>

        {/* Gradient bar */}
        <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-3"></div>

        {data.description && (
          <div className="text-xs text-gray-600 leading-relaxed text-center">{data.description}</div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-blue-600 border-2 border-white" />
    </div>
  )
}
