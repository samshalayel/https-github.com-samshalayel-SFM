"use client"

import type React from "react"
import { memo } from "react"
import { Handle, Position, useReactFlow, type NodeProps } from "reactflow"
import { Trash2, ChevronDown, ChevronUp, FolderOpen } from "lucide-react"
import SeesawIcon from "../seesaw-icon"
import { getNodeConfig, colorMap, type SfmNodeConfig } from "@/lib/sfm-node-registry"
import type { NodeData } from "@/lib/types"

interface SfmNodeProps extends NodeProps<NodeData> {
  nodeType: string
}

function SfmNodeInner({ data, id, nodeType }: SfmNodeProps) {
  const config = getNodeConfig(nodeType)
  const { deleteElements, setNodes } = useReactFlow()
  const isCollapsed = data.isCollapsed || false

  // Fallback if config not found
  if (!config) {
    return (
      <div className="bg-gray-200 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600">Unknown node type: {nodeType}</p>
      </div>
    )
  }

  const colors = colorMap[config.color]
  const Icon = config.icon
  const humanPercent = typeof data.humanPercentage === "number" ? data.humanPercentage : (config.defaultHumanPercent ?? 50)
  const aiPercent = typeof data.aiPercentage === "number" ? data.aiPercentage : (config.defaultAiPercent ?? 50)
  const isHorizontal = config.handlePosition === "horizontal"

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

  // Collapsed view
  if (isCollapsed) {
    const isGroupRep = data.isGroupRepresentative && data.groupNodeCount && data.groupNodeCount > 1

    return (
      <div className={`shadow-lg rounded-xl border-2 ${isGroupRep ? 'border-blue-400 bg-blue-50' : `${colors.border} bg-white`} min-w-[120px] overflow-hidden hover:shadow-xl transition-all duration-200 group`}>
        <Handle 
          type="target" 
          position={isHorizontal ? Position.Left : Position.Top} 
          className="w-3 h-3 !bg-blue-600 border-2 border-white" 
        />

        <div className={`px-3 py-2 flex items-center gap-2 bg-gradient-to-r ${colors.gradient}`}>
          <button
            onClick={toggleCollapse}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Expand node"
          >
            <ChevronDown className="h-4 w-4 text-white" />
          </button>
          <div className="flex-1 text-center">
            <div className="text-xs font-semibold text-white truncate max-w-[100px]">
              {data.label || config.title}
            </div>
            {data.group && (
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <FolderOpen className="h-3 w-3 text-white/80" />
                <span className="text-[10px] text-white/80 truncate max-w-[80px]">{data.group}</span>
                {isGroupRep && (
                  <span className="text-[10px] bg-white/30 text-white px-1.5 py-0.5 rounded-full font-medium">
                    {data.groupNodeCount}
                  </span>
                )}
              </div>
            )}
          </div>
          <Icon className="h-4 w-4 text-white/80" />
        </div>

        <Handle 
          type="source" 
          position={isHorizontal ? Position.Right : Position.Bottom} 
          className="w-3 h-3 !bg-blue-600 border-2 border-white" 
        />
      </div>
    )
  }

  // Expanded view
  return (
    <div className={`shadow-lg rounded-2xl border-2 ${colors.border} bg-white min-w-[260px] max-w-[300px] overflow-hidden hover:shadow-xl transition-all duration-200 group`}>
      <Handle 
        type="target" 
        position={isHorizontal ? Position.Left : Position.Top} 
        className="w-3 h-3 !bg-blue-600 border-2 border-white" 
      />

      {/* Header with gradient */}
      <div className={`px-4 py-3 flex items-center justify-between bg-gradient-to-r ${colors.gradient} text-white`}>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleCollapse}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Collapse node"
          >
            <ChevronUp className="h-4 w-4 text-white" />
          </button>
          <Icon className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">{config.stage}</span>
        </div>
        <span className="text-xs font-medium opacity-90">{config.title}</span>
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

        <div className="font-bold text-sm text-gray-900 mb-2 text-center">
          {data.label || config.title}
        </div>

        {/* Gradient bar */}
        <div className={`h-1 bg-gradient-to-r ${colors.gradient} rounded-full mb-3`}></div>

        {data.description && (
          <div className="text-xs text-gray-600 leading-relaxed text-center mb-3">
            {data.description}
          </div>
        )}

        {/* Tooltip */}
        {config.tooltip && !data.description && (
          <div className="mt-2 px-2 py-1.5 bg-gray-100 rounded-lg">
            <p className="text-[10px] text-gray-500 italic text-center">
              {config.tooltip}
            </p>
          </div>
        )}
      </div>

      <Handle 
        type="source" 
        position={isHorizontal ? Position.Right : Position.Bottom} 
        className="w-3 h-3 !bg-blue-600 border-2 border-white" 
      />
    </div>
  )
}

// Create a memoized component factory for each node type
export function createSfmNode(nodeType: string) {
  const SfmNodeComponent: React.FC<NodeProps<NodeData>> = (props) => (
    <SfmNodeInner {...props} nodeType={nodeType} />
  )
  SfmNodeComponent.displayName = `SfmNode_${nodeType}`
  return memo(SfmNodeComponent)
}

export default memo(SfmNodeInner)
