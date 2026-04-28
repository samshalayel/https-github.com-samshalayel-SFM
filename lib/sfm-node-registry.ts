import {
  FileText,
  Users,
  Target,
  AlertTriangle,
  Lock,
  Telescope,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Compass,
  Box,
  Workflow,
  Layers,
  Database,
  Link2,
  AlertCircle,
  Code,
  TestTube,
  Rocket,
  Shield,
  Settings,
  Boxes,
  Network,
  GitBranch,
  FileCode,
  Server,
  Monitor,
  CheckSquare,
  Bug,
  FileCheck,
  Upload,
  RotateCcw,
  BookOpen,
  Send,
  type LucideIcon,
} from "lucide-react"

// Node kinds determine base behavior and styling
export type SfmNodeKind = "info" | "gate" | "evidence" | "insight" | "outcome" | "direction"

// Stage identifiers
export type SfmStage = "PD" | "S0" | "S1" | "S2" | "S3" | "S4" | "S5" | "S6"

// Color themes for nodes
export type SfmNodeColor = 
  | "blue" | "purple" | "cyan" | "green" | "emerald" | "teal"
  | "amber" | "orange" | "red" | "pink" | "indigo" | "violet"
  | "slate" | "gray"

// Node configuration interface
export interface SfmNodeConfig {
  title: string
  stage: SfmStage
  color: SfmNodeColor
  kind: SfmNodeKind
  icon: LucideIcon
  description?: string
  defaultHumanPercent?: number
  defaultAiPercent?: number
  // For gates
  decisionAuthority?: "Human Only" | "Human" | "Human + AI" | "AI Advisory"
  // Handle positions
  handlePosition?: "vertical" | "horizontal"
  // Tooltip/help text
  tooltip?: string
}

// Color mapping to Tailwind classes
export const colorMap: Record<SfmNodeColor, {
  gradient: string
  border: string
  bg: string
  text: string
  lightBg: string
}> = {
  blue: {
    gradient: "from-blue-500 to-blue-600",
    border: "border-blue-400",
    bg: "bg-blue-500",
    text: "text-blue-100",
    lightBg: "bg-blue-50",
  },
  purple: {
    gradient: "from-purple-500 to-purple-600",
    border: "border-purple-400",
    bg: "bg-purple-500",
    text: "text-purple-100",
    lightBg: "bg-purple-50",
  },
  cyan: {
    gradient: "from-cyan-500 to-cyan-600",
    border: "border-cyan-400",
    bg: "bg-cyan-500",
    text: "text-cyan-100",
    lightBg: "bg-cyan-50",
  },
  green: {
    gradient: "from-green-500 to-green-600",
    border: "border-green-400",
    bg: "bg-green-500",
    text: "text-green-100",
    lightBg: "bg-green-50",
  },
  emerald: {
    gradient: "from-emerald-500 to-emerald-600",
    border: "border-emerald-400",
    bg: "bg-emerald-500",
    text: "text-emerald-100",
    lightBg: "bg-emerald-50",
  },
  teal: {
    gradient: "from-teal-500 to-teal-600",
    border: "border-teal-400",
    bg: "bg-teal-500",
    text: "text-teal-100",
    lightBg: "bg-teal-50",
  },
  amber: {
    gradient: "from-amber-500 to-amber-600",
    border: "border-amber-400",
    bg: "bg-amber-500",
    text: "text-amber-100",
    lightBg: "bg-amber-50",
  },
  orange: {
    gradient: "from-orange-500 to-orange-600",
    border: "border-orange-400",
    bg: "bg-orange-500",
    text: "text-orange-100",
    lightBg: "bg-orange-50",
  },
  red: {
    gradient: "from-red-500 to-red-600",
    border: "border-red-400",
    bg: "bg-red-500",
    text: "text-red-100",
    lightBg: "bg-red-50",
  },
  pink: {
    gradient: "from-pink-500 to-pink-600",
    border: "border-pink-400",
    bg: "bg-pink-500",
    text: "text-pink-100",
    lightBg: "bg-pink-50",
  },
  indigo: {
    gradient: "from-indigo-500 to-indigo-600",
    border: "border-indigo-400",
    bg: "bg-indigo-500",
    text: "text-indigo-100",
    lightBg: "bg-indigo-50",
  },
  violet: {
    gradient: "from-violet-500 to-violet-600",
    border: "border-violet-400",
    bg: "bg-violet-500",
    text: "text-violet-100",
    lightBg: "bg-violet-50",
  },
  slate: {
    gradient: "from-slate-500 to-slate-600",
    border: "border-slate-400",
    bg: "bg-slate-500",
    text: "text-slate-100",
    lightBg: "bg-slate-50",
  },
  gray: {
    gradient: "from-gray-500 to-gray-600",
    border: "border-gray-400",
    bg: "bg-gray-500",
    text: "text-gray-100",
    lightBg: "bg-gray-50",
  },
}

