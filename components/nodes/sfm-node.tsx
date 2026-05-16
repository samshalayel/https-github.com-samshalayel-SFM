"use client"

import type React from "react"
import { memo } from "react"
import { Handle, Position, useReactFlow, type NodeProps } from "reactflow"
import { Trash2, ChevronDown, ChevronUp, FolderOpen, CheckCircle2, XCircle, Lock } from "lucide-react"
import SeesawIcon from "../seesaw-icon"
import EditableDescription from "./editable-description"
import EditablePointsList from "./editable-points-list"
import { getNodeConfig, colorMap, type SfmNodeConfig } from "@/lib/sfm-node-registry"
import type { NodeData } from "@/lib/types"

interface SfmNodeProps extends NodeProps<NodeData> {
  nodeType: string
}

function SfmNodeInner({ data, id, nodeType }: SfmNodeProps) {
  const config = getNodeConfig(nodeType)
  const { deleteElements, setNodes } = useReactFlow()
  const isCollapsed = data.isCollapsed || false
  const completed = (data as any).completed || false

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

  const description = data.description ?? ""
  const points = data.points ?? (data as any).items ?? (data as any).values ?? []

  const handleDescriptionChange = (newDescription: string) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, description: newDescription } } : node
      )
    )
  }

  const handlePointsChange = (newPoints: string[]) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, points: newPoints } } : node
      )
    )
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteElements({ nodes: [{ id }] })
  }

  const toggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation()
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, isCollapsed: !isCollapsed } } : node
      )
    )
  }

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newCompleted = !completed
    setNodes((nodes) => {
      const thisNode = nodes.find((n) => n.id === id)
      const parentId = thisNode?.parentId

      // Update this node first
      const updated = nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, completed: newCompleted } } : node
      )

      if (!parentId) return updated

      // Check all children of parent — if ANY failed → Blocked, if ALL passed → clear
      const children = updated.filter(n => n.parentId === parentId)
      const anyFailed = children.some(n => !(n.data as any)?.completed)

      return updated.map((node) =>
        node.id === parentId
          ? { ...node, data: { ...node.data, status: anyFailed ? "Blocked" : undefined } }
          : node
      )
    })
  }

  // ── Collapsed view ─────────────────────────────────────────
  if (isCollapsed) {
    const isGroupRep = data.isGroupRepresentative && data.groupNodeCount && data.groupNodeCount > 1
    return (
      <div
        className={`shadow-lg rounded-xl border-2 min-w-[120px] overflow-hidden hover:shadow-xl transition-all duration-200 group ${
          completed ? "border-green-400 bg-green-50" : isGroupRep ? "border-blue-400 bg-blue-50" : `${colors.border} bg-white`
        }`}
      >
        <Handle type="target" position={isHorizontal ? Position.Left : Position.Top} className="w-3 h-3 !bg-blue-600 border-2 border-white" />
        <div className={`px-3 py-2 flex items-center gap-2 bg-gradient-to-r ${completed ? "from-green-500 to-green-600" : colors.gradient}`}>
          <button onClick={toggleCollapse} className="p-1 hover:bg-white/20 rounded transition-colors" title="Expand node">
            <ChevronDown className="h-4 w-4 text-white" />
          </button>
          <div className="flex-1 text-center">
            <div className="text-xs font-semibold text-white truncate max-w-[100px]">{data.label || config.title}</div>
            {completed && <div className="text-[10px] text-white/90 font-semibold">✓ Completed</div>}
            {data.group && !completed && (
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <FolderOpen className="h-3 w-3 text-white/80" />
                <span className="text-[10px] text-white/80 truncate max-w-[80px]">{data.group}</span>
                {isGroupRep && (
                  <span className="text-[10px] bg-white/30 text-white px-1.5 py-0.5 rounded-full font-medium">{data.groupNodeCount}</span>
                )}
              </div>
            )}
          </div>
          <Icon className="h-4 w-4 text-white/80" />
        </div>
        <Handle type="source" position={isHorizontal ? Position.Right : Position.Bottom} className="w-3 h-3 !bg-blue-600 border-2 border-white" />
      </div>
    )
  }

  // ── Expanded view ──────────────────────────────────────────
  return (
    <div
      className={`shadow-lg rounded-2xl border-2 min-w-[260px] max-w-[300px] overflow-hidden hover:shadow-xl transition-all duration-200 group ${
        (data as any).locked ? "border-amber-400" : completed ? "border-green-400" : colors.border
      } bg-white`}
    >
      <Handle type="target" position={isHorizontal ? Position.Left : Position.Top} className="w-3 h-3 !bg-blue-600 border-2 border-white" />

      {/* Header */}
      <div
        className={`px-4 py-3 flex items-center justify-between bg-gradient-to-r ${
          (data as any).locked ? "from-amber-500 to-amber-600" : completed ? "from-green-500 to-green-600" : colors.gradient
        } text-white`}
      >
        <div className="flex items-center gap-2">
          <button onClick={toggleCollapse} className="p-1 hover:bg-white/20 rounded transition-colors" title="Collapse node">
            <ChevronUp className="h-4 w-4 text-white" />
          </button>
          <Icon className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">{config.stage}</span>
        </div>
        <div className="flex items-center gap-2">
          {(data as any).locked && (
            <span className="text-[10px] bg-white/30 text-white px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <Lock className="h-3 w-3" /> Locked
            </span>
          )}
          {completed && !(data as any).locked && (
            <span className="text-[10px] bg-white/30 text-white px-2 py-0.5 rounded-full font-semibold">
              ✓ Completed
            </span>
          )}
          <span className="text-xs font-medium opacity-90">{config.title}</span>
        </div>
      </div>

      {/* Group badge */}
      {data.group && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center justify-center gap-1.5">
          <FolderOpen className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-xs font-medium text-blue-700">{data.group}</span>
        </div>
      )}

      {/* Percentages */}
      <div className="px-4 py-2 flex items-center justify-center gap-3 border-b border-gray-100">
        <span className="text-purple-600 text-xs font-semibold">AI:{aiPercent}%</span>
        <SeesawIcon humanPercent={humanPercent} aiPercent={aiPercent} size={24} />
        <span className="text-blue-600 text-xs font-semibold">H:{humanPercent}%</span>
      </div>

      {/* Content */}
      <div className="px-4 py-4 relative">
        <button
          onClick={handleDelete}
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 hover:bg-gray-100 rounded-lg"
          title="Delete node"
        >
          <Trash2 className="h-4 w-4 text-gray-600" />
        </button>

        <div className="font-bold text-sm text-gray-900 mb-2 text-center">{data.label || config.title}</div>

        <div className={`h-1 bg-gradient-to-r ${completed ? "from-green-400 to-green-500" : colors.gradient} rounded-full mb-3`} />

        <EditableDescription description={description} onChange={handleDescriptionChange} placeholder={config.tooltip || "Click to add description..."} />

        <div className="mt-3">
          <EditablePointsList points={points} onChange={handlePointsChange} placeholder="Add a point..." />
        </div>
      </div>

      {/* ── Pass / Fail OR Lock Gate ── */}
      {config.kind === "gate" ? (
        <div className="px-3 pb-3 pt-2 border-t border-gray-100">
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              const newLocked = !(data as any).locked
              setNodes((nodes) =>
                nodes.map((node) =>
                  node.id === id ? { ...node, data: { ...node.data, locked: newLocked } } : node
                )
              )
            }}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold border-2 transition-all duration-200 ${
              (data as any).locked
                ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200"
                : "bg-white text-gray-400 border-gray-200 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50"
            }`}
          >
            <Lock className="h-4 w-4" />
            {(data as any).locked ? "Gate Locked 🔒" : "Lock Gate"}
          </button>
        </div>
      ) : (
        <div className="px-3 pb-3 pt-2 border-t border-gray-100">
          <div className="flex gap-2" onMouseDown={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => { e.stopPropagation(); if (!completed) handleToggleComplete(e) }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border-2 transition-all duration-200 ${
                completed
                  ? "bg-green-500 text-white border-green-500 shadow-md shadow-green-200"
                  : "bg-white text-gray-400 border-gray-200 hover:border-green-400 hover:text-green-600 hover:bg-green-50"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              Pass
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); if (completed) handleToggleComplete(e) }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border-2 transition-all duration-200 ${
                !completed
                  ? "bg-white text-gray-400 border-gray-200 hover:border-red-400 hover:text-red-500 hover:bg-red-50"
                  : "bg-white text-red-400 border-red-200 hover:border-red-500 hover:bg-red-50"
              }`}
            >
              <XCircle className="h-4 w-4" />
              Fail
            </button>
          </div>
        </div>
      )}

      <Handle type="source" position={isHorizontal ? Position.Right : Position.Bottom} className="w-3 h-3 !bg-blue-600 border-2 border-white" />
    </div>
  )
}

export function createSfmNode(nodeType: string) {
  const SfmNodeComponent: React.FC<NodeProps<NodeData>> = (props) => (
    <SfmNodeInner {...props} nodeType={nodeType} />
  )
  SfmNodeComponent.displayName = `SfmNode_${nodeType}`
  return memo(SfmNodeComponent)
}

export default memo(SfmNodeInner)
