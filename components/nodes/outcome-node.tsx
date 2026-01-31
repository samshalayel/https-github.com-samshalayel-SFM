"use client"

import type React from "react"
import { Handle, Position, useReactFlow } from "reactflow"
import { Trash2, CheckCircle2, ChevronDown, ChevronUp, FolderOpen } from "lucide-react"
import SeesawIcon from "../seesaw-icon"

interface OutcomeNodeProps {
  data: {
    label: string
    description?: string
    humanPercentage?: number
    aiPercentage?: number
    outcomeType?: string
    group?: string
    isCollapsed?: boolean
  }
  id: string
}

export default function OutcomeNode({ data, id }: OutcomeNodeProps) {
  // Outcome nodes: Human >= 80%, AI <= 20%
  const humanPercent = typeof data.humanPercentage === "number" ? data.humanPercentage : 80
  const aiPercent = typeof data.aiPercentage === "number" ? data.aiPercentage : 20
  const { deleteElements, setNodes } = useReactFlow()
  const isCollapsed = data.isCollapsed || false

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

  // Different gradient colors based on outcome type
  const getGradientColors = () => {
    switch (data.outcomeType) {
      case "validated-pain":
        return "from-red-500 to-rose-600"
      case "confirmed-job":
        return "from-blue-500 to-indigo-600"
      case "rejected-assumption":
        return "from-gray-500 to-slate-600"
      default:
        return "from-green-500 to-emerald-600"
    }
  }

  const getBorderColor = () => {
    switch (data.outcomeType) {
      case "validated-pain":
        return "border-red-300"
      case "confirmed-job":
        return "border-blue-300"
      case "rejected-assumption":
        return "border-gray-300"
      default:
        return "border-green-300"
    }
  }

  // Collapsed view
  if (isCollapsed) {
    return (
      <div className={`shadow-lg rounded-xl border-2 ${getBorderColor()} bg-white min-w-[100px] overflow-hidden hover:shadow-xl transition-all duration-200 group`}>
        <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-green-600 border-2 border-white" />
        
        <div className={`px-3 py-2 bg-gradient-to-r ${getGradientColors()} flex items-center gap-2`}>
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
          <CheckCircle2 className="h-4 w-4 text-white/80" />
        </div>

        <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-green-600 border-2 border-white" />
      </div>
    )
  }

  return (
    <div className={`shadow-lg rounded-2xl border-2 ${getBorderColor()} bg-white min-w-[260px] max-w-[300px] overflow-hidden hover:shadow-xl transition-all duration-200 group`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-green-600 border-2 border-white" />

      {/* Top section with outcome icon and type */}
      <div className={`px-4 py-3 flex items-center justify-between bg-gradient-to-r ${getGradientColors()} text-white`}>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleCollapse}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Collapse node"
          >
            <ChevronUp className="h-4 w-4 text-white" />
          </button>
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">Outcome</span>
        </div>
        <span className="text-xs font-medium opacity-90 capitalize">{data.outcomeType?.replace("-", " ") || "Validated"}</span>
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

        <div className="font-bold text-sm text-gray-900 mb-2 text-center">{data.label}</div>

        {data.description && (
          <div className="text-xs text-gray-600 leading-relaxed text-center">{data.description}</div>
        )}

        {/* Tooltip */}
        <div className="mt-3 px-2 py-1.5 bg-green-50 rounded-lg border border-green-200">
          <p className="text-[10px] text-green-700 italic text-center">
            Validated outcome derived from insights. Connects ONLY after Insight nodes.
          </p>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-green-600 border-2 border-white" />
    </div>
  )
}
