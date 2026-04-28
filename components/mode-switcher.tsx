"use client"

import { Briefcase, GitBranch, GraduationCap, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react"
import type { Mode, Stage } from "@/lib/use-mode"
import { STAGES } from "@/lib/use-mode"

interface StagesProgress {
  total: number
  completed: number
  inProgress: number
  notStarted: number
  blocked: number
  percentage: number
}

interface ModeSwitcherProps {
  mode: Mode
  currentStage: Stage
  onModeChange: (mode: Mode) => void
  onStageChange: (stage: Stage) => void
  onNextStage: () => void
  onPrevStage: () => void
  isDarkMode?: boolean
  isSandbox?: boolean
  projectId?: string | null
  stagesProgress?: StagesProgress
}

const modeConfig = {
  work: {
    label: "Work",
    icon: Briefcase,
    description: "Focus on current stage",
  },
  pipeline: {
    label: "Pipeline",
    icon: GitBranch,
    description: "View full workflow (read-only)",
  },
  training: {
    label: "Training",
    icon: GraduationCap,
    description: "Sandbox mode for learning",
  },
}

const stageLabels: Record<Stage, string> = {
  PD: "Problem Discovery",
  S0: "Problem Lock",
  S1: "Product Shape",
  S2: "Architecture",
  S3: "Development",
  S4: "Build",
  S5: "Release",
  S6: "Learn & Iterate",
}

export default function ModeSwitcher({
  mode,
  currentStage,
  onModeChange,
  onStageChange,
  onNextStage,
  onPrevStage,
  isDarkMode = true,
  isSandbox = false,
  projectId,
  stagesProgress,
}: ModeSwitcherProps) {
  const stageIndex = STAGES.indexOf(currentStage)
  const canGoBack = stageIndex > 0
  const canGoForward = stageIndex < STAGES.length - 1

  return (
    <div className="flex flex-col gap-3">
      {/* Mode Toggle */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-black/20">
        {(Object.keys(modeConfig) as Mode[]).map((m) => {
          const config = modeConfig[m]
          const Icon = config.icon
          const isActive = mode === m

          return (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all
                ${isActive
                  ? isDarkMode
                    ? "bg-[#f26522] text-white shadow-lg"
                    : "bg-indigo-600 text-white shadow-lg"
                  : isDarkMode
                    ? "text-gray-400 hover:text-white hover:bg-white/5"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }
              `}
              title={config.description}
            >
              <Icon className="w-4 h-4" />
              <span>{config.label}</span>
            </button>
          )
        })}
      </div>

      {/* Stage Selector - Only visible in Work mode */}
      {mode === "work" && (
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevStage}
            disabled={!canGoBack}
            className={`
              p-2 rounded-lg transition-colors
              ${canGoBack
                ? isDarkMode
                  ? "text-gray-300 hover:text-white hover:bg-white/10"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                : isDarkMode
                  ? "text-gray-600 cursor-not-allowed"
                  : "text-gray-300 cursor-not-allowed"
              }
            `}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <select
            value={currentStage}
            onChange={(e) => onStageChange(e.target.value as Stage)}
            className={`
              flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
              ${isDarkMode
                ? "bg-white/5 text-white border border-white/10 focus:border-[#f26522]"
                : "bg-gray-100 text-gray-900 border border-gray-200 focus:border-indigo-500"
              }
              focus:outline-none focus:ring-2 focus:ring-offset-0
              ${isDarkMode ? "focus:ring-[#f26522]/30" : "focus:ring-indigo-500/30"}
            `}
          >
            {STAGES.map((stage) => (
              <option key={stage} value={stage} className={isDarkMode ? "bg-gray-900" : "bg-white"}>
                {stage} - {stageLabels[stage]}
              </option>
            ))}
          </select>

          <button
            onClick={onNextStage}
            disabled={!canGoForward}
            className={`
              p-2 rounded-lg transition-colors
              ${canGoForward
                ? isDarkMode
                  ? "text-gray-300 hover:text-white hover:bg-white/10"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                : isDarkMode
                  ? "text-gray-600 cursor-not-allowed"
                  : "text-gray-300 cursor-not-allowed"
              }
            `}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Sandbox Indicator - Only in Training mode */}
      {isSandbox && (
        <div className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm
          ${isDarkMode
            ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
            : "bg-amber-50 border border-amber-200 text-amber-700"
          }
        `}>
          <AlertTriangle className="w-4 h-4" />
          <span>Sandbox Mode - Changes won&apos;t be saved to production</span>
        </div>
      )}

      {/* Pipeline Mode Indicator */}
      {mode === "pipeline" && (
        <div className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm
          ${isDarkMode
            ? "bg-blue-500/10 border border-blue-500/30 text-blue-400"
            : "bg-blue-50 border border-blue-200 text-blue-700"
          }
        `}>
          <GitBranch className="w-4 h-4" />
          <span>Read-only view of full pipeline</span>
        </div>
      )}

      {/* Project Progress */}
      {projectId && stagesProgress && stagesProgress.total > 0 && (
        <div className={`
          px-3 py-2 rounded-lg text-sm
          ${isDarkMode
            ? "bg-white/5 border border-white/10"
            : "bg-gray-50 border border-gray-200"
          }
        `}>
          <div className="flex items-center justify-between mb-2">
            <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              Project Progress
            </span>
            <span className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {stagesProgress.percentage}%
            </span>
          </div>
          <div className={`h-2 rounded-full overflow-hidden ${
            isDarkMode ? "bg-white/10" : "bg-gray-200"
          }`}>
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${stagesProgress.percentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className={isDarkMode ? "text-green-400" : "text-green-600"}>
              {stagesProgress.completed} completed
            </span>
            <span className={isDarkMode ? "text-blue-400" : "text-blue-600"}>
              {stagesProgress.inProgress} in progress
            </span>
          </div>
        </div>
      )}

      {/* No Project Warning */}
      {!projectId && mode === "work" && (
        <div className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm
          ${isDarkMode
            ? "bg-orange-500/10 border border-orange-500/30 text-orange-400"
            : "bg-orange-50 border border-orange-200 text-orange-700"
          }
        `}>
          <AlertTriangle className="w-4 h-4" />
          <span>No project selected. Open Settings to create one.</span>
        </div>
      )}
    </div>
  )
}
