"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Handle, Position, useReactFlow } from "reactflow"
import { 
  Trash2, 
  FileText, 
  File, 
  ExternalLink, 
  X,
  Loader2,
  BookOpen,
  Scale,
  Briefcase,
  FileSearch,
  Settings2,
  Plus,
  ChevronDown,
  ChevronRight
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import type { EvidenceType } from "@/types/evidence"

interface UploadedFile {
  id: string
  url: string
  name: string
}

interface EvidenceNodeData {
  label: string
  description?: string
  evidenceType: EvidenceType
  owner: string
  mandatory: boolean
  fileUrl?: string
  fileName?: string
  files?: UploadedFile[]
  justification?: string
}

interface EvidenceNodeProps {
  data: EvidenceNodeData
  id: string
}

const evidenceTypeIcons: Record<EvidenceType, React.ReactNode> = {
  Policy: <BookOpen className="h-4 w-4" />,
  Strategy: <Settings2 className="h-4 w-4" />,
  Legal: <Scale className="h-4 w-4" />,
  Ops: <Briefcase className="h-4 w-4" />,
  Research: <FileSearch className="h-4 w-4" />,
}

const evidenceTypeColors: Record<EvidenceType, { bg: string; border: string; text: string }> = {
  Policy: { bg: "from-blue-500 to-blue-600", border: "border-blue-400", text: "text-blue-100" },
  Strategy: { bg: "from-purple-500 to-purple-600", border: "border-purple-400", text: "text-purple-100" },
  Legal: { bg: "from-red-500 to-red-600", border: "border-red-400", text: "text-red-100" },
  Ops: { bg: "from-green-500 to-green-600", border: "border-green-400", text: "text-green-100" },
  Research: { bg: "from-amber-500 to-amber-600", border: "border-amber-400", text: "text-amber-100" },
}

export default function EvidenceNode({ data, id }: EvidenceNodeProps) {
  const { deleteElements, setNodes } = useReactFlow()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isFilesExpanded, setIsFilesExpanded] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const evidenceType = data.evidenceType || "Policy"
  const colors = evidenceTypeColors[evidenceType]
  
  // Get files array (support both old single file and new multiple files format)
  const files: UploadedFile[] = data.files || (data.fileUrl ? [{ id: '1', url: data.fileUrl, name: data.fileName || 'Document.pdf' }] : [])

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteElements({ nodes: [{ id }] })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    setUploadError(null)

    if (!selectedFiles || selectedFiles.length === 0) return

    setIsUploading(true)
    const newFiles: UploadedFile[] = []

    try {
      const supabase = createClient()

      for (const file of Array.from(selectedFiles)) {
        // Validate file type
        if (file.type !== "application/pdf") {
          setUploadError(`${file.name}: Only PDF files are allowed`)
          continue
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setUploadError(`${file.name}: File size must be less than 10MB`)
          continue
        }

        const fileExt = file.name.split(".").pop()
        const filePath = `evidence/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        const { error: uploadErr } = await supabase.storage
          .from("documents")
          .upload(filePath, file)

        if (uploadErr) {
          console.log("[v0] Error uploading file:", uploadErr)
          continue
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("documents")
          .getPublicUrl(filePath)

        newFiles.push({
          id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
          url: urlData.publicUrl,
          name: file.name,
        })
      }

      if (newFiles.length > 0) {
        // Update node data with new files
        setNodes((nodes) =>
          nodes.map((node) => {
            if (node.id === id) {
              const existingFiles = node.data.files || []
              return {
                ...node,
                data: {
                  ...node.data,
                  files: [...existingFiles, ...newFiles],
                },
              }
            }
            return node
          })
        )
      }
    } catch (error) {
      console.log("[v0] Error uploading files:", error)
      setUploadError(error instanceof Error ? error.message : "Failed to upload files")
    } finally {
      setIsUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveFile = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation()
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          const currentFiles = node.data.files || []
          return {
            ...node,
            data: {
              ...node.data,
              files: currentFiles.filter((f: UploadedFile) => f.id !== fileId),
              fileUrl: undefined,
              fileName: undefined,
            },
          }
        }
        return node
      })
    )
  }

  const triggerFileInput = (e: React.MouseEvent) => {
    e.stopPropagation()
    fileInputRef.current?.click()
  }

  return (
    <div className={`shadow-lg rounded-2xl border-2 ${colors.border} bg-gradient-to-br ${colors.bg} min-w-[280px] max-w-[320px] overflow-hidden hover:shadow-xl transition-all duration-200 group`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-white border-2 border-gray-300" />

      {/* Top section with type badge and mandatory status */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-white/20">
        <div className="flex items-center gap-2">
          <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
            <span className="flex items-center gap-1">
              {evidenceTypeIcons[evidenceType]}
              {evidenceType}
            </span>
          </Badge>
        </div>
        <Badge 
          variant={data.mandatory ? "destructive" : "secondary"} 
          className={data.mandatory ? "bg-red-600/80 text-white" : "bg-white/20 text-white border-white/30"}
        >
          {data.mandatory ? "Mandatory" : "Advisory"}
        </Badge>
      </div>

      {/* Main content area */}
      <div className="px-4 py-4 relative">
        <button
          onClick={handleDelete}
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 hover:bg-white/20 rounded-lg"
          title="Delete node"
        >
          <Trash2 className="h-4 w-4 text-white" />
        </button>

        <div className="flex items-center gap-2 mb-2 justify-center">
          <FileText className="h-5 w-5 text-white" />
          <div className="font-bold text-base text-white">{data.label}</div>
        </div>

        {data.owner && (
          <div className="text-xs text-white/70 text-center mb-2">
            Owner: {data.owner}
          </div>
        )}

        {data.description && (
          <div className={`text-xs ${colors.text} leading-relaxed text-center mb-3`}>
            {data.description}
          </div>
        )}

        {/* File upload/display area */}
        <div className="mt-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            onChange={handleFileChange}
            className="hidden"
            onClick={(e) => e.stopPropagation()}
          />
          
          {files.length > 0 ? (
            <div className="space-y-2">
              {/* Header with collapse/expand and add button */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsFilesExpanded(!isFilesExpanded)
                  }}
                  className="flex items-center gap-1 text-xs text-white/80 hover:text-white"
                >
                  {isFilesExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                  <span>{files.length} file{files.length > 1 ? 's' : ''}</span>
                </button>
                <button
                  type="button"
                  onClick={triggerFileInput}
                  disabled={isUploading}
                  className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  title="Add more files"
                >
                  {isUploading ? (
                    <Loader2 className="h-3 w-3 text-white animate-spin" />
                  ) : (
                    <Plus className="h-3 w-3 text-white" />
                  )}
                </button>
              </div>
              
              {/* Files list - collapsible */}
              {isFilesExpanded && (
                <div className="space-y-1">
                  {files.map((file) => (
                    <div key={file.id} className="bg-white/10 rounded-lg p-2 flex items-center justify-between gap-2">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-white hover:text-white/80 truncate flex-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <File className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{file.name}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveFile(e, file.id)}
                        className="p-1 hover:bg-white/20 rounded"
                        title="Remove file"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={triggerFileInput}
              disabled={isUploading}
              className="w-full bg-white/10 hover:bg-white/20 border border-dashed border-white/30 rounded-lg p-3 flex items-center justify-center gap-2 text-xs text-white transition-colors"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white/50">
                    <Plus className="h-3 w-3" />
                  </div>
                  <span>Upload PDF</span>
                </>
              )}
            </button>
          )}
          
          {uploadError && (
            <p className="text-xs text-red-200 mt-1 text-center">{uploadError}</p>
          )}
        </div>

        {/* Justification field display */}
        {data.justification && (
          <div className="mt-3 bg-white/10 rounded-lg p-2">
            <div className="text-xs text-white/60 mb-1">Justification:</div>
            <div className="text-xs text-white">{data.justification}</div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-white border-2 border-gray-300" />
    </div>
  )
}
