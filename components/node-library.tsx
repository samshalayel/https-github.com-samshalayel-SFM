"use client"

import type React from "react"

import { Lightbulb, Target, Network, Slice, Eye, RefreshCw, Rocket, Shield } from "lucide-react"
import SeesawIcon from "./seesaw-icon"

interface NodeLibraryProps {
  isDarkMode?: boolean
}

const nodeTypes = [
  // ... existing stage nodes ...
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

const gateTypes = [
  {
    type: "gate-problem",
    label: "Problem Gate",
    title: "Problem Gate",
    description: "AI may advise. Only humans sign.",
    icon: Shield,
    displayName: "Problem Gate",
    authority: "Human Only",
    humanPercent: 100,
    aiPercent: 0,
    color: "from-red-500 to-red-600",
  },
  {
    type: "gate-product",
    label: "Product Gate",
    title: "Product Gate",
    description: "Human decides product boundaries.",
    icon: Shield,
    displayName: "Product Gate",
    authority: "Human",
    humanPercent: 95,
    aiPercent: 5,
    color: "from-orange-500 to-orange-600",
  },
  {
    type: "gate-architecture",
    label: "Architecture Gate",
    title: "Architecture Gate",
    description: "Human approves architecture decisions.",
    icon: Shield,
    displayName: "Architecture Gate",
    authority: "Human",
    humanPercent: 90,
    aiPercent: 10,
    color: "from-amber-500 to-amber-600",
  },
  {
    type: "gate-production",
    label: "Production Gate",
    title: "Production Gate",
    description: "Joint human-AI production approval.",
    icon: Shield,
    displayName: "Production Gate",
    authority: "Human + AI",
    humanPercent: 70,
    aiPercent: 30,
    color: "from-yellow-500 to-yellow-600",
  },
  {
    type: "gate-release",
    label: "Release Gate",
    title: "Release Gate",
    description: "Final release requires human sign-off.",
    icon: Shield,
    displayName: "Release Gate",
    authority: "Human Only",
    humanPercent: 100,
    aiPercent: 0,
    color: "from-green-500 to-green-600",
  },
]

export default function NodeLibrary({ isDarkMode = true }: NodeLibraryProps) {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string, displayName: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.setData("application/reactflow-label", displayName)
    event.dataTransfer.effectAllowed = "move"
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Stage Nodes */}
      {nodeTypes.map((node) => {
        const IconComponent = node.icon
        return (
          <div
            key={node.type}
            className={`backdrop-blur-sm border rounded-2xl p-4 cursor-move hover:scale-[1.02] transition-all duration-200 group ${
              isDarkMode
                ? "bg-gradient-to-br from-[#1f1f3a]/80 to-[#151528]/80 border-white/5 hover:border-[#f26522]/30 hover:shadow-lg hover:shadow-[#f26522]/10"
                : "bg-white/80 border-gray-200 hover:bg-white hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/20"
            }`}
            draggable
            onDragStart={(e) => onDragStart(e, node.type, node.displayName)}
          >
            <div
              className={`flex items-center justify-between mb-3 pb-3 border-b ${isDarkMode ? "border-white/5" : "border-gray-200"}`}
            >
              <div className="flex items-center gap-2">
                <span className={`font-semibold text-xs ${isDarkMode ? "text-teal-400" : "text-blue-600"}`}>
                  Human: {node.humanPercent}%
                </span>
                <SeesawIcon humanPercent={node.humanPercent} aiPercent={node.aiPercent} size={24} />
                <span className={`font-semibold text-xs ${isDarkMode ? "text-purple-400" : "text-purple-600"}`}>
                  AI: {node.aiPercent}%
                </span>
              </div>
              <span className={`text-xs font-medium ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                {node.label}
              </span>
            </div>

            <h3 className={`text-center text-base font-bold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {node.title}
            </h3>

            <div
              className={`h-1 rounded-full mb-3 ${
                isDarkMode
                  ? "bg-gradient-to-r from-[#f26522] via-purple-500 to-teal-500"
                  : "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
              }`}
            />

            <p className={`text-center text-xs leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              {node.description}
            </p>
          </div>
        )
      })}

      {/* Human Quality Gates */}
      <div className={`mt-6 pt-6 border-t-2 border-dashed ${isDarkMode ? "border-[#f26522]/20" : "border-gray-300"}`}>
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          <Shield className={`h-5 w-5 ${isDarkMode ? "text-[#f26522]" : "text-red-500"}`} />
          Human Quality Gates
        </h3>
        <p className={`text-xs mb-4 ${isDarkMode ? "text-gray-500" : "text-gray-600"}`}>
          AI may advise. Only humans sign.
        </p>

        {gateTypes.map((gate) => {
          const IconComponent = gate.icon
          return (
            <div
              key={gate.type}
              className={`bg-gradient-to-r ${gate.color} rounded-2xl p-4 cursor-move hover:shadow-lg hover:shadow-current/20 hover:scale-[1.02] transition-all duration-200 group mb-3`}
              draggable
              onDragStart={(e) => onDragStart(e, gate.type, gate.displayName)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <IconComponent className="h-4 w-4 text-white" />
                </div>
                <span className="text-white font-bold text-sm">{gate.title}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-white/90 mb-2">
                <span>Human: {gate.humanPercent}%</span>
                <span>AI: {gate.aiPercent}%</span>
              </div>
              <p className="text-center text-xs text-white/80 leading-relaxed">{gate.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
