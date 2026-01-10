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
import { Save, Play, Settings, Download, Zap, ChevronLeft, ChevronRight, Copy, Sun, Moon } from "lucide-react"
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

  return (
    <div
      className={`flex flex-row h-screen ${isDarkMode ? "bg-[#0a0a0a]" : "bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100"}`}
    >
      <div
        className={`border-r flex flex-col shadow-2xl transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "w-0 overflow-hidden" : "w-80"
        } ${isDarkMode ? "border-white/10 bg-[#111111]/95 backdrop-blur-xl" : "border-gray-200 bg-white/90 backdrop-blur-xl"}`}
      >
        <div className={`p-6 border-b ${isDarkMode ? "border-white/10" : "border-gray-200"}`}>
          <h2 className={`text-2xl font-bold mb-1 ${isDarkMode ? "text-[#f26522]" : "text-gray-900"}`}>
            Seesaw Model Stages
          </h2>
          <p className={`text-sm ${isDarkMode ? "text-[#f5e6d3]" : "text-gray-600"}`}>
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
            ? "bg-[#1a1a1a]/90 hover:bg-[#252525] border-white/10"
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
            isDarkMode ? "border-white/10 bg-[#111111]/95" : "border-gray-200 bg-white/95"
          }`}
        >
          <div className="flex items-center gap-2">
            <Button
              onClick={handleOpenSave}
              size="sm"
              className={`rounded-lg px-4 py-2 shadow-lg transition-all border-0 ${
                isDarkMode
                  ? "bg-gradient-to-r from-[#f26522] to-[#e05a1c] hover:from-[#e05a1c] hover:to-[#d04f16] text-white shadow-[#f26522]/25 hover:shadow-[#f26522]/40"
                  : "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40"
              }`}
            >
              <Save className="h-4 w-4 mr-1.5" />
              Save
            </Button>

            <Button
              onClick={handleOpenLoad}
              size="sm"
              className="bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white rounded-lg px-4 py-2 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all border-0"
            >
              <Download className="h-4 w-4 mr-1.5 text-violet-100" />
              Load
            </Button>

            <Button
              onClick={executeWorkflow}
              size="sm"
              className="bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 hover:from-fuchsia-600 hover:to-fuchsia-700 text-white rounded-lg px-4 py-2 shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40 transition-all border-0"
            >
              <Play className="h-4 w-4 mr-1.5 text-fuchsia-100" />
              Test
            </Button>

            <Button
              onClick={executeWorkflow}
              size="sm"
              className={`rounded-lg px-4 py-2 shadow-lg transition-all border-0 ${
                isDarkMode
                  ? "bg-gradient-to-r from-[#f26522] to-[#e05a1c] hover:from-[#e05a1c] hover:to-[#d04f16] text-white shadow-[#f26522]/25 hover:shadow-[#f26522]/40"
                  : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40"
              }`}
            >
              <Zap className="h-4 w-4 mr-1.5" />
              Run
            </Button>

            <Button
              onClick={() => setIsSettingsOpen(true)}
              size="sm"
              className={`rounded-lg px-4 py-2 shadow-lg transition-all border-0 ${
                isDarkMode
                  ? "bg-[#1a1a1a] hover:bg-[#252525] text-gray-300"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              <Settings className="h-4 w-4 mr-1.5" />
              Settings
            </Button>

            <Button
              onClick={toggleTheme}
              size="sm"
              className={`rounded-lg px-3 py-2 shadow-lg transition-all border-0 ${
                isDarkMode
                  ? "bg-[#f26522]/20 hover:bg-[#f26522]/30 text-[#f26522]"
                  : "bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-600"
              }`}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg shadow-lg flex items-center justify-center ${
                      isDarkMode
                        ? "bg-gradient-to-br from-[#f26522] to-[#e05a1c] shadow-[#f26522]/30"
                        : "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-purple-500/30"
                    }`}
                  >
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <h1 className={`text-2xl font-bold ${isDarkMode ? "text-[#f26522]" : "text-gray-900"}`}>SILLAR</h1>
                </div>
                <p className={`text-xs font-medium mt-0.5 ${isDarkMode ? "text-[#f5e6d3]" : "text-gray-500"}`}>
                  AI-Powered Workflow Platform
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className={`absolute top-20 left-20 w-72 h-72 rounded-full blur-3xl ${isDarkMode ? "bg-indigo-500/5" : "bg-indigo-500/10"}`}
            ></div>
            <div
              className={`absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl ${isDarkMode ? "bg-purple-500/5" : "bg-purple-500/10"}`}
            ></div>
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl ${isDarkMode ? "bg-pink-500/3" : "bg-pink-500/5"}`}
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
              <Background color={isDarkMode ? "#333333" : "#d1d5db"} gap={20} size={1} className="opacity-30" />
              <Controls
                className={`backdrop-blur-sm border rounded-xl shadow-xl ${
                  isDarkMode ? "bg-[#1a1a1a]/90 border-white/10" : "bg-white/90 border-gray-200"
                }`}
              />
              <MiniMap
                className={`backdrop-blur-sm border rounded-xl shadow-xl ${
                  isDarkMode ? "bg-[#1a1a1a]/90 border-white/10" : "bg-white/90 border-gray-200"
                }`}
                maskColor={isDarkMode ? "rgba(99, 102, 241, 0.15)" : "rgba(99, 102, 241, 0.1)"}
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
                      isDarkMode ? "bg-[#111111]/90 border-white/10" : "bg-white/90 border-gray-200"
                    }`}
                  >
                    <div
                      className={`w-20 h-20 mx-auto mb-4 border-2 border-dashed rounded-2xl flex items-center justify-center ${
                        isDarkMode
                          ? "border-[#f26522]/50 bg-gradient-to-br from-[#f26522]/10 to-[#e05a1c]/10"
                          : "border-indigo-500/50 bg-gradient-to-br from-indigo-500/10 to-purple-500/10"
                      }`}
                    >
                      <Copy className={`h-8 w-8 ${isDarkMode ? "text-[#f26522]" : "text-indigo-400"}`} />
                    </div>
                    <h2
                      className={`text-2xl font-bold mb-2 text-center ${isDarkMode ? "text-[#f26522]" : "text-gray-900"}`}
                    >
                      Build Your Seesaw Workflow
                    </h2>
                    <p className={`text-base text-center ${isDarkMode ? "text-[#f5e6d3]" : "text-gray-600"}`}>
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
