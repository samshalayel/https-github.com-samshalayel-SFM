"use client"

import { Handle, Position } from "reactflow"
import { Box } from "lucide-react"

export function RawMaterialNode({ data }: any) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-gradient-to-r from-orange-500 to-orange-600 border-2 border-orange-700 min-w-[180px]">
      <div className="flex items-center gap-2">
        <Box className="h-5 w-5 text-white" />
        <div>
          <div className="text-sm font-bold text-white">{data.label || "Raw Material"}</div>
          {data.materialType && <div className="text-xs text-orange-100">{data.materialType}</div>}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  )
}
