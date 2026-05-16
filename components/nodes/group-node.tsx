"use client"

import React, { memo, useState, useEffect } from "react"
import { NodeResizer, type NodeProps, useReactFlow, Handle, Position } from "reactflow"
import { FolderOpen, Plus, Minus, ShieldAlert } from "lucide-react"

interface GroupNodeData {
  label: string
  color?: string
  isCollapsed?: boolean
  originalSize?: { width: number; height: number }
  hiddenEdgeIds?: string[]
  childPositions?: Record<string, { x: number; y: number }>
  status?: string
}

const GROUP_COLORS = [
  { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", header: "bg-blue-100", btnBg: "bg-blue-200 hover:bg-blue-300", darkBg: "dark:bg-blue-900/30", darkBorder: "dark:border-blue-700", darkText: "dark:text-blue-300", darkHeader: "dark:bg-blue-800/50", darkBtnBg: "dark:bg-blue-700 dark:hover:bg-blue-600" },
  { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", header: "bg-green-100", btnBg: "bg-green-200 hover:bg-green-300", darkBg: "dark:bg-green-900/30", darkBorder: "dark:border-green-700", darkText: "dark:text-green-300", darkHeader: "dark:bg-green-800/50", darkBtnBg: "dark:bg-green-700 dark:hover:bg-green-600" },
  { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", header: "bg-purple-100", btnBg: "bg-purple-200 hover:bg-purple-300", darkBg: "dark:bg-purple-900/30", darkBorder: "dark:border-purple-700", darkText: "dark:text-purple-300", darkHeader: "dark:bg-purple-800/50", darkBtnBg: "dark:bg-purple-700 dark:hover:bg-purple-600" },
  { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", header: "bg-orange-100", btnBg: "bg-orange-200 hover:bg-orange-300", darkBg: "dark:bg-orange-900/30", darkBorder: "dark:border-orange-700", darkText: "dark:text-orange-300", darkHeader: "dark:bg-orange-800/50", darkBtnBg: "dark:bg-orange-700 dark:hover:bg-orange-600" },
  { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700", header: "bg-pink-100", btnBg: "bg-pink-200 hover:bg-pink-300", darkBg: "dark:bg-pink-900/30", darkBorder: "dark:border-pink-700", darkText: "dark:text-pink-300", darkHeader: "dark:bg-pink-800/50", darkBtnBg: "dark:bg-pink-700 dark:hover:bg-pink-600" },
  { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", header: "bg-cyan-100", btnBg: "bg-cyan-200 hover:bg-cyan-300", darkBg: "dark:bg-cyan-900/30", darkBorder: "dark:border-cyan-700", darkText: "dark:text-cyan-300", darkHeader: "dark:bg-cyan-800/50", darkBtnBg: "dark:bg-cyan-700 dark:hover:bg-cyan-600" },
  { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", header: "bg-amber-100", btnBg: "bg-amber-200 hover:bg-amber-300", darkBg: "dark:bg-amber-900/30", darkBorder: "dark:border-amber-700", darkText: "dark:text-amber-300", darkHeader: "dark:bg-amber-800/50", darkBtnBg: "dark:bg-amber-700 dark:hover:bg-amber-600" },
  { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", header: "bg-indigo-100", btnBg: "bg-indigo-200 hover:bg-indigo-300", darkBg: "dark:bg-indigo-900/30", darkBorder: "dark:border-indigo-700", darkText: "dark:text-indigo-300", darkHeader: "dark:bg-indigo-800/50", darkBtnBg: "dark:bg-indigo-700 dark:hover:bg-indigo-600" },
]

function getColorByName(name: string) {
  // Generate consistent color based on group name
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % GROUP_COLORS.length
  return GROUP_COLORS[index]
}

const COLLAPSED_HEIGHT = 50
const COLLAPSED_WIDTH = 200

const GroupNode: React.FC<NodeProps<GroupNodeData>> = ({ id, data, selected }) => {
  const groupName = data.label || "Group"
  const colors = getColorByName(groupName)
  // Use data.isCollapsed as source of truth, local state only for UI reactivity
  const [isCollapsed, setIsCollapsed] = useState(data.isCollapsed || false)
  const { setNodes, setEdges, getNodes, getEdges, getNode } = useReactFlow()

  // Sync local state with data.isCollapsed when it changes (e.g., after load)
  useEffect(() => {
    if (data.isCollapsed !== undefined && data.isCollapsed !== isCollapsed) {
      setIsCollapsed(data.isCollapsed)
    }
  }, [data.isCollapsed])

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    const currentNode = getNode(id)
    const originalSize = currentNode?.data?.originalSize || data.originalSize
    const hiddenEdgeIds = currentNode?.data?.hiddenEdgeIds || data.hiddenEdgeIds || []
    
    setIsCollapsed(false)
    
    const nodes = getNodes()
    const childNodeIds = nodes.filter(n => n.parentId === id).map(n => n.id)
    
    // Restore original size, show child nodes, and update data.isCollapsed
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              isCollapsed: false,
              // Keep originalSize and hiddenEdgeIds for future collapses
            },
            style: { 
              ...node.style, 
              width: originalSize?.width || 300, 
              height: originalSize?.height || 200,
              transition: 'width 0.3s ease, height 0.3s ease'
            },
          }
        }
        if (node.parentId === id) {
          return { ...node, hidden: false }
        }
        return node
      })
    )
    
    // Restore original edges and remove group-level edges
    setEdges((eds) =>
      eds
        .filter(e => {
          // Remove group-level edges that belong to this group
          if (e.id.startsWith('group-edge-')) {
            // Check if this group edge involves our group
            return !(e.source === id || e.target === id)
          }
          return true
        })
        .map(e => {
          // Unhide edges that were hidden during collapse
          if (hiddenEdgeIds.includes(e.id) || childNodeIds.includes(e.source) || childNodeIds.includes(e.target)) {
            return { ...e, hidden: false }
          }
          return e
        })
    )
  }

  const handleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    // Save current size before collapsing
    const currentNode = getNode(id)
    let originalSize = { width: 300, height: 200 }
    if (currentNode) {
      const width = (currentNode.style?.width as number) || currentNode.width || 300
      const height = (currentNode.style?.height as number) || currentNode.height || 200
      originalSize = { width, height }
    }
    
    setIsCollapsed(true)
    
    const nodes = getNodes()
    const edges = getEdges()
    const childNodeIds = nodes.filter(n => n.parentId === id).map(n => n.id)
    
    // Track edges that will be hidden so we can restore them
    const hiddenEdgeIds: string[] = []
    
    // Find external connections - track unique target groups/nodes
    const externalConnections = new Map<string, { isSource: boolean; originalTarget: string }>()
    
    edges.forEach(edge => {
      // Skip already hidden edges or group edges
      if (edge.hidden || edge.id.startsWith('group-edge-')) return
      
      const sourceInGroup = childNodeIds.includes(edge.source)
      const targetInGroup = childNodeIds.includes(edge.target)
      
      // Track edges to hide
      if (sourceInGroup || targetInGroup) {
        hiddenEdgeIds.push(edge.id)
      }
      
      if (sourceInGroup && !targetInGroup) {
        const targetNode = nodes.find(n => n.id === edge.target)
        const connectTo = targetNode?.parentId || edge.target
        if (connectTo !== id) {
          externalConnections.set(`out-${connectTo}`, { isSource: true, originalTarget: connectTo })
        }
      } else if (!sourceInGroup && targetInGroup) {
        const sourceNode = nodes.find(n => n.id === edge.source)
        const connectFrom = sourceNode?.parentId || edge.source
        if (connectFrom !== id) {
          externalConnections.set(`in-${connectFrom}`, { isSource: false, originalTarget: connectFrom })
        }
      }
    })
    
    // Shrink group, hide child nodes, and save state in node data
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              isCollapsed: true,
              originalSize: originalSize,
              hiddenEdgeIds: hiddenEdgeIds,
            },
            style: { 
              ...node.style, 
              width: COLLAPSED_WIDTH, 
              height: COLLAPSED_HEIGHT,
              transition: 'width 0.3s ease, height 0.3s ease'
            },
          }
        }
        if (node.parentId === id) {
          return { ...node, hidden: true }
        }
        return node
      })
    )
    
    // Hide edges from/to child nodes and create group-level edges
    setEdges((eds) => {
      const newEdges = eds.map(e => {
        if (!e.id.startsWith('group-edge-') && 
            (childNodeIds.includes(e.source) || childNodeIds.includes(e.target))) {
          return { ...e, hidden: true }
        }
        return e
      })
      
      // Add group-level edges - one per external connection
      externalConnections.forEach((connection) => {
        const sortedIds = [id, connection.originalTarget].sort()
        const groupEdgeId = `group-edge-${sortedIds[0]}-${sortedIds[1]}-${connection.isSource ? 'out' : 'in'}`
        
        const existingEdge = newEdges.find(e => 
          e.id.startsWith('group-edge-') && 
          ((e.source === id && e.target === connection.originalTarget) ||
           (e.target === id && e.source === connection.originalTarget))
        )
        
        if (!existingEdge) {
          newEdges.push({
            id: groupEdgeId,
            source: connection.isSource ? id : connection.originalTarget,
            target: connection.isSource ? connection.originalTarget : id,
            type: 'custom',
            animated: true,
            style: { stroke: '#888', strokeWidth: 2, strokeDasharray: '5,5' },
          })
        }
      })
      
      return newEdges
    })
  }

  return (
    <>
      <NodeResizer
        minWidth={200}
        minHeight={isCollapsed ? 50 : 150}
        isVisible={selected}
        lineClassName="!border-blue-400"
        handleClassName="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !rounded-full"
      />
      
      {/* Handles for group-level connections - always present but styled differently when collapsed */}
      <Handle
        type="target"
        position={Position.Left}
        className={`!w-3 !h-3 !border-2 !border-white ${isCollapsed ? '!bg-gray-400' : '!bg-transparent !border-transparent'}`}
        style={{ opacity: isCollapsed ? 1 : 0 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={`!w-3 !h-3 !border-2 !border-white ${isCollapsed ? '!bg-gray-400' : '!bg-transparent !border-transparent'}`}
        style={{ opacity: isCollapsed ? 1 : 0 }}
      />
      
      <div
        className={`w-full h-full ${colors.bg} ${colors.darkBg} ${colors.border} ${colors.darkBorder} border-2 border-dashed rounded-xl overflow-hidden transition-all duration-300`}
        style={{ minWidth: 200, minHeight: isCollapsed ? 50 : 150 }}
      >
        {/* Group Header */}
        <div className={`${colors.header} ${colors.darkHeader} px-3 py-2 flex items-center justify-between border-b ${colors.border} ${colors.darkBorder}`}>
          <div className="flex items-center gap-2">
            <FolderOpen className={`h-4 w-4 ${colors.text} ${colors.darkText}`} />
            <span className={`text-sm font-semibold ${colors.text} ${colors.darkText}`}>{groupName}</span>
            {data.status === "Blocked" && (
              <span className="flex items-center gap-1 text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold">
                <ShieldAlert className="h-3 w-3" />
                Blocked
              </span>
            )}
          </div>
          
          {/* Control Buttons */}
          <div 
            className="flex items-center gap-1"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Expand Button */}
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={handleExpand}
              className={`p-1 rounded ${colors.btnBg} ${colors.darkBtnBg} ${colors.text} ${colors.darkText} transition-colors ${!isCollapsed ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Expand group"
              disabled={!isCollapsed}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            
            {/* Collapse Button */}
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={handleCollapse}
              className={`p-1 rounded ${colors.btnBg} ${colors.darkBtnBg} ${colors.text} ${colors.darkText} transition-colors ${isCollapsed ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Collapse group"
              disabled={isCollapsed}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        
        {/* Content area - children nodes go here */}
        {!isCollapsed && <div className="p-2 h-full" />}
      </div>
    </>
  )
}

export default memo(GroupNode)
