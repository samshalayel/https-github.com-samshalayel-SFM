"use client"

import type React from "react"
import { Handle, Position, useReactFlow } from "reactflow"
import { Trash2, Target, ChevronDown, ChevronUp, FolderOpen, CheckCircle, XCircle } from "lucide-react"
import SeesawIcon from "../seesaw-icon"
import EditablePointsList from "./editable-points-list"

interface ScopeNodeProps {
  data: {
    label: string
    description?: string
    inScope?: string[]
    outScope?: string[]
    humanPercentage?: number
    aiPercentage?: number
    group?: string
    isCollapsed?: boolean
  }
  id: string
}

export default function ScopeNode({ data, id }: ScopeNodeProps) {
  // Scope nodes: Human >= 80%, AI <= 20%
  const humanPercent = typeof data.humanPercentage === "number" ? data.humanPercentage : 80
  const aiPercent = typeof data.aiPercentage === "number" ? data.aiPercentage : 20
  const { deleteElements, setNodes } = useReactFlow()
  const isCollapsed = data.isCollapsed || false

  // Scope-specific data structure
  const inScope = data.inScope ?? []
  const outScope = data.outScope ?? []

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteElements({ nodes: [{ id }] })
  }

  const toggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation()
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, isCollapsed: !isCollapsed } }
          : node
      )
    )
  }

  const handleInScopeChange = (newItems: string[]) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, inScope: newItems } }
          : node
      )
    )
  }

  const handleOutScopeChange = (newItems: string[]) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, outScope: newItems } }
          : node
      )
    )
  }

  // Collapsed view
  if (isCollapsed) {
    return (
      <div className="shadow-lg rounded-xl border-2 border-teal-300 bg-white min-w-[100px] overflow-hidden hover:shadow-xl transition-all duration-200 group">
        <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-teal-600 border-2 border-white" />
        
        <div className="px-3 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 flex items-center gap-2">
          <button
            onClick={toggleCollapse}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Expand node"
          >
            <ChevronDown className="h-4 w-4 text-white" />
          </button>
          <div className="flex-1 text-center">
            <div className="text-xs font-semibold text-white truncate max-w-[80px]">{data.label}</div>
            {data.group && (
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <FolderOpen className="h-3 w-3 text-white/80" />
                <span className="text-[10px] text-white/80 truncate max-w-[70px]">{data.group}</span>
              </div>
            )}
          </div>
          <Target className="h-4 w-4 text-white/80" />
        </div>

        <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-teal-600 border-2 border-white" />
      </div>
    )
  }

  return (
    <div className="shadow-lg rounded-2xl border-2 border-teal-300 bg-white min-w-[280px] max-w-[320px] overflow-hidden hover:shadow-xl transition-all duration-200 group">
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-teal-600 border-2 border-white" />

      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleCollapse}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Collapse node"
          >
            <ChevronUp className="h-4 w-4 text-white" />
          </button>
          <Target className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">Scope</span>
        </div>
        <span className="text-xs font-medium opacity-90">Definition</span>
      </div>

      {/* Group badge if exists */}
      {data.group && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center justify-center gap-1.5">
          <FolderOpen className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-xs font-medium text-blue-700">{data.group}</span>
        </div>
      )}

      {/* Percentages section */}
      <div className="px-4 py-2 flex items-center justify-center gap-3 border-b border-gray-100">
        <span className="text-purple-600 text-xs font-semibold">AI:{aiPercent}%</span>
        <SeesawIcon humanPercent={humanPercent} aiPercent={aiPercent} size={24} />
        <span className="text-blue-600 text-xs font-semibold">H:{humanPercent}%</span>
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

        <div className="font-bold text-sm text-gray-900 mb-3 text-center">{data.label}</div>

        {/* In Scope Section */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
            <span className="text-xs font-semibold text-green-700">In Scope</span>
          </div>
          <div className="bg-green-50 rounded-lg p-2 border border-green-200">
            <EditablePointsList
              points={inScope}
              onChange={handleInScopeChange}
              placeholder="Add in-scope item..."
              maxItems={8}
            />
          </div>
        </div>

        {/* Out of Scope Section */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <XCircle className="h-3.5 w-3.5 text-red-600" />
            <span className="text-xs font-semibold text-red-700">Out of Scope</span>
          </div>
          <div className="bg-red-50 rounded-lg p-2 border border-red-200">
            <EditablePointsList
              points={outScope}
              onChange={handleOutScopeChange}
              placeholder="Add out-of-scope item..."
              maxItems={8}
            />
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-teal-600 border-2 border-white" />
    </div>
  )
}
