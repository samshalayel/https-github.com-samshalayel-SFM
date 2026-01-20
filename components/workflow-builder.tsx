"use client"

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
import { Save, Play, Settings, Download, Zap, ChevronLeft, ChevronRight, Copy, Sun, Moon, Upload, LogOut, LayoutTemplate } from "lucide-react"
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
import { generateNodeId, createNode } from "@/lib/workflow-utils"
import type { WorkflowNode as WorkflowNodeType } from "@/lib/types"
import SettingsDialog from "./settings-dialog"
import SaveLoadDialog from "./save-load-dialog"

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
}

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
}

export default function WorkflowBuilder() {
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

  useEffect(() => {
    const savedTheme = localStorage.getItem("sillar-theme")
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark")
    }
  }, [])

  const toggleTheme = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem("sillar-theme", newMode ? "dark" : "light")
  }

  const handleLogout = () => {
    window.location.href = "https://cp.sillar.us/auth/login"
  }

  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false)

  const loadSeesawTemplate = () => {
    // Define the Seesaw Model template
    // Stage 0 → Problem Gate → Stage 1 → Product Gate → Stage 2 → Architecture Gate → Stage 3 → Production Gate → Stage 5 → Release Gate → Stage 6
    
    const templateNodes = [
      // Stage 0
      {
        id: "stage-0-template",
        type: "stage-0",
        position: { x: 50, y: 200 },
        data: { label: "Stage 0", displayName: "Problem / Technical Lock", humanPercentage: 95, aiPercentage: 5 },
      },
      // Problem Gate
      {
        id: "gate-problem-template",
        type: "gate-problem",
        position: { x: 300, y: 200 },
        data: { label: "Problem Gate", displayName: "Problem Gate", humanPercentage: 100, aiPercentage: 0, authority: "Human Only" },
      },
      // Stage 1
      {
        id: "stage-1-template",
        type: "stage-1",
        position: { x: 550, y: 200 },
        data: { label: "Stage 1", displayName: "Product Shape", humanPercentage: 80, aiPercentage: 20 },
      },
      // Product Gate
      {
        id: "gate-product-template",
        type: "gate-product",
        position: { x: 800, y: 200 },
        data: { label: "Product Gate", displayName: "Product Gate", humanPercentage: 95, aiPercentage: 5, authority: "Human" },
      },
      // Stage 2
      {
        id: "stage-2-template",
        type: "stage-2",
        position: { x: 1050, y: 200 },
        data: { label: "Stage 2", displayName: "Architecture Spine", humanPercentage: 70, aiPercentage: 30 },
      },
      // Architecture Gate
      {
        id: "gate-architecture-template",
        type: "gate-architecture",
        position: { x: 1300, y: 200 },
        data: { label: "Architecture Gate", displayName: "Architecture Gate", humanPercentage: 90, aiPercentage: 10, authority: "Human" },
      },
      // Stage 3
      {
        id: "stage-3-template",
        type: "stage-3",
        position: { x: 1550, y: 200 },
        data: { label: "Stage 3", displayName: "Production Slice", humanPercentage: 50, aiPercentage: 50 },
      },
      // Production Gate
      {
        id: "gate-production-template",
        type: "gate-production",
        position: { x: 1800, y: 200 },
        data: { label: "Production Gate", displayName: "Production Gate", humanPercentage: 70, aiPercentage: 30, authority: "Human + AI" },
      },
      // Stage 5
      {
        id: "stage-5-template",
        type: "stage-5",
        position: { x: 2050, y: 200 },
        data: { label: "Stage 5", displayName: "Reproducibility", humanPercentage: 30, aiPercentage: 70 },
      },
      // Release Gate
      {
        id: "gate-release-template",
        type: "gate-release",
        position: { x: 2300, y: 200 },
        data: { label: "Release Gate", displayName: "Release Gate", humanPercentage: 100, aiPercentage: 0, authority: "Human Only" },
      },
      // Stage 6
      {
        id: "stage-6-template",
        type: "stage-6",
        position: { x: 2550, y: 200 },
        data: { label: "Stage 6", displayName: "Production Ready", humanPercentage: 20, aiPercentage: 80 },
      },
    ]

    const templateEdges = [
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
    setIsTemplateMenuOpen(false)

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

  const handleLoadWorkflow = (workflow: { nodes: any[]; edges: any[] }) => {
    setNodes(workflow.nodes)
    setEdges(workflow.edges)
    toast({
      title: "Workflow loaded",
      description: "Your workflow has been loaded successfully",
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

    const workflowData = {
      name: "Sillar Workflow",
      exportedAt: new Date().toISOString(),
      nodes: nodes,
      edges: edges,
    }

    const blob = new Blob([JSON.stringify(workflowData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `sillar-workflow-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Workflow exported",
      description: "Your workflow has been downloaded as JSON file",
    })
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
        <div className={`p-6 border-b ${isDarkMode ? "border-white/5" : "border-gray-200"}`}>
          <h2 className={`text-2xl font-bold mb-1 ${isDarkMode ? "text-[#f26522]" : "text-gray-900"}`}>
            Seesaw Model Stages
          </h2>
          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Drag stages to build your workflow
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
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
          <div className="flex items-center gap-2">
            <Button
              onClick={handleOpenSave}
              size="sm"
              variant="outline"
              className={`rounded-lg px-4 py-2 transition-all font-medium ${
                isDarkMode
                  ? "bg-transparent hover:bg-yellow-500/10 text-yellow-500 border-yellow-500/50 hover:border-yellow-500"
                  : "bg-transparent hover:bg-yellow-500/10 text-yellow-600 border-yellow-500"
              }`}
            >
              <Save className="h-4 w-4 mr-1.5" />
              Save
            </Button>

            <Button
              onClick={handleOpenLoad}
              size="sm"
              variant="outline"
              className={`rounded-lg px-4 py-2 transition-all font-medium ${
                isDarkMode
                  ? "bg-transparent hover:bg-emerald-500/10 text-emerald-400 border-emerald-500/50 hover:border-emerald-500"
                  : "bg-transparent hover:bg-emerald-500/10 text-emerald-600 border-emerald-500"
              }`}
            >
              <Download className="h-4 w-4 mr-1.5" />
              Load
            </Button>

            <Button
              onClick={exportWorkflow}
              size="sm"
              variant="outline"
              className={`rounded-lg px-4 py-2 transition-all font-medium ${
                isDarkMode
                  ? "bg-transparent hover:bg-[#f26522]/10 text-[#f26522] border-[#f26522]/50 hover:border-[#f26522]"
                  : "bg-transparent hover:bg-orange-500/10 text-orange-600 border-orange-500"
              }`}
            >
              <Upload className="h-4 w-4 mr-1.5" />
              Export
            </Button>

            <Button
              onClick={executeWorkflow}
              size="sm"
              variant="outline"
              className={`rounded-lg px-4 py-2 transition-all font-medium ${
                isDarkMode
                  ? "bg-transparent hover:bg-purple-500/10 text-purple-400 border-purple-500/50 hover:border-purple-500"
                  : "bg-transparent hover:bg-purple-500/10 text-purple-600 border-purple-500"
              }`}
            >
              <Play className="h-4 w-4 mr-1.5" />
              Test
            </Button>

            <Button
              onClick={executeWorkflow}
              size="sm"
              variant="outline"
              className={`rounded-lg px-4 py-2 transition-all font-medium ${
                isDarkMode
                  ? "bg-transparent hover:bg-cyan-500/10 text-cyan-400 border-cyan-500/50 hover:border-cyan-500"
                  : "bg-transparent hover:bg-cyan-500/10 text-cyan-600 border-cyan-500"
              }`}
            >
              <Zap className="h-4 w-4 mr-1.5" />
              Run
            </Button>

            <div className="relative">
              <Button
                onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
                size="sm"
                variant="outline"
                className={`rounded-lg px-4 py-2 transition-all font-medium ${
                  isDarkMode
                    ? "bg-transparent hover:bg-teal-500/10 text-teal-400 border-teal-500/50 hover:border-teal-500"
                    : "bg-transparent hover:bg-teal-500/10 text-teal-600 border-teal-500"
                }`}
              >
                <LayoutTemplate className="h-4 w-4 mr-1.5" />
                Template
              </Button>
              
              {isTemplateMenuOpen && (
                <div className={`absolute top-full left-0 mt-2 w-48 rounded-lg shadow-xl border z-50 ${
                  isDarkMode
                    ? "bg-[#1a1a2e] border-white/10"
                    : "bg-white border-gray-200"
                }`}>
                  <button
                    onClick={loadSeesawTemplate}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      isDarkMode
                        ? "hover:bg-[#f26522]/10 text-white"
                        : "hover:bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="font-medium">Seesaw Model</div>
                    <div className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Complete workflow with all stages and gates
                    </div>
                  </button>
                </div>
              )}
            </div>

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
          </div>

          <div className="text-right">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-xl shadow-lg flex items-center justify-center ${
                      isDarkMode
                        ? "bg-gradient-to-br from-[#f26522] to-[#ff8c42] shadow-[#f26522]/40"
                        : "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-purple-500/30"
                    }`}
                  >
                    <span className="text-white font-bold text-base">S</span>
                  </div>
                  <h1 className={`text-2xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    SILLAR
                  </h1>
                </div>
                <p className={`text-xs font-medium mt-0.5 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                  AI-Powered Workflow Platform
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 relative" ref={reactFlowWrapper}>
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

          <ReactFlowProvider>
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
          </ReactFlowProvider>
        </div>
      </div>

      {selectedNode && (
        <NodeConfigPanel
          node={selectedNode as WorkflowNodeType}
          updateNodeData={updateNodeData}
          onClose={() => setSelectedNode(null)}
          isDarkMode={isDarkMode}
        />
      )}

      <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} isDarkMode={isDarkMode} />

      <SaveLoadDialog
        isOpen={isSaveLoadOpen}
        onClose={() => setIsSaveLoadOpen(false)}
        mode={saveLoadMode}
        currentNodes={nodes}
        currentEdges={edges}
        onLoad={handleLoadWorkflow}
        isDarkMode={isDarkMode}
      />
    </div>
  )
}
