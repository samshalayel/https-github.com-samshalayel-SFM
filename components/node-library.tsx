"use client"

import type React from "react"
import { Layers, Shield } from "lucide-react"
import SeesawIcon from "./seesaw-icon"

interface NodeLibraryProps {
  isDarkMode?: boolean
}

export default function NodeLibrary({ isDarkMode = true }: NodeLibraryProps) {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string, displayName: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.setData("application/reactflow-label", displayName)
    event.dataTransfer.effectAllowed = "move"
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Generic Stage Node */}
      <div
        className={`backdrop-blur-sm border rounded-2xl p-4 cursor-move hover:scale-[1.02] transition-all duration-200 group ${
          isDarkMode
            ? "bg-gradient-to-br from-[#1f1f3a]/80 to-[#151528]/80 border-white/5 hover:border-[#f26522]/30 hover:shadow-lg hover:shadow-[#f26522]/10"
            : "bg-white/80 border-gray-200 hover:bg-white hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/20"
        }`}
        draggable
        onDragStart={(e) => onDragStart(e, "stage-0", "Stage")}
      >
        <div className={`flex items-center justify-between mb-3 pb-3 border-b ${isDarkMode ? "border-white/5" : "border-gray-200"}`}>
          <div className="flex items-center gap-2">
            <Layers className={`h-5 w-5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
            <span className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>Stage</span>
          </div>
          <SeesawIcon humanPercent={50} aiPercent={50} size={24} />
        </div>
        <p className={`text-center text-xs leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          Drag to add a development stage
        </p>
      </div>

      {/* Generic Gate Node */}
      <div
        className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-4 cursor-move hover:shadow-lg hover:shadow-red-500/20 hover:scale-[1.02] transition-all duration-200"
        draggable
        onDragStart={(e) => onDragStart(e, "gate-problem", "Gate")}
      >
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/20">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-white" />
            <span className="font-semibold text-sm text-white">Gate</span>
          </div>
          <span className="text-xs text-white/80">Human Quality Gate</span>
        </div>
        <p className="text-center text-xs text-white/80 leading-relaxed">
          AI may advise. Only humans sign.
        </p>
      </div>
    </div>
  )
}
