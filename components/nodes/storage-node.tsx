"use client"

import { Handle, Position } from "reactflow"
import { Warehouse } from "lucide-react"

export function StorageNode({ data }: any) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-gradient-to-r from-slate-500 to-slate-600 border-2 border-slate-700 min-w-[180px]">
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <div className="flex items-center gap-2">
        <Warehouse className="h-5 w-5 text-white" />
        <div>
          <div className="text-sm font-bold text-white">{data.label || "Storage"}</div>
          {data.capacity && <div className="text-xs text-slate-100">Capacity: {data.capacity}</div>}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  )
}
