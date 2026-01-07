"use client"

import { Handle, Position } from "reactflow"
import { GitMerge } from "lucide-react"

export function SortingNode({ data }: any) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-gradient-to-r from-cyan-500 to-cyan-600 border-2 border-cyan-700 min-w-[180px]">
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <div className="flex items-center gap-2">
        <GitMerge className="h-5 w-5 text-white" />
        <div>
          <div className="text-sm font-bold text-white">{data.label || "Sorting"}</div>
          {data.sortCriteria && <div className="text-xs text-cyan-100">By {data.sortCriteria}</div>}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  )
}
