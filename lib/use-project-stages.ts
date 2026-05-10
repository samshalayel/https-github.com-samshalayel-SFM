"use client"

import { useState, useCallback, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Node, Edge } from "reactflow"

export type StageCode = "PD" | "S0" | "S1" | "S2" | "S3" | "S4" | "S5" | "S6"
export type StageStatus = "not_started" | "in_progress" | "completed" | "blocked"

export interface ProjectStage {
  id: string
  project_id: string
  stage_code: StageCode
  status: StageStatus
  nodes_data: Node[]
  edges_data: Edge[]
  evidence_data: Record<string, any>
  notes: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export const stageLabels: Record<StageCode, string> = {
  PD: "Problem Discovery",
  S0: "Problem Lock",
  S1: "Product Shape",
  S2: "Architecture",
  S3: "Development",
  S4: "Build",
  S5: "Release",
  S6: "Learn & Iterate",
}

export const stageOrder: StageCode[] = ["PD", "S0", "S1", "S2", "S3", "S4", "S5", "S6"]

export function useProjectStages(projectId: string | null) {
  const [stages, setStages] = useState<ProjectStage[]>([])
  const [currentStage, setCurrentStage] = useState<StageCode>("S0")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  // Load all stages for a project
  const loadStages = useCallback(async () => {
    if (!projectId) {
      setStages([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from("project_stages")
        .select("*")
        .eq("project_id", projectId)
        .order("stage_code", { ascending: true })

      if (fetchError) throw fetchError

      // If no stages exist, create them
      if (!data || data.length === 0) {
        const stagesToCreate = stageOrder.map(code => ({
          project_id: projectId,
          stage_code: code,
          status: "not_started" as StageStatus,
          nodes_data: [],
          edges_data: [],
          evidence_data: {},
        }))

        const { data: createdStages, error: createError } = await supabase
          .from("project_stages")
          .insert(stagesToCreate)
          .select()

        if (createError) {
          console.error("Error creating stages:", createError)
        } else {
          setStages(createdStages || [])
        }
      } else {
        setStages(data)
      }

      // Also get current stage from project
      const { data: projectData } = await supabase
        .from("projects")
        .select("current_stage")
        .eq("id", projectId)
        .single()

      if (projectData?.current_stage) {
        setCurrentStage(projectData.current_stage as StageCode)
      }
    } catch (err) {
      console.error("Error loading stages:", err)
      setError("Failed to load project stages")
    } finally {
      setIsLoading(false)
    }
  }, [projectId, supabase])

  // Load stages when projectId changes
  useEffect(() => {
    loadStages()
  }, [loadStages])

  // Get a specific stage
  const getStage = useCallback((stageCode: StageCode): ProjectStage | undefined => {
    return stages.find(s => s.stage_code === stageCode)
  }, [stages])

  // Save stage data (nodes, edges, evidence)
  const saveStageData = useCallback(async (
    stageCode: StageCode,
    nodes: Node[],
    edges: Edge[],
    evidence?: Record<string, any>
  ) => {
    if (!projectId) return false

    try {
      const stage = getStage(stageCode)
      if (!stage) {
        // Stage not found, reload stages and try again
        await loadStages()
        return false
      }

      const updateData: Partial<ProjectStage> = {
        nodes_data: nodes,
        edges_data: edges,
        updated_at: new Date().toISOString(),
      }

      if (evidence) {
        updateData.evidence_data = evidence
      }

      // Set status to in_progress if not_started and has nodes
      if (stage.status === "not_started" && nodes.length > 0) {
        updateData.status = "in_progress"
        updateData.started_at = new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from("project_stages")
        .update(updateData)
        .eq("id", stage.id)

      if (updateError) throw updateError

      // Reload stages
      await loadStages()
      return true
    } catch (err) {
      console.error("Error saving stage data:", err)
      setError("Failed to save stage data")
      return false
    }
  }, [projectId, getStage, loadStages, supabase])

  // Update stage status
  const updateStageStatus = useCallback(async (
    stageCode: StageCode,
    status: StageStatus
  ) => {
    if (!projectId) return false

    try {
      const stage = getStage(stageCode)
      if (!stage) return false

      const updateData: Partial<ProjectStage> = {
        status,
        updated_at: new Date().toISOString(),
      }

      if (status === "in_progress" && !stage.started_at) {
        updateData.started_at = new Date().toISOString()
      }

      if (status === "completed") {
        updateData.completed_at = new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from("project_stages")
        .update(updateData)
        .eq("id", stage.id)

      if (updateError) throw updateError

      await loadStages()
      return true
    } catch (err) {
      console.error("Error updating stage status:", err)
      setError("Failed to update stage status")
      return false
    }
  }, [projectId, getStage, loadStages, supabase])

  // Update current stage in project
  const setProjectCurrentStage = useCallback(async (stageCode: StageCode) => {
    if (!projectId) return false

    try {
      const { error: updateError } = await supabase
        .from("projects")
        .update({ current_stage: stageCode, updated_at: new Date().toISOString() })
        .eq("id", projectId)

      if (updateError) throw updateError

      setCurrentStage(stageCode)
      return true
    } catch (err) {
      console.error("Error updating current stage:", err)
      return false
    }
  }, [projectId, supabase])

  // Get all nodes and edges combined (for Pipeline view) with stage groups
  // expandedStages is a Set of stage codes that are expanded
  const getAllStagesData = useCallback((expandedStages: Set<string> = new Set()) => {
    const allNodes: Node[] = []
    const allEdges: Edge[] = []
    const collapsedWidth = 320
    const expandedWidth = 380
    const collapsedHeight = 100
    const baseExpandedHeight = 150

    // Calculate positions - expanded stages take more vertical space
    let currentY = 50

    stageOrder.forEach((stageCode, index) => {
      const stage = stages.find(s => s.stage_code === stageCode)
      const stageNodes = stage?.nodes_data || []
      const stageEdges = stage?.edges_data || []
      const isExpanded = expandedStages.has(stageCode)
      const xOffset = index * 400
      
      // Calculate height based on content
      const nodeHeight = isExpanded && stageNodes.length > 0 
        ? Math.max(baseExpandedHeight, 100 + stageNodes.length * 70) 
        : collapsedHeight

      // Create a parent group node for each stage
      const groupNodeId = `stage-group-${stageCode}`
      const groupNode: Node = {
        id: groupNodeId,
        type: "pipeline-stage",
        position: { x: xOffset, y: 50 },
        data: {
          label: `${stageCode} - ${stageLabels[stageCode]}`,
          status: stage?.status || "not_started",
          nodeCount: stageNodes.length,
          isCollapsed: !isExpanded,
          stageCode: stageCode,
        },
        style: {
          width: isExpanded ? expandedWidth : collapsedWidth,
          height: nodeHeight,
        },
      }
      allNodes.push(groupNode)

      // If expanded, add child nodes inside the stage
      if (isExpanded && stageNodes.length > 0) {
        stageNodes.forEach((node, nodeIndex) => {
          const childNode: Node = {
            ...node,
            id: `${stageCode}-${node.id}`,
            position: {
              x: 15,
              y: 80 + nodeIndex * 65,
            },
            parentNode: groupNodeId,
            extent: "parent" as const,
            draggable: false,
            style: {
              ...node.style,
              width: expandedWidth - 30,
              minHeight: 55,
            },
            data: {
              ...node.data,
              isCollapsed: true,
              isPipelineView: true,
            },
          }
          allNodes.push(childNode)
        })

        // Update group height based on actual content
        groupNode.style = {
          ...groupNode.style,
          height: Math.max(baseExpandedHeight, 90 + stageNodes.length * 65),
        }
      }

      // Add edges between stages (connecting groups)
      if (index > 0) {
        const prevStageCode = stageOrder[index - 1]
        allEdges.push({
          id: `edge-${prevStageCode}-${stageCode}`,
          source: `stage-group-${prevStageCode}`,
          target: `stage-group-${stageCode}`,
          type: "smoothstep",
          animated: stage?.status === "in_progress",
          style: { stroke: "#888", strokeWidth: 2 },
        })
      }

      // Add internal edges if not collapsed
      if (!collapsed) {
        stageEdges.forEach(edge => {
          allEdges.push({
            ...edge,
            id: `${stageCode}-${edge.id}`,
            source: `${stageCode}-${edge.source}`,
            target: `${stageCode}-${edge.target}`,
          })
        })
      }
    })

    return { nodes: allNodes, edges: allEdges }
  }, [stages])

  // Helper function to get stage color based on status
  const getStageColor = (status: StageStatus): string => {
    switch (status) {
      case "completed":
        return "rgba(34, 197, 94, 0.15)" // Green
      case "in_progress":
        return "rgba(59, 130, 246, 0.15)" // Blue
      case "blocked":
        return "rgba(239, 68, 68, 0.15)" // Red
      default:
        return "rgba(100, 100, 100, 0.1)" // Gray
    }
  }

  // Get progress summary
  const getProgress = useCallback(() => {
    const total = stages.length
    const completed = stages.filter(s => s.status === "completed").length
    const inProgress = stages.filter(s => s.status === "in_progress").length
    const notStarted = stages.filter(s => s.status === "not_started").length
    const blocked = stages.filter(s => s.status === "blocked").length

    return {
      total,
      completed,
      inProgress,
      notStarted,
      blocked,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  }, [stages])

  return {
    stages,
    currentStage,
    isLoading,
    error,
    loadStages,
    getStage,
    saveStageData,
    updateStageStatus,
    setProjectCurrentStage,
    getAllStagesData,
    getProgress,
  }
}
