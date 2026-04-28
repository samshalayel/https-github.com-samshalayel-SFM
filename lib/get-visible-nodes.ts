import type { Node } from "reactflow"
import type { Mode, Stage } from "./use-mode"
import { sfmNodeRegistry } from "./sfm-node-registry"

// Map stages to their allowed node types
// These are the nodes that can appear in each stage
export const stageNodeTypes: Record<Stage, string[]> = {
  PD: [
    "pd-summary-node",
    "pd-actors-node",
    "pd-goals-node",
    "pd-pain-points-node",
    "pd-constraints-node",
    "pd-scope-node",
    "pd-signals-node",
    "pd-unknowns-node",
    "insight-node",
    "evidence-node",
  ],
  S0: [
    "stage-0",
    "s0-stage",
    "s0-insight-node",
    "s0-outcome-node",
    "s0-direction-node",
    "gate-problem",
    "insight-node",
    "outcome-node",
    "direction-node",
    "evidence-node",
  ],
  S1: [
    "stage-1",
    "s1-stage",
    "s1-actors-node",
    "s1-modules-node",
    "s1-procedures-node",
    "s1-boundary-node",
    "s1-product-insight-node",
    "gate-product",
    "insight-node",
    "outcome-node",
    "direction-node",
    "evidence-node",
  ],
  S2: [
    "stage-2",
    "s2-stage",
    "s2-domains-node",
    "s2-components-node",
    "s2-interactions-node",
    "s2-data-domains-node",
    "s2-integrations-node",
    "s2-constraints-node",
    "s2-architecture-insight-node",
    "gate-architecture",
    "insight-node",
    "outcome-node",
    "direction-node",
    "evidence-node",
  ],
  S3: [
    "stage-3",
    "s3-stage",
    "s3-stories-node",
    "s3-tasks-node",
    "s3-dependencies-node",
    "s3-dev-insight-node",
    "gate-development",
    "insight-node",
    "outcome-node",
    "direction-node",
    "evidence-node",
  ],
  S4: [
    "stage-4",
    "s4-stage",
    "s4-code-node",
    "s4-tests-node",
    "s4-reviews-node",
    "s4-build-insight-node",
    "gate-production",
    "insight-node",
    "outcome-node",
    "direction-node",
    "evidence-node",
  ],
  S5: [
    "stage-5",
    "s5-stage",
    "s5-deploy-node",
    "s5-monitor-node",
    "s5-validate-node",
    "s5-release-insight-node",
    "gate-release",
    "insight-node",
    "outcome-node",
    "direction-node",
    "evidence-node",
  ],
  S6: [
    "stage-6",
    "s6-stage",
    "s6-feedback-node",
    "s6-metrics-node",
    "s6-learn-insight-node",
    "s6-iterate-node",
    "insight-node",
    "outcome-node",
    "direction-node",
    "evidence-node",
  ],
}

// Get all registered node types
export function getAllNodeTypes(): string[] {
  return Object.keys(sfmNodeRegistry)
}

// Get node types for a specific stage
export function getNodeTypesForStage(stage: Stage): string[] {
  return stageNodeTypes[stage] || []
}

// Filter nodes based on mode and current stage
export function getVisibleNodes(
  nodes: Node[],
  mode: Mode,
  currentStage: Stage
): Node[] {
  switch (mode) {
    case "work":
      // Show only nodes that belong to the current stage
      const allowedTypes = getNodeTypesForStage(currentStage)
      return nodes.filter((node) => {
        // Check if node type is in allowed types
        if (allowedTypes.includes(node.type || "")) return true
        // Also check if node has stage data matching current stage
        const nodeConfig = sfmNodeRegistry[node.type || ""]
        if (nodeConfig && nodeConfig.stage === currentStage) return true
        // Keep group nodes
        if (node.type === "group") return true
        return false
      })
    
    case "pipeline":
      // Show all nodes but they will be locked
      return nodes
    
    case "training":
      // Show all nodes, fully editable
      return nodes
    
    default:
      return nodes
  }
}

// Get node types to show in palette based on mode and stage
export function getPaletteNodeTypes(mode: Mode, currentStage: Stage): string[] {
  switch (mode) {
    case "work":
      return getNodeTypesForStage(currentStage)
    
    case "pipeline":
      // Minimal or no palette in pipeline mode
      return []
    
    case "training":
      // Show all node types
      return getAllNodeTypes()
    
    default:
      return []
  }
}

// Check if a node should be locked based on mode
export function isNodeLocked(mode: Mode): boolean {
  return mode === "pipeline"
}

// Get stage for a node type
export function getStageForNodeType(nodeType: string): Stage | null {
  const config = sfmNodeRegistry[nodeType]
  return config?.stage || null
}

// Group nodes by their stage
export function groupNodesByStage(nodes: Node[]): Record<Stage, Node[]> {
  const grouped: Record<Stage, Node[]> = {
    PD: [],
    S0: [],
    S1: [],
    S2: [],
    S3: [],
    S4: [],
    S5: [],
    S6: [],
  }

  nodes.forEach((node) => {
    const nodeType = node.type || ""
    const config = sfmNodeRegistry[nodeType]
    if (config) {
      grouped[config.stage].push(node)
    } else {
      // Try to infer stage from node type prefix
      const match = nodeType.match(/^(s\d|pd)-/i)
      if (match) {
        const stage = match[1].toUpperCase() as Stage
        if (grouped[stage]) {
          grouped[stage].push(node)
        }
      }
    }
  })

  return grouped
}
