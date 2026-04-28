"use client"

import type React from "react"
import { memo } from "react"
import { Handle, Position, useReactFlow, type NodeProps } from "reactflow"
import { Trash2, Lock, ChevronDown, ChevronUp, FolderOpen } from "lucide-react"
import { getNodeConfig, colorMap, type SfmNodeConfig } from "@/lib/sfm-node-registry"
import type { NodeData } from "@/lib/types"

interface SfmGateNodeProps extends NodeProps<NodeData> {
  nodeType: string
}

function SfmGateNodeInner({ data, id, nodeType }: SfmGateNodeProps) {
  const config = getNodeConfig(nodeType)
  const { deleteElements, setNodes } = useReactFlow()
  const isCollapsed = data.isCollapsed || false

  // Fallback if config not found
  if (!config || config.kind !== "gate") {
    return (
      <div className="bg-gray-200 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600">Unknown gate type: {nodeType}</p>
      </div>
    )
  }

  const colors = colorMap[config.color]
  const Icon = config.icon
  const humanPercent = typeof data.humanPercentage === "number" ? data.humanPercentage : (config.defaultHumanPercent ?? 100)
  const aiPercent = typeof data.aiPercentage === "number" ? data.aiPercentage : (config.defaultAiPercent ?? 0)
  const decisionAuthority = data.decisionAuthority || config.decisionAuthority || "Human Only"

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    const event = new CustomEvent("deleteNode", { detail: { id } })
    window.dispatchEvent(event)
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

  // Gate colors based on authority level
  const getGateGradient = () => {
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

  // Collapsed view
  if (isCollapsed) {
    return (
      <div className="relative group">
        <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-blue-600 border-2 border-white shadow-md" />

        <div className={`bg-gradient-to-r ${getGateGradient()} rounded-xl shadow-lg min-w-[100px] overflow-hidden hover:shadow-xl transition-all duration-200`}>
          <div className="px-3 py-2 flex items-center gap-2">
            <button
              onClick={toggleCollapse}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title="Expand gate"
            >
              <ChevronDown className="h-4 w-4 text-white" />
            </button>
            <div className="flex-1 text-center">
              <div className="text-xs font-semibold text-white truncate max-w-[80px]">
                {data.label || config.title}
              </div>
              {data.group && (
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <FolderOpen className="h-3 w-3 text-white/80" />
                  <span className="text-[10px] text-white/80 truncate max-w-[70px]">{data.group}</span>
                </div>
              )}
            </div>
            <Icon className="h-4 w-4 text-white/80" />
          </div>
        </div>

        <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-blue-600 border-2 border-white shadow-md" />
      </div>
    )
  }

  // Expanded view
  return (
    <div className="relative group">
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
        <div className={`bg-gradient-to-r ${getGateGradient()} p-3 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleCollapse}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title="Collapse gate"
            >
              <ChevronUp className="h-4 w-4 text-white" />
            </button>
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Icon className="h-4 w-4 text-white" />
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
            <span className="text-xs font-medium text-white/80">{config.stage}</span>
            <div className="text-white/80 text-xs">AI: {aiPercent}%</div>
          </div>
        </div>

        {/* Group badge if exists */}
        {data.group && (
          <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center justify-center gap-1.5">
            <FolderOpen className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs font-medium text-blue-700">{data.group}</span>
          </div>
        )}

        {/* Body */}
        <div className="p-4">
          <h3 className="text-center text-base font-bold text-gray-900 mb-2">
            {data.label || config.title}
          </h3>

          {/* Authority Badge */}
          <div className="flex justify-center mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getAuthorityBadgeColor()}`}>
              {decisionAuthority}
            </span>
          </div>

          {/* Divider */}
          <div className={`h-1 bg-gradient-to-r ${getGateGradient()} rounded-full mb-3`} />

          {/* Description */}
          <p className="text-center text-xs text-gray-500 leading-relaxed">
            {data.description || config.description || "AI may advise. Only humans sign."}
          </p>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-blue-600 border-2 border-white shadow-md" />
    </div>
  )
}

// Create a memoized component factory for each gate type
export function createSfmGateNode(nodeType: string) {
  const SfmGateNodeComponent: React.FC<NodeProps<NodeData>> = (props) => (
    <SfmGateNodeInner {...props} nodeType={nodeType} />
  )
  SfmGateNodeComponent.displayName = `SfmGateNode_${nodeType}`
  return memo(SfmGateNodeComponent)
}

export default memo(SfmGateNodeInner)
