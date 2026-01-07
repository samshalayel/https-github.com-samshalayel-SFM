"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Table } from "lucide-react"
import type { NodeData } from "@/lib/types"

export const TableNode = memo(({ data, isConnectable }: NodeProps<NodeData>) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-amber-500 min-w-[150px]">
      <div className="flex items-center">
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-amber-100 text-amber-500">
          <Table className="h-4 w-4" />
        </div>
        <div className="ml-2">
          <div className="text-sm font-bold">{data.label || "Table"}</div>
          <div className="text-xs text-gray-500">{data.description || "Database table operation"}</div>
        </div>
      </div>

      {data.tableName && <div className="mt-2 text-xs bg-gray-100 p-1 rounded">Table: {data.tableName}</div>}
      {data.operation && <div className="mt-1 text-xs bg-gray-100 p-1 rounded">Op: {data.operation}</div>}

      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-3 h-3 bg-amber-500" />
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-3 h-3 bg-amber-500" />
    </div>
  )
})

TableNode.displayName = "TableNode"
