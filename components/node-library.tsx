"use client"

import type React from "react"

import { Lightbulb, Target, Network, Slice, Eye, RefreshCw, Rocket } from "lucide-react"
import SeesawIcon from "./seesaw-icon"

const nodeTypes = [
  {
    type: "stage-0",
    label: "Stage 0",
    title: "Problem Definition",
    description: "Define the real problem and context",
    icon: Lightbulb,
    displayName: "Problem / Technical Lock",
    color: "bg-red-500",
    humanPercent: 95,
    aiPercent: 5,
  },
  {
    type: "stage-1",
    label: "Stage 1",
    title: "Product Shaping",
    description: "Define product vision and MVP boundaries",
    icon: Target,
    displayName: "Product Shape",
    color: "bg-orange-500",
    humanPercent: 80,
    aiPercent: 20,
  },
  {
    type: "stage-2",
    label: "Stage 2",
    title: "Architecture Spine",
    description: "Design system architecture and tech stack",
    icon: Network,
    displayName: "Architecture Spine",
    color: "bg-yellow-500",
    humanPercent: 70,
    aiPercent: 30,
  },
  {
    type: "stage-3",
    label: "Stage 3",
    title: "Production Slice",
    description: "Build first end-to-end feature slice",
    icon: Slice,
    displayName: "Production Slice",
    color: "bg-green-500",
    humanPercent: 50,
    aiPercent: 50,
  },
  {
    type: "stage-4",
    label: "Stage 4",
    title: "Observability & Ops",
    description: "Add monitoring, logging, and operations",
    icon: Eye,
    displayName: "Observability & Ops",
    color: "bg-blue-500",
    humanPercent: 40,
    aiPercent: 60,
  },
  {
    type: "stage-5",
    label: "Stage 5",
    title: "Reproducibility",
    description: "Ensure consistent builds and deployments",
    icon: RefreshCw,
    displayName: "Reproducibility",
    color: "bg-indigo-500",
    humanPercent: 30,
    aiPercent: 70,
  },
  {
    type: "stage-6",
    label: "Stage 6",
    title: "Production Ready",
    description: "Final polish and production deployment",
    icon: Rocket,
    displayName: "Production Ready",
    color: "bg-purple-500",
    humanPercent: 20,
    aiPercent: 80,
  },
]

export default function NodeLibrary() {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string, displayName: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.setData("application/reactflow-label", displayName)
    event.dataTransfer.effectAllowed = "move"
  }

  return (
    <div className="flex flex-col gap-4">
      {nodeTypes.map((node) => {
        const IconComponent = node.icon
        return (
          <div
            key={node.type}
            className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-4 cursor-move hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group"
            draggable
            onDragStart={(e) => onDragStart(e, node.type, node.displayName)}
          >
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-semibold text-xs">Human: {node.humanPercent}%</span>
                <SeesawIcon humanPercent={node.humanPercent} aiPercent={node.aiPercent} size={24} />
                <span className="text-purple-600 font-semibold text-xs">AI: {node.aiPercent}%</span>
              </div>
              <span className="text-xs text-gray-500 font-medium">{node.label}</span>
            </div>

            <h3 className="text-center text-base font-bold text-gray-900 mb-3">{node.title}</h3>

            <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 rounded-full mb-3" />

            <p className="text-center text-xs text-gray-600 leading-relaxed">{node.description}</p>
          </div>
        )
      })}
    </div>
  )
}
