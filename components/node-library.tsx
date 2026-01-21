"use client"

import type React from "react"
import { Layers, Shield, Lightbulb, CheckCircle2, Compass, Link2 } from "lucide-react"
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

      {/* Insight Node */}
      <div
        className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-4 cursor-move hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] transition-all duration-200"
        draggable
        onDragStart={(e) => onDragStart(e, "insight-node", "Insight")}
      >
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/20">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-white" />
            <span className="font-semibold text-sm text-white">Insight</span>
          </div>
          <span className="text-xs text-white/80">Analysis Only</span>
        </div>
        <p className="text-center text-xs text-white/80 leading-relaxed">
          Generates understanding, not decisions
        </p>
      </div>

      {/* Outcome Node */}
      <div
        className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 cursor-move hover:shadow-lg hover:shadow-green-500/20 hover:scale-[1.02] transition-all duration-200"
        draggable
        onDragStart={(e) => onDragStart(e, "outcome-node", "Outcome")}
      >
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/20">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-white" />
            <span className="font-semibold text-sm text-white">Outcome</span>
          </div>
          <span className="text-xs text-white/80">H:80%+ AI:20%-</span>
        </div>
        <p className="text-center text-xs text-white/80 leading-relaxed">
          Validated outcomes from insights
        </p>
      </div>

      {/* Direction Node */}
      <div
        className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 cursor-move hover:shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02] transition-all duration-200"
        draggable
        onDragStart={(e) => onDragStart(e, "direction-node", "Direction")}
      >
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/20">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-white" />
            <span className="font-semibold text-sm text-white">Direction</span>
          </div>
          <span className="text-xs text-white/80">H:90%+ AI:10%-</span>
        </div>
        <p className="text-center text-xs text-white/80 leading-relaxed">
          WHERE to go, not HOW
        </p>
      </div>

      {/* Blocking Gate Node */}
      <div
        className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-4 cursor-move hover:shadow-lg hover:shadow-red-500/20 hover:scale-[1.02] transition-all duration-200"
        draggable
        onDragStart={(e) => onDragStart(e, "gate-problem", "Blocking Gate")}
      >
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/20">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-white" />
            <span className="font-semibold text-sm text-white">Blocking Gate</span>
          </div>
          <span className="text-xs text-white/80">Requires Approval</span>
        </div>
        <p className="text-center text-xs text-white/80 leading-relaxed">
          Prevents moving forward without human sign-off
        </p>
      </div>

      {/* Alignment Gate Node */}
      <div
        className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-4 cursor-move hover:shadow-lg hover:shadow-amber-500/20 hover:scale-[1.02] transition-all duration-200 border-2 border-dashed border-white/30"
        draggable
        onDragStart={(e) => onDragStart(e, "alignment-gate", "Alignment Gate")}
      >
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-dashed border-white/20">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-white" />
            <span className="font-semibold text-sm text-white">Alignment</span>
          </div>
          <span className="text-xs text-white/80">Non-Blocking</span>
        </div>
        <p className="text-center text-xs text-white/80 leading-relaxed">
          Justification check, does not block flow
        </p>
      </div>
    </div>
  )
}
