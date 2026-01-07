"use client"

import type React from "react"

import { useState } from "react"
import { X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SettingsDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const [settings, setSettings] = useState({
    companyName: "",
    productOwner: "",
    productManager: "",
    budget: "",
    duration: "",
    projectName: "",
    logo: null as File | null,
  })

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSettings({ ...settings, logo: file })
    }
  }

  const handleSave = () => {
    localStorage.setItem("projectSettings", JSON.stringify(settings))
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Project Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Project Name */}
          <div className="space-y-1.5">
            <Label htmlFor="projectName" className="text-sm font-semibold text-gray-700">
              Project Name
            </Label>
            <Input
              id="projectName"
              value={settings.projectName}
              onChange={(e) => setSettings({ ...settings, projectName: e.target.value })}
              placeholder="Enter project name"
              className="w-full"
            />
          </div>

          {/* Company Name */}
          <div className="space-y-1.5">
            <Label htmlFor="companyName" className="text-sm font-semibold text-gray-700">
              Company Name
            </Label>
            <Input
              id="companyName"
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              placeholder="Enter company name"
              className="w-full"
            />
          </div>

          {/* Logo Upload */}
          <div className="space-y-1.5">
            <Label htmlFor="logo" className="text-sm font-semibold text-gray-700">
              Company Logo
            </Label>
            <div className="flex items-center gap-4">
              <label
                htmlFor="logo"
                className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 cursor-pointer transition-colors"
              >
                <Upload className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{settings.logo ? settings.logo.name : "Upload logo"}</span>
              </label>
              <input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </div>
          </div>

          {/* Product Owner */}
          <div className="space-y-1.5">
            <Label htmlFor="productOwner" className="text-sm font-semibold text-gray-700">
              Product Owner
            </Label>
            <Input
              id="productOwner"
              value={settings.productOwner}
              onChange={(e) => setSettings({ ...settings, productOwner: e.target.value })}
              placeholder="Enter product owner name"
              className="w-full"
            />
          </div>

          {/* Product Manager */}
          <div className="space-y-1.5">
            <Label htmlFor="productManager" className="text-sm font-semibold text-gray-700">
              Product Manager
            </Label>
            <Input
              id="productManager"
              value={settings.productManager}
              onChange={(e) => setSettings({ ...settings, productManager: e.target.value })}
              placeholder="Enter product manager name"
              className="w-full"
            />
          </div>

          {/* Budget */}
          <div className="space-y-1.5">
            <Label htmlFor="budget" className="text-sm font-semibold text-gray-700">
              Budget
            </Label>
            <Input
              id="budget"
              value={settings.budget}
              onChange={(e) => setSettings({ ...settings, budget: e.target.value })}
              placeholder="Enter project budget"
              className="w-full"
            />
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <Label htmlFor="duration" className="text-sm font-semibold text-gray-700">
              Duration
            </Label>
            <Input
              id="duration"
              value={settings.duration}
              onChange={(e) => setSettings({ ...settings, duration: e.target.value })}
              placeholder="e.g., 6 months"
              className="w-full"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
          <Button onClick={onClose} variant="outline" className="rounded-lg bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
