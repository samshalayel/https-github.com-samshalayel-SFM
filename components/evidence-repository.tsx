"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  FileText, 
  Plus, 
  Trash2, 
  Search,
  BookOpen,
  Scale,
  Briefcase,
  FileSearch,
  Settings2,
  X,
  Upload,
  File,
  ExternalLink,
  Loader2,
  ChevronDown,
  ChevronRight
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Evidence, EvidenceType } from "@/types/evidence"
import type { Node } from "reactflow"

interface EvidenceRepositoryProps {
  isOpen: boolean
  onClose: () => void
  nodes: Node[]
  isDarkMode: boolean
  evidence: Evidence[]
  setEvidence: React.Dispatch<React.SetStateAction<Evidence[]>>
}

const evidenceTypeIcons: Record<EvidenceType, React.ReactNode> = {
  Policy: <BookOpen className="h-4 w-4" />,
  Strategy: <Settings2 className="h-4 w-4" />,
  Legal: <Scale className="h-4 w-4" />,
  Ops: <Briefcase className="h-4 w-4" />,
  Research: <FileSearch className="h-4 w-4" />,
}

const evidenceTypeColors: Record<EvidenceType, string> = {
  Policy: "bg-blue-100 text-blue-800 border-blue-200",
  Strategy: "bg-purple-100 text-purple-800 border-purple-200",
  Legal: "bg-red-100 text-red-800 border-red-200",
  Ops: "bg-green-100 text-green-800 border-green-200",
  Research: "bg-amber-100 text-amber-800 border-amber-200",
}

