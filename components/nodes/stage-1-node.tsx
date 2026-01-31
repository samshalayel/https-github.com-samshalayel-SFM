"use client"

import BaseStageNode from "./base-stage-node"

interface Stage1NodeProps {
  data: {
    label: string
    description?: string
    humanPercentage?: number
    aiPercentage?: number
    group?: string
    isCollapsed?: boolean
  }
  id: string
}

export default function Stage1Node({ data, id }: Stage1NodeProps) {
  return (
    <BaseStageNode
      data={data}
      id={id}
      stageNumber={1}
      defaultHumanPercent={80}
      defaultAiPercent={20}
    />
  )
}
