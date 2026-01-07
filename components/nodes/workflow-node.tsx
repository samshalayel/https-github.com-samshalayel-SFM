"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Workflow } from "lucide-react"
import type { NodeData } from "@/lib/types"

export const WorkflowNode = memo(({ data, isConnectable }: NodeProps<NodeData>) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-indigo-500 min-w-[150px]">
      <div className="flex items-center">
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-500">
          <Workflow className="h-4 w-4" />
        </div>
        <div className="ml-2">
          <div className="text-sm font-bold">{data.label || "Sub-workflow"}</div>
          <div className="text-xs text-gray-500">{data.description || "Nested workflow"}</div>
        </div>
      </div>

      {data.workflowId && <div className="mt-2 text-xs bg-gray-100 p-1 rounded">Workflow: {data.workflowId}</div>}

      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-3 h-3 bg-indigo-500" />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-indigo-500"
      />
    </div>
  )
})

WorkflowNode.displayName = "WorkflowNode"
