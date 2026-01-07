"use client"

import { Handle, Position } from "reactflow"
import { TestTube } from "lucide-react"

export function TestingNode({ data }: any) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-gradient-to-r from-indigo-500 to-indigo-600 border-2 border-indigo-700 min-w-[180px]">
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <div className="flex items-center gap-2">
        <TestTube className="h-5 w-5 text-white" />
        <div>
          <div className="text-sm font-bold text-white">{data.label || "Testing"}</div>
          {data.testType && <div className="text-xs text-indigo-100">{data.testType} test</div>}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  )
}
