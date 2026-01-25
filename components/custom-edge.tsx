"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { BaseEdge, EdgeLabelRenderer, type EdgeProps, getBezierPath, useReactFlow } from "reactflow"
import { X } from "lucide-react"

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
  selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const { setEdges } = useReactFlow()
  const [isHovered, setIsHovered] = useState(false)

  const onDeleteClick = useCallback(
    (evt: React.MouseEvent) => {
      evt.stopPropagation()
      setEdges((edges) => edges.filter((edge) => edge.id !== id))
    },
    [setEdges, id],
  )

  // Enhanced edge style for better visibility
  const enhancedStyle = {
    ...style,
    strokeWidth: isHovered || selected ? 4 : 3,
    stroke: isHovered || selected ? '#ef4444' : (style?.stroke || '#64748b'),
    cursor: 'pointer',
  }

  const showDeleteButton = isHovered || selected

  return (
    <>
      {/* Invisible wider path for easier hover detection */}
      <path
        d={edgePath}
        fill="none"
        strokeWidth={20}
        stroke="transparent"
        style={{ cursor: 'pointer' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={enhancedStyle} />
      <EdgeLabelRenderer>
        {/* Delete button */}
        {showDeleteButton && (
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <button
              onClick={onDeleteClick}
              className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg border-2 border-white transition-all hover:scale-110"
              title="Delete connection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {/* Label (if exists and delete button not shown) */}
        {data?.label && !showDeleteButton && (
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: "white",
              padding: "4px 8px",
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 500,
              pointerEvents: "all",
              border: "1px solid #e2e8f0",
            }}
            className="nodrag nopan"
          >
            {data.label}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  )
}
