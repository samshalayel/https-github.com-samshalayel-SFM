"use client"

import type React from "react"
import { Handle, Position, useReactFlow } from "reactflow"
import { Trash2, CheckCircle2 } from "lucide-react"
import SeesawIcon from "../seesaw-icon"

interface OutcomeNodeProps {
  data: {
    label: string
    description?: string
    humanPercentage?: number
    aiPercentage?: number
    outcomeType?: string
  }
  id: string
}

export default function OutcomeNode({ data, id }: OutcomeNodeProps) {
  // Outcome nodes: Human >= 80%, AI <= 20%
  const humanPercent = typeof data.humanPercentage === "number" ? data.humanPercentage : 80
  const aiPercent = typeof data.aiPercentage === "number" ? data.aiPercentage : 20
  const { deleteElements } = useReactFlow()

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteElements({ nodes: [{ id }] })
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

  return (
    <div className={`shadow-lg rounded-2xl border-2 ${getBorderColor()} bg-white min-w-[260px] max-w-[300px] overflow-hidden hover:shadow-xl transition-all duration-200 group`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-green-600 border-2 border-white" />

      {/* Top section with outcome icon and type */}
      <div className={`px-4 py-3 flex items-center justify-between bg-gradient-to-r ${getGradientColors()} text-white`}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">Outcome</span>
        </div>
        <span className="text-xs font-medium opacity-90 capitalize">{data.outcomeType?.replace("-", " ") || "Validated"}</span>
      </div>

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
