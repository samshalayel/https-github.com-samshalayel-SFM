"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  Panel,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  type Node,
} from "reactflow"
import "reactflow/dist/style.css"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Save, Settings, Download, ChevronLeft, ChevronRight, Copy, Sun, Moon, Upload, LogOut, LayoutTemplate, FileText, FilePlus, FileInput, Minimize2, Maximize2, Group, Ungroup } from "lucide-react"
import NodeLibrary from "./node-library"
import NodeConfigPanel from "./node-config-panel"
import CustomEdge from "./custom-edge"
import { InputNode } from "./nodes/input-node"
import { OutputNode } from "./nodes/output-node"
import { ProcessNode } from "./nodes/process-node"
import { ConditionalNode } from "./nodes/conditional-node"
import { CodeNode } from "./nodes/code-node"
import { EmailNode } from "./nodes/email-node"
import { FilterNode } from "./nodes/filter-node"
import { WorkflowNode } from "./nodes/workflow-node"
import { TableNode } from "./nodes/table-node"
import { ConveyorNode } from "./nodes/conveyor-node"
import { AssemblyNode } from "./nodes/assembly-node"
import { QualityNode } from "./nodes/quality-node"
import { PackagingNode } from "./nodes/packaging-node"
import { SortingNode } from "./nodes/sorting-node"
import { CuttingNode } from "./nodes/cutting-node"
import { PaintingNode } from "./nodes/painting-node"
import { TestingNode } from "./nodes/testing-node"
import { StorageNode } from "./nodes/storage-node"
import { RawMaterialNode } from "./nodes/raw-material-node"
import Stage0Node from "./nodes/stage-0-node"
import Stage1Node from "./nodes/stage-1-node"
import Stage2Node from "./nodes/stage-2-node"
import Stage3Node from "./nodes/stage-3-node"
import Stage4Node from "./nodes/stage-4-node"
import Stage5Node from "./nodes/stage-5-node"
import Stage6Node from "./nodes/stage-6-node"
import GateNode from "./nodes/gate-node"
import InsightNode from "./nodes/insight-node"
import OutcomeNode from "./nodes/outcome-node"
import DirectionNode from "./nodes/direction-node"
import AlignmentGateNode from "./nodes/alignment-gate-node"
import EvidenceNode from "./nodes/evidence-node"
import GroupNode from "./nodes/group-node"
import { generateNodeId, createNode } from "@/lib/workflow-utils"
import type { WorkflowNode as WorkflowNodeType } from "@/lib/types"
import SettingsDialog from "./settings-dialog"
import { createClient } from "@/lib/supabase/client"
import SaveLoadDialog from "./save-load-dialog"
import EvidenceRepository from "./evidence-repository"
import type { Evidence } from "@/types/evidence"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const nodeTypes: NodeTypes = {
  input: InputNode,
  output: OutputNode,
  process: ProcessNode,
  conditional: ConditionalNode,
  code: CodeNode,
  email: EmailNode,
  filter: FilterNode,
  workflow: WorkflowNode,
  table: TableNode,
  conveyor: ConveyorNode,
  assembly: AssemblyNode,
  quality: QualityNode,
  packaging: PackagingNode,
  sorting: SortingNode,
  cutting: CuttingNode,
  painting: PaintingNode,
  testing: TestingNode,
  storage: StorageNode,
  "raw-material": RawMaterialNode,
  "stage-0": Stage0Node,
  "stage-1": Stage1Node,
  "stage-2": Stage2Node,
  "stage-3": Stage3Node,
  "stage-4": Stage4Node,
  "stage-5": Stage5Node,
  "stage-6": Stage6Node,
  "gate-problem": GateNode,
  "gate-product": GateNode,
  "gate-architecture": GateNode,
  "gate-production": GateNode,
  "gate-release": GateNode,
  "insight-node": InsightNode,
  "outcome-node": OutcomeNode,
  "direction-node": DirectionNode,
  "alignment-gate": AlignmentGateNode,
  "evidence-node": EvidenceNode,
  "group": GroupNode,
}

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
}

function WorkflowBuilderInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isSaveLoadOpen, setIsSaveLoadOpen] = useState(false)
  const [saveLoadMode, setSaveLoadMode] = useState<"save" | "load">("save")
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false)
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false)
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [currentProjectName, setCurrentProjectName] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false)
  const [lastSavedState, setLastSavedState] = useState<string>("")

  useEffect(() => {
    const savedTheme = localStorage.getItem("sillar-theme")
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark")
    }
  }, [])

  // Apply light/dark class to document for global CSS variable switching
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove("light")
    } else {
      document.documentElement.classList.add("light")
    }
  }, [isDarkMode])

  const toggleTheme = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem("sillar-theme", newMode ? "dark" : "light")
  }

  // Track unsaved changes
  useEffect(() => {
    const currentState = JSON.stringify({ nodes, edges, evidence })
    if (lastSavedState && currentState !== lastSavedState) {
      setHasUnsavedChanges(true)
    }
  }, [nodes, edges, evidence, lastSavedState])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/auth/login"
  }

  const loadSeesawTemplate = () => {
    // Define the Seesaw Model template
    // Stage 0 → Problem Gate → Stage 1 → Product Gate → Stage 2 → Architecture Gate → Stage 3 → Production Gate → Stage 5 → Release Gate → Stage 6
    
    const templateNodes: any[] = [
      // Stage 0
      {
        id: "stage-0-template",
        type: "stage-0",
        position: { x: 50, y: 200 },
        data: { 
          label: "Problem / Technical Lock", 
          description: "Define the real problem and context",
          humanPercentage: 95, 
          aiPercentage: 5 
        },
      },
      // Problem Gate
      {
        id: "gate-problem-template",
        type: "gate-problem",
        position: { x: 350, y: 200 },
        data: { 
          label: "Problem Gate", 
          description: "AI may advise. Only humans sign.",
          humanPercentage: 100, 
          aiPercentage: 0, 
          decisionAuthority: "Human Only", 
          gateType: "problem" 
        },
      },
      // Stage 1
      {
        id: "stage-1-template",
        type: "stage-1",
        position: { x: 600, y: 200 },
        data: { 
          label: "Product Shape", 
          description: "Define product vision and MVP boundaries",
          humanPercentage: 80, 
          aiPercentage: 20 
        },
      },
      // Product Gate
      {
        id: "gate-product-template",
        type: "gate-product",
        position: { x: 900, y: 200 },
        data: { 
          label: "Product Gate", 
          description: "Human decides product boundaries.",
          humanPercentage: 95, 
          aiPercentage: 5, 
          decisionAuthority: "Human", 
          gateType: "product" 
        },
      },
      // Stage 2
      {
        id: "stage-2-template",
        type: "stage-2",
        position: { x: 1150, y: 200 },
        data: { 
          label: "Architecture Spine", 
          description: "Design system architecture and tech stack",
          humanPercentage: 70, 
          aiPercentage: 30 
        },
      },
      // Architecture Gate
      {
        id: "gate-architecture-template",
        type: "gate-architecture",
        position: { x: 1450, y: 200 },
        data: { 
          label: "Architecture Gate", 
          description: "Human approves architecture decisions.",
          humanPercentage: 90, 
          aiPercentage: 10, 
          decisionAuthority: "Human", 
          gateType: "architecture" 
        },
      },
      // Stage 3
      {
        id: "stage-3-template",
        type: "stage-3",
        position: { x: 1700, y: 200 },
        data: { 
          label: "Production Slice", 
          description: "Build first end-to-end feature slice",
          humanPercentage: 50, 
          aiPercentage: 50 
        },
      },
      // Production Gate
      {
        id: "gate-production-template",
        type: "gate-production",
        position: { x: 2000, y: 200 },
        data: { 
          label: "Production Gate", 
          description: "Joint human-AI production approval.",
          humanPercentage: 70, 
          aiPercentage: 30, 
          decisionAuthority: "Human + AI", 
          gateType: "production" 
        },
      },
      // Stage 5
      {
        id: "stage-5-template",
        type: "stage-5",
        position: { x: 2250, y: 200 },
        data: { 
          label: "Reproducibility", 
          description: "Ensure consistent builds and deployments",
          humanPercentage: 30, 
          aiPercentage: 70 
        },
      },
      // Release Gate
      {
        id: "gate-release-template",
        type: "gate-release",
        position: { x: 2550, y: 200 },
        data: { 
          label: "Release Gate", 
          description: "Final release requires human sign-off.",
          humanPercentage: 100, 
          aiPercentage: 0, 
          decisionAuthority: "Human Only", 
          gateType: "release" 
        },
      },
      // Stage 6
      {
        id: "stage-6-template",
        type: "stage-6",
        position: { x: 2800, y: 200 },
        data: { 
          label: "Production Ready", 
          description: "Final polish and production deployment",
          humanPercentage: 20, 
          aiPercentage: 80 
        },
      },
    ]

    const templateEdges: any[] = [
      { id: "e-s0-gp", source: "stage-0-template", target: "gate-problem-template", type: "custom" },
      { id: "e-gp-s1", source: "gate-problem-template", target: "stage-1-template", type: "custom" },
      { id: "e-s1-gprod", source: "stage-1-template", target: "gate-product-template", type: "custom" },
      { id: "e-gprod-s2", source: "gate-product-template", target: "stage-2-template", type: "custom" },
      { id: "e-s2-ga", source: "stage-2-template", target: "gate-architecture-template", type: "custom" },
      { id: "e-ga-s3", source: "gate-architecture-template", target: "stage-3-template", type: "custom" },
      { id: "e-s3-gproduction", source: "stage-3-template", target: "gate-production-template", type: "custom" },
      { id: "e-gproduction-s5", source: "gate-production-template", target: "stage-5-template", type: "custom" },
      { id: "e-s5-gr", source: "stage-5-template", target: "gate-release-template", type: "custom" },
      { id: "e-gr-s6", source: "gate-release-template", target: "stage-6-template", type: "custom" },
    ]

    setNodes(templateNodes)
    setEdges(templateEdges)


    toast({
      title: "Seesaw Model loaded",
      description: "The complete Seesaw Model template has been loaded",
    })

    // Fit view after loading
    setTimeout(() => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView({ padding: 0.2 })
      }
    }, 100)
  }

  const loadInsightDiscoveryTemplate = () => {
    // Insight-Driven Product Discovery template
    // Problem Gate → Behavior → Sentiment → JTBD → Assumptions → Consolidation → Stage 1
    
    const templateNodes: any[] = [
      // Problem Gate (starting point)
      {
        id: "gate-problem-insight",
        type: "gate-problem",
        position: { x: 50, y: 400 },
        data: { 
          label: "Problem Gate", 
          description: "Validate problem before discovery",
          humanPercentage: 100, 
          aiPercentage: 0, 
          decisionAuthority: "Human Only", 
          gateType: "problem" 
        },
      },
      // Consumer Behavior Analysis
      {
        id: "insight-behavior",
        type: "insight-node",
        position: { x: 350, y: 400 },
        data: { 
          label: "Consumer Behavior Analysis", 
          description: "Analyze observed user behavior without proposing solutions",
          humanPercentage: 60, 
          aiPercentage: 40,
          insightType: "behavior"
        },
      },
      // Sentiment & Opinion Analysis
      {
        id: "insight-sentiment",
        type: "insight-node",
        position: { x: 650, y: 400 },
        data: { 
          label: "Sentiment & Opinion Analysis", 
          description: "Cluster emotions, trust signals, and expectation gaps",
          humanPercentage: 55, 
          aiPercentage: 45,
          insightType: "sentiment"
        },
      },
      // JTBD Signal Extraction
      {
        id: "insight-jtbd",
        type: "insight-node",
        position: { x: 950, y: 400 },
        data: { 
          label: "JTBD Signal Extraction", 
          description: "Extract jobs users are trying to get done",
          humanPercentage: 65, 
          aiPercentage: 35,
          insightType: "jtbd"
        },
      },
      // Assumption Stress Test
      {
        id: "insight-assumptions",
        type: "insight-node",
        position: { x: 1250, y: 400 },
        data: { 
          label: "Assumption Stress Test", 
          description: "Surface risky or unvalidated assumptions",
          humanPercentage: 70, 
          aiPercentage: 30,
          insightType: "assumptions"
        },
      },
      // Insight Consolidation
      {
        id: "insight-consolidation",
        type: "insight-node",
        position: { x: 1550, y: 400 },
        data: { 
          label: "Insight Consolidation", 
          description: "Consolidate validated pains and priority tensions",
          humanPercentage: 80, 
          aiPercentage: 20,
          insightType: "consolidation"
        },
      },
      // Insight Validation Gate
      {
        id: "gate-insight-validation",
        type: "gate-problem",
        position: { x: 1850, y: 400 },
        data: { 
          label: "Insight Validation Gate", 
          description: "Human validates that insights are sufficient to shape the product",
          humanPercentage: 100, 
          aiPercentage: 0, 
          decisionAuthority: "Human Only", 
          gateType: "insight-validation" 
        },
      },
      // Stage 1 (ending point)
      {
        id: "stage-1-insight",
        type: "stage-1",
        position: { x: 2150, y: 400 },
        data: { 
          label: "Product Shape", 
          description: "Translate validated insights into clear product boundaries",
          humanPercentage: 80, 
          aiPercentage: 20 
        },
      },
    ]

    const templateEdges: any[] = [
      { id: "e-gp-behavior", source: "gate-problem-insight", target: "insight-behavior", type: "custom" },
      { id: "e-behavior-sentiment", source: "insight-behavior", target: "insight-sentiment", type: "custom" },
      { id: "e-sentiment-jtbd", source: "insight-sentiment", target: "insight-jtbd", type: "custom" },
      { id: "e-jtbd-assumptions", source: "insight-jtbd", target: "insight-assumptions", type: "custom" },
      { id: "e-assumptions-consolidation", source: "insight-assumptions", target: "insight-consolidation", type: "custom" },
      { id: "e-consolidation-gate", source: "insight-consolidation", target: "gate-insight-validation", type: "custom" },
      { id: "e-gate-s1", source: "gate-insight-validation", target: "stage-1-insight", type: "custom" },
    ]

    setNodes(templateNodes)
    setEdges(templateEdges)

    toast({
      title: "Insight Discovery loaded",
      description: "The Insight-Driven Product Discovery template has been loaded",
    })

    // Fit view after loading
    setTimeout(() => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView({ padding: 0.2 })
      }
    }, 100)
  }

  const loadFromAToZTemplate = () => {
    // From A to Z - Complete SFM workflow with all stages from S-INTAKE to S6
    // Based on the SFM JSON specification
    
    const templateNodes: any[] = [
      // S-INTAKE: Raw Intake
      {
        id: "intake-template",
        type: "raw-material",
        position: { x: 50, y: 300 },
        data: { 
          label: "Raw Intake (S-INTAKE)", 
          description: "التقاط المواد الخام وتوحيدها - استخلاص actors/outcomes/frictions/constraints",
          humanPercentage: 80, 
          aiPercentage: 20,
          inputs: ["A0_STORY"],
          outputs: ["A1_INTENT"],
          aiRole: "intent_parser_only",
          humanRole: "confirm_capture"
        },
      },
      // G_INTENT_OK Gate
      {
        id: "gate-intent-template",
        type: "gate-problem",
        position: { x: 350, y: 300 },
        data: { 
          label: "Intent Gate", 
          description: "التحقق من صحة الـ intent - valid_json, actors_min_1, no_solutions",
          humanPercentage: 100, 
          aiPercentage: 0, 
          decisionAuthority: "Human Only", 
          gateType: "intent" 
        },
      },
      // S0: Scrum Epics Generator
      {
        id: "stage-0-atoz",
        type: "stage-0",
        position: { x: 600, y: 300 },
        data: { 
          label: "Scrum Epics (S0)", 
          description: "تحويل النية إلى Epics/Stories منظمة - حد أقصى 7 Epics",
          humanPercentage: 70, 
          aiPercentage: 30,
          inputs: ["A1_INTENT"],
          outputs: ["A2_S0_EPICS"],
          aiRole: "scrum_mapper",
          humanRole: "select_top_outcomes_and_edit"
        },
      },
      // G_S0_HUMAN_APPROVED Gate
      {
        id: "gate-s0-template",
        type: "gate-problem",
        position: { x: 900, y: 300 },
        data: { 
          label: "S0 Approval Gate", 
          description: "موافقة بشرية على Epics - traceable_to_outcomes",
          humanPercentage: 100, 
          aiPercentage: 0, 
          decisionAuthority: "Human Only", 
          gateType: "s0-approval" 
        },
      },
      // S1: Requirements & Scope
      {
        id: "stage-1-atoz",
        type: "stage-1",
        position: { x: 1150, y: 300 },
        data: { 
          label: "Requirements (S1)", 
          description: "تثبيت النطاق والمتطلبات ومعايير القبول - DoR/DoD",
          humanPercentage: 60, 
          aiPercentage: 40,
          inputs: ["A2_S0_EPICS", "A1_INTENT"],
          outputs: ["A3_S1_REQUIREMENTS"],
          aiRole: "requirements_synthesizer",
          humanRole: "approve_scope"
        },
      },
      // G_S1_REQUIREMENTS_OK Gate
      {
        id: "gate-s1-template",
        type: "gate-product",
        position: { x: 1450, y: 300 },
        data: { 
          label: "Requirements Gate", 
          description: "scope_in_out_present, acceptance_criteria_present",
          humanPercentage: 95, 
          aiPercentage: 5, 
          decisionAuthority: "Human", 
          gateType: "requirements" 
        },
      },
      // S2: Architecture Shape
      {
        id: "stage-2-atoz",
        type: "stage-2",
        position: { x: 1700, y: 300 },
        data: { 
          label: "Architecture (S2)", 
          description: "شكل معماري عالي المستوى + قرارات ADRs + حدود النظام",
          humanPercentage: 50, 
          aiPercentage: 50,
          inputs: ["A3_S1_REQUIREMENTS"],
          outputs: ["A4_S2_ARCH"],
          aiRole: "architect_assistant",
          humanRole: "architect_decides"
        },
      },
      // G_S2_ARCH_OK Gate
      {
        id: "gate-s2-template",
        type: "gate-architecture",
        position: { x: 2000, y: 300 },
        data: { 
          label: "Architecture Gate", 
          description: "high_level_components_present, data_flows_present",
          humanPercentage: 90, 
          aiPercentage: 10, 
          decisionAuthority: "Human", 
          gateType: "architecture" 
        },
      },
      // S3: Execution Plan
      {
        id: "stage-3-atoz",
        type: "stage-3",
        position: { x: 2250, y: 300 },
        data: { 
          label: "Execution Plan (S3)", 
          description: "خطة تنفيذ Kanban/Sprints - كل عنصر فيه owner + acceptance",
          humanPercentage: 40, 
          aiPercentage: 60,
          inputs: ["A4_S2_ARCH", "A3_S1_REQUIREMENTS", "A2_S0_EPICS"],
          outputs: ["A5_S3_PLAN"],
          aiRole: "planner",
          humanRole: "prioritize_and_assign"
        },
      },
      // G_S3_PLAN_OK Gate
      {
        id: "gate-s3-template",
        type: "gate-production",
        position: { x: 2550, y: 300 },
        data: { 
          label: "Plan Gate", 
          description: "tasks_have_owner, tasks_have_acceptance, priorities_set",
          humanPercentage: 70, 
          aiPercentage: 30, 
          decisionAuthority: "Human + AI", 
          gateType: "plan" 
        },
      },
      // S4: MVP Implementation
      {
        id: "stage-4-atoz",
        type: "stage-4",
        position: { x: 2800, y: 300 },
        data: { 
          label: "Implementation (S4)", 
          description: "تنفيذ MVP - لا كود بدون معيار قبول - روابط PR/Commits",
          humanPercentage: 30, 
          aiPercentage: 70,
          inputs: ["A5_S3_PLAN"],
          outputs: ["A6_S4_IMPLEMENTATION"],
          aiRole: "coder",
          humanRole: "review_and_merge"
        },
      },
      // G_S4_BUILD_RUNS Gate
      {
        id: "gate-s4-template",
        type: "gate-production",
        position: { x: 3100, y: 300 },
        data: { 
          label: "Build Gate", 
          description: "service_starts, basic_healthcheck_ok",
          humanPercentage: 60, 
          aiPercentage: 40, 
          decisionAuthority: "Human + AI", 
          gateType: "build" 
        },
      },
      // S5: Testing & Debug Loops
      {
        id: "stage-5-atoz",
        type: "stage-5",
        position: { x: 3350, y: 300 },
        data: { 
          label: "Testing (S5)", 
          description: "تقرير اختبارات + ربط النتائج بمعايير القبول - فشل → S4",
          humanPercentage: 30, 
          aiPercentage: 70,
          inputs: ["A6_S4_IMPLEMENTATION", "A3_S1_REQUIREMENTS"],
          outputs: ["A7_S5_TEST_REPORT"],
          aiRole: "tester_debugger",
          humanRole: "accept_results"
        },
      },
      // G_S5_ACCEPTANCE_PASS Gate
      {
        id: "gate-s5-template",
        type: "gate-release",
        position: { x: 3650, y: 300 },
        data: { 
          label: "Acceptance Gate", 
          description: "acceptance_tests_pass, blockers_resolved",
          humanPercentage: 80, 
          aiPercentage: 20, 
          decisionAuthority: "Human", 
          gateType: "acceptance" 
        },
      },
      // S6: Release & Handover
      {
        id: "stage-6-atoz",
        type: "stage-6",
        position: { x: 3900, y: 300 },
        data: { 
          label: "Release (S6)", 
          description: "Release notes + Runbook + خطة rollback",
          humanPercentage: 20, 
          aiPercentage: 80,
          inputs: ["A7_S5_TEST_REPORT", "A6_S4_IMPLEMENTATION"],
          outputs: ["A8_S6_RELEASE", "EVIDENCE_BUNDLE"],
          aiRole: "release_assistant",
          humanRole: "release_owner"
        },
      },
      // G_S6_RELEASE_APPROVED Gate (Final)
      {
        id: "gate-s6-template",
        type: "gate-release",
        position: { x: 4200, y: 300 },
        data: { 
          label: "Release Gate", 
          description: "release_notes_present, runbook_present, rollback_plan",
          humanPercentage: 100, 
          aiPercentage: 0, 
          decisionAuthority: "Human Only", 
          gateType: "release" 
        },
      },
    ]

    const templateEdges: any[] = [
      { id: "e-intake-gintent", source: "intake-template", target: "gate-intent-template", type: "custom" },
      { id: "e-gintent-s0", source: "gate-intent-template", target: "stage-0-atoz", type: "custom" },
      { id: "e-s0-gs0", source: "stage-0-atoz", target: "gate-s0-template", type: "custom" },
      { id: "e-gs0-s1", source: "gate-s0-template", target: "stage-1-atoz", type: "custom" },
      { id: "e-s1-gs1", source: "stage-1-atoz", target: "gate-s1-template", type: "custom" },
      { id: "e-gs1-s2", source: "gate-s1-template", target: "stage-2-atoz", type: "custom" },
      { id: "e-s2-gs2", source: "stage-2-atoz", target: "gate-s2-template", type: "custom" },
      { id: "e-gs2-s3", source: "gate-s2-template", target: "stage-3-atoz", type: "custom" },
      { id: "e-s3-gs3", source: "stage-3-atoz", target: "gate-s3-template", type: "custom" },
      { id: "e-gs3-s4", source: "gate-s3-template", target: "stage-4-atoz", type: "custom" },
      { id: "e-s4-gs4", source: "stage-4-atoz", target: "gate-s4-template", type: "custom" },
      { id: "e-gs4-s5", source: "gate-s4-template", target: "stage-5-atoz", type: "custom" },
      { id: "e-s5-gs5", source: "stage-5-atoz", target: "gate-s5-template", type: "custom" },
      { id: "e-gs5-s6", source: "gate-s5-template", target: "stage-6-atoz", type: "custom" },
      { id: "e-s6-gs6", source: "stage-6-atoz", target: "gate-s6-template", type: "custom" },
      // Feedback loop: S5 fail → back to S4
      { id: "e-gs5-s4-fail", source: "gate-s5-template", target: "stage-4-atoz", type: "custom", label: "fail", style: { stroke: "#ef4444", strokeDasharray: "5,5" } },
    ]

    setNodes(templateNodes)
    setEdges(templateEdges)

    toast({
      title: "From A to Z loaded",
      description: "Complete SFM workflow from S-INTAKE to S6 with all gates",
    })

    // Fit view after loading
    setTimeout(() => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView({ padding: 0.2 })
      }
    }, 100)
  }

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge({ ...params, type: "custom" }, eds)),
    [setEdges],
  )

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
      const type = event.dataTransfer.getData("application/reactflow")
      const displayName = event.dataTransfer.getData("application/reactflow-label")

      if (typeof type === "undefined" || !type) {
        return
      }

      if (reactFlowBounds && reactFlowInstance) {
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        })

        const newNode = createNode({
          type,
          position,
          id: generateNodeId(type),
          displayName: displayName || undefined,
        })

        setNodes((nds) => nds.concat(newNode))
      }
    },
    [reactFlowInstance, setNodes],
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const updateNodeData = useCallback(
    (nodeId: string, data: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...data,
              },
            }
          }
          return node
        }),
      )
    },
    [setNodes],
  )

  const handleNewProjectClick = () => {
    // Check if there are unsaved changes (nodes, edges, or evidence exist)
    if (nodes.length > 0 || edges.length > 0 || evidence.length > 0) {
      setIsNewProjectDialogOpen(true)
    } else {
      createNewProject()
    }
  }

  const createNewProject = () => {
    const defaultName = `Project-${new Date().toISOString().slice(0, 10)}-${Date.now().toString().slice(-4)}`
    setNodes([])
    setEdges([])
    setEvidence([])
    setCurrentProjectName(defaultName)
    setHasUnsavedChanges(false)
    setLastSavedState("")
    setIsNewProjectDialogOpen(false)
    toast({
      title: "New project created",
      description: `"${defaultName}" is ready to use`,
    })
  }

  const handleSaveBeforeNew = () => {
    setIsNewProjectDialogOpen(false)
    handleOpenSave()
  }

  const handleOpenSave = () => {
    if (nodes.length === 0) {
      toast({
        title: "Nothing to save",
        description: "Add some nodes to your workflow first",
        variant: "destructive",
      })
      return
    }
    setSaveLoadMode("save")
    setIsSaveLoadOpen(true)
  }

  const handleOpenLoad = () => {
    setSaveLoadMode("load")
    setIsSaveLoadOpen(true)
  }

  const handleLoadWorkflow = (workflow: { nodes: any[]; edges: any[]; name?: string }) => {
    setNodes(workflow.nodes)
    setEdges(workflow.edges)
    if (workflow.name) {
      setCurrentProjectName(workflow.name)
    }
    toast({
      title: "Workflow loaded",
      description: workflow.name ? `"${workflow.name}" has been loaded successfully` : "Your workflow has been loaded successfully",
    })
  }

  // Auto-group nodes by their group property
  const autoGroupNodes = useCallback(() => {
    const groupedNodes = new Map<string, Node[]>()
    const ungroupedNodes: Node[] = []
    
    // Separate nodes by group
    nodes.forEach((node) => {
      if (node.type === "group") return // Skip existing group nodes
      
      const groupName = node.data?.group
      if (groupName) {
        if (!groupedNodes.has(groupName)) {
          groupedNodes.set(groupName, [])
        }
        groupedNodes.get(groupName)!.push(node)
      } else {
        ungroupedNodes.push(node)
      }
    })

    if (groupedNodes.size === 0) {
      toast({
        title: "No groups found",
        description: "Add groups to nodes first using the config panel",
        variant: "destructive",
      })
      return
    }

    const newNodes: Node[] = []
    const PADDING = 40
    const HEADER_HEIGHT = 40

    // Create group nodes and position children
    groupedNodes.forEach((groupNodes, groupName) => {
      if (groupNodes.length === 0) return

      // Calculate bounding box for the group
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      
      groupNodes.forEach((node) => {
        const nodeWidth = node.width || 280
        const nodeHeight = node.height || 150
        minX = Math.min(minX, node.position.x)
        minY = Math.min(minY, node.position.y)
        maxX = Math.max(maxX, node.position.x + nodeWidth)
        maxY = Math.max(maxY, node.position.y + nodeHeight)
      })

      // Create group node
      const groupId = `group-${groupName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}`
      const groupNode: Node = {
        id: groupId,
        type: "group",
        position: { x: minX - PADDING, y: minY - PADDING - HEADER_HEIGHT },
        style: { 
          width: maxX - minX + PADDING * 2, 
          height: maxY - minY + PADDING * 2 + HEADER_HEIGHT,
          zIndex: -1,
        },
        data: { 
          label: groupName,
        },
        draggable: true,
        selectable: true,
      }

      newNodes.push(groupNode)

      // Update children to be parented to the group
      groupNodes.forEach((node) => {
        newNodes.push({
          ...node,
          parentId: groupId,
          position: {
            x: node.position.x - (minX - PADDING),
            y: node.position.y - (minY - PADDING - HEADER_HEIGHT),
          },
          extent: "parent" as const,
        })
      })
    })

    // Add ungrouped nodes
    ungroupedNodes.forEach((node) => {
      newNodes.push({ ...node, parentId: undefined, extent: undefined })
    })

    setNodes(newNodes)
    toast({
      title: "Nodes grouped",
      description: `Created ${groupedNodes.size} group(s)`,
    })
  }, [nodes, setNodes])

  // Remove all group containers (ungroup)
  const ungroupAllNodes = useCallback(() => {
    const groupNodes = nodes.filter((n) => n.type === "group")
    
    if (groupNodes.length === 0) {
      toast({
        title: "No groups to remove",
        description: "There are no group containers to remove",
      })
      return
    }

    const newNodes = nodes
      .filter((n) => n.type !== "group")
      .map((node) => {
        if (node.parentId) {
          // Find parent group position
          const parentGroup = groupNodes.find((g) => g.id === node.parentId)
          if (parentGroup) {
            return {
              ...node,
              parentId: undefined,
              extent: undefined,
              position: {
                x: node.position.x + parentGroup.position.x,
                y: node.position.y + parentGroup.position.y,
              },
            }
          }
        }
        return { ...node, parentId: undefined, extent: undefined }
      })

    setNodes(newNodes)
    toast({
      title: "Groups removed",
      description: `Removed ${groupNodes.length} group container(s)`,
    })
  }, [nodes, setNodes])

  const collapseAllNodes = () => {
    setNodes((nds) => {
      // Filter out group container nodes (type === 'group')
      const regularNodes = nds.filter((node) => node.type !== 'group')
      const groupContainerNodes = nds.filter((node) => node.type === 'group')
      
      // Group regular nodes by their group name
      const groupedNodes: Record<string, typeof nds> = {}
      const ungroupedNodes: typeof nds = []
      
      regularNodes.forEach((node) => {
        if (node.data.group) {
          if (!groupedNodes[node.data.group]) {
            groupedNodes[node.data.group] = []
          }
          groupedNodes[node.data.group].push(node)
        } else {
          ungroupedNodes.push(node)
        }
      })
      
      // Collapse ungrouped nodes individually
      const collapsedUngrouped = ungroupedNodes.map((node) => ({
        ...node,
        data: { ...node.data, isCollapsed: true },
      }))
      
      // For grouped nodes: hide all except one representative node per group
      const collapsedGrouped: typeof nds = []
      Object.entries(groupedNodes).forEach(([groupName, nodesInGroup]) => {
        // Sort by position to get the first node as representative
        const sorted = [...nodesInGroup].sort((a, b) => a.position.x - b.position.x)
        
        // First node becomes the visible representative (collapsed)
        const representative = sorted[0]
        collapsedGrouped.push({
          ...representative,
          data: { 
            ...representative.data, 
            isCollapsed: true,
            isGroupRepresentative: true,
            hiddenGroupNodes: sorted.slice(1).map(n => n.id),
            groupNodeCount: sorted.length,
            groupedNodeTypes: sorted.map(n => n.type),
          },
        })
        
        // Hide other nodes in the group by setting hidden: true
        sorted.slice(1).forEach((node) => {
          collapsedGrouped.push({
            ...node,
            data: { ...node.data, isCollapsed: true, isHiddenInGroup: true },
            hidden: true,
          })
        })
      })
      
      // Return all nodes including group containers (collapsed)
      const collapsedGroupContainers = groupContainerNodes.map((node) => ({
        ...node,
        data: { ...node.data, isCollapsed: true },
      }))
      
      return [...collapsedUngrouped, ...collapsedGrouped, ...collapsedGroupContainers]
    })
    toast({
      title: "All nodes collapsed",
      description: "Nodes in same group are merged together",
    })
  }

  const expandAllNodes = () => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        hidden: false, // Show all hidden nodes
        data: { 
          ...node.data, 
          isCollapsed: false,
          isGroupRepresentative: false,
          hiddenGroupNodes: undefined,
          groupNodeCount: undefined,
        },
      }))
    )
    toast({
      title: "All nodes expanded",
      description: "All nodes are now fully visible",
    })
  }

  const executeWorkflow = () => {
    if (nodes.length === 0) {
      toast({
        title: "Nothing to execute",
        description: "Add some nodes to your workflow first",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Executing workflow",
      description: "Your workflow is being executed (simulation only in this MVP)",
    })

    setTimeout(() => {
      toast({
        title: "Workflow executed",
        description: "Your workflow has been executed successfully",
      })
    }, 2000)
  }

const exportWorkflow = () => {
    if (nodes.length === 0) {
      toast({
        title: "Nothing to export",
        description: "Add some nodes to your workflow first",
        variant: "destructive",
      })
      return
    }

    const workflow = {
      nodes,
      edges,
      evidence,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `workflow-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Workflow exported",
      description: "Your workflow has been downloaded as JSON file",
    })
  }

  const importWorkflow = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string
          const workflow = JSON.parse(content)

          if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
            toast({
              title: "Invalid file",
              description: "The file does not contain valid workflow data",
              variant: "destructive",
            })
            return
          }

          setNodes(workflow.nodes || [])
          setEdges(workflow.edges || [])
          if (workflow.evidence && Array.isArray(workflow.evidence)) {
            setEvidence(workflow.evidence)
          }
          setCurrentProjectName(null)
          setHasUnsavedChanges(true)

          toast({
            title: "Workflow imported",
            description: `Loaded ${workflow.nodes.length} nodes and ${workflow.edges?.length || 0} connections`,
          })

          setTimeout(() => {
            if (reactFlowInstance) {
              reactFlowInstance.fitView({ padding: 0.2 })
            }
          }, 100)
        } catch {
          toast({
            title: "Import failed",
            description: "Could not parse the JSON file",
            variant: "destructive",
          })
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <div
      className={`flex flex-row h-screen ${
        isDarkMode
          ? "bg-gradient-to-br from-[#0f0f0f] via-[#1a1a2e] to-[#16213e]"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      }`}
    >
      <div
        className={`border-r flex flex-col shadow-2xl transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "w-0 overflow-hidden" : "w-80"
        } ${
          isDarkMode
            ? "border-white/5 bg-gradient-to-b from-[#1a1a2e]/95 to-[#0f0f0f]/95 backdrop-blur-xl"
            : "border-gray-200 bg-white/90 backdrop-blur-xl"
        }`}
      >
        {/* Action Buttons at Top */}
        <div className={`p-4 border-b ${isDarkMode ? "border-white/5" : "border-gray-200"}`}>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleNewProjectClick}
              size="sm"
              variant="outline"
              className={`rounded-lg px-3 py-2 transition-all font-medium ${
                isDarkMode
                  ? "bg-transparent hover:bg-blue-500/10 text-blue-400 border-blue-500/50 hover:border-blue-500"
                  : "bg-transparent hover:bg-blue-500/10 text-blue-600 border-blue-500"
              }`}
            >
              <FilePlus className="h-4 w-4 mr-1.5" />
              New
            </Button>

            <Button
              onClick={handleOpenLoad}
              size="sm"
              variant="outline"
              className={`rounded-lg px-3 py-2 transition-all font-medium ${
                isDarkMode
                  ? "bg-transparent hover:bg-emerald-500/10 text-emerald-400 border-emerald-500/50 hover:border-emerald-500"
                  : "bg-transparent hover:bg-emerald-500/10 text-emerald-600 border-emerald-500"
              }`}
            >
              <Download className="h-4 w-4 mr-1.5" />
              Load
            </Button>

            <Button
              onClick={handleOpenSave}
              size="sm"
              variant="outline"
              className={`rounded-lg px-3 py-2 transition-all font-medium ${
                isDarkMode
                  ? "bg-transparent hover:bg-yellow-500/10 text-yellow-500 border-yellow-500/50 hover:border-yellow-500"
                  : "bg-transparent hover:bg-yellow-500/10 text-yellow-600 border-yellow-500"
              }`}
            >
              <Save className="h-4 w-4 mr-1.5" />
              Save
            </Button>

            <Button
              onClick={exportWorkflow}
              size="sm"
              variant="outline"
              className={`rounded-lg px-3 py-2 transition-all font-medium ${
                isDarkMode
                  ? "bg-transparent hover:bg-[#f26522]/10 text-[#f26522] border-[#f26522]/50 hover:border-[#f26522]"
                  : "bg-transparent hover:bg-orange-500/10 text-orange-600 border-orange-500"
              }`}
            >
              <Upload className="h-4 w-4 mr-1.5" />
              Export
            </Button>

            <Button
              onClick={importWorkflow}
              size="sm"
              variant="outline"
              className={`rounded-lg px-3 py-2 transition-all font-medium ${
                isDarkMode
                  ? "bg-transparent hover:bg-purple-500/10 text-purple-400 border-purple-500/50 hover:border-purple-500"
                  : "bg-transparent hover:bg-purple-500/10 text-purple-600 border-purple-500"
              }`}
            >
              <FileInput className="h-4 w-4 mr-1.5" />
              Import
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className={`rounded-lg px-3 py-2 transition-all font-medium w-full ${
                    isDarkMode
                      ? "bg-transparent hover:bg-teal-500/10 text-teal-400 border-teal-500/50 hover:border-teal-500"
                      : "bg-transparent hover:bg-teal-500/10 text-teal-600 border-teal-500"
                  }`}
                >
                  <LayoutTemplate className="h-4 w-4 mr-1.5" />
                  Template
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className={`w-56 ${
                  isDarkMode
                    ? "bg-[#1a1a2e] border-white/10"
                    : "bg-white border-gray-200"
                }`}
              >
                <DropdownMenuItem 
                  onClick={loadSeesawTemplate}
                  className={`cursor-pointer ${
                    isDarkMode
                      ? "text-white hover:bg-[#f26522]/20 focus:bg-[#f26522]/20"
                      : "text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <div>
                    <div className="font-medium">Seesaw Model</div>
                    <div className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Complete workflow with all stages and gates
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={loadInsightDiscoveryTemplate}
                  className={`cursor-pointer ${
                    isDarkMode
                      ? "text-white hover:bg-[#f26522]/20 focus:bg-[#f26522]/20"
                      : "text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <div>
                    <div className="font-medium">Insight Discovery</div>
                    <div className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Insight-Driven Product Discovery flow
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={loadFromAToZTemplate}
                  className={`cursor-pointer ${
                    isDarkMode
                      ? "text-white hover:bg-[#f26522]/20 focus:bg-[#f26522]/20"
                      : "text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <div>
                    <div className="font-medium">From A to Z</div>
                    <div className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Complete SFM workflow S-INTAKE → S6
                    </div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Project Name Display */}
        {currentProjectName && (
          <div className={`px-4 py-3 border-b ${isDarkMode ? "border-white/5" : "border-gray-200"}`}>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>Project:</span>
              <span className={`text-sm font-semibold truncate ${isDarkMode ? "text-[#f26522]" : "text-indigo-600"}`}>
                {currentProjectName}
              </span>
            </div>
          </div>
        )}

        {/* Seesaw Model Stages Title */}
        <div className={`p-4 border-b ${isDarkMode ? "border-white/5" : "border-gray-200"}`}>
          <h2 className={`text-lg font-bold ${isDarkMode ? "text-[#f26522]" : "text-gray-900"}`}>
            Seesaw Model Stages
          </h2>
          <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Drag stages to build your workflow
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <NodeLibrary isDarkMode={isDarkMode} />
        </div>
      </div>

      <button
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-50 backdrop-blur-sm border shadow-lg rounded-r-lg p-2 transition-all duration-300 hover:shadow-xl ${
          isDarkMode
            ? "bg-[#1a1a2e]/90 hover:bg-[#252542] border-white/5 hover:border-[#f26522]/30"
            : "bg-white/90 hover:bg-gray-50 border-gray-200"
        }`}
        style={{ left: isSidebarCollapsed ? "0" : "20rem" }}
        aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isSidebarCollapsed ? (
          <ChevronRight className={`h-5 w-5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
        ) : (
          <ChevronLeft className={`h-5 w-5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
        )}
      </button>

      <div className="flex-1 flex flex-col">
        <div
          className={`h-16 border-b backdrop-blur-xl flex items-center justify-between px-6 shadow-lg ${
            isDarkMode
              ? "border-white/5 bg-gradient-to-r from-[#1a1a2e]/95 to-[#0f0f0f]/95"
              : "border-gray-200 bg-white/95"
          }`}
        >
          {/* Left side - Theme, Logout */}
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleTheme}
              size="sm"
              variant="outline"
              className={`rounded-lg px-3 py-2 transition-all font-medium ${
                isDarkMode
                  ? "bg-transparent hover:bg-[#f26522]/10 text-[#f26522] border-[#f26522]/50 hover:border-[#f26522]"
                  : "bg-transparent hover:bg-indigo-500/10 text-indigo-600 border-indigo-500"
              }`}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button
              onClick={handleLogout}
              size="sm"
              variant="outline"
              className={`rounded-lg px-4 py-2 transition-all font-medium ${
                isDarkMode
                  ? "bg-transparent hover:bg-red-500/10 text-red-400 border-red-500/50 hover:border-red-500"
                  : "bg-transparent hover:bg-red-500/10 text-red-600 border-red-500"
              }`}
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Logout
            </Button>

            <Button
              onClick={() => setIsSettingsOpen(true)}
              size="sm"
              variant="outline"
              className={`rounded-lg px-4 py-2 transition-all font-medium ${
                isDarkMode
                  ? "bg-transparent hover:bg-gray-500/10 text-gray-400 border-gray-500/50 hover:border-gray-500"
                  : "bg-transparent hover:bg-gray-500/10 text-gray-600 border-gray-400"
              }`}
            >
              <Settings className="h-4 w-4 mr-1.5" />
              Settings
            </Button>

            {/* Collapse/Expand All Buttons */}
            <div className={`h-6 w-px mx-1 ${isDarkMode ? "bg-white/10" : "bg-gray-300"}`} />
            
            <Button
              onClick={collapseAllNodes}
              size="sm"
              variant="outline"
              className={`rounded-lg px-3 py-2 transition-all font-medium ${
                isDarkMode
                  ? "bg-transparent hover:bg-cyan-500/10 text-cyan-400 border-cyan-500/50 hover:border-cyan-500"
                  : "bg-transparent hover:bg-cyan-500/10 text-cyan-600 border-cyan-500"
              }`}
              title="Collapse all nodes"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>

            <Button
              onClick={expandAllNodes}
              size="sm"
              variant="outline"
              className={`rounded-lg px-3 py-2 transition-all font-medium ${
                isDarkMode
                  ? "bg-transparent hover:bg-emerald-500/10 text-emerald-400 border-emerald-500/50 hover:border-emerald-500"
                  : "bg-transparent hover:bg-emerald-500/10 text-emerald-600 border-emerald-500"
              }`}
              title="Expand all nodes"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>

            {/* Group/Ungroup Buttons */}
            <div className={`h-6 w-px mx-1 ${isDarkMode ? "bg-white/10" : "bg-gray-300"}`} />
            
            <Button
              onClick={autoGroupNodes}
              size="sm"
              variant="outline"
              className={`rounded-lg px-3 py-2 transition-all font-medium ${
                isDarkMode
                  ? "bg-transparent hover:bg-violet-500/10 text-violet-400 border-violet-500/50 hover:border-violet-500"
                  : "bg-transparent hover:bg-violet-500/10 text-violet-600 border-violet-500"
              }`}
              title="Group nodes by group name"
            >
              <Group className="h-4 w-4" />
            </Button>

            <Button
              onClick={ungroupAllNodes}
              size="sm"
              variant="outline"
              className={`rounded-lg px-3 py-2 transition-all font-medium ${
                isDarkMode
                  ? "bg-transparent hover:bg-rose-500/10 text-rose-400 border-rose-500/50 hover:border-rose-500"
                  : "bg-transparent hover:bg-rose-500/10 text-rose-600 border-rose-500"
              }`}
              title="Remove all group containers"
            >
              <Ungroup className="h-4 w-4" />
            </Button>
          </div>

          {/* Right side - Logo */}
          <div className="flex items-center gap-2">
            <Image
              src="/company-logo.png"
              alt="SFM Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <div>
              <h1 className={`text-xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                SFM
              </h1>
              <p className={`text-xs font-medium ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                Software Factory Model
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 relative h-full w-full" ref={reactFlowWrapper} style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className={`absolute top-20 left-20 w-72 h-72 rounded-full blur-3xl ${
                isDarkMode ? "bg-[#f26522]/5" : "bg-indigo-500/10"
              }`}
            ></div>
            <div
              className={`absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl ${
                isDarkMode ? "bg-purple-600/5" : "bg-purple-500/10"
              }`}
            ></div>
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl ${
                isDarkMode ? "bg-blue-600/3" : "bg-pink-500/5"
              }`}
            ></div>
          </div>

          <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              snapToGrid
              snapGrid={[15, 15]}
              defaultEdgeOptions={{ type: "custom" }}
              className="relative z-10"
              style={{ width: '100%', height: '100%' }}
            >
              <Background color={isDarkMode ? "#2a2a4a" : "#d1d5db"} gap={20} size={1} className="opacity-30" />
              <Controls
                className={`backdrop-blur-sm border rounded-xl shadow-xl ${
                  isDarkMode ? "bg-[#1a1a2e]/90 border-white/10" : "bg-white/90 border-gray-200"
                }`}
              />
              <MiniMap
                className={`backdrop-blur-sm border rounded-xl shadow-xl ${
                  isDarkMode ? "bg-[#1a1a2e]/90 border-white/10" : "bg-white/90 border-gray-200"
                }`}
                maskColor={isDarkMode ? "rgba(242, 101, 34, 0.1)" : "rgba(99, 102, 241, 0.1)"}
                nodeColor={(node) => {
                  const colors: Record<string, string> = {
                    "stage-0": "#ef4444",
                    "stage-1": "#f97316",
                    "stage-2": "#84cc16",
                    "stage-3": "#10b981",
                    "stage-4": "#06b6d4",
                    "stage-5": "#3b82f6",
                    "stage-6": "#8b5cf6",
                    "gate-problem": "#ff0000",
                    "gate-product": "#00ff00",
                    "gate-architecture": "#0000ff",
                    "gate-production": "#ffff00",
"gate-release": "#00ffff",
"insight-node": "#10b981",
    "outcome-node": "#22c55e",
    "direction-node": "#6366f1",
    "alignment-gate": "#f59e0b",
    "evidence-node": "#06b6d4",
  }
  return colors[node.type as string] || "#6366f1"
                }}
              />
              {nodes.length === 0 && (
                <Panel position="center">
                  <div
                    className={`text-center backdrop-blur-xl p-8 rounded-2xl shadow-2xl border max-w-lg mt-32 ${
                      isDarkMode
                        ? "bg-gradient-to-br from-[#1a1a2e]/90 to-[#0f0f0f]/90 border-white/10"
                        : "bg-white/90 border-gray-200"
                    }`}
                  >
                    <div
                      className={`w-20 h-20 mx-auto mb-4 border-2 border-dashed rounded-2xl flex items-center justify-center ${
                        isDarkMode
                          ? "border-[#f26522]/40 bg-gradient-to-br from-[#f26522]/10 to-[#ff8c42]/10"
                          : "border-indigo-500/50 bg-gradient-to-br from-indigo-500/10 to-purple-500/10"
                      }`}
                    >
                      <Copy className={`h-8 w-8 ${isDarkMode ? "text-[#f26522]" : "text-indigo-400"}`} />
                    </div>
                    <h2
                      className={`text-2xl font-bold mb-2 text-center ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      Build Your Seesaw Workflow
                    </h2>
                    <p className={`text-base text-center ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Drag stages from the sidebar to visualize Human-AI balanced development
                    </p>
                  </div>
                </Panel>
              )}
            </ReactFlow>
        </div>
      </div>

      {selectedNode && (
        <NodeConfigPanel
          node={selectedNode as WorkflowNodeType}
          updateNodeData={updateNodeData}
          onClose={() => setSelectedNode(null)}
          isDarkMode={isDarkMode}
          existingGroups={[...new Set(nodes.map(n => n.data.group).filter(Boolean) as string[])]}
        />
      )}

      <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} isDarkMode={isDarkMode} />

      <SaveLoadDialog
        isOpen={isSaveLoadOpen}
        onClose={() => setIsSaveLoadOpen(false)}
        mode={saveLoadMode}
        currentNodes={nodes}
        currentEdges={edges}
        currentEvidence={evidence}
        onLoad={handleLoadWorkflow}
        onLoadEvidence={setEvidence}
        isDarkMode={isDarkMode}
      />

      <EvidenceRepository
        isOpen={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
        nodes={nodes}
        isDarkMode={isDarkMode}
        evidence={evidence}
        setEvidence={setEvidence}
      />

      {/* Unsaved Changes Confirmation Dialog */}
      <AlertDialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen}>
        <AlertDialogContent className={isDarkMode ? "bg-[#1a1a2e] border-white/10" : "bg-white border-gray-200"}>
          <AlertDialogHeader>
            <AlertDialogTitle className={isDarkMode ? "text-white" : "text-gray-900"}>
              Unsaved Changes
            </AlertDialogTitle>
            <AlertDialogDescription className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              You have unsaved changes in your current project. Would you like to save them before creating a new project?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              onClick={() => setIsNewProjectDialogOpen(false)}
              className={isDarkMode 
                ? "bg-transparent border-white/20 text-white hover:bg-white/10" 
                : "bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100"
              }
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={createNewProject}
              className={isDarkMode 
                ? "bg-red-600 hover:bg-red-700 text-white" 
                : "bg-red-600 hover:bg-red-700 text-white"
              }
            >
              Discard Changes
            </AlertDialogAction>
            <AlertDialogAction
              onClick={handleSaveBeforeNew}
              className={isDarkMode 
                ? "bg-[#f26522] hover:bg-[#ff8c42] text-white" 
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }
            >
              Save First
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Wrap the component with ReactFlowProvider
export default function WorkflowBuilder() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderInner />
    </ReactFlowProvider>
  )
}
