"use client"

import { Handle, Position } from "reactflow"
import { Wrench } from "lucide-react"

export function AssemblyNode({ data }: any) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-gradient-to-r from-purple-500 to-purple-600 border-2 border-purple-700 min-w-[180px]">
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <div className="flex items-center gap-2">
        <Wrench className="h-5 w-5 text-white" />
        <div>
          <div className="text-sm font-bold text-white">{data.label || "Assembly Station"}</div>
          {data.assemblyType && <div className="text-xs text-purple-100">{data.assemblyType}</div>}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  )
}
