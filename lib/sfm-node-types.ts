import type { NodeTypes } from "reactflow"
import { sfmNodeRegistry, NODE_TYPE_ALIASES } from "./sfm-node-registry"
import { createSfmNode } from "@/components/nodes/sfm-node"
import { createSfmGateNode } from "@/components/nodes/sfm-gate-node"

/**
 * Generates ReactFlow NodeTypes from the SFM registry
 * This creates a component for each registered node type
 */
export function generateSfmNodeTypes(): NodeTypes {
  const nodeTypes: NodeTypes = {}

  for (const [nodeType, config] of Object.entries(sfmNodeRegistry)) {
    if (config.kind === "gate") {
      nodeTypes[nodeType] = createSfmGateNode(nodeType)
    } else {
      nodeTypes[nodeType] = createSfmNode(nodeType)
    }
  }

  // Aliases: short names that generators tend to produce (often copied from
  // node ids like "s4-structure-core"). Each alias renders as its real type.
  for (const [alias, real] of Object.entries(NODE_TYPE_ALIASES)) {
    if (!nodeTypes[alias] && nodeTypes[real]) nodeTypes[alias] = nodeTypes[real]
  }

  return nodeTypes
}

/**
 * Get a list of all SFM node type keys
 */
export function getSfmNodeTypeKeys(): string[] {
  return Object.keys(sfmNodeRegistry)
}

/**
 * Pre-generated SFM node types for use in ReactFlow
 * Import this directly if you don't need dynamic generation
 */
export const sfmNodeTypes = generateSfmNodeTypes()
