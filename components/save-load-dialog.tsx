"use client"

import { useState } from "react"
import { X, Save, Download, FolderOpen, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SavedWorkflow {
  name: string
  timestamp: string
  nodes: any[]
  edges: any[]
}

interface SaveLoadDialogProps {
  isOpen: boolean
  onClose: () => void
  mode: "save" | "load"
  currentNodes: any[]
  currentEdges: any[]
  onLoad: (workflow: { nodes: any[]; edges: any[] }) => void
}

export default function SaveLoadDialog({
  isOpen,
  onClose,
  mode,
  currentNodes,
  currentEdges,
  onLoad,
}: SaveLoadDialogProps) {
  const [workflowName, setWorkflowName] = useState("")
  const [savedWorkflows, setSavedWorkflows] = useState<SavedWorkflow[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("savedWorkflows")
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  if (!isOpen) return null

  const handleSave = () => {
    if (!workflowName.trim()) {
      alert("Please enter a workflow name")
      return
    }

    const newWorkflow: SavedWorkflow = {
      name: workflowName,
      timestamp: new Date().toISOString(),
      nodes: currentNodes,
      edges: currentEdges,
    }

    const updated = [...savedWorkflows, newWorkflow]
    setSavedWorkflows(updated)
    localStorage.setItem("savedWorkflows", JSON.stringify(updated))
    setWorkflowName("")
    onClose()
  }

  const handleLoad = (workflow: SavedWorkflow) => {
    onLoad({ nodes: workflow.nodes, edges: workflow.edges })
    onClose()
  }

  const handleDelete = (index: number) => {
    const updated = savedWorkflows.filter((_, i) => i !== index)
    setSavedWorkflows(updated)
    localStorage.setItem("savedWorkflows", JSON.stringify(updated))
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[70vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            {mode === "save" ? <Save className="h-7 w-7" /> : <FolderOpen className="h-7 w-7" />}
            <div>
              <h2 className="text-2xl font-bold">{mode === "save" ? "Save Workflow" : "Load Workflow"}</h2>
              <p className="text-indigo-100 text-sm mt-1">
                {mode === "save" ? "Save your current workflow for later use" : "Choose a workflow to load"}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(70vh-180px)]">
          {mode === "save" ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="workflow-name" className="text-gray-700 font-medium mb-2 block">
                  Workflow Name
                </Label>
                <Input
                  id="workflow-name"
                  type="text"
                  placeholder="Enter workflow name..."
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              {savedWorkflows.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Previously Saved:</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {savedWorkflows.map((workflow, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{workflow.name}</p>
                          <p className="text-xs text-gray-500">{formatDate(workflow.timestamp)}</p>
                        </div>
                        <Button
                          onClick={() => handleDelete(index)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {savedWorkflows.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">No saved workflows found</p>
                  <p className="text-gray-400 text-sm mt-2">Save a workflow first to load it later</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedWorkflows.map((workflow, index) => (
                    <div
                      key={index}
                      className="group flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handleLoad(workflow)}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="p-3 bg-white rounded-lg shadow-sm">
                          <Download className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{workflow.name}</p>
                          <p className="text-xs text-gray-500">{formatDate(workflow.timestamp)}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {workflow.nodes.length} stages, {workflow.edges.length} connections
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(index)
                          }}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {mode === "save" && (
          <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-end gap-3">
            <Button onClick={onClose} variant="outline" className="px-6 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Workflow
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
