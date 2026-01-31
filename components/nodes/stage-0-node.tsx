"use client"

import BaseStageNode from "./base-stage-node"

interface Stage0NodeProps {
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

export default function Stage0Node({ data, id }: Stage0NodeProps) {
  return (
    <BaseStageNode
      data={data}
      id={id}
      stageNumber={0}
      defaultHumanPercent={95}
      defaultAiPercent={5}
    />
  )
}
