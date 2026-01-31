"use client"

import BaseStageNode from "./base-stage-node"

interface Stage3NodeProps {
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

export default function Stage3Node({ data, id }: Stage3NodeProps) {
  return (
    <BaseStageNode
      data={data}
      id={id}
      stageNumber={3}
      defaultHumanPercent={40}
      defaultAiPercent={60}
    />
  )
}