export default function EvidenceRepository({
  isOpen,
  onClose,
  nodes,
  isDarkMode,
  evidence,
  setEvidence,
}: EvidenceRepositoryProps) {
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<EvidenceType | "all">("all")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set())

  const toggleDocExpanded = (docId: string) => {
    setExpandedDocs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(docId)) {
        newSet.delete(docId)
      } else {
        newSet.add(docId)
      }
      return newSet
    })
  }
  
  // New evidence form state
  const [newEvidence, setNewEvidence] = useState({
    name: "",
    type: "Policy" as EvidenceType,
    owner: "",
    mandatory: true,
    description: "",
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setUploadError(null)
    
    if (file) {
      // Validate file type
      if (file.type !== "application/pdf") {
        setUploadError("Only PDF files are allowed")
        setSelectedFile(null)
        return
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("File size must be less than 10MB")
        setSelectedFile(null)
        return
      }
      
      setSelectedFile(file)
    }
  }

  const handleAddEvidence = async () => {
    if (!newEvidence.name.trim() || !newEvidence.owner.trim()) return
    
    setIsUploading(true)
    setUploadError(null)
    
    let fileUrl: string | undefined
    let fileName: string | undefined
    
    try {
      // Upload file if selected
      if (selectedFile) {
        const supabase = createClient()
        const fileExt = selectedFile.name.split(".").pop()
        const filePath = `evidence/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, selectedFile)
        
        if (uploadError) {
          console.log("[v0] Upload error:", uploadError)
          throw new Error(uploadError.message)
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from("documents")
          .getPublicUrl(filePath)
        
        fileUrl = urlData.publicUrl
        fileName = selectedFile.name
      }
      
      const newDoc: Evidence = {
        id: `evidence-${Date.now()}`,
        ...newEvidence,
        fileUrl,
        fileName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      setEvidence((prev) => [...prev, newDoc])
      setNewEvidence({
        name: "",
        type: "Policy",
        owner: "",
        mandatory: true,
        description: "",
      })
      setSelectedFile(null)
      setIsAddingNew(false)
    } catch (error) {
      console.log("[v0] Error adding evidence:", error)
      setUploadError(error instanceof Error ? error.message : "Failed to upload file")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteEvidence = (id: string) => {
    setEvidence((prev) => prev.filter((e) => e.id !== id))
  }

  const filteredEvidence = evidence.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.owner.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || e.type === filterType
    return matchesSearch && matchesType
  })

  const onDeleteEvidence = (id: string) => {
    handleDeleteEvidence(id)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[500px] sm:w-[600px] bg-white">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-gray-900">
            <FileText className="h-5 w-5 text-blue-600" />
            Evidence Repository
          </SheetTitle>
          <SheetDescription className="text-gray-600">
            Manage organizational documents that support workflow decisions.
            Documents are evidence, not workflow nodes.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-gray-100 border-gray-300 text-gray-900"
              />
            </div>
            <Select value={filterType} onValueChange={(v) => setFilterType(v as EvidenceType | "all")}>
              <SelectTrigger className="w-[130px] bg-gray-100 border-gray-300 text-gray-900">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Policy">Policy</SelectItem>
                <SelectItem value="Strategy">Strategy</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
                <SelectItem value="Ops">Operations</SelectItem>
                <SelectItem value="Research">Research</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Add New Button */}
          {!isAddingNew && (
            <Button
              onClick={() => setIsAddingNew(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white">
                <Plus className="h-3 w-3" />
              </div>
              Upload New Document
            </Button>
          )}

          {/* Add New Form */}
          {isAddingNew && (
            <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">New Document</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingNew(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="name" className="text-gray-700">Document Name *</Label>
                  <Input
                    id="name"
                    value={newEvidence.name}
                    onChange={(e) => setNewEvidence({ ...newEvidence, name: e.target.value })}
                    placeholder="e.g., Data Privacy Policy 2024"
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="type" className="text-gray-700">Type *</Label>
                    <Select
                      value={newEvidence.type}
                      onValueChange={(v) => setNewEvidence({ ...newEvidence, type: v as EvidenceType })}
                    >
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Policy">Policy</SelectItem>
                        <SelectItem value="Strategy">Strategy</SelectItem>
                        <SelectItem value="Legal">Legal</SelectItem>
                        <SelectItem value="Ops">Operations</SelectItem>
                        <SelectItem value="Research">Research</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="owner" className="text-gray-700">Owner *</Label>
                    <Input
                      id="owner"
                      value={newEvidence.owner}
                      onChange={(e) => setNewEvidence({ ...newEvidence, owner: e.target.value })}
                      placeholder="e.g., Legal Dept"
                      className="bg-white border-gray-300 text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-700">Description</Label>
                  <Textarea
                    id="description"
                    value={newEvidence.description}
                    onChange={(e) => setNewEvidence({ ...newEvidence, description: e.target.value })}
                    placeholder="Brief description of the document..."
                    className="bg-white border-gray-300 text-gray-900 h-20"
                  />
                </div>

                {/* PDF Upload Field */}
                <div>
                  <Label htmlFor="file" className="text-gray-700">Attach PDF (Optional)</Label>
                  <div className="mt-1">
                    <label
                      htmlFor="file"
                      className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        selectedFile 
                          ? "border-green-400 bg-green-50" 
                          : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                      }`}
                    >
                      {selectedFile ? (
                        <>
                          <File className="h-5 w-5 text-green-600" />
                          <span className="text-sm text-green-700 truncate max-w-[200px]">
                            {selectedFile.name}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              setSelectedFile(null)
                            }}
                            className="h-6 w-6 p-0 ml-2 text-gray-500 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            Click to upload PDF (max 10MB)
                          </span>
                        </>
                      )}
                    </label>
                    <input
                      id="file"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  {uploadError && (
                    <p className="text-xs text-red-500 mt-1">{uploadError}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newEvidence.mandatory}
                      onCheckedChange={(checked) => setNewEvidence({ ...newEvidence, mandatory: checked })}
                    />
                    <Label className="text-gray-700">
                      {newEvidence.mandatory ? "Mandatory" : "Advisory"}
                    </Label>
                  </div>
                  <Badge variant={newEvidence.mandatory ? "destructive" : "secondary"}>
                    {newEvidence.mandatory ? "Required for approval" : "Optional reference"}
                  </Badge>
                </div>

                <Button
                  onClick={handleAddEvidence}
                  disabled={!newEvidence.name.trim() || !newEvidence.owner.trim() || isUploading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Add Document"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Evidence List */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 pr-4">
              {filteredEvidence.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {evidence.length === 0 ? (
                    <>
                      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No documents in repository</p>
                      <p className="text-sm">Add organizational documents to reference in your workflow</p>
                    </>
                  ) : (
                    <p>No documents match your search</p>
                  )}
                </div>
) : (
                filteredEvidence.map((doc) => (
                    <div
                      key={doc.id}
                      className="border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors overflow-hidden"
                    >
                      <div
                        className="flex items-center gap-2 p-3 cursor-pointer"
                        onClick={() => toggleDocExpanded(doc.id)}
                      >
                        <button type="button" className="flex-shrink-0 text-gray-500 hover:text-gray-700">
                          {expandedDocs.has(doc.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        <Badge className={`${evidenceTypeColors[doc.type]} border flex-shrink-0`}>
                          <span className="flex items-center gap-1">
                            {evidenceTypeIcons[doc.type]}
                            {doc.type}
                          </span>
                        </Badge>
                        <h4 className="font-medium text-gray-900 truncate flex-1">{doc.name}</h4>
                        <Badge variant={doc.mandatory ? "destructive" : "outline"} className="text-xs flex-shrink-0">
                          {doc.mandatory ? "Mandatory" : "Advisory"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteEvidence(doc.id)
                          }}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {expandedDocs.has(doc.id) && (
                        <div className="px-3 pb-3 pt-0 ml-6 border-t border-gray-100">
                          <div className="pt-2 space-y-2">
                            <p className="text-xs text-gray-500">
                              <span className="font-medium">Owner:</span> {doc.owner}
                            </p>
                            {doc.description && (
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Description:</span> {doc.description}
                              </p>
                            )}
                            {doc.fileUrl && (
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                              >
                                <File className="h-3 w-3" />
                                <span className="truncate max-w-[200px]">{doc.fileName || "View PDF"}</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                            <p className="text-xs text-gray-400">
                              Added: {new Date(doc.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </ScrollArea>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Mental Model:</strong> Documents = Evidence, Nodes = Thinking, Gates = Validation.
              Documents support decisions, they do not drive them.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
