"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Mail } from "lucide-react"
import type { NodeData } from "@/lib/types"

export const EmailNode = memo(({ data, isConnectable }: NodeProps<NodeData>) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-purple-500 min-w-[150px]">
      <div className="flex items-center">
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-purple-100 text-purple-500">
          <Mail className="h-4 w-4" />
        </div>
        <div className="ml-2">
          <div className="text-sm font-bold">{data.label || "Email"}</div>
          <div className="text-xs text-gray-500">{data.description || "Send email notification"}</div>
        </div>
      </div>

      {data.emailTo && <div className="mt-2 text-xs bg-gray-100 p-1 rounded">To: {data.emailTo}</div>}
      {data.emailSubject && <div className="mt-1 text-xs bg-gray-100 p-1 rounded">Subject: {data.emailSubject}</div>}

      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-3 h-3 bg-purple-500" />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-purple-500"
      />
    </div>
  )
})

EmailNode.displayName = "EmailNode"
