"use client"

import { useState } from "react"
import {
  X,
  Github,
  Loader2,
  FileJson,
  FolderOpen,
  ChevronRight,
  AlertCircle,
  Download,
  Key,
  Link as LinkIcon,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface GitHubFile {
  name: string
  path: string
  type: "file" | "dir"
  size?: number
  downloadUrl?: string
}

interface WorkflowPreview {
  nodes: any[]
  edges: any[]
  evidence?: any[]
}

interface GitHubImportDialogProps {
  isOpen: boolean
  onClose: () => void
  onImport: (workflow: { nodes: any[]; edges: any[]; name?: string; evidence?: any[] }) => void
  isDarkMode?: boolean
}

// Default templates repository configuration
const TEMPLATES_CONFIG = {
  owner: process.env.NEXT_PUBLIC_GITHUB_TEMPLATES_OWNER || "samshalayel",
  repo: process.env.NEXT_PUBLIC_GITHUB_TEMPLATES_REPO || "sfm-templates",
  path: "workflows",
}

export default function GitHubImportDialog({
  isOpen,
  onClose,
  onImport,
  isDarkMode = true,
}: GitHubImportDialogProps) {
  const [activeTab, setActiveTab] = useState<"templates" | "custom">("custom")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Custom import state
  const [githubUrl, setGithubUrl] = useState("")
  const [customToken, setCustomToken] = useState("")
  const [showToken, setShowToken] = useState(false)

  // Preview state
  const [preview, setPreview] = useState<WorkflowPreview | null>(null)
  const [previewMeta, setPreviewMeta] = useState<{
    owner: string
    repo: string
    path: string
    nodesCount: number
    edgesCount: number
    evidenceCount: number
  } | null>(null)

  // Templates browsing state
  const [templateFiles, setTemplateFiles] = useState<GitHubFile[]>([])
  const [currentPath, setCurrentPath] = useState("")
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([])

  if (!isOpen) return null

  // Parse GitHub URL to extract owner, repo, path, and branch
  const parseGitHubUrl = (url: string) => {
    // Support formats:
    // https://github.com/owner/repo/blob/branch/path/to/file.json
    // owner/repo/path/to/file.json
    // https://raw.githubusercontent.com/owner/repo/branch/path/to/file.json

    try {
      if (url.includes("raw.githubusercontent.com")) {
        const match = url.match(/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)/)
        if (match) {
          return { owner: match[1], repo: match[2], ref: match[3], path: match[4] }
        }
      }

      if (url.includes("github.com")) {
        const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)/)
        if (match) {
          return { owner: match[1], repo: match[2], ref: match[3], path: match[4] }
        }
      }

      // Simple format: owner/repo/path
      const parts = url.split("/")
      if (parts.length >= 3) {
        return {
          owner: parts[0],
          repo: parts[1],
          path: parts.slice(2).join("/"),
          ref: "main",
        }
      }

      return null
    } catch {
      return null
    }
  }

  const fetchWorkflow = async (owner: string, repo: string, path: string, ref = "main", token?: string) => {
    setIsLoading(true)
    setError(null)
    setPreview(null)
    setPreviewMeta(null)

    try {
      const params = new URLSearchParams({
        owner,
        repo,
        path,
        ref,
      })
      if (token) {
        params.append("token", token)
      }

      const response = await fetch(`/api/github?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch workflow")
      }

      setPreview(data.data)
      setPreviewMeta({
        owner,
        repo,
        path,
        nodesCount: data.meta.nodesCount,
        edgesCount: data.meta.edgesCount,
        evidenceCount: data.meta.evidenceCount || 0,
      })
    } catch (err: any) {
      setError(err.message || "Failed to fetch workflow")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFetchCustom = () => {
    if (!githubUrl.trim()) {
      setError("Please enter a GitHub URL or path")
      return
    }

    const parsed = parseGitHubUrl(githubUrl.trim())
    if (!parsed) {
      setError("Invalid GitHub URL format. Use: owner/repo/path/file.json or full GitHub URL")
      return
    }

    fetchWorkflow(parsed.owner, parsed.repo, parsed.path, parsed.ref, customToken || undefined)
  }

  const handleImport = () => {
    if (!preview) return

    const fileName = previewMeta?.path.split("/").pop()?.replace(".json", "") || "Imported Workflow"
    onImport({
      nodes: preview.nodes,
      edges: preview.edges,
      evidence: preview.evidence,
      name: fileName,
    })
    onClose()
  }

  const loadTemplates = async (path = "") => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: TEMPLATES_CONFIG.owner,
          repo: TEMPLATES_CONFIG.repo,
          path: path || TEMPLATES_CONFIG.path,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to load templates")
      }

      setTemplateFiles(data.items)
      setCurrentPath(path)

      // Update breadcrumbs
      if (path) {
        setBreadcrumbs(path.split("/"))
      } else {
        setBreadcrumbs([])
      }
    } catch (err: any) {
      setError(err.message || "Failed to load templates")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTemplateClick = (file: GitHubFile) => {
    if (file.type === "dir") {
      loadTemplates(file.path)
    } else {
      fetchWorkflow(TEMPLATES_CONFIG.owner, TEMPLATES_CONFIG.repo, file.path)
    }
  }

  const navigateToBreadcrumb = (index: number) => {
    if (index === -1) {
      loadTemplates(TEMPLATES_CONFIG.path)
    } else {
      const newPath = breadcrumbs.slice(0, index + 1).join("/")
      loadTemplates(newPath)
    }
  }

  const resetDialog = () => {
    setPreview(null)
    setPreviewMeta(null)
    setError(null)
    setGithubUrl("")
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm ${
        isDarkMode ? "bg-black/60" : "bg-black/50"
      }`}
    >
      <div
        className={`rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border ${
          isDarkMode ? "bg-[#111111] border-white/10" : "bg-white border-gray-200"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <Github className="h-7 w-7" />
            <div>
              <h2 className="text-2xl font-bold">Import from GitHub</h2>
              <p className="text-gray-300 text-sm mt-1">
                Import workflow templates from GitHub repositories
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex border-b ${isDarkMode ? "border-white/10" : "border-gray-200"}`}>
          <button
            onClick={() => {
              setActiveTab("templates")
              if (templateFiles.length === 0) {
                loadTemplates(TEMPLATES_CONFIG.path)
              }
            }}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "templates"
                ? isDarkMode
                  ? "text-white border-b-2 border-indigo-500 bg-indigo-500/10"
                  : "text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50"
                : isDarkMode
                  ? "text-gray-400 hover:text-white hover:bg-white/5"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Official Templates
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "custom"
                ? isDarkMode
                  ? "text-white border-b-2 border-indigo-500 bg-indigo-500/10"
                  : "text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50"
                : isDarkMode
                  ? "text-gray-400 hover:text-white hover:bg-white/5"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Custom Import
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-250px)]">
          {error && (
            <div
              className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${
                isDarkMode ? "bg-red-500/10 border border-red-500/20" : "bg-red-50 border border-red-200"
              }`}
            >
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className={`text-sm ${isDarkMode ? "text-red-400" : "text-red-600"}`}>{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-500 hover:text-red-400">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {preview ? (
            // Preview Mode
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Workflow Preview
                </h3>
                <Button
                  onClick={resetDialog}
                  variant="ghost"
                  size="sm"
                  className={isDarkMode ? "text-gray-400 hover:text-white" : ""}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Choose Another
                </Button>
              </div>

              <div
                className={`p-4 rounded-lg border ${
                  isDarkMode ? "bg-[#1a1a1a] border-white/10" : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${isDarkMode ? "bg-green-500/20" : "bg-green-100"}`}>
                    <FileJson className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {previewMeta?.path.split("/").pop()}
                    </p>
                    <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                      {previewMeta?.owner}/{previewMeta?.repo}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div
                    className={`p-3 rounded-lg text-center ${
                      isDarkMode ? "bg-indigo-500/10" : "bg-indigo-50"
                    }`}
                  >
                    <p className="text-2xl font-bold text-indigo-500">{previewMeta?.nodesCount}</p>
                    <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Nodes</p>
                  </div>
                  <div
                    className={`p-3 rounded-lg text-center ${
                      isDarkMode ? "bg-purple-500/10" : "bg-purple-50"
                    }`}
                  >
                    <p className="text-2xl font-bold text-purple-500">{previewMeta?.edgesCount}</p>
                    <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Connections</p>
                  </div>
                  <div
                    className={`p-3 rounded-lg text-center ${
                      isDarkMode ? "bg-amber-500/10" : "bg-amber-50"
                    }`}
                  >
                    <p className="text-2xl font-bold text-amber-500">{previewMeta?.evidenceCount}</p>
                    <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Evidence</p>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "templates" ? (
            // Templates Browser
            <div className="space-y-4">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  onClick={() => navigateToBreadcrumb(-1)}
                  className={`text-sm px-2 py-1 rounded hover:bg-white/10 ${
                    isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Templates
                </button>
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center">
                    <ChevronRight className={`h-4 w-4 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`} />
                    <button
                      onClick={() => navigateToBreadcrumb(index)}
                      className={`text-sm px-2 py-1 rounded hover:bg-white/10 ${
                        isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {crumb}
                    </button>
                  </div>
                ))}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className={`h-8 w-8 animate-spin ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                </div>
              ) : templateFiles.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className={`h-12 w-12 mx-auto mb-3 ${isDarkMode ? "text-gray-600" : "text-gray-300"}`} />
                  <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    No templates found
                  </p>
                  <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                    Configure NEXT_PUBLIC_GITHUB_TEMPLATES_OWNER and NEXT_PUBLIC_GITHUB_TEMPLATES_REPO
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {templateFiles.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => handleTemplateClick(file)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                        isDarkMode
                          ? "bg-[#1a1a1a] border-white/10 hover:bg-[#222] hover:border-indigo-500/30"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-indigo-300"
                      }`}
                    >
                      {file.type === "dir" ? (
                        <FolderOpen className={`h-5 w-5 ${isDarkMode ? "text-amber-400" : "text-amber-500"}`} />
                      ) : (
                        <FileJson className={`h-5 w-5 ${isDarkMode ? "text-indigo-400" : "text-indigo-500"}`} />
                      )}
                      <span className={`flex-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {file.name.replace(".json", "")}
                      </span>
                      <ChevronRight className={`h-4 w-4 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Custom Import Form
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="github-url"
                  className={`font-medium mb-2 block ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  GitHub URL or Path
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon
                      className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                    <Input
                      id="github-url"
                      type="text"
                      placeholder="owner/repo/path/file.json or GitHub URL"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleFetchCustom()}
                      className={`pl-10 ${
                        isDarkMode
                          ? "bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  <Button
                    onClick={handleFetchCustom}
                    disabled={isLoading || !githubUrl.trim()}
                    className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch"}
                  </Button>
                </div>
                <p className={`text-xs mt-2 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                  Examples: owner/repo/workflows/template.json or
                  https://github.com/owner/repo/blob/main/file.json
                </p>
              </div>

              <div>
                <button
                  onClick={() => setShowToken(!showToken)}
                  className={`flex items-center gap-2 text-sm ${
                    isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Key className="h-4 w-4" />
                  {showToken ? "Hide" : "Show"} GitHub Token (for private repos)
                </button>

                {showToken && (
                  <div className="mt-2">
                    <Input
                      type="password"
                      placeholder="ghp_xxxx (optional)"
                      value={customToken}
                      onChange={(e) => setCustomToken(e.target.value)}
                      className={`${
                        isDarkMode
                          ? "bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500"
                          : "border-gray-300"
                      }`}
                    />
                    <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                      Your token is sent securely and never stored
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`border-t p-6 flex justify-end gap-3 ${
            isDarkMode ? "border-white/10 bg-[#0a0a0a]/50" : "border-gray-200 bg-gray-50"
          }`}
        >
          <Button
            onClick={onClose}
            variant="outline"
            className={`px-6 ${
              isDarkMode ? "bg-transparent border-white/10 text-gray-300 hover:bg-white/10" : ""
            }`}
          >
            Cancel
          </Button>
          {preview && (
            <Button
              onClick={handleImport}
              className="px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Import Workflow
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
