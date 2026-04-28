import type { Node } from "reactflow"
import type { EvidenceType } from "@/types/evidence"

export interface NodeData {
  label: string
  description?: string
  required?: boolean
  
  // Unified content structure
  points?: string[]
  
  // Scope node specific (exception to standard structure)
  inScope?: string[]
  outScope?: string[]
  
  // Legacy fields (mapped to points for backwards compatibility)
  items?: string[]
  values?: string[]
  content?: string[]
  
  // Group and collapse properties
  group?: string
  isCollapsed?: boolean
  isGroupRepresentative?: boolean
  hiddenGroupNodes?: string[]
  groupNodeCount?: number

  // Input node properties
  dataSource?: "manual" | "api" | "database" | "file"
  sampleData?: string

  // Output node properties
  outputType?: "console" | "api" | "database" | "file"
  outputFormat?: "json" | "csv" | "xml" | "text"

  // Process node properties
  processType?: "transform" | "filter" | "aggregate" | "sort"
  processConfig?: string

  // Conditional node properties
  condition?: string
  trueLabel?: string
  falseLabel?: string

  // Code node properties
  codeLanguage?: "javascript" | "typescript"
  code?: string

  emailTo?: string
  emailSubject?: string
  emailBody?: string
  emailFrom?: string

  filterCondition?: string
  filterField?: string
  filterOperator?: "equals" | "contains" | "greater" | "less"

  workflowId?: string
  workflowName?: string

  tableName?: string
  operation?: "select" | "insert" | "update" | "delete"
  query?: string

  // Factory machine-specific properties
  // Conveyor properties
  speed?: number
  length?: number
  direction?: "forward" | "reverse" | "bidirectional"

  // Assembly properties
  assemblyType?: "manual" | "robotic" | "semi-automatic"
  cycleTime?: number
  components?: string

  // Quality Control properties
  inspectionType?: "visual" | "dimensional" | "functional" | "all"
  rejectThreshold?: number
  inspectionCriteria?: string

  // Packaging properties
  packagingType?: "box" | "shrink-wrap" | "pallet" | "custom"
  packagingMaterial?: string
  unitsPerPackage?: number

  // Sorting properties
  sortCriteria?: "size" | "weight" | "color" | "quality" | "type"
  sortDirections?: number

  // Cutting properties
  cuttingMethod?: "laser" | "plasma" | "mechanical" | "water-jet"
  cutDimensions?: string
  precision?: number

  // Painting properties
  coatingType?: "powder" | "liquid" | "spray" | "dip"
  color?: string
  layers?: number

  // Testing properties
  testType?: "pressure" | "electrical" | "thermal" | "durability"
  testDuration?: number
  passRate?: number

  // Storage properties
  capacity?: number
  storageType?: "warehouse" | "buffer" | "staging" | "cold-storage"
  temperature?: number

  // Raw Material properties
  materialType?: string
  quantity?: number
  supplier?: string

  // Software stage-specific properties
  // Stage 0: Problem / Technical Lock
  problemStatement?: string
  technicalConstraints?: string
  stakeholders?: string
  humanResponsibilities?: string[]
  aiResponsibilities?: string[]
  restrictions?: string[]
  customFields?: Record<string, string>
  humanPercentage?: number
  aiPercentage?: number
  stageNumber?: number

  // Stage 1: Product Shape
  productVision?: string
  userPersonas?: string
  coreFeatures?: string

  // Stage 2: Architecture Spine
  systemArchitecture?: string
  techStack?: string
  dataModel?: string

  // Stage 3: Production Slice
  mvpScope?: string
  deliverables?: string
  timeline?: string

  // Stage 4: Observability & Ops
  monitoring?: string
  logging?: string
  alerts?: string

  // Stage 5: Reproducibility
  cicd?: string
  testing?: string
  documentation?: string

  // Stage 6: Production Ready
  scalability?: string
  security?: string
  performance?: string

  gateType?: "problem" | "product" | "architecture" | "production" | "release"
  decisionAuthority?: "Human Only" | "Human" | "Human + AI" | "AI Advisory"
  approvalRequired?: boolean
  approvers?: string[]
  gateChecklist?: string[]
  gateStatus?: "pending" | "approved" | "rejected"

  // Evidence node properties
  evidenceType?: EvidenceType
  owner?: string
  mandatory?: boolean
  fileUrl?: string
  fileName?: string
  justification?: string
}

export type WorkflowNode = Node<NodeData>

export interface Workflow {
  nodes: WorkflowNode[]
  edges: any[]
}
