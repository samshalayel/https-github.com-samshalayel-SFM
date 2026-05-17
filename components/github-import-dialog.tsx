"use client"

import { useState, useEffect } from "react"
import {
  X, Github, Loader2, FileJson, FolderOpen, ChevronRight,
  AlertCircle, Download, Key, RefreshCw, Save, Home, Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface GitHubFile {
  name: string
  path: string
  type: "file" | "dir"
  size?: number
}

interface GitHubImportDialogProps {
  isOpen: boolean
  onClose: () => void
  onImport: (workflow: { nodes: any[]; edges: any[]; name?: string; evidence?: any[] }) => void
  isDarkMode?: boolean
  currentNodes?: any[]
  currentEdges?: any[]
}

const LS_REPO_KEY = "sfm_gh_repo"
const LS_TOKEN_KEY = "sfm_gh_token"
const LS_BRANCH_KEY = "sfm_gh_branch"

export default function GitHubImportDialog({
  isOpen,
  onClose,
  onImport,
  isDarkMode = true,
  currentNodes = [],
  currentEdges = [],
}: GitHubImportDialogProps) {
  const [repo, setRepo] = useState("")
  const [token, setToken] = useState("")
  const [branch, setBranch] = useState("main")
  const [showToken, setShowToken] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [files, setFiles] = useState<GitHubFile[]>([])
  const [currentPath, setCurrentPath] = useState("")
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([])
  const [preview, setPreview] = useState<any | null>(null)
  const [previewFile, setPreviewFile] = useState<string>("")
  const [saveFileName, setSaveFileName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [view, setView] = useState<"browse" | "preview" | "save">("browse")

  // Load saved settings
  useEffect(() => {
    if (typeof window !== "undefined") {
      setRepo(localStorage.getItem(LS_REPO_KEY) || "")
      setToken(localStorage.getItem(LS_TOKEN_KEY) || "")
      setBranch(localStorage.getItem(LS_BRANCH_KEY) || "main")
    }
  }, [])

  if (!isOpen) return null

  const saveSettings = () => {
    localStorage.setItem(LS_REPO_KEY, repo)
    localStorage.setItem(LS_TOKEN_KEY, token)
    localStorage.setItem(LS_BRANCH_KEY, branch)
  }

  const browsePath = async (path = "") => {
    if (!repo.trim()) { setError("أدخل اسم الريبو (owner/repo)"); return }
    setIsLoading(true)
    setError(null)
    saveSettings()

    try {
      const res = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list", repo: repo.trim(), path, token: token || undefined, ref: branch }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "فشل في تحميل الملفات")
      setFiles(data.files || [])
      setCurrentPath(path)
      setBreadcrumbs(path ? path.split("/") : [])
      setView("browse")
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFile = async (filePath: string) => {
    setIsLoading(true)
    setError(null)
    saveSettings()

    try {
      const res = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "fetch", repo: repo.trim(), path: filePath, token: token || undefined, ref: branch }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "فشل في تحميل الملف")
      if (!data.content?.nodes) throw new Error("الملف لا يحتوي على workflow صحيح")
      setPreview(data.content)
      setPreviewFile(filePath)
      setView("preview")
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!saveFileName.trim()) { setError("أدخل اسم الملف"); return }
    if (!repo.trim()) { setError("أدخل اسم الريبو"); return }
    if (!token.trim()) { setError("Token مطلوب للحفظ"); return }
    setIsSaving(true)
    setError(null)
    saveSettings()

    const fileName = saveFileName.trim().endsWith(".json") ? saveFileName.trim() : `${saveFileName.trim()}.json`
    const savePath = currentPath ? `${currentPath}/${fileName}` : fileName

    try {
      const res = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          repo: repo.trim(),
          path: savePath,
          token: token.trim(),
          ref: branch,
          content: { nodes: currentNodes, edges: currentEdges },
          message: `Save workflow: ${fileName}`,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "فشل الحفظ")
      setSaveSuccess(true)
      setTimeout(() => { setSaveSuccess(false); setView("browse"); browsePath(currentPath) }, 2000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsSaving(false)
    }
  }

  const navigateBreadcrumb = (index: number) => {
    const newPath = index === -1 ? "" : breadcrumbs.slice(0, index + 1).join("/")
    browsePath(newPath)
  }

  const bg = isDarkMode ? "bg-[#111111] border-white/10" : "bg-white border-gray-200"
  const text = isDarkMode ? "text-white" : "text-gray-900"
  const sub = isDarkMode ? "text-gray-400" : "text-gray-500"
  const inputCls = isDarkMode ? "bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500" : "border-gray-300"
  const rowCls = isDarkMode
    ? "bg-[#1a1a1a] border-white/10 hover:bg-[#222] hover:border-indigo-500/30"
    : "bg-gray-50 border-gray-200 hover:bg-gray-100"

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm ${isDarkMode ? "bg-black/60" : "bg-black/50"}`}>
      <div className={`rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border ${bg}`}>

        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-5 text-white flex items-center justify-between flex-shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Github className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">GitHub Browser</h2>
              <p className="text-gray-300 text-xs mt-0.5">Browse, import and save workflows</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors"><X className="h-5 w-5" /></button>
        </div>

        {/* Repo settings */}
        <div className={`p-4 border-b flex-shrink-0 ${isDarkMode ? "border-white/10 bg-[#0d0d0d]" : "border-gray-200 bg-gray-50"}`}>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label className={`text-xs mb-1 block ${sub}`}>Repo (owner/repo)</Label>
              <Input
                placeholder="samshalayel/my-workflows"
                value={repo}
                onChange={e => setRepo(e.target.value)}
                onKeyDown={e => e.key === "Enter" && browsePath()}
                className={`h-8 text-sm ${inputCls}`}
              />
            </div>
            <div className="w-24">
              <Label className={`text-xs mb-1 block ${sub}`}>Branch</Label>
              <Input
                placeholder="main"
                value={branch}
                onChange={e => setBranch(e.target.value)}
                className={`h-8 text-sm ${inputCls}`}
              />
            </div>
            <button
              onClick={() => setShowToken(!showToken)}
              className={`h-8 px-2 rounded border text-xs flex items-center gap-1 ${isDarkMode ? "border-white/10 text-gray-400 hover:text-white hover:border-white/30" : "border-gray-300 text-gray-500 hover:text-gray-700"}`}
            >
              <Key className="h-3.5 w-3.5" />{showToken ? "Hide" : "Token"}
            </button>
            <Button onClick={() => browsePath()} disabled={isLoading || !repo.trim()} className="h-8 px-3 text-sm bg-indigo-600 hover:bg-indigo-700 text-white">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Open"}
            </Button>
          </div>
          {showToken && (
            <Input
              type="password"
              placeholder="ghp_xxxx (required for private repos and saving)"
              value={token}
              onChange={e => setToken(e.target.value)}
              className={`h-8 text-sm mt-2 ${inputCls}`}
            />
          )}
        </div>

        {/* Error */}
        {error && (
          <div className={`mx-4 mt-3 p-3 rounded-lg flex items-start gap-2 flex-shrink-0 ${isDarkMode ? "bg-red-500/10 border border-red-500/20" : "bg-red-50 border border-red-200"}`}>
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className={`text-sm flex-1 ${isDarkMode ? "text-red-400" : "text-red-600"}`}>{error}</p>
            <button onClick={() => setError(null)}><X className="h-4 w-4 text-red-500" /></button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {view === "preview" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold ${text}`}>Preview: {previewFile.split("/").pop()}</h3>
                <Button onClick={() => setView("browse")} variant="ghost" size="sm" className={sub}>
                  <RefreshCw className="h-4 w-4 mr-1" /> Back
                </Button>
              </div>
              <div className={`p-4 rounded-lg border ${isDarkMode ? "bg-[#1a1a1a] border-white/10" : "bg-gray-50 border-gray-200"}`}>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className={`p-3 rounded-lg ${isDarkMode ? "bg-indigo-500/10" : "bg-indigo-50"}`}>
                    <p className="text-2xl font-bold text-indigo-500">{preview?.nodes?.length || 0}</p>
                    <p className={`text-xs ${sub}`}>Nodes</p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDarkMode ? "bg-purple-500/10" : "bg-purple-50"}`}>
                    <p className="text-2xl font-bold text-purple-500">{preview?.edges?.length || 0}</p>
                    <p className={`text-xs ${sub}`}>Connections</p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDarkMode ? "bg-amber-500/10" : "bg-amber-50"}`}>
                    <p className="text-2xl font-bold text-amber-500">{preview?.evidence?.length || 0}</p>
                    <p className={`text-xs ${sub}`}>Evidence</p>
                  </div>
                </div>
              </div>
            </div>
          ) : view === "save" ? (
            <div className="space-y-4">
              <h3 className={`font-semibold ${text}`}>Save to GitHub</h3>
              <div className={`p-3 rounded-lg text-sm ${isDarkMode ? "bg-[#1a1a1a] border border-white/10 text-gray-400" : "bg-gray-50 border border-gray-200 text-gray-600"}`}>
                Path: <span className={`font-mono ${isDarkMode ? "text-white" : "text-gray-900"}`}>{currentPath || "/"}</span>
              </div>
              <div>
                <Label className={`text-xs mb-1 block ${sub}`}>File name</Label>
                <Input
                  placeholder="my-workflow.json"
                  value={saveFileName}
                  onChange={e => setSaveFileName(e.target.value)}
                  className={`${inputCls}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className={`p-3 rounded-lg text-center ${isDarkMode ? "bg-indigo-500/10" : "bg-indigo-50"}`}>
                  <p className="text-xl font-bold text-indigo-500">{currentNodes.length}</p>
                  <p className={sub}>Nodes</p>
                </div>
                <div className={`p-3 rounded-lg text-center ${isDarkMode ? "bg-purple-500/10" : "bg-purple-50"}`}>
                  <p className="text-xl font-bold text-purple-500">{currentEdges.length}</p>
                  <p className={sub}>Edges</p>
                </div>
              </div>
              {saveSuccess && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center font-medium">
                  ✅ تم الحفظ بنجاح على GitHub!
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Breadcrumbs */}
              {files.length > 0 || currentPath ? (
                <div className="flex items-center gap-1 flex-wrap text-sm">
                  <button onClick={() => browsePath("")} className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 ${sub}`}>
                    <Home className="h-3.5 w-3.5" /> Root
                  </button>
                  {breadcrumbs.map((crumb, i) => (
                    <div key={i} className="flex items-center">
                      <ChevronRight className={`h-3.5 w-3.5 ${sub}`} />
                      <button onClick={() => navigateBreadcrumb(i)} className={`px-2 py-1 rounded hover:bg-white/10 ${sub} hover:${text}`}>{crumb}</button>
                    </div>
                  ))}
                </div>
              ) : null}

              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className={`h-8 w-8 animate-spin ${sub}`} />
                </div>
              ) : files.length === 0 && !isLoading ? (
                <div className="text-center py-12">
                  <Github className={`h-12 w-12 mx-auto mb-3 ${isDarkMode ? "text-gray-600" : "text-gray-300"}`} />
                  <p className={sub}>أدخل اسم الريبو واضغط Open</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {files.map(file => (
                    <button
                      key={file.path}
                      onClick={() => file.type === "dir" ? browsePath(file.path) : fetchFile(file.path)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${rowCls}`}
                    >
                      {file.type === "dir"
                        ? <FolderOpen className={`h-5 w-5 ${isDarkMode ? "text-amber-400" : "text-amber-500"}`} />
                        : <FileJson className={`h-5 w-5 ${isDarkMode ? "text-indigo-400" : "text-indigo-500"}`} />
                      }
                      <span className={`flex-1 text-sm ${text}`}>{file.name.replace(".json", "")}</span>
                      {file.type === "dir"
                        ? <ChevronRight className={`h-4 w-4 ${sub}`} />
                        : <Eye className={`h-4 w-4 ${sub}`} />
                      }
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`border-t p-4 flex justify-between items-center flex-shrink-0 ${isDarkMode ? "border-white/10 bg-[#0a0a0a]/50" : "border-gray-200 bg-gray-50"}`}>
          <div className="flex gap-2">
            {view === "browse" && files.length > 0 && (
              <Button
                onClick={() => { setSaveFileName(""); setView("save") }}
                variant="outline"
                size="sm"
                className={isDarkMode ? "border-white/10 text-gray-300 hover:bg-white/10" : ""}
              >
                <Save className="h-4 w-4 mr-1.5" /> Save Here
              </Button>
            )}
            {view !== "browse" && (
              <Button onClick={() => setView("browse")} variant="ghost" size="sm" className={sub}>
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline" size="sm" className={isDarkMode ? "bg-transparent border-white/10 text-gray-300 hover:bg-white/10" : ""}>
              Cancel
            </Button>
            {view === "preview" && (
              <Button
                onClick={() => { onImport({ nodes: preview.nodes, edges: preview.edges, evidence: preview.evidence, name: previewFile.split("/").pop()?.replace(".json", "") }); onClose() }}
                size="sm"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <Download className="h-4 w-4 mr-1.5" /> Import
              </Button>
            )}
            {view === "save" && (
              <Button
                onClick={handleSave}
                disabled={isSaving || !saveFileName.trim()}
                size="sm"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
                Save to GitHub
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
