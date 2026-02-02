"use client"

import type React from "react"
import { memo, useState } from "react"
import { NodeResizer, type NodeProps, useReactFlow } from "reactflow"
import { FolderOpen, Plus, Minus } from "lucide-react"

interface GroupNodeData {
  label: string
  color?: string
  isCollapsed?: boolean
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
  const [isCollapsed, setIsCollapsed] = useState(data.isCollapsed || false)
  const [originalSize, setOriginalSize] = useState<{ width: number; height: number } | null>(null)
  const { setNodes, getNode } = useReactFlow()

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsCollapsed(false)
    
    // Restore original size and show child nodes
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id && originalSize) {
          return {
            ...node,
            style: { ...node.style, width: originalSize.width, height: originalSize.height },
          }
        }
        if (node.parentId === id) {
          return { ...node, hidden: false }
        }
        return node
      })
    )
  }

  const handleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    // Save current size before collapsing
    const currentNode = getNode(id)
    if (currentNode) {
      const width = (currentNode.style?.width as number) || currentNode.width || 300
      const height = (currentNode.style?.height as number) || currentNode.height || 200
      setOriginalSize({ width, height })
    }
    
    setIsCollapsed(true)
    
    // Shrink group and hide child nodes
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            style: { ...node.style, width: COLLAPSED_WIDTH, height: COLLAPSED_HEIGHT },
          }
        }
        if (node.parentId === id) {
          return { ...node, hidden: true }
        }
        return node
      })
    )
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
      
      <div
        className={`w-full h-full ${colors.bg} ${colors.darkBg} ${colors.border} ${colors.darkBorder} border-2 border-dashed rounded-xl overflow-hidden transition-all duration-200`}
        style={{ minWidth: 200, minHeight: isCollapsed ? 50 : 150 }}
      >
        {/* Group Header */}
        <div className={`${colors.header} ${colors.darkHeader} px-3 py-2 flex items-center justify-between border-b ${colors.border} ${colors.darkBorder}`}>
          <div className="flex items-center gap-2">
            <FolderOpen className={`h-4 w-4 ${colors.text} ${colors.darkText}`} />
            <span className={`text-sm font-semibold ${colors.text} ${colors.darkText}`}>{groupName}</span>
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
