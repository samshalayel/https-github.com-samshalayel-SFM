"use client"

import { Handle, Position } from "reactflow"
import { MoveRight } from "lucide-react"

export function ConveyorNode({ data }: any) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-gradient-to-r from-blue-500 to-blue-600 border-2 border-blue-700 min-w-[180px]">
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <div className="flex items-center gap-2">
        <MoveRight className="h-5 w-5 text-white" />
        <div>
          <div className="text-sm font-bold text-white">{data.label || "Conveyor Belt"}</div>
          {data.speed && <div className="text-xs text-blue-100">Speed: {data.speed} m/min</div>}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  )
}
