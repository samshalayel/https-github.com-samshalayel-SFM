"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown, ChevronRight, Shield } from "lucide-react"
import { sfmNodeRegistry, colorMap, stageColors, type SfmStage } from "@/lib/sfm-node-registry"
import SeesawIcon from "./seesaw-icon"

interface SfmNodeLibraryProps {
  isDarkMode?: boolean
}

const stageLabels: Record<SfmStage, string> = {
  PD: "Problem Discovery",
  S0: "Problem Lock",
  S1: "Product Shape",
  S2: "Architecture",
  S3: "Production Slice",
  S4: "Implementation",
  S5: "Quality & Testing",
  S6: "Release",
}

const stageOrder: SfmStage[] = ["PD", "S0", "S1", "S2", "S3", "S4", "S5", "S6"]

export default function SfmNodeLibrary({ isDarkMode = true }: SfmNodeLibraryProps) {
  const [expandedStages, setExpandedStages] = useState<Set<SfmStage>>(new Set(["S0", "S1"]))

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string, displayName: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.setData("application/reactflow-label", displayName)
    event.dataTransfer.effectAllowed = "move"
  }

  const toggleStage = (stage: SfmStage) => {
    setExpandedStages((prev) => {
      const next = new Set(prev)
      if (next.has(stage)) {
        next.delete(stage)
      } else {
        next.add(stage)
      }
      return next
    })
  }

  // Group nodes by stage
  const nodesByStage = stageOrder.reduce((acc, stage) => {
    acc[stage] = Object.entries(sfmNodeRegistry).filter(([, config]) => config.stage === stage)
    return acc
  }, {} as Record<SfmStage, [string, typeof sfmNodeRegistry[string]][]>)

  return (
    <div className="flex flex-col gap-2">
      {stageOrder.map((stage) => {
        const nodes = nodesByStage[stage]
        if (nodes.length === 0) return null

        const isExpanded = expandedStages.has(stage)
        const stageColor = colorMap[stageColors[stage]]

        return (
          <div key={stage} className="rounded-xl overflow-hidden">
            {/* Stage Header */}
            <button
              onClick={() => toggleStage(stage)}
              className={`w-full px-3 py-2 flex items-center justify-between transition-colors ${
                isDarkMode
                  ? "bg-white/5 hover:bg-white/10 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span className={`text-xs font-bold px-2 py-0.5 rounded bg-gradient-to-r ${stageColor.gradient} text-white`}>
                  {stage}
                </span>
                <span className="text-sm font-medium">{stageLabels[stage]}</span>
              </div>
              <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                {nodes.length}
              </span>
            </button>

            {/* Stage Nodes */}
            {isExpanded && (
              <div className={`p-2 space-y-2 ${isDarkMode ? "bg-white/[0.02]" : "bg-gray-50"}`}>
                {nodes.map(([nodeType, config]) => {
                  const colors = colorMap[config.color]
                  const Icon = config.icon
                  const isGate = config.kind === "gate"

                  return (
                    <div
                      key={nodeType}
                      className={`rounded-xl p-3 cursor-move hover:scale-[1.02] transition-all duration-200 ${
                        isGate
                          ? `bg-gradient-to-r ${colors.gradient} border-2 border-dashed border-white/30`
                          : `bg-gradient-to-r ${colors.gradient}`
                      }`}
                      draggable
                      onDragStart={(e) => onDragStart(e, nodeType, config.title)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {isGate ? (
                            <Shield className="h-4 w-4 text-white" />
                          ) : (
                            <Icon className="h-4 w-4 text-white" />
                          )}
                          <span className="font-semibold text-xs text-white">{config.title}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {isGate ? (
                            <span className="text-[10px] text-white/80 px-1.5 py-0.5 bg-white/20 rounded">
                              {config.decisionAuthority}
                            </span>
                          ) : (
                            <SeesawIcon
                              humanPercent={config.defaultHumanPercent ?? 50}
                              aiPercent={config.defaultAiPercent ?? 50}
                              size={18}
                            />
                          )}
                        </div>
                      </div>
                      {config.description && (
                        <p className="text-[10px] text-white/70 leading-relaxed line-clamp-2">
                          {config.description}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
