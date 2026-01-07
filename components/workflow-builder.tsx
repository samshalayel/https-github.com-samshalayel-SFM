"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
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
import { Save, Play, Settings, FolderOpen, Copy, ChevronLeft, ChevronRight } from "lucide-react"
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
import { generateNodeId, createNode } from "@/lib/workflow-utils"
import type { WorkflowNode as WorkflowNodeType } from "@/lib/types"
import SettingsDialog from "./settings-dialog"

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

      // Check if the dropped element is valid
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

  const saveWorkflow = () => {
    if (nodes.length === 0) {
      toast({
        title: "Nothing to save",
        description: "Add some nodes to your workflow first",
        variant: "destructive",
      })
      return
    }

    const workflow = {
      nodes,
      edges,
    }

    const workflowString = JSON.stringify(workflow)
    localStorage.setItem("workflow", workflowString)

    toast({
      title: "Workflow saved",
      description: "Your workflow has been saved successfully",
    })
  }

  const loadWorkflow = () => {
    const savedWorkflow = localStorage.getItem("workflow")

    if (!savedWorkflow) {
      toast({
        title: "No saved workflow",
        description: "There is no workflow saved in your browser",
        variant: "destructive",
      })
      return
    }

    try {
      const { nodes: savedNodes, edges: savedEdges } = JSON.parse(savedWorkflow)
      setNodes(savedNodes)
      setEdges(savedEdges)
      toast({
        title: "Workflow loaded",
        description: "Your workflow has been loaded successfully",
      })
    } catch (error) {
      toast({
        title: "Error loading workflow",
        description: "There was an error loading your workflow",
        variant: "destructive",
      })
    }
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

    // In a real implementation, we would traverse the graph and execute each node
    // For the MVP, we'll just simulate execution with a success message
    setTimeout(() => {
      toast({
        title: "Workflow executed",
        description: "Your workflow has been executed successfully",
      })
    }, 2000)
  }

  return (
    <div className="flex flex-row h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar on the left with collapse functionality */}
      <div
        className={`border-r border-white/50 bg-white/80 backdrop-blur-sm flex flex-col shadow-xl transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "w-0 overflow-hidden" : "w-80"
        }`}
      >
        <div className="p-6 border-b border-gray-200/50">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Seesaw Model Stages</h2>
          <p className="text-sm text-gray-500">Drag stages to build your workflow</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <NodeLibrary />
        </div>

        <div className="p-6 border-t border-gray-200/50">
          <Button onClick={loadWorkflow} variant="outline" className="w-full rounded-lg bg-transparent">
            <FolderOpen className="h-4 w-4 mr-2" />
            Show Flows
          </Button>
          <p className="text-xs text-gray-400 text-center mt-2">flows saved 0</p>
        </div>
      </div>

      <button
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-50 bg-white/90 backdrop-blur-sm hover:bg-white border border-gray-200 shadow-lg rounded-r-lg p-2 transition-all duration-300 hover:shadow-xl"
        style={{ left: isSidebarCollapsed ? "0" : "20rem" }}
        aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isSidebarCollapsed ? (
          <ChevronRight className="h-5 w-5 text-gray-600" />
        ) : (
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        )}
      </button>

      {/* Main canvas area */}
      <div className="flex-1 flex flex-col">
        {/* Top header bar */}
        <div className="h-16 border-b border-white/50 bg-white/80 backdrop-blur-sm flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Button onClick={saveWorkflow} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6">
              <Save className="h-4 w-4 mr-2" />
              Save Flow
            </Button>
            <Button onClick={executeWorkflow} variant="outline" className="rounded-full px-6 bg-transparent">
              <Play className="h-4 w-4 mr-2" />
              Test Flow
            </Button>
            <Button
              onClick={() => setIsSettingsOpen(true)}
              variant="outline"
              className="rounded-full px-6 bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-200"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>

          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900">SILLAR</h1>
            <p className="text-sm text-gray-500">Build powerful workflows</p>
          </div>
        </div>

        <div className="flex-1 relative" ref={reactFlowWrapper}>
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-300/5 rounded-full blur-3xl"></div>
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
              <Background color="#cbd5e1" gap={20} size={1} className="opacity-30" />
              <Controls className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-lg" />
              <MiniMap
                className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-lg"
                maskColor="rgba(99, 102, 241, 0.1)"
                nodeColor={(node) => {
                  const colors: Record<string, string> = {
                    "stage-0": "#ef4444",
                    "stage-1": "#f97316",
                    "stage-2": "#84cc16",
                    "stage-3": "#10b981",
                    "stage-4": "#06b6d4",
                    "stage-5": "#3b82f6",
                    "stage-6": "#8b5cf6",
                  }
                  return colors[node.type as string] || "#6366f1"
                }}
              />
              {nodes.length === 0 && (
                <Panel position="center">
                  <div className="text-center bg-white/80 backdrop-blur-md p-12 rounded-3xl shadow-2xl border border-white/50">
                    <div className="w-32 h-32 mx-auto mb-6 border-4 border-dashed border-indigo-300 rounded-3xl flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                      <Copy className="h-12 w-12 text-indigo-400" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                      Build Your Seesaw Workflow
                    </h2>
                    <p className="text-gray-600 max-w-md text-lg">
                      Drag stages from the sidebar to visualize Human-AI balanced development
                    </p>
                  </div>
                </Panel>
              )}
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>

      {/* Config panel */}
      {selectedNode && (
        <NodeConfigPanel
          node={selectedNode as WorkflowNodeType}
          updateNodeData={updateNodeData}
          onClose={() => setSelectedNode(null)}
        />
      )}

      {/* Settings Dialog */}
      <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  )
}
