"use client"

import { Briefcase, GitBranch, GraduationCap, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react"
import type { Mode, Stage } from "@/lib/use-mode"
import { STAGES } from "@/lib/use-mode"

interface ModeSwitcherProps {
  mode: Mode
  currentStage: Stage
  onModeChange: (mode: Mode) => void
  onStageChange: (stage: Stage) => void
  onNextStage: () => void
  onPrevStage: () => void
  isDarkMode?: boolean
  isSandbox?: boolean
}

const modeConfig = {
  work: {
    label: "عمل",
    labelEn: "Work",
    icon: Briefcase,
    description: "التركيز على المرحلة الحالية",
  },
  pipeline: {
    label: "مسار",
    labelEn: "Pipeline",
    icon: GitBranch,
    description: "عرض المسار الكامل (للقراءة فقط)",
  },
  training: {
    label: "تدريب",
    labelEn: "Training",
    icon: GraduationCap,
    description: "وضع التجريب والتعلم",
  },
}

const stageLabels: Record<Stage, string> = {
  PD: "اكتشاف المشكلة",
  S0: "تثبيت المشكلة",
  S1: "شكل المنتج",
  S2: "الهيكلة",
  S3: "التطوير",
  S4: "البناء",
  S5: "الإطلاق",
  S6: "التعلم والتكرار",
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
          <span>وضع التجريب - التغييرات لن تُحفظ في الإنتاج</span>
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
          <span>عرض المسار الكامل (للقراءة فقط)</span>
        </div>
      )}
    </div>
  )
}
