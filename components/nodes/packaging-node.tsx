"use client"

import { Handle, Position } from "reactflow"
import { Package } from "lucide-react"

export function PackagingNode({ data }: any) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-gradient-to-r from-amber-500 to-amber-600 border-2 border-amber-700 min-w-[180px]">
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-white" />
        <div>
          <div className="text-sm font-bold text-white">{data.label || "Packaging"}</div>
          {data.packagingType && <div className="text-xs text-amber-100">{data.packagingType}</div>}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  )
}
