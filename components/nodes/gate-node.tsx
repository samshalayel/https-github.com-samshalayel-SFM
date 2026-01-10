"use client"

import type React from "react"
import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Shield, Trash2, Lock } from "lucide-react"
import type { NodeData } from "@/lib/types"

interface GateNodeProps extends NodeProps<NodeData> {}

const GateNode: React.FC<GateNodeProps> = ({ data, id }) => {
  const gateName = data.label || "Quality Gate"
  const gateType = data.gateType || "problem"
  const decisionAuthority = data.decisionAuthority || "Human Only"
  const humanPercent = typeof data.humanPercentage === "number" ? data.humanPercentage : 100
  const aiPercent = typeof data.aiPercentage === "number" ? data.aiPercentage : 0

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    const event = new CustomEvent("deleteNode", { detail: { id } })
    window.dispatchEvent(event)
  }

  // Gate colors based on authority level
  const getGateColor = () => {
    if (humanPercent >= 90) return "from-red-500 to-red-600" // Human Only
    if (humanPercent >= 70) return "from-orange-500 to-orange-600" // Human primary
    if (humanPercent >= 50) return "from-amber-500 to-amber-600" // Human + AI
    return "from-purple-500 to-purple-600" // AI advisory
  }

  const getAuthorityBadgeColor = () => {
    if (humanPercent >= 90) return "bg-red-100 text-red-700 border-red-200"
    if (humanPercent >= 70) return "bg-orange-100 text-orange-700 border-orange-200"
    if (humanPercent >= 50) return "bg-amber-100 text-amber-700 border-amber-200"
    return "bg-purple-100 text-purple-700 border-purple-200"
  }

  return (
    <div className="relative group">
      {/* Top Handle */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-blue-600 border-2 border-white shadow-md" />

      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center shadow-lg z-10"
      >
        <Trash2 className="h-3 w-3" />
      </button>

      {/* Gate Card */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 min-w-[220px] overflow-hidden hover:shadow-xl transition-all duration-200">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${getGateColor()} p-3 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-white/80 text-xs font-medium">GATE</span>
              <div className="flex items-center gap-1">
                <Lock className="h-3 w-3 text-white/90" />
                <span className="text-white text-xs font-semibold">Human: {humanPercent}%</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-white/80 text-xs">AI: {aiPercent}%</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          <h3 className="text-center text-base font-bold text-gray-900 mb-2">{gateName}</h3>

          {/* Authority Badge */}
          <div className="flex justify-center mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getAuthorityBadgeColor()}`}>
              {decisionAuthority}
            </span>
          </div>

          {/* Divider */}
          <div className="h-1 bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 rounded-full mb-3" />

          {/* Description */}
          <p className="text-center text-xs text-gray-500 leading-relaxed">
            {data.description || "AI may advise. Only humans sign."}
          </p>
        </div>
      </div>

      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-600 border-2 border-white shadow-md"
      />
    </div>
  )
}

export default memo(GateNode)
