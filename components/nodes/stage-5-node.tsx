"use client"

import BaseStageNode from "./base-stage-node"

interface Stage5NodeProps {
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

export default function Stage5Node({ data, id }: Stage5NodeProps) {
  return (
    <BaseStageNode
      data={data}
      id={id}
      stageNumber={5}
      defaultHumanPercent={60}
      defaultAiPercent={40}
    />
  )
}
