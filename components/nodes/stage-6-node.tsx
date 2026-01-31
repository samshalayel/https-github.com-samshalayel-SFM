"use client"

import BaseStageNode from "./base-stage-node"

interface Stage6NodeProps {
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

export default function Stage6Node({ data, id }: Stage6NodeProps) {
  return (
    <BaseStageNode
      data={data}
      id={id}
      stageNumber={6}
      defaultHumanPercent={70}
      defaultAiPercent={30}
    />
  )
}
