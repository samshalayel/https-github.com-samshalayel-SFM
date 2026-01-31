"use client"

import BaseStageNode from "./base-stage-node"

interface Stage2NodeProps {
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

export default function Stage2Node({ data, id }: Stage2NodeProps) {
  return (
    <BaseStageNode
      data={data}
      id={id}
      stageNumber={2}
      defaultHumanPercent={70}
      defaultAiPercent={30}
    />
  )
}
