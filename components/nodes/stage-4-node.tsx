"use client"

import BaseStageNode from "./base-stage-node"

interface Stage4NodeProps {
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

export default function Stage4Node({ data, id }: Stage4NodeProps) {
  return (
    <BaseStageNode
      data={data}
      id={id}
      stageNumber={4}
      defaultHumanPercent={50}
      defaultAiPercent={50}
    />
  )
}
