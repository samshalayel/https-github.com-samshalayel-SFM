"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { X, Plus, Trash2, User, Cpu, AlertTriangle, GripVertical, FolderOpen, Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { WorkflowNode } from "@/lib/types"
import CodeEditor from "./code-editor"
import SeesawIcon from "./seesaw-icon"

interface NodeConfigPanelProps {
  node: WorkflowNode
  updateNodeData: (nodeId: string, data: any) => void
  onClose: () => void
  isDarkMode?: boolean
  existingGroups?: string[]
}

export default function NodeConfigPanel({ node, updateNodeData, onClose, isDarkMode = false, existingGroups = [] }: NodeConfigPanelProps) {
  const [localData, setLocalData] = useState({ ...node.data })
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 250, y: 100 })
  const [size, setSize] = useState({ width: 500, height: 500 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const panelRef = useRef<HTMLDivElement>(null)
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")

  useEffect(() => {
    setLocalData({ ...node.data })
  }, [node.id, node.data])

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".resize-handle")) return
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        })
      }
      if (isResizing) {
        const newWidth = Math.max(400, resizeStart.width + (e.clientX - resizeStart.x))
        const newHeight = Math.max(350, resizeStart.height + (e.clientY - resizeStart.y))
        setSize({ width: newWidth, height: newHeight })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, isResizing, dragStart, resizeStart])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isGroupDropdownOpen) {
        const target = e.target as HTMLElement
        if (!target.closest('.group-dropdown-container')) {
          setIsGroupDropdownOpen(false)
        }
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isGroupDropdownOpen])

  const handleChange = (key: string, value: any) => {
    setLocalData((prev) => ({
      ...prev,
      [key]: value,
    }))
    updateNodeData(node.id, { [key]: value })
  }

  const addItemToList = (key: string) => {
    const currentList = (localData[key as keyof typeof localData] as string[]) || []
    handleChange(key, [...currentList, ""])
  }

  const updateListItem = (key: string, index: number, value: string) => {
    const currentList = (localData[key as keyof typeof localData] as string[]) || []
    const newList = [...currentList]
    newList[index] = value
    handleChange(key, newList)
  }

  const removeListItem = (key: string, index: number) => {
    const currentList = (localData[key as keyof typeof localData] as string[]) || []
    handleChange(
      key,
      currentList.filter((_, i) => i !== index),
    )
  }

  const addCustomField = () => {
    const currentFields = (localData.customFields as Record<string, string>) || {}
    const fieldName = `field_${Object.keys(currentFields).length + 1}`
    handleChange("customFields", { ...currentFields, [fieldName]: "" })
  }

  const updateCustomFieldKey = (oldKey: string, newKey: string) => {
    const currentFields = (localData.customFields as Record<string, string>) || {}
    const { [oldKey]: value, ...rest } = currentFields
    handleChange("customFields", { ...rest, [newKey]: value })
  }

  const updateCustomFieldValue = (key: string, value: string) => {
    const currentFields = (localData.customFields as Record<string, string>) || {}
    handleChange("customFields", { ...currentFields, [key]: value })
  }

  const removeCustomField = (key: string) => {
    const currentFields = (localData.customFields as Record<string, string>) || {}
    const { [key]: _, ...rest } = currentFields
    handleChange("customFields", rest)
  }

  const renderStageFields = () => {
    if (node.type?.startsWith("stage-")) {
      const stageNumber = localData.stageNumber || 0
      const humanPercentage = localData.humanPercentage || 95
      const aiPercentage = localData.aiPercentage || 5

      return (
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-4 text-sm pb-4 border-b">
            <div className="flex items-center gap-2 text-blue-600 font-medium">
              <User className="w-4 h-4" />
              <span>Human: {humanPercentage}%</span>
            </div>
            <SeesawIcon humanPercent={humanPercentage} aiPercent={aiPercentage} size={48} />
            <div className="flex items-center gap-2 text-purple-600 font-medium">
              <Cpu className="w-4 h-4" />
              <span>AI: {aiPercentage}%</span>
            </div>
          </div>

          <div className="text-sm text-gray-500">Configure stage responsibilities and constraints</div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="humanPercentage" className="flex items-center gap-2 text-blue-600">
                <User className="w-4 h-4" />
                Human %
              </Label>
              <Input
                id="humanPercentage"
                type="number"
                min="0"
                max="100"
                value={humanPercentage}
                onChange={(e) => {
                  const value = Number.parseInt(e.target.value) || 0
                  const clampedValue = Math.max(0, Math.min(100, value))
                  handleChange("humanPercentage", clampedValue)
                  handleChange("aiPercentage", 100 - clampedValue)
                }}
                className="font-medium bg-gray-100 border-gray-300 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aiPercentage" className="flex items-center gap-2 text-purple-600">
                <Cpu className="w-4 h-4" />
                AI %
              </Label>
              <Input
                id="aiPercentage"
                type="number"
                min="0"
                max="100"
                value={aiPercentage}
                onChange={(e) => {
                  const value = Number.parseInt(e.target.value) || 0
                  const clampedValue = Math.max(0, Math.min(100, value))
                  handleChange("aiPercentage", clampedValue)
                  handleChange("humanPercentage", 100 - clampedValue)
                }}
                className="font-medium bg-gray-100 border-gray-300 text-gray-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stageTitle">Stage Title</Label>
            <Input
              id="stageTitle"
              value={localData.label || ""}
              onChange={(e) => handleChange("label", e.target.value)}
              placeholder="Stage title"
              className="font-medium bg-gray-100 border-gray-300 text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={localData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              className="h-20 resize-none bg-gray-100 border-gray-300 text-gray-900"
              placeholder="Define the real problem and context"
            />
          </div>

          {/* Group Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-blue-600">
              <FolderOpen className="w-4 h-4" />
              Group
            </Label>
            <div className="relative group-dropdown-container">
              <button
                type="button"
                onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-900 text-sm hover:bg-gray-50 transition-colors"
              >
                <span className={localData.group ? "text-gray-900" : "text-gray-500"}>
                  {localData.group || "Select or add group..."}
                </span>
                <ChevronsUpDown className="w-4 h-4 text-gray-500" />
              </button>
              
              {isGroupDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {/* Add new group */}
                  <div className="p-2 border-b border-gray-100">
                    <div className="flex gap-2">
                      <Input
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="New group name..."
                        className="flex-1 h-8 text-sm bg-white"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newGroupName.trim()) {
                            handleChange("group", newGroupName.trim())
                            setNewGroupName("")
                            setIsGroupDropdownOpen(false)
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newGroupName.trim()) {
                            handleChange("group", newGroupName.trim())
                            setNewGroupName("")
                            setIsGroupDropdownOpen(false)
                          }
                        }}
                        className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* No group option */}
                  <button
                    type="button"
                    onClick={() => {
                      handleChange("group", "")
                      setIsGroupDropdownOpen(false)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <span className="flex-1 text-right">No group</span>
                    {!localData.group && <Check className="w-4 h-4 text-blue-500" />}
                  </button>
                  
                  {/* Existing groups */}
                  {existingGroups.length > 0 && (
                    <div className="border-t border-gray-100">
                      {existingGroups.map((group) => (
                        <button
                          key={group}
                          type="button"
                          onClick={() => {
                            handleChange("group", group)
                            setIsGroupDropdownOpen(false)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                        >
                          <FolderOpen className="w-4 h-4 text-blue-500" />
                          <span className="flex-1 text-right">{group}</span>
                          {localData.group === group && <Check className="w-4 h-4 text-blue-500" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <Label className="text-blue-600 font-semibold">Human Responsibilities</Label>
            </div>
            <div className="space-y-2">
              {((localData.humanResponsibilities as string[]) || []).map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateListItem("humanResponsibilities", index, e.target.value)}
                    placeholder="Add human responsibility"
                    className="flex-1 bg-gray-100 border-gray-300 text-gray-900"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeListItem("humanResponsibilities", index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                onClick={() => addItemToList("humanResponsibilities")}
                variant="outline"
                size="sm"
                className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 bg-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-600" />
              <Label className="text-purple-600 font-semibold">AI Responsibilities</Label>
            </div>
            <div className="space-y-2">
              {((localData.aiResponsibilities as string[]) || []).map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateListItem("aiResponsibilities", index, e.target.value)}
                    placeholder="Add AI responsibility"
                    className="flex-1 bg-gray-100 border-gray-300 text-gray-900"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeListItem("aiResponsibilities", index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                onClick={() => addItemToList("aiResponsibilities")}
                variant="outline"
                size="sm"
                className="w-full border-dashed border-purple-300 text-purple-600 hover:bg-purple-50 bg-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <Label className="text-red-600 font-semibold">Restrictions & Constraints</Label>
            </div>
            <div className="space-y-2">
              {((localData.restrictions as string[]) || []).map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateListItem("restrictions", index, e.target.value)}
                    placeholder="Add restriction"
                    className="flex-1 bg-gray-100 border-gray-300 text-gray-900"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeListItem("restrictions", index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                onClick={() => addItemToList("restrictions")}
                variant="outline"
                size="sm"
                className="w-full border-dashed border-red-300 text-red-600 hover:bg-red-50 bg-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="font-semibold">Additional Custom Fields</Label>
            <div className="space-y-2">
              {Object.entries((localData.customFields as Record<string, string>) || {}).map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <Input
                    value={key}
                    onChange={(e) => updateCustomFieldKey(key, e.target.value)}
                    placeholder="Field name"
                    className="w-1/3 bg-gray-100 border-gray-300 text-gray-900"
                  />
                  <Input
                    value={value}
                    onChange={(e) => updateCustomFieldValue(key, e.target.value)}
                    placeholder="Field value"
                    className="flex-1 bg-gray-100 border-gray-300 text-gray-900"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCustomField(key)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                onClick={addCustomField}
                variant="outline"
                size="sm"
                className="w-full border-dashed bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  const renderInputFields = () => {
    if (node.type?.startsWith("stage-")) {
      return renderStageFields()
    }

    switch (node.type) {
      case "input":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="dataSource">Data Source</Label>
              <Select
                value={localData.dataSource || "manual"}
                onValueChange={(value) => handleChange("dataSource", value)}
              >
                <SelectTrigger id="dataSource">
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Input</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="file">File Upload</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sampleData">Sample Data (JSON)</Label>
              <Textarea
                id="sampleData"
                value={localData.sampleData || ""}
                onChange={(e) => handleChange("sampleData", e.target.value)}
                className="h-32"
                placeholder='{"key": "value"}'
              />
            </div>
          </>
        )

      case "output":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="outputType">Output Type</Label>
              <Select
                value={localData.outputType || "console"}
                onValueChange={(value) => handleChange("outputType", value)}
              >
                <SelectTrigger id="outputType">
                  <SelectValue placeholder="Select output type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="console">Console</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="file">File</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="outputFormat">Output Format</Label>
              <Select
                value={localData.outputFormat || "json"}
                onValueChange={(value) => handleChange("outputFormat", value)}
              >
                <SelectTrigger id="outputFormat">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                  <SelectItem value="text">Plain Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )

      case "process":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="processType">Process Type</Label>
              <Select
                value={localData.processType || "transform"}
                onValueChange={(value) => handleChange("processType", value)}
              >
                <SelectTrigger id="processType">
                  <SelectValue placeholder="Select process type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transform">Transform</SelectItem>
                  <SelectItem value="filter">Filter</SelectItem>
                  <SelectItem value="aggregate">Aggregate</SelectItem>
                  <SelectItem value="sort">Sort</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="processConfig">Process Configuration (JSON)</Label>
              <Textarea
                id="processConfig"
                value={localData.processConfig || ""}
                onChange={(e) => handleChange("processConfig", e.target.value)}
                className="h-32"
                placeholder='{"operation": "value"}'
              />
            </div>
          </>
        )

      case "conditional":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Input
                id="condition"
                value={localData.condition || ""}
                onChange={(e) => handleChange("condition", e.target.value)}
                placeholder="data.value > 10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trueLabel">True Path Label</Label>
              <Input
                id="trueLabel"
                value={localData.trueLabel || "Yes"}
                onChange={(e) => handleChange("trueLabel", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="falseLabel">False Path Label</Label>
              <Input
                id="falseLabel"
                value={localData.falseLabel || "No"}
                onChange={(e) => handleChange("falseLabel", e.target.value)}
              />
            </div>
          </>
        )

      case "code":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="codeLanguage">Language</Label>
              <Select
                value={localData.codeLanguage || "javascript"}
                onValueChange={(value) => handleChange("codeLanguage", value)}
              >
                <SelectTrigger id="codeLanguage">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <CodeEditor
                value={
                  localData.code ||
                  "// Write your code here\nfunction process(data) {\n  // Transform data\n  return data;\n}"
                }
                onChange={(value) => handleChange("code", value)}
                language={localData.codeLanguage || "javascript"}
              />
            </div>
          </>
        )

      case "email":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="emailFrom">From Email</Label>
              <Input
                id="emailFrom"
                value={localData.emailFrom || ""}
                onChange={(e) => handleChange("emailFrom", e.target.value)}
                placeholder="sender@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailTo">To Email</Label>
              <Input
                id="emailTo"
                value={localData.emailTo || ""}
                onChange={(e) => handleChange("emailTo", e.target.value)}
                placeholder="recipient@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailSubject">Subject</Label>
              <Input
                id="emailSubject"
                value={localData.emailSubject || ""}
                onChange={(e) => handleChange("emailSubject", e.target.value)}
                placeholder="Email subject"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailBody">Email Body</Label>
              <Textarea
                id="emailBody"
                value={localData.emailBody || ""}
                onChange={(e) => handleChange("emailBody", e.target.value)}
                className="h-32"
                placeholder="Email message content"
              />
            </div>
          </>
        )

      case "filter":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="filterField">Field to Filter</Label>
              <Input
                id="filterField"
                value={localData.filterField || ""}
                onChange={(e) => handleChange("filterField", e.target.value)}
                placeholder="data.field"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterOperator">Operator</Label>
              <Select
                value={localData.filterOperator || "equals"}
                onValueChange={(value) => handleChange("filterOperator", value)}
              >
                <SelectTrigger id="filterOperator">
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="greater">Greater Than</SelectItem>
                  <SelectItem value="less">Less Than</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterCondition">Filter Condition</Label>
              <Input
                id="filterCondition"
                value={localData.filterCondition || ""}
                onChange={(e) => handleChange("filterCondition", e.target.value)}
                placeholder="value > 0"
              />
            </div>
          </>
        )

      case "workflow":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="workflowId">Workflow ID</Label>
              <Input
                id="workflowId"
                value={localData.workflowId || ""}
                onChange={(e) => handleChange("workflowId", e.target.value)}
                placeholder="workflow-123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workflowName">Workflow Name</Label>
              <Input
                id="workflowName"
                value={localData.workflowName || ""}
                onChange={(e) => handleChange("workflowName", e.target.value)}
                placeholder="Sub-workflow name"
              />
            </div>
          </>
        )

      case "table":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="tableName">Table Name</Label>
              <Input
                id="tableName"
                value={localData.tableName || ""}
                onChange={(e) => handleChange("tableName", e.target.value)}
                placeholder="users"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="operation">Database Operation</Label>
              <Select
                value={localData.operation || "select"}
                onValueChange={(value) => handleChange("operation", value)}
              >
                <SelectTrigger id="operation">
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select">SELECT</SelectItem>
                  <SelectItem value="insert">INSERT</SelectItem>
                  <SelectItem value="update">UPDATE</SelectItem>
                  <SelectItem value="delete">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="query">SQL Query</Label>
              <Textarea
                id="query"
                value={localData.query || ""}
                onChange={(e) => handleChange("query", e.target.value)}
                className="h-32"
                placeholder="SELECT * FROM table WHERE id = ?"
              />
            </div>
          </>
        )

      case "conveyor":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="speed">Speed (m/min)</Label>
              <Input
                id="speed"
                type="number"
                value={localData.speed || 10}
                onChange={(e) => handleChange("speed", Number(e.target.value))}
                placeholder="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="length">Length (meters)</Label>
              <Input
                id="length"
                type="number"
                value={localData.length || 5}
                onChange={(e) => handleChange("length", Number(e.target.value))}
                placeholder="5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direction">Direction</Label>
              <Select
                value={localData.direction || "forward"}
                onValueChange={(value) => handleChange("direction", value)}
              >
                <SelectTrigger id="direction">
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="forward">Forward</SelectItem>
                  <SelectItem value="reverse">Reverse</SelectItem>
                  <SelectItem value="bidirectional">Bidirectional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )

      case "assembly":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="assemblyType">Assembly Type</Label>
              <Select
                value={localData.assemblyType || "robotic"}
                onValueChange={(value) => handleChange("assemblyType", value)}
              >
                <SelectTrigger id="assemblyType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="robotic">Robotic</SelectItem>
                  <SelectItem value="semi-automatic">Semi-Automatic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cycleTime">Cycle Time (seconds)</Label>
              <Input
                id="cycleTime"
                type="number"
                value={localData.cycleTime || 30}
                onChange={(e) => handleChange("cycleTime", Number(e.target.value))}
                placeholder="30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="components">Components</Label>
              <Textarea
                id="components"
                value={localData.components || ""}
                onChange={(e) => handleChange("components", e.target.value)}
                placeholder="Part A, Part B, Part C"
              />
            </div>
          </>
        )

      case "quality":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="inspectionType">Inspection Type</Label>
              <Select
                value={localData.inspectionType || "all"}
                onValueChange={(value) => handleChange("inspectionType", value)}
              >
                <SelectTrigger id="inspectionType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visual">Visual</SelectItem>
                  <SelectItem value="dimensional">Dimensional</SelectItem>
                  <SelectItem value="functional">Functional</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rejectThreshold">Reject Threshold (%)</Label>
              <Input
                id="rejectThreshold"
                type="number"
                value={localData.rejectThreshold || 5}
                onChange={(e) => handleChange("rejectThreshold", Number(e.target.value))}
                placeholder="5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inspectionCriteria">Inspection Criteria</Label>
              <Textarea
                id="inspectionCriteria"
                value={localData.inspectionCriteria || ""}
                onChange={(e) => handleChange("inspectionCriteria", e.target.value)}
                placeholder="Quality standards to check"
              />
            </div>
          </>
        )

      case "packaging":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="packagingType">Packaging Type</Label>
              <Select
                value={localData.packagingType || "box"}
                onValueChange={(value) => handleChange("packagingType", value)}
              >
                <SelectTrigger id="packagingType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="box">Box</SelectItem>
                  <SelectItem value="shrink-wrap">Shrink Wrap</SelectItem>
                  <SelectItem value="pallet">Pallet</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="packagingMaterial">Packaging Material</Label>
              <Input
                id="packagingMaterial"
                value={localData.packagingMaterial || ""}
                onChange={(e) => handleChange("packagingMaterial", e.target.value)}
                placeholder="Cardboard, Plastic, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitsPerPackage">Units Per Package</Label>
              <Input
                id="unitsPerPackage"
                type="number"
                value={localData.unitsPerPackage || 10}
                onChange={(e) => handleChange("unitsPerPackage", Number(e.target.value))}
                placeholder="10"
              />
            </div>
          </>
        )

      case "sorting":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="sortCriteria">Sort Criteria</Label>
              <Select
                value={localData.sortCriteria || "size"}
                onValueChange={(value) => handleChange("sortCriteria", value)}
              >
                <SelectTrigger id="sortCriteria">
                  <SelectValue placeholder="Select criteria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="size">Size</SelectItem>
                  <SelectItem value="weight">Weight</SelectItem>
                  <SelectItem value="color">Color</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortDirections">Number of Sort Directions</Label>
              <Input
                id="sortDirections"
                type="number"
                value={localData.sortDirections || 3}
                onChange={(e) => handleChange("sortDirections", Number(e.target.value))}
                placeholder="3"
              />
            </div>
          </>
        )

      case "cutting":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="cuttingMethod">Cutting Method</Label>
              <Select
                value={localData.cuttingMethod || "laser"}
                onValueChange={(value) => handleChange("cuttingMethod", value)}
              >
                <SelectTrigger id="cuttingMethod">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="laser">Laser</SelectItem>
                  <SelectItem value="plasma">Plasma</SelectItem>
                  <SelectItem value="mechanical">Mechanical</SelectItem>
                  <SelectItem value="water-jet">Water Jet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cutDimensions">Cut Dimensions</Label>
              <Input
                id="cutDimensions"
                value={localData.cutDimensions || ""}
                onChange={(e) => handleChange("cutDimensions", e.target.value)}
                placeholder="100x50mm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precision">Precision (mm)</Label>
              <Input
                id="precision"
                type="number"
                step="0.01"
                value={localData.precision || 0.1}
                onChange={(e) => handleChange("precision", Number(e.target.value))}
                placeholder="0.1"
              />
            </div>
          </>
        )

      case "painting":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="coatingType">Coating Type</Label>
              <Select
                value={localData.coatingType || "spray"}
                onValueChange={(value) => handleChange("coatingType", value)}
              >
                <SelectTrigger id="coatingType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="powder">Powder</SelectItem>
                  <SelectItem value="liquid">Liquid</SelectItem>
                  <SelectItem value="spray">Spray</SelectItem>
                  <SelectItem value="dip">Dip</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={localData.color || ""}
                onChange={(e) => handleChange("color", e.target.value)}
                placeholder="Blue, Red, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="layers">Number of Layers</Label>
              <Input
                id="layers"
                type="number"
                value={localData.layers || 2}
                onChange={(e) => handleChange("layers", Number(e.target.value))}
                placeholder="2"
              />
            </div>
          </>
        )

      case "testing":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="testType">Test Type</Label>
              <Select
                value={localData.testType || "durability"}
                onValueChange={(value) => handleChange("testType", value)}
              >
                <SelectTrigger id="testType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pressure">Pressure</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="thermal">Thermal</SelectItem>
                  <SelectItem value="durability">Durability</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testDuration">Test Duration (seconds)</Label>
              <Input
                id="testDuration"
                type="number"
                value={localData.testDuration || 60}
                onChange={(e) => handleChange("testDuration", Number(e.target.value))}
                placeholder="60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passRate">Required Pass Rate (%)</Label>
              <Input
                id="passRate"
                type="number"
                value={localData.passRate || 95}
                onChange={(e) => handleChange("passRate", Number(e.target.value))}
                placeholder="95"
              />
            </div>
          </>
        )

      case "storage":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (units)</Label>
              <Input
                id="capacity"
                type="number"
                value={localData.capacity || 1000}
                onChange={(e) => handleChange("capacity", Number(e.target.value))}
                placeholder="1000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storageType">Storage Type</Label>
              <Select
                value={localData.storageType || "warehouse"}
                onValueChange={(value) => handleChange("storageType", value)}
              >
                <SelectTrigger id="storageType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="buffer">Buffer</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="cold-storage">Cold Storage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                value={localData.temperature || 20}
                onChange={(e) => handleChange("temperature", Number(e.target.value))}
                placeholder="20"
              />
            </div>
          </>
        )

      case "raw-material":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="materialType">Material Type</Label>
              <Input
                id="materialType"
                value={localData.materialType || ""}
                onChange={(e) => handleChange("materialType", e.target.value)}
                placeholder="Steel, Plastic, Wood, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (units)</Label>
              <Input
                id="quantity"
                type="number"
                value={localData.quantity || 100}
                onChange={(e) => handleChange("quantity", Number(e.target.value))}
                placeholder="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={localData.supplier || ""}
                onChange={(e) => handleChange("supplier", e.target.value)}
                placeholder="Supplier name"
              />
            </div>
          </>
        )

      case "evidence-node":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="evidenceType">Evidence Type</Label>
              <Select
                value={localData.evidenceType || "Policy"}
                onValueChange={(value) => handleChange("evidenceType", value)}
              >
                <SelectTrigger id="evidenceType" className="bg-gray-100 border-gray-300 text-gray-900">
                  <SelectValue placeholder="Select type" />
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

            <div className="space-y-2">
              <Label htmlFor="owner">Document Owner</Label>
              <Input
                id="owner"
                value={localData.owner || ""}
                onChange={(e) => handleChange("owner", e.target.value)}
                placeholder="e.g., Legal Dept, Compliance Team"
                className="bg-gray-100 border-gray-300 text-gray-900"
              />
            </div>

            <div className="flex items-center space-x-2 py-2">
              <Switch
                id="mandatory"
                checked={localData.mandatory !== false}
                onCheckedChange={(checked) => handleChange("mandatory", checked)}
              />
              <Label htmlFor="mandatory">
                {localData.mandatory !== false ? "Mandatory (Required for approval)" : "Advisory (Optional reference)"}
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="justification">Justification</Label>
              <Textarea
                id="justification"
                value={localData.justification || ""}
                onChange={(e) => handleChange("justification", e.target.value)}
                placeholder="Why this evidence supports the workflow decision..."
                className="h-24 bg-gray-100 border-gray-300 text-gray-900"
              />
            </div>

            {localData.fileUrl && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>File attached:</strong> {localData.fileName || "PDF Document"}
                </p>
                <a
                  href={localData.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 hover:text-green-800 underline"
                >
                  View Document
                </a>
              </div>
            )}
          </>
        )

      default:
        return null
    }
  }

  return (
    <div
      ref={panelRef}
      className="fixed bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        maxHeight: "calc(100vh - 120px)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="h-5 w-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">
            {node.data.label || "Configure Node"}{" "}
            {node.type?.startsWith("stage-") && `- Stage ${node.data.stageNumber}`}
          </h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!node.type?.startsWith("stage-") && (
          <>
            <div className="space-y-2">
              <Label htmlFor="label">Node Label</Label>
              <Input 
                id="label" 
                value={localData.label || ""} 
                onChange={(e) => handleChange("label", e.target.value)} 
                className="bg-gray-100 border-gray-300 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={localData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe what this node does"
                className="bg-gray-100 border-gray-300 text-gray-900"
              />
            </div>

            <div className="flex items-center space-x-2 py-2">
              <Switch
                id="required"
                checked={localData.required || false}
                onCheckedChange={(checked) => handleChange("required", checked)}
              />
              <Label htmlFor="required">Required Node</Label>
            </div>

            {/* Group Selection for non-stage nodes */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-blue-600">
                <FolderOpen className="w-4 h-4" />
                Group
              </Label>
              <div className="relative group-dropdown-container">
                <button
                  type="button"
                  onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-900 text-sm hover:bg-gray-50 transition-colors"
                >
                  <span className={localData.group ? "text-gray-900" : "text-gray-500"}>
                    {localData.group || "Select or add group..."}
                  </span>
                  <ChevronsUpDown className="w-4 h-4 text-gray-500" />
                </button>
                
                {isGroupDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {/* Add new group */}
                    <div className="p-2 border-b border-gray-100">
                      <div className="flex gap-2">
                        <Input
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          placeholder="New group name..."
                          className="flex-1 h-8 text-sm bg-white"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newGroupName.trim()) {
                              handleChange("group", newGroupName.trim())
                              setNewGroupName("")
                              setIsGroupDropdownOpen(false)
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newGroupName.trim()) {
                              handleChange("group", newGroupName.trim())
                              setNewGroupName("")
                              setIsGroupDropdownOpen(false)
                            }
                          }}
                          className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* No group option */}
                    <button
                      type="button"
                      onClick={() => {
                        handleChange("group", "")
                        setIsGroupDropdownOpen(false)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <span className="flex-1 text-right">No group</span>
                      {!localData.group && <Check className="w-4 h-4 text-blue-500" />}
                    </button>
                    
                    {/* Existing groups */}
                    {existingGroups.length > 0 && (
                      <div className="border-t border-gray-100">
                        {existingGroups.map((group) => (
                          <button
                            key={group}
                            type="button"
                            onClick={() => {
                              handleChange("group", group)
                              setIsGroupDropdownOpen(false)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                          >
                            <FolderOpen className="w-4 h-4 text-blue-500" />
                            <span className="flex-1 text-right">{group}</span>
                            {localData.group === group && <Check className="w-4 h-4 text-blue-500" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 my-4"></div>
          </>
        )}

        {renderInputFields()}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
        <Button onClick={onClose} variant="outline" className="rounded-lg bg-white border-gray-300 text-gray-700 hover:bg-gray-100">
          Cancel
        </Button>
        <Button
          onClick={() => {
            updateNodeData(node.id, localData)
            onClose()
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
        >
          Save Changes
        </Button>
      </div>

      {/* Resize Handle */}
      <div
        className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={handleResizeMouseDown}
      >
        <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-gray-400 rounded-br"></div>
      </div>
    </div>
  )
}
