"use client"

import type React from "react"
import { memo } from "react"
import { NodeResizer, type NodeProps } from "reactflow"
import { FolderOpen, ChevronDown, ChevronUp } from "lucide-react"

interface GroupNodeData {
  label: string
  color?: string
  isCollapsed?: boolean
}

const GROUP_COLORS = [
  { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", header: "bg-blue-100" },
  { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", header: "bg-green-100" },
  { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", header: "bg-purple-100" },
  { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", header: "bg-orange-100" },
  { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700", header: "bg-pink-100" },
  { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", header: "bg-cyan-100" },
  { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", header: "bg-amber-100" },
  { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", header: "bg-indigo-100" },
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

const GroupNode: React.FC<NodeProps<GroupNodeData>> = ({ data, selected }) => {
  const groupName = data.label || "Group"
  const colors = getColorByName(groupName)

  return (
    <>
      <NodeResizer
        minWidth={200}
        minHeight={150}
        isVisible={selected}
        lineClassName="!border-blue-400"
        handleClassName="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !rounded-full"
      />
      
      <div
        className={`w-full h-full ${colors.bg} ${colors.border} border-2 border-dashed rounded-xl overflow-hidden transition-all duration-200`}
        style={{ minWidth: 200, minHeight: 150 }}
      >
        {/* Group Header */}
        <div className={`${colors.header} px-4 py-2 flex items-center gap-2 border-b ${colors.border}`}>
          <FolderOpen className={`h-4 w-4 ${colors.text}`} />
          <span className={`text-sm font-semibold ${colors.text}`}>{groupName}</span>
        </div>
        
        {/* Content area - children nodes go here */}
        <div className="p-2 h-full" />
      </div>
    </>
  )
}

export default memo(GroupNode)
