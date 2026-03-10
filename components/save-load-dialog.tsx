"use client"

import { useState, useEffect } from "react"
import { X, Save, Download, FolderOpen, Trash2, Loader2, Copy, Edit3, RefreshCw, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

interface SavedWorkflow {
  id: string
  name: string
  created_at: string
  data: {
    nodes: any[]
    edges: any[]
    evidence?: any[]
  }
}

interface SaveLoadDialogProps {
  isOpen: boolean
  onClose: () => void
  mode: "save" | "load"
  currentNodes: any[]
  currentEdges: any[]
  currentEvidence?: any[]
  onLoad: (workflow: { nodes: any[]; edges: any[]; name?: string }) => void
  onLoadEvidence?: (evidence: any[]) => void
  isDarkMode?: boolean
  onOpenGitHubImport?: () => void
}

type DuplicateAction = "overwrite" | "version" | "rename" | null

export default function SaveLoadDialog({
  isOpen,
  onClose,
  mode,
  currentNodes,
  currentEdges,
  currentEvidence = [],
  onLoad,
  onLoadEvidence,
  isDarkMode = true,
  onOpenGitHubImport,
}: SaveLoadDialogProps) {
  const [workflowName, setWorkflowName] = useState("")
  const [savedWorkflows, setSavedWorkflows] = useState<SavedWorkflow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [duplicateName, setDuplicateName] = useState("")
  const [suggestedVersionName, setSuggestedVersionName] = useState("")
  
  // GitHub templates state
  const [githubTemplates, setGithubTemplates] = useState<{name: string, path: string, sha: string}[]>([])
  const [isLoadingGithub, setIsLoadingGithub] = useState(false)
  const [githubError, setGithubError] = useState<string | null>(null)
  const [githubConfig, setGithubConfig] = useState<{repo: string, token: string} | null>(null)
  const [isSavingToGithub, setIsSavingToGithub] = useState(false)
  const [githubSaveSuccess, setGithubSaveSuccess] = useState<string | null>(null)

  // Load workflows from Supabase when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadWorkflows()
      loadGithubConfig()
      setGithubSaveSuccess(null)
      
      // Load GitHub templates when in load mode
      if (mode === "load" && githubConfig) {
        loadGithubTemplates(githubConfig.repo, githubConfig.token)
      }
    }
  }, [isOpen, mode])

  // Load GitHub config from localStorage
  const loadGithubConfig = () => {
    if (typeof window === "undefined") return
    
    try {
      const savedSettings = localStorage.getItem("projectSettings")
      console.log("[v0] Loading GitHub config, savedSettings:", savedSettings)
      
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        console.log("[v0] Parsed settings:", parsed)
        
        if (parsed.githubRepo) {
          console.log("[v0] Setting githubConfig with repo:", parsed.githubRepo)
          setGithubConfig({
            repo: parsed.githubRepo,
            token: parsed.githubToken || ""
          })
        } else {
          console.log("[v0] No githubRepo found in settings")
          setGithubConfig(null)
          setGithubTemplates([])
        }
      } else {
        console.log("[v0] No projectSettings in localStorage")
        setGithubConfig(null)
      }
    } catch (e) {
      console.log("[v0] Error loading GitHub config:", e)
      setGithubConfig(null)
    }
  }

  // Save workflow to GitHub
  const saveToGithub = async () => {
    if (!githubConfig || !githubConfig.token) {
      alert("GitHub token required to save files. Please add it in Settings.")
      return
    }

    if (!workflowName.trim()) {
      alert("Please enter a workflow name")
      return
    }

    setIsSavingToGithub(true)
    setGithubSaveSuccess(null)
    try {
      const fileName = workflowName.trim().replace(/[^a-zA-Z0-9-_]/g, "-") + ".json"
      
      const response = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          repo: githubConfig.repo,
          path: fileName,
          token: githubConfig.token,
          content: {
            nodes: currentNodes,
            edges: currentEdges,
            evidence: currentEvidence,
          },
          message: `Save workflow: ${workflowName.trim()}`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save to GitHub")
      }

      setGithubSaveSuccess(`Saved to ${githubConfig.repo}/${fileName}`)
      setWorkflowName("")
    } catch (error: any) {
      alert("Failed to save to GitHub: " + (error.message || "Unknown error"))
    } finally {
      setIsSavingToGithub(false)
    }
  }

  // Load GitHub templates from repo
  const loadGithubTemplates = async (repo: string, token: string) => {
    setIsLoadingGithub(true)
    setGithubError(null)
    try {
      const response = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "list",
          repo,
          token: token || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to load templates")
      }

      // Filter only JSON files
      const jsonFiles = (data.files || []).filter((file: any) => 
        file.name.toLowerCase().endsWith(".json")
      )
      setGithubTemplates(jsonFiles)
    } catch (error: any) {
      console.log("[v0] Error loading GitHub templates:", error)
      setGithubError(error.message || "Failed to load templates")
      setGithubTemplates([])
    } finally {
      setIsLoadingGithub(false)
    }
  }

  // Load a specific template from GitHub
  const loadGithubTemplate = async (path: string, fileName: string) => {
    if (!githubConfig) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "fetch",
          repo: githubConfig.repo,
          path,
          token: githubConfig.token || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to load template")
      }

      // Parse the workflow content
      const workflow = data.content
      const nodes = Array.isArray(workflow.nodes) ? workflow.nodes : []
      const edges = Array.isArray(workflow.edges) ? workflow.edges : []
      const evidenceData = Array.isArray(workflow.evidence) ? workflow.evidence : []

      onLoad({ nodes, edges, name: fileName.replace(".json", "") })
      
      if (onLoadEvidence && evidenceData.length > 0) {
        onLoadEvidence(evidenceData)
      }
      
      onClose()
    } catch (error: any) {
      console.log("[v0] Error loading GitHub template:", error)
      alert("Failed to load template: " + (error.message || "Unknown error"))
    } finally {
      setIsLoading(false)
    }
  }

  const loadWorkflows = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      
      // Get user with error handling
      const { data: userData, error: userError } = await supabase.auth.getUser()
      
      if (userError || !userData?.user) {
        console.log("[v0] No user found or error:", userError?.message)
        setSavedWorkflows([])
        return
      }

      const { data, error } = await supabase
        .from("snapshots")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.log("[v0] Error fetching snapshots:", error.message)
        setSavedWorkflows([])
        return
      }
      
      setSavedWorkflows(data || [])
    } catch (error: any) {
      console.log("[v0] Error loading workflows:", error?.message || error)
      setSavedWorkflows([])
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to generate next version name
  const getNextVersionName = (baseName: string): string => {
    // Check if name already has a version suffix like .v1, .v2, etc.
    const versionMatch = baseName.match(/^(.+)\.v(\d+)$/)
    
    let baseNameWithoutVersion: string
    if (versionMatch) {
      baseNameWithoutVersion = versionMatch[1]
    } else {
      baseNameWithoutVersion = baseName
    }
    
    // Find all existing versions of this workflow
    const existingVersions = savedWorkflows
      .filter(w => {
        const match = w.name.match(/^(.+)\.v(\d+)$/)
        if (match) {
          return match[1] === baseNameWithoutVersion
        }
        return w.name === baseNameWithoutVersion
      })
      .map(w => {
        const match = w.name.match(/^(.+)\.v(\d+)$/)
        if (match) {
          return parseInt(match[2], 10)
        }
        return 0 // Original has version 0
      })
    
    const maxVersion = existingVersions.length > 0 ? Math.max(...existingVersions) : 0
    return `${baseNameWithoutVersion}.v${maxVersion + 1}`
  }

  // Check if workflow name already exists
  const checkNameExists = (name: string): boolean => {
    return savedWorkflows.some(w => w.name.toLowerCase() === name.toLowerCase())
  }

  if (!isOpen) return null

  const handleSave = async () => {
    if (!workflowName.trim()) {
      alert("Please enter a workflow name")
      return
    }

    // Check if name already exists
    if (checkNameExists(workflowName.trim())) {
      setDuplicateName(workflowName.trim())
      setSuggestedVersionName(getNextVersionName(workflowName.trim()))
      setShowDuplicateDialog(true)
      return
    }

    await saveWorkflow(workflowName.trim())
  }

  const saveWorkflow = async (name: string) => {
    setIsSaving(true)
    try {
      const supabase = createClient()
      const { data: userData, error: userError } = await supabase.auth.getUser()
      
      if (userError || !userData?.user) {
        alert("Please sign in to save workflows")
        return
      }

      const { error } = await supabase
        .from("snapshots")
        .insert({
          user_id: userData.user.id,
          name: name,
          data: {
            nodes: currentNodes,
            edges: currentEdges,
            evidence: currentEvidence,
          },
        })

      if (error) {
        throw error
      }

      setWorkflowName("")
      setShowDuplicateDialog(false)
      await loadWorkflows()
      onClose()
    } catch (error: any) {
      alert("Failed to save workflow")
    } finally {
      setIsSaving(false)
    }
  }

  // Overwrite existing workflow with same name
  const overwriteWorkflow = async (name: string) => {
    setIsSaving(true)
    try {
      const supabase = createClient()
      const { data: userData, error: userError } = await supabase.auth.getUser()
      
      if (userError || !userData?.user) {
        alert("Please sign in to save workflows")
        return
      }

      // Find existing workflow with same name
      const existingWorkflow = savedWorkflows.find(
        w => w.name.toLowerCase() === name.toLowerCase()
      )

      if (!existingWorkflow) {
        // If not found, just save as new
        await saveWorkflow(name)
        return
      }

      console.log("[v0] Overwriting workflow:", name)
      console.log("[v0] Existing workflow ID:", existingWorkflow.id)
      console.log("[v0] Current Evidence being saved:", currentEvidence)
      console.log("[v0] Evidence count:", currentEvidence?.length || 0)
      console.log("[v0] Nodes count:", currentNodes?.length || 0)
      console.log("[v0] Edges count:", currentEdges?.length || 0)

      const updatePayload = {
        data: {
          nodes: currentNodes,
          edges: currentEdges,
          evidence: currentEvidence,
        },
      }
      console.log("[v0] Update payload:", JSON.stringify(updatePayload))

      // Update existing workflow
      const { data: updateResult, error } = await supabase
        .from("snapshots")
        .update(updatePayload)
        .eq("id", existingWorkflow.id)
        .eq("user_id", userData.user.id)
        .select()

      if (error) {
        console.log("[v0] Error updating workflow:", error)
        throw error
      }

      console.log("[v0] Update result:", updateResult)

      // Check if update actually happened (RLS might block without error)
      if (!updateResult || updateResult.length === 0) {
        console.log("[v0] Update returned empty - may be RLS issue, trying delete+insert approach")
        
        // Delete and re-insert as fallback
        const { error: deleteError } = await supabase
          .from("snapshots")
          .delete()
          .eq("id", existingWorkflow.id)
          .eq("user_id", userData.user.id)

        if (deleteError) {
          console.log("[v0] Delete error:", deleteError)
          throw deleteError
        }

        const { error: insertError } = await supabase
          .from("snapshots")
          .insert({
            user_id: userData.user.id,
            name: name,
            data: {
              nodes: currentNodes,
              edges: currentEdges,
              evidence: currentEvidence,
            },
          })

        if (insertError) {
          console.log("[v0] Insert error:", insertError)
          throw insertError
        }

        console.log("[v0] Workflow saved via delete+insert fallback")
      } else {
        console.log("[v0] Workflow updated successfully via update")
      }
      setWorkflowName("")
      setShowDuplicateDialog(false)
      await loadWorkflows()
      onClose()
    } catch (error: any) {
      console.log("[v0] Failed to update workflow:", error)
      alert("Failed to update workflow")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDuplicateAction = async (action: DuplicateAction) => {
    if (action === "overwrite") {
      await overwriteWorkflow(duplicateName)
    } else if (action === "version") {
      await saveWorkflow(suggestedVersionName)
    } else if (action === "rename") {
      setShowDuplicateDialog(false)
      // Focus will return to the input field for user to change the name
    }
  }

  const handleLoad = (workflow: SavedWorkflow) => {
    try {
      const data = workflow.data || {}
      const nodes = Array.isArray(data.nodes) ? data.nodes : []
      const edges = Array.isArray(data.edges) ? data.edges : []
      const evidenceData = Array.isArray(data.evidence) ? data.evidence : []
      
      console.log("[v0] Loading workflow:", workflow.name)
      console.log("[v0] Evidence in loaded workflow:", evidenceData)
      console.log("[v0] Evidence count in loaded workflow:", evidenceData.length)
      
      onLoad({ nodes, edges, name: workflow.name })
      
      // Always update evidence when loading - clear if no evidence exists, load if it does
      if (onLoadEvidence) {
        console.log("[v0] Calling onLoadEvidence with:", evidenceData)
        onLoadEvidence(evidenceData)
      }
      
      onClose()
    } catch (error) {
      console.log("[v0] Error loading workflow data:", error)
      alert("Failed to load workflow - invalid data format")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("snapshots")
        .delete()
        .eq("id", id)

      if (error) {
        console.log("[v0] Error deleting workflow:", error.message)
        return
      }
      setSavedWorkflows(savedWorkflows.filter(w => w.id !== id))
    } catch (error: any) {
      console.log("[v0] Error deleting workflow:", error?.message || error)
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  // Duplicate Name Dialog
  if (showDuplicateDialog) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm ${
          isDarkMode ? "bg-black/60" : "bg-black/50"
        }`}
      >
        <div
          className={`rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border ${
            isDarkMode ? "bg-[#111111] border-white/10" : "bg-white border-gray-200"
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white">
            <div className="flex items-center gap-3">
              <Copy className="h-6 w-6" />
              <div>
                <h2 className="text-xl font-bold">Name Already Exists</h2>
                <p className="text-amber-100 text-sm mt-1">
                  A workflow named "{duplicateName}" already exists
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Choose how you want to save this workflow:
            </p>

            {/* Option 1: Overwrite Existing (Recommended) */}
            <button
              onClick={() => handleDuplicateAction("overwrite")}
              disabled={isSaving}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                isDarkMode
                  ? "border-green-500/30 bg-green-500/10 hover:bg-green-500/20 hover:border-green-500/50"
                  : "border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${isDarkMode ? "bg-green-500/20" : "bg-green-100"}`}>
                  <RefreshCw className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Update Existing (Recommended)
                  </p>
                  <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Replace "{duplicateName}" with the current workflow
                  </p>
                </div>
              </div>
            </button>

            {/* Option 2: Save as Version */}
            <button
              onClick={() => handleDuplicateAction("version")}
              disabled={isSaving}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                isDarkMode
                  ? "border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 hover:border-indigo-500/50"
                  : "border-indigo-200 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${isDarkMode ? "bg-indigo-500/20" : "bg-indigo-100"}`}>
                  <Copy className="h-5 w-5 text-indigo-500" />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Save as New Version
                  </p>
                  <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Save as: <span className="font-mono text-indigo-500">{suggestedVersionName}</span>
                  </p>
                </div>
              </div>
            </button>

            {/* Option 2: Choose New Name */}
            <button
              onClick={() => handleDuplicateAction("rename")}
              disabled={isSaving}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                isDarkMode
                  ? "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                  : "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${isDarkMode ? "bg-white/10" : "bg-gray-100"}`}>
                  <Edit3 className="h-5 w-5 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Choose Different Name
                  </p>
                  <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Go back and enter a new unique name
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div
            className={`border-t p-4 flex justify-end ${
              isDarkMode ? "border-white/10 bg-[#0a0a0a]/50" : "border-gray-200 bg-gray-50"
            }`}
          >
            <Button
              onClick={() => setShowDuplicateDialog(false)}
              variant="outline"
              className={`px-4 ${
                isDarkMode ? "bg-transparent border-white/10 text-gray-300 hover:bg-white/10" : "bg-transparent"
              }`}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm ${
        isDarkMode ? "bg-black/60" : "bg-black/50"
      }`}
    >
      <div
        className={`rounded-2xl shadow-2xl w-full max-w-2xl max-h-[70vh] overflow-hidden border ${
          isDarkMode ? "bg-[#111111] border-white/10" : "bg-white border-gray-200"
        }`}
      >
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
                {mode === "save" ? "Save your workflow to cloud storage" : "Choose a workflow to load"}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(70vh-180px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className={`h-8 w-8 animate-spin ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
            </div>
          ) : mode === "save" ? (
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="workflow-name"
                  className={`font-medium mb-2 block ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  Workflow Name
                </Label>
                <Input
                  id="workflow-name"
                  type="text"
                  placeholder="Enter workflow name..."
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className={`w-full rounded-lg ${
                    isDarkMode
                      ? "bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500"
                      : "border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  }`}
                />
              </div>

              {/* GitHub Save Section */}
              {githubConfig && githubConfig.token && (
                <div className={`rounded-xl border overflow-hidden ${isDarkMode ? "border-white/10 bg-gradient-to-r from-gray-900/50 to-gray-800/50" : "border-gray-200 bg-gradient-to-r from-gray-50 to-white"}`}>
                  <div className={`flex items-center justify-between p-4`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white shadow-sm"}`}>
                        <Github className={`h-5 w-5 ${isDarkMode ? "text-white" : "text-gray-800"}`} />
                      </div>
                      <div>
                        <p className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                          Save to GitHub
                        </p>
                        <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {githubConfig.repo}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={saveToGithub}
                      disabled={isSavingToGithub || !workflowName.trim()}
                      className="bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white"
                    >
                      {isSavingToGithub ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Github className="h-4 w-4 mr-2" />
                      )}
                      {isSavingToGithub ? "Saving..." : "Save to GitHub"}
                    </Button>
                  </div>
                  {githubSaveSuccess && (
                    <div className={`px-4 pb-4`}>
                      <p className="text-green-500 text-sm">{githubSaveSuccess}</p>
                    </div>
                  )}
                </div>
              )}

              {/* No GitHub Config Notice */}
              {!githubConfig && (
                <div className={`p-4 rounded-xl border ${isDarkMode ? "border-white/10 bg-gray-900/30" : "border-gray-200 bg-gray-50"}`}>
                  <div className="flex items-center gap-3">
                    <Github className={`h-5 w-5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Configure GitHub repository in Settings to save workflows to GitHub
                    </p>
                  </div>
                </div>
              )}

              {/* No GitHub Token Notice */}
              {githubConfig && !githubConfig.token && (
                <div className={`p-4 rounded-xl border ${isDarkMode ? "border-white/10 bg-gray-900/30" : "border-gray-200 bg-gray-50"}`}>
                  <div className="flex items-center gap-3">
                    <Github className={`h-5 w-5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Add GitHub token in Settings to save workflows to GitHub
                    </p>
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className={`flex items-center gap-3 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                <div className={`flex-1 h-px ${isDarkMode ? "bg-white/10" : "bg-gray-200"}`} />
                <span className="text-xs font-medium">Cloud Storage</span>
                <div className={`flex-1 h-px ${isDarkMode ? "bg-white/10" : "bg-gray-200"}`} />
              </div>

              {savedWorkflows.length > 0 && (
                <div className="mt-6">
                  <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? "text-gray-400" : "text-gray-700"}`}>
                    Your Saved Workflows:
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {savedWorkflows.map((workflow) => (
                      <div
                        key={workflow.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          isDarkMode
                            ? "bg-[#1a1a1a] border-white/10 hover:bg-[#222]"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {workflow.name}
                          </p>
                          <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                            {formatDate(workflow.created_at)}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleDelete(workflow.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
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
            <div className="space-y-4">
              {/* GitHub Templates Section */}
              {githubConfig && (
                <div className={`rounded-xl border overflow-hidden ${isDarkMode ? "border-white/10 bg-gradient-to-r from-gray-900/50 to-gray-800/50" : "border-gray-200 bg-gradient-to-r from-gray-50 to-white"}`}>
                  <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? "border-white/10" : "border-gray-200"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white shadow-sm"}`}>
                        <Github className={`h-5 w-5 ${isDarkMode ? "text-white" : "text-gray-800"}`} />
                      </div>
                      <div>
                        <p className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                          GitHub Templates
                        </p>
                        <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {githubConfig.repo}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => loadGithubTemplates(githubConfig.repo, githubConfig.token)}
                      disabled={isLoadingGithub}
                      className={`p-2 rounded-lg transition-colors ${isDarkMode ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-600"}`}
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoadingGithub ? "animate-spin" : ""}`} />
                    </button>
                  </div>
                  
                  <div className="p-3 max-h-48 overflow-y-auto">
                    {isLoadingGithub ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className={`h-6 w-6 animate-spin ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                      </div>
                    ) : githubError ? (
                      <div className="text-center py-4">
                        <p className="text-red-500 text-sm">{githubError}</p>
                        <p className={`text-xs mt-2 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                          Check your repo name and token in Settings
                        </p>
                      </div>
                    ) : githubTemplates.length === 0 ? (
                      <div className="text-center py-4">
                        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          No JSON templates found
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {githubTemplates.map((template) => (
                          <button
                            key={template.sha}
                            onClick={() => loadGithubTemplate(template.path, template.name)}
                            disabled={isLoading}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                              isDarkMode
                                ? "hover:bg-white/10 border border-transparent hover:border-white/10"
                                : "hover:bg-gray-100 border border-transparent hover:border-gray-200"
                            }`}
                          >
                            <div className={`p-2 rounded-lg ${isDarkMode ? "bg-indigo-500/20" : "bg-indigo-100"}`}>
                              <FolderOpen className="h-4 w-4 text-indigo-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                {template.name.replace(".json", "")}
                              </p>
                              <p className={`text-xs truncate ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                                {template.path}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* No GitHub Config Notice */}
              {!githubConfig && (
                <div className={`p-4 rounded-xl border text-center ${isDarkMode ? "border-white/10 bg-gray-900/50" : "border-gray-200 bg-gray-50"}`}>
                  <Github className={`h-8 w-8 mx-auto mb-2 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`} />
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Configure GitHub in Settings to import templates
                  </p>
                </div>
              )}

              {/* Divider */}
              <div className={`flex items-center gap-3 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                <div className={`flex-1 h-px ${isDarkMode ? "bg-white/10" : "bg-gray-200"}`} />
                <span className="text-xs font-medium">Saved Workflows</span>
                <div className={`flex-1 h-px ${isDarkMode ? "bg-white/10" : "bg-gray-200"}`} />
              </div>

              {savedWorkflows.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? "text-gray-600" : "text-gray-300"}`} />
                  <p className={`text-lg ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    No saved workflows found
                  </p>
                  <p className={`text-sm mt-2 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                    Save a workflow first to load it later
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedWorkflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className={`group flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer ${
                        isDarkMode
                          ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/10"
                          : "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 hover:shadow-md"
                      }`}
                      onClick={() => handleLoad(workflow)}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`p-3 rounded-lg shadow-sm ${isDarkMode ? "bg-[#1a1a1a]" : "bg-white"}`}>
                          <Download className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {workflow.name}
                          </p>
                          <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                            {formatDate(workflow.created_at)}
                          </p>
                          <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {workflow.data?.nodes?.length || 0} stages, {workflow.data?.edges?.length || 0} connections
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(workflow.id)
                          }}
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
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
          <div
            className={`border-t p-6 flex justify-end gap-3 ${
              isDarkMode ? "border-white/10 bg-[#0a0a0a]/50" : "border-gray-200 bg-gray-50"
            }`}
          >
            <Button
              onClick={onClose}
              variant="outline"
              className={`px-6 ${
                isDarkMode ? "bg-transparent border-white/10 text-gray-300 hover:bg-white/10" : "bg-transparent"
              }`}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? "Saving..." : "Save Workflow"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
