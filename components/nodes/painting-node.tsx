"use client"

import { Handle, Position } from "reactflow"
import { Paintbrush } from "lucide-react"

export function PaintingNode({ data }: any) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-gradient-to-r from-pink-500 to-pink-600 border-2 border-pink-700 min-w-[180px]">
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <div className="flex items-center gap-2">
        <Paintbrush className="h-5 w-5 text-white" />
        <div>
          <div className="text-sm font-bold text-white">{data.label || "Painting/Coating"}</div>
          {data.coatingType && <div className="text-xs text-pink-100">{data.coatingType}</div>}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  )
}
