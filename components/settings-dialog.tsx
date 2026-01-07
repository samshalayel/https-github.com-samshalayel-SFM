"use client"

import type React from "react"

import { useState } from "react"
import { X, Upload, Building2, User, DollarSign, Calendar, Briefcase } from "lucide-react"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/40 via-indigo-900/30 to-purple-900/30 backdrop-blur-md">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col border border-white/20">
        <div className="relative flex items-center justify-between p-6 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div>
            <h2 className="text-2xl font-bold text-white">Project Settings</h2>
            <p className="text-sm text-indigo-100 mt-1">Configure your project details</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="projectName" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-indigo-600" />
              Project Name
            </Label>
            <Input
              id="projectName"
              value={settings.projectName}
              onChange={(e) => setSettings({ ...settings, projectName: e.target.value })}
              placeholder="Enter project name"
              className="w-full border-gray-200 focus:border-indigo-400 focus:ring-indigo-400 rounded-xl"
            />
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-600" />
              Company Name
            </Label>
            <Input
              id="companyName"
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              placeholder="Enter company name"
              className="w-full border-gray-200 focus:border-indigo-400 focus:ring-indigo-400 rounded-xl"
            />
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label htmlFor="logo" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Upload className="h-4 w-4 text-indigo-600" />
              Company Logo
            </Label>
            <div className="flex items-center gap-4">
              <label
                htmlFor="logo"
                className="flex-1 flex items-center justify-center gap-3 px-4 py-3 border-2 border-dashed border-indigo-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/50 cursor-pointer transition-all group"
              >
                <Upload className="h-5 w-5 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                <span className="text-sm text-gray-600 group-hover:text-indigo-600 font-medium transition-colors">
                  {settings.logo ? settings.logo.name : "Click to upload logo"}
                </span>
              </label>
              <input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </div>
          </div>

          {/* Two-column layout for roles */}
          <div className="grid grid-cols-2 gap-4">
            {/* Product Owner */}
            <div className="space-y-2">
              <Label htmlFor="productOwner" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-600" />
                Product Owner
              </Label>
              <Input
                id="productOwner"
                value={settings.productOwner}
                onChange={(e) => setSettings({ ...settings, productOwner: e.target.value })}
                placeholder="Owner name"
                className="w-full border-gray-200 focus:border-indigo-400 focus:ring-indigo-400 rounded-xl"
              />
            </div>

            {/* Product Manager */}
            <div className="space-y-2">
              <Label htmlFor="productManager" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4 text-purple-600" />
                Product Manager
              </Label>
              <Input
                id="productManager"
                value={settings.productManager}
                onChange={(e) => setSettings({ ...settings, productManager: e.target.value })}
                placeholder="Manager name"
                className="w-full border-gray-200 focus:border-purple-400 focus:ring-purple-400 rounded-xl"
              />
            </div>
          </div>

          {/* Two-column layout for budget and duration */}
          <div className="grid grid-cols-2 gap-4">
            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                Budget
              </Label>
              <Input
                id="budget"
                value={settings.budget}
                onChange={(e) => setSettings({ ...settings, budget: e.target.value })}
                placeholder="e.g., $50,000"
                className="w-full border-gray-200 focus:border-green-400 focus:ring-green-400 rounded-xl"
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                Duration
              </Label>
              <Input
                id="duration"
                value={settings.duration}
                onChange={(e) => setSettings({ ...settings, duration: e.target.value })}
                placeholder="e.g., 6 months"
                className="w-full border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50">
          <Button
            onClick={onClose}
            variant="outline"
            className="rounded-xl border-gray-300 hover:bg-gray-100 px-6 bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl px-6 shadow-lg shadow-indigo-500/30"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
