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
  X
} from "lucide-react"
import type { Evidence, EvidenceType } from "@/types/evidence"

interface EvidenceRepositoryProps {
  isOpen: boolean
  onClose: () => void
  evidence: Evidence[]
  onAddEvidence: (evidence: Omit<Evidence, "id" | "createdAt" | "updatedAt">) => void
  onDeleteEvidence: (id: string) => void
  onUpdateEvidence: (id: string, updates: Partial<Evidence>) => void
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
  evidence,
  onAddEvidence,
  onDeleteEvidence,
  onUpdateEvidence,
}: EvidenceRepositoryProps) {
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<EvidenceType | "all">("all")
  
  // New evidence form state
  const [newEvidence, setNewEvidence] = useState({
    name: "",
    type: "Policy" as EvidenceType,
    owner: "",
    mandatory: true,
    description: "",
  })

  const handleAddEvidence = () => {
    if (!newEvidence.name.trim() || !newEvidence.owner.trim()) return
    
    onAddEvidence(newEvidence)
    setNewEvidence({
      name: "",
      type: "Policy",
      owner: "",
      mandatory: true,
      description: "",
    })
    setIsAddingNew(false)
  }

  const filteredEvidence = evidence.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.owner.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || e.type === filterType
    return matchesSearch && matchesType
  })

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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Document
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
                  disabled={!newEvidence.name.trim() || !newEvidence.owner.trim()}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Add Document
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
                    className="border border-gray-200 rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${evidenceTypeColors[doc.type]} border`}>
                            <span className="flex items-center gap-1">
                              {evidenceTypeIcons[doc.type]}
                              {doc.type}
                            </span>
                          </Badge>
                          <Badge variant={doc.mandatory ? "destructive" : "outline"} className="text-xs">
                            {doc.mandatory ? "Mandatory" : "Advisory"}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-gray-900 truncate">{doc.name}</h4>
                        <p className="text-xs text-gray-500">Owner: {doc.owner}</p>
                        {doc.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{doc.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteEvidence(doc.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