// The main SFM Node Registry
export const sfmNodeRegistry: Record<string, SfmNodeConfig> = {
  // ============================================
  // PD - Problem Discovery Stage Nodes
  // ============================================
  "pd-summary-node": {
    title: "Problem Summary",
    stage: "PD",
    color: "slate",
    kind: "info",
    icon: FileText,
    description: "High-level problem statement and context",
    defaultHumanPercent: 90,
    defaultAiPercent: 10,
    tooltip: "Define the core problem being solved",
  },
  "pd-actors-node": {
    title: "Actors",
    stage: "PD",
    color: "blue",
    kind: "info",
    icon: Users,
    description: "Key stakeholders and users involved",
    defaultHumanPercent: 85,
    defaultAiPercent: 15,
    tooltip: "Identify all actors in the system",
  },
  "pd-goals-node": {
    title: "Goals",
    stage: "PD",
    color: "green",
    kind: "info",
    icon: Target,
    description: "Desired outcomes and objectives",
    defaultHumanPercent: 90,
    defaultAiPercent: 10,
    tooltip: "What success looks like",
  },
  "pd-pain-points-node": {
    title: "Pain Points",
    stage: "PD",
    color: "red",
    kind: "info",
    icon: AlertTriangle,
    description: "Current frustrations and problems",
    defaultHumanPercent: 80,
    defaultAiPercent: 20,
    tooltip: "Problems users currently face",
  },
  "pd-constraints-node": {
    title: "Constraints",
    stage: "PD",
    color: "amber",
    kind: "info",
    icon: Lock,
    description: "Technical and business limitations",
    defaultHumanPercent: 95,
    defaultAiPercent: 5,
    tooltip: "Non-negotiable boundaries",
  },
  "pd-scope-node": {
    title: "Scope",
    stage: "PD",
    color: "purple",
    kind: "info",
    icon: Telescope,
    description: "In-scope and out-of-scope items",
    defaultHumanPercent: 90,
    defaultAiPercent: 10,
    tooltip: "Define what's included and excluded",
  },
  "pd-signals-node": {
    title: "Success Signals",
    stage: "PD",
    color: "emerald",
    kind: "info",
    icon: CheckCircle2,
    description: "Measurable indicators of success",
    defaultHumanPercent: 85,
    defaultAiPercent: 15,
    tooltip: "How we'll know we succeeded",
  },
  "pd-unknowns-node": {
    title: "Unknowns",
    stage: "PD",
    color: "orange",
    kind: "info",
    icon: HelpCircle,
    description: "Open questions and uncertainties",
    defaultHumanPercent: 75,
    defaultAiPercent: 25,
    tooltip: "What we still need to discover",
  },

  // ============================================
  // S0 - Problem Lock Stage Nodes
  // ============================================
  "s0-stage": {
    title: "Problem Lock",
    stage: "S0",
    color: "blue",
    kind: "info",
    icon: Layers,
    description: "Lock the problem definition",
    defaultHumanPercent: 95,
    defaultAiPercent: 5,
  },
  "s0-insight-node": {
    title: "Problem Insight",
    stage: "S0",
    color: "emerald",
    kind: "insight",
    icon: Lightbulb,
    description: "Key insight about the problem space",
    defaultHumanPercent: 60,
    defaultAiPercent: 40,
    handlePosition: "horizontal",
    tooltip: "Generates understanding, not decisions",
  },
  "s0-outcome-node": {
    title: "Desired Outcome",
    stage: "S0",
    color: "green",
    kind: "outcome",
    icon: CheckCircle2,
    description: "Validated outcome from discovery",
    defaultHumanPercent: 80,
    defaultAiPercent: 20,
    tooltip: "What we want to achieve",
  },
  "s0-direction-node": {
    title: "Strategic Direction",
    stage: "S0",
    color: "indigo",
    kind: "direction",
    icon: Compass,
    description: "WHERE to go, not HOW",
    defaultHumanPercent: 90,
    defaultAiPercent: 10,
    tooltip: "High-level direction, not implementation",
  },
  "gate-problem": {
    title: "Problem Gate",
    stage: "S0",
    color: "red",
    kind: "gate",
    icon: Shield,
    description: "AI may advise. Only humans sign.",
    defaultHumanPercent: 100,
    defaultAiPercent: 0,
    decisionAuthority: "Human Only",
    tooltip: "Blocks progress until human approval",
  },

  // ============================================
  // S1 - Product Shape Stage Nodes
  // ============================================
  "s1-stage": {
    title: "Product Shape",
    stage: "S1",
    color: "purple",
    kind: "info",
    icon: Box,
    description: "Define product vision and MVP boundaries",
    defaultHumanPercent: 80,
    defaultAiPercent: 20,
  },
  "s1-product-insight-node": {
    title: "Product Insight",
    stage: "S1",
    color: "pink",
    kind: "insight",
    icon: Lightbulb,
    description: "Key product understanding",
    defaultHumanPercent: 65,
    defaultAiPercent: 35,
    handlePosition: "horizontal",
  },
  "s1-actors-node": {
    title: "User Personas",
    stage: "S1",
    color: "blue",
    kind: "info",
    icon: Users,
    description: "Target users and their needs",
    defaultHumanPercent: 75,
    defaultAiPercent: 25,
  },
  "s1-modules-node": {
    title: "Feature Modules",
    stage: "S1",
    color: "cyan",
    kind: "info",
    icon: Boxes,
    description: "Core feature groupings",
    defaultHumanPercent: 70,
    defaultAiPercent: 30,
  },
  "s1-procedures-node": {
    title: "User Procedures",
    stage: "S1",
    color: "teal",
    kind: "info",
    icon: Workflow,
    description: "Key user workflows",
    defaultHumanPercent: 65,
    defaultAiPercent: 35,
  },
  "s1-boundary-node": {
    title: "MVP Boundary",
    stage: "S1",
    color: "amber",
    kind: "info",
    icon: AlertCircle,
    description: "What's in/out of MVP",
    defaultHumanPercent: 90,
    defaultAiPercent: 10,
  },
  "gate-product": {
    title: "Product Gate",
    stage: "S1",
    color: "orange",
    kind: "gate",
    icon: Shield,
    description: "Human decides product boundaries",
    defaultHumanPercent: 95,
    defaultAiPercent: 5,
    decisionAuthority: "Human",
  },

  // ============================================
  // S2 - Architecture Stage Nodes
  // ============================================
  "s2-stage": {
    title: "Architecture Spine",
    stage: "S2",
    color: "violet",
    kind: "info",
    icon: Network,
    description: "System architecture and tech stack",
    defaultHumanPercent: 70,
    defaultAiPercent: 30,
  },
  "s2-domains-node": {
    title: "Domain Model",
    stage: "S2",
    color: "purple",
    kind: "info",
    icon: Layers,
    description: "Core domain concepts",
    defaultHumanPercent: 60,
    defaultAiPercent: 40,
  },
  "s2-components-node": {
    title: "System Components",
    stage: "S2",
    color: "cyan",
    kind: "info",
    icon: Boxes,
    description: "Main architectural components",
    defaultHumanPercent: 55,
    defaultAiPercent: 45,
  },
  "s2-interactions-node": {
    title: "Component Interactions",
    stage: "S2",
    color: "blue",
    kind: "info",
    icon: Link2,
    description: "How components communicate",
    defaultHumanPercent: 50,
    defaultAiPercent: 50,
  },
  "s2-data-domains-node": {
    title: "Data Domains",
    stage: "S2",
    color: "emerald",
    kind: "info",
    icon: Database,
    description: "Data models and schemas",
    defaultHumanPercent: 55,
    defaultAiPercent: 45,
  },
  "s2-integrations-node": {
    title: "External Integrations",
    stage: "S2",
    color: "indigo",
    kind: "info",
    icon: GitBranch,
    description: "Third-party services and APIs",
    defaultHumanPercent: 65,
    defaultAiPercent: 35,
  },
  "s2-constraints-node": {
    title: "Tech Constraints",
    stage: "S2",
    color: "amber",
    kind: "info",
    icon: Lock,
    description: "Technical limitations",
    defaultHumanPercent: 80,
    defaultAiPercent: 20,
  },
  "gate-architecture": {
    title: "Architecture Gate",
    stage: "S2",
    color: "red",
    kind: "gate",
    icon: Shield,
    description: "Human approves architecture decisions",
    defaultHumanPercent: 90,
    defaultAiPercent: 10,
    decisionAuthority: "Human",
  },

  // ============================================
  // S3 - Production Slice Stage Nodes
  // ============================================
  "s3-stage": {
    title: "Production Slice",
    stage: "S3",
    color: "teal",
    kind: "info",
    icon: Code,
    description: "Build first end-to-end slice",
    defaultHumanPercent: 50,
    defaultAiPercent: 50,
  },
  "s3-slice-node": {
    title: "Feature Slice",
    stage: "S3",
    color: "cyan",
    kind: "info",
    icon: Layers,
    description: "Vertical feature slice",
    defaultHumanPercent: 45,
    defaultAiPercent: 55,
  },
  "s3-feature-node": {
    title: "Feature Implementation",
    stage: "S3",
    color: "blue",
    kind: "info",
    icon: Code,
    description: "Feature code and logic",
    defaultHumanPercent: 40,
    defaultAiPercent: 60,
  },
  "s3-contract-node": {
    title: "API Contract",
    stage: "S3",
    color: "purple",
    kind: "info",
    icon: FileCode,
    description: "API definitions and contracts",
    defaultHumanPercent: 50,
    defaultAiPercent: 50,
  },
  "s3-data-model-node": {
    title: "Data Model",
    stage: "S3",
    color: "emerald",
    kind: "info",
    icon: Database,
    description: "Database schema for slice",
    defaultHumanPercent: 45,
    defaultAiPercent: 55,
  },
  "s3-task-plan-node": {
    title: "Task Breakdown",
    stage: "S3",
    color: "amber",
    kind: "info",
    icon: CheckSquare,
    description: "Implementation task list",
    defaultHumanPercent: 60,
    defaultAiPercent: 40,
  },
  "gate-slice": {
    title: "Slice Gate",
    stage: "S3",
    color: "orange",
    kind: "gate",
    icon: Shield,
    description: "Joint human-AI slice approval",
    defaultHumanPercent: 70,
    defaultAiPercent: 30,
    decisionAuthority: "Human + AI",
  },

  // ============================================
  // S4 - Code Implementation Stage Nodes
  // ============================================
  "s4-stage": {
    title: "Code Implementation",
    stage: "S4",
    color: "blue",
    kind: "info",
    icon: Code,
    description: "Full code implementation",
    defaultHumanPercent: 35,
    defaultAiPercent: 65,
  },
  "s4-code-structure-node": {
    title: "Code Structure",
    stage: "S4",
    color: "slate",
    kind: "info",
    icon: FileCode,
    description: "Project and file structure",
    defaultHumanPercent: 40,
    defaultAiPercent: 60,
  },
  "s4-backend-node": {
    title: "Backend Code",
    stage: "S4",
    color: "green",
    kind: "info",
    icon: Server,
    description: "Server-side implementation",
    defaultHumanPercent: 35,
    defaultAiPercent: 65,
  },
  "s4-frontend-node": {
    title: "Frontend Code",
    stage: "S4",
    color: "cyan",
    kind: "info",
    icon: Monitor,
    description: "Client-side implementation",
    defaultHumanPercent: 35,
    defaultAiPercent: 65,
  },
  "s4-validation-node": {
    title: "Code Validation",
    stage: "S4",
    color: "amber",
    kind: "info",
    icon: CheckSquare,
    description: "Code review and validation",
    defaultHumanPercent: 50,
    defaultAiPercent: 50,
  },
  "s4-integration-node": {
    title: "Integration",
    stage: "S4",
    color: "purple",
    kind: "info",
    icon: Link2,
    description: "Component integration",
    defaultHumanPercent: 45,
    defaultAiPercent: 55,
  },
  "gate-code": {
    title: "Code Gate",
    stage: "S4",
    color: "red",
    kind: "gate",
    icon: Shield,
    description: "Code review and approval",
    defaultHumanPercent: 70,
    defaultAiPercent: 30,
    decisionAuthority: "Human + AI",
  },

  // ============================================
  // S5 - Quality & Testing Stage Nodes
  // ============================================
  "s5-stage": {
    title: "Quality Assurance",
    stage: "S5",
    color: "emerald",
    kind: "info",
    icon: TestTube,
    description: "Testing and quality assurance",
    defaultHumanPercent: 30,
    defaultAiPercent: 70,
  },
  "s5-test-plan-node": {
    title: "Test Plan",
    stage: "S5",
    color: "blue",
    kind: "info",
    icon: FileCheck,
    description: "Testing strategy and plan",
    defaultHumanPercent: 50,
    defaultAiPercent: 50,
  },
  "s5-unit-test-node": {
    title: "Unit Tests",
    stage: "S5",
    color: "green",
    kind: "info",
    icon: CheckSquare,
    description: "Component-level tests",
    defaultHumanPercent: 25,
    defaultAiPercent: 75,
  },
  "s5-integration-test-node": {
    title: "Integration Tests",
    stage: "S5",
    color: "cyan",
    kind: "info",
    icon: Link2,
    description: "System integration tests",
    defaultHumanPercent: 30,
    defaultAiPercent: 70,
  },
  "s5-acceptance-node": {
    title: "Acceptance Tests",
    stage: "S5",
    color: "purple",
    kind: "info",
    icon: CheckCircle2,
    description: "User acceptance criteria",
    defaultHumanPercent: 60,
    defaultAiPercent: 40,
  },
  "s5-bug-node": {
    title: "Bug Tracking",
    stage: "S5",
    color: "red",
    kind: "info",
    icon: Bug,
    description: "Issues and bug fixes",
    defaultHumanPercent: 40,
    defaultAiPercent: 60,
  },
  "gate-quality": {
    title: "Quality Gate",
    stage: "S5",
    color: "orange",
    kind: "gate",
    icon: Shield,
    description: "Quality standards approval",
    defaultHumanPercent: 80,
    defaultAiPercent: 20,
    decisionAuthority: "Human",
  },

  // ============================================
  // S6 - Release Stage Nodes
  // ============================================
  "s6-stage": {
    title: "Production Release",
    stage: "S6",
    color: "indigo",
    kind: "info",
    icon: Rocket,
    description: "Deploy to production",
    defaultHumanPercent: 20,
    defaultAiPercent: 80,
  },
  "s6-release-node": {
    title: "Release Package",
    stage: "S6",
    color: "purple",
    kind: "info",
    icon: Upload,
    description: "Release artifacts",
    defaultHumanPercent: 25,
    defaultAiPercent: 75,
  },
  "s6-deploy-checklist-node": {
    title: "Deploy Checklist",
    stage: "S6",
    color: "blue",
    kind: "info",
    icon: CheckSquare,
    description: "Deployment verification",
    defaultHumanPercent: 40,
    defaultAiPercent: 60,
  },
  "s6-rollback-node": {
    title: "Rollback Plan",
    stage: "S6",
    color: "amber",
    kind: "info",
    icon: RotateCcw,
    description: "Recovery procedures",
    defaultHumanPercent: 50,
    defaultAiPercent: 50,
  },
  "s6-docs-node": {
    title: "Documentation",
    stage: "S6",
    color: "cyan",
    kind: "info",
    icon: BookOpen,
    description: "User and technical docs",
    defaultHumanPercent: 35,
    defaultAiPercent: 65,
  },
  "s6-handoff-node": {
    title: "Handoff",
    stage: "S6",
    color: "green",
    kind: "info",
    icon: Send,
    description: "Stakeholder handoff",
    defaultHumanPercent: 80,
    defaultAiPercent: 20,
  },
  "gate-release": {
    title: "Release Gate",
    stage: "S6",
    color: "red",
    kind: "gate",
    icon: Shield,
    description: "Final release requires human sign-off",
    defaultHumanPercent: 100,
    defaultAiPercent: 0,
    decisionAuthority: "Human Only",
  },
}

// Helper function to get node config
export function getNodeConfig(nodeType: string): SfmNodeConfig | undefined {
  return sfmNodeRegistry[nodeType]
}

// Helper to get all nodes for a stage
export function getNodesForStage(stage: SfmStage): Record<string, SfmNodeConfig> {
  return Object.fromEntries(
    Object.entries(sfmNodeRegistry).filter(([, config]) => config.stage === stage)
  )
}

// Helper to get all gates
export function getAllGates(): Record<string, SfmNodeConfig> {
  return Object.fromEntries(
    Object.entries(sfmNodeRegistry).filter(([, config]) => config.kind === "gate")
  )
}

// Helper to get stage color
export const stageColors: Record<SfmStage, SfmNodeColor> = {
  PD: "slate",
  S0: "blue",
  S1: "purple",
  S2: "violet",
  S3: "teal",
  S4: "blue",
  S5: "emerald",
  S6: "indigo",
}

// Get all registered node types (for ReactFlow nodeTypes mapping)
export function getAllNodeTypes(): string[] {
  return Object.keys(sfmNodeRegistry)
}
