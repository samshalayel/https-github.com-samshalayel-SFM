export type EvidenceType = "Policy" | "Strategy" | "Legal" | "Ops" | "Research"

export interface Evidence {
  id: string
  name: string
  type: EvidenceType
  owner: string
  mandatory: boolean // true = Mandatory, false = Advisory
  description?: string
  fileUrl?: string // URL to uploaded PDF file in Supabase Storage
  fileName?: string // Original file name
  createdAt: string
  updatedAt: string
}

export interface NodeEvidenceLink {
  evidenceId: string
  justification?: string // Why this evidence supports the node
}

export interface NodeEvidenceState {
  linkedEvidence: NodeEvidenceLink[]
  noFormalDocument: boolean // "No formal document – expert judgment"
  expertJustification?: string // Required if noFormalDocument is true
}
