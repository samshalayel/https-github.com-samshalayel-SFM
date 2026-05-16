"use client"

import type React from "react"
import { Handle, Position, useReactFlow } from "reactflow"
import { Trash2, ChevronDown, ChevronUp, FolderOpen, CheckCircle2, XCircle } from "lucide-react"
import SeesawIcon from "../seesaw-icon"
import EditableDescription from "./editable-description"
import EditablePointsList from "./editable-points-list"

interface BaseStageNodeProps {
  data: {
    label: string
    description?: string
    points?: string[]
    items?: string[]
    values?: string[]
    humanPercentage?: number
    aiPercentage?: number
    group?: string
    isCollapsed?: boolean
    isGroupRepresentative?: boolean
    hiddenGroupNodes?: string[]
    groupNodeCount?: number
    completed?: boolean
  }
  id: string
  stageNumber: number
  defaultHumanPercent: number
  defaultAiPercent: number
}

export default function BaseStageNode({
  data,
  id,
  stageNumber,
  defaultHumanPercent,
  defaultAiPercent,
}: BaseStageNodeProps) {
  const humanPercent = typeof data.humanPercentage === "number" ? data.humanPercentage : defaultHumanPercent
  const aiPercent = typeof data.aiPercentage === "number" ? data.aiPercentage : defaultAiPercent
  const { deleteElements, setNodes } = useReactFlow()
  const isCollapsed = data.isCollapsed || false
  const completed = data.completed || false

  const description = data.description ?? ""
  const points = data.points ?? data.items ?? data.values ?? []

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
      return nodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, completed: newCompleted } }
        }
        if (parentId && node.id === parentId) {
          return {
            ...node,
            data: {
              ...node.data,
              status: newCompleted ? "Blocked" : undefined,
            },
          }
        }
        return node
      })
    })
  }

  // ── Collapsed view ──────────────────────────────────────────
  if (isCollapsed) {
    const isGroupRep = data.isGroupRepresentative && data.groupNodeCount && data.groupNodeCount > 1
    return (
      <div
        className={`shadow-lg rounded-xl border-2 min-w-[120px] overflow-hidden hover:shadow-xl transition-all duration-200 group ${
          completed
            ? "border-green-400 bg-green-50"
            : isGroupRep
            ? "border-blue-400 bg-blue-50"
            : "border-gray-200 bg-white"
        }`}
      >
        <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-blue-600 border-2 border-white" />
        <div className="px-3 py-2 flex items-center gap-2">
          <button onClick={toggleCollapse} className="p-1 hover:bg-gray-100 rounded transition-colors" title="Expand node">
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
          <div className="flex-1 text-center">
            <div className="text-xs font-semibold text-gray-700 truncate max-w-[100px]">{data.label}</div>
            {completed && <span className="text-[10px] text-green-600 font-semibold">✓ Completed</span>}
            {data.group && !completed && (
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <FolderOpen className="h-3 w-3 text-blue-500" />
                <span className="text-[10px] text-blue-600 truncate max-w-[80px]">{data.group}</span>
                {isGroupRep && (
                  <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                    {data.groupNodeCount}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="text-[10px] text-gray-400">S{stageNumber}</div>
        </div>
        <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-blue-600 border-2 border-white" />
      </div>
    )
  }

  // ── Expanded view ───────────────────────────────────────────
  return (
    <div
      className={`shadow-lg rounded-2xl border-2 min-w-[260px] max-w-[300px] overflow-hidden hover:shadow-xl transition-all duration-200 group ${
        completed ? "border-green-400 bg-green-50/30" : "border-gray-200 bg-white"
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-blue-600 border-2 border-white" />

      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button onClick={toggleCollapse} className="p-1 hover:bg-gray-100 rounded transition-colors" title="Collapse node">
            <ChevronUp className="h-4 w-4 text-gray-500" />
          </button>
          <span className="text-purple-600 text-xs font-semibold">AI:{aiPercent}%</span>
          <SeesawIcon humanPercent={humanPercent} aiPercent={aiPercent} size={24} />
          <span className="text-blue-600 text-xs font-semibold">H:{humanPercent}%</span>
        </div>
        <div className="flex items-center gap-2">
          {completed && (
            <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">
              ✓ Completed
            </span>
          )}
          <span className="text-gray-500 text-xs font-medium">Stage {stageNumber}</span>
        </div>
      </div>

      {/* Group badge */}
      {data.group && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center justify-center gap-1.5">
          <FolderOpen className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-xs font-medium text-blue-700">{data.group}</span>
        </div>
      )}

      {/* Main content */}
      <div className="px-4 py-4 relative">
        <button
          onClick={handleDelete}
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 hover:bg-gray-100 rounded-lg"
          title="Delete node"
        >
          <Trash2 className="h-4 w-4 text-gray-600" />
        </button>

        <div className="font-bold text-base text-gray-900 mb-3 text-center">{data.label}</div>

        <div
          className={`h-1 rounded-full mb-3 ${
            completed ? "bg-green-400" : "bg-gradient-to-r from-blue-500 to-purple-600"
          }`}
        />

        <EditableDescription
          description={description}
          onChange={handleDescriptionChange}
          placeholder="Click to add description..."
        />

        {(points.length > 0 || true) && (
          <div className="mt-3">
            <EditablePointsList points={points} onChange={handlePointsChange} placeholder="Add a point..." />
          </div>
        )}
      </div>

      {/* Pass / Fail Toggle */}
      <div className="px-4 pb-4 pt-1 border-t border-gray-100 mt-1">
        <button
          onClick={handleToggleComplete}
          onMouseDown={(e) => e.stopPropagation()}
          className={`w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            completed
              ? "bg-green-100 text-green-700 border border-green-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
              : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
          }`}
          title={completed ? "Click to mark as Failed" : "Click to mark as Passed"}
        >
          {completed ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Completed — click to revert
            </>
          ) : (
            <>
              <XCircle className="h-3.5 w-3.5" />
              Mark as Passed
            </>
          )}
        </button>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-blue-600 border-2 border-white" />
    </div>
  )
}
