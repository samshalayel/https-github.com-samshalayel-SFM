"use client"

import type React from "react"
import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { ChevronDown, ChevronRight, CheckCircle2, Clock, AlertCircle, Circle } from "lucide-react"

interface PipelineStageNodeData {
  label: string
  status: "not_started" | "in_progress" | "completed" | "blocked"
  nodeCount: number
  isCollapsed: boolean
  stageCode: string
  onToggleCollapse?: (stageCode: string) => void
}

const statusConfig = {
  not_started: {
    icon: Circle,
    color: "text-gray-400",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/30",
    label: "Not Started",
  },
  in_progress: {
    icon: Clock,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    label: "In Progress",
  },
  completed: {
    icon: CheckCircle2,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    label: "Completed",
  },
  blocked: {
    icon: AlertCircle,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    label: "Blocked",
  },
}

function PipelineStageNode({ data, id }: NodeProps<PipelineStageNodeData>) {
  const config = statusConfig[data.status] || statusConfig.not_started
  const StatusIcon = config.icon

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    data.onToggleCollapse?.(data.stageCode)
  }

  return (
    <div
      className={`
        rounded-xl border-2 transition-all duration-200 cursor-pointer
        ${config.bgColor} ${config.borderColor}
        hover:shadow-lg hover:scale-[1.02]
        min-w-[320px]
      `}
      onClick={handleToggle}
    >
      {/* Handle for connections */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-white/50 !border-2 !border-white/30"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-white/50 !border-2 !border-white/30"
      />

      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Collapse toggle */}
          <button
            onClick={handleToggle}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            {data.isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-white/70" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white/70" />
            )}
          </button>

          {/* Stage info */}
          <div>
            <h3 className="font-bold text-white text-sm">{data.label}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusIcon className={`w-3.5 h-3.5 ${config.color}`} />
              <span className={`text-xs ${config.color}`}>{config.label}</span>
            </div>
          </div>
        </div>

        {/* Node count badge */}
        <div className={`
          px-2.5 py-1 rounded-full text-xs font-medium
          ${data.nodeCount > 0 ? "bg-white/20 text-white" : "bg-white/5 text-white/40"}
        `}>
          {data.nodeCount} {data.nodeCount === 1 ? "node" : "nodes"}
        </div>
      </div>

      {/* Expanded content placeholder */}
      {!data.isCollapsed && data.nodeCount > 0 && (
        <div className="px-4 pb-3 border-t border-white/10 pt-3">
          <p className="text-xs text-white/50 text-center">
            Nodes displayed inside
          </p>
        </div>
      )}

      {/* Empty state */}
      {!data.isCollapsed && data.nodeCount === 0 && (
        <div className="px-4 pb-3 border-t border-white/10 pt-3">
          <p className="text-xs text-white/30 text-center italic">
            No nodes in this stage yet
          </p>
        </div>
      )}
    </div>
  )
}

export default memo(PipelineStageNode)
