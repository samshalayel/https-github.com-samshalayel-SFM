import { useState, useCallback, useMemo } from "react"

export type Mode = "work" | "pipeline" | "training"
export type Stage = "PD" | "S0" | "S1" | "S2" | "S3" | "S4" | "S5" | "S6"

export const STAGES: Stage[] = ["PD", "S0", "S1", "S2", "S3", "S4", "S5", "S6"]

export interface ModeState {
  mode: Mode
  currentStage: Stage
  setMode: (mode: Mode) => void
  setCurrentStage: (stage: Stage) => void
  nextStage: () => void
  prevStage: () => void
  isEditable: boolean
  isSandbox: boolean
  showAllStages: boolean
}

export function useMode(initialMode: Mode = "work", initialStage: Stage = "S0"): ModeState {
  const [mode, setMode] = useState<Mode>(initialMode)
  const [currentStage, setCurrentStage] = useState<Stage>(initialStage)

  const nextStage = useCallback((): Stage => {
    const idx = STAGES.indexOf(currentStage)
    const newStage = idx < STAGES.length - 1 ? STAGES[idx + 1] : currentStage
    setCurrentStage(newStage)
    return newStage
  }, [currentStage])

  const prevStage = useCallback((): Stage => {
    const idx = STAGES.indexOf(currentStage)
    const newStage = idx > 0 ? STAGES[idx - 1] : currentStage
    setCurrentStage(newStage)
    return newStage
  }, [currentStage])

  // Derived states based on mode
  const isEditable = useMemo(() => mode !== "pipeline", [mode])
  const isSandbox = useMemo(() => mode === "training", [mode])
  const showAllStages = useMemo(() => mode === "pipeline" || mode === "training", [mode])

  return {
    mode,
    currentStage,
    setMode,
    setCurrentStage,
    nextStage,
    prevStage,
    isEditable,
    isSandbox,
    showAllStages,
  }
}
