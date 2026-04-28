"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Upload, Building2, User, DollarSign, Calendar, Briefcase, Github, Eye, EyeOff, FolderGit2, Plus, FolderOpen, Trash2, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

interface Project {
  id: string
  name: string
  company_name: string | null
  company_logo_url: string | null
  product_owner: string | null
  product_manager: string | null
  budget: string | null
  duration: string | null
  github_repo: string | null
  github_token: string | null
  created_at: string
  updated_at: string
}

interface SettingsDialogProps {
  isOpen: boolean
  onClose: () => void
  isDarkMode?: boolean
  currentProjectId?: string | null
  onProjectChange?: (projectId: string | null, projectName: string | null) => void
}

export default function SettingsDialog({ 
  isOpen, 
  onClose, 
  isDarkMode = true,
  currentProjectId,
  onProjectChange 
}: SettingsDialogProps) {
  const [settings, setSettings] = useState({
    companyName: "",
    productOwner: "",
    productManager: "",
    budget: "",
    duration: "",
    projectName: "",
    logoUrl: "",
    githubToken: "",
    githubRepo: "",
  })
  const [showToken, setShowToken] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(currentProjectId || null)
  const [activeTab, setActiveTab] = useState<"projects" | "settings">("projects")
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const supabase = createClient()

  // Load projects from database
  useEffect(() => {
    if (isOpen) {
      loadProjects()
    }
  }, [isOpen])

  // Load project settings when selected
  useEffect(() => {
    if (selectedProjectId) {
      loadProjectSettings(selectedProjectId)
    } else {
      // Reset to empty for new project
      setSettings({
        companyName: "",
        productOwner: "",
        productManager: "",
        budget: "",
        duration: "",
        projectName: "",
        logoUrl: "",
        githubToken: "",
        githubRepo: "",
      })
    }
  }, [selectedProjectId])

  const loadProjects = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      console.log("[v0] loadProjects - user:", user?.id)
      if (!user) {
        console.log("[v0] No user found, cannot load projects")
        return
      }

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })

      console.log("[v0] loadProjects - data:", data, "error:", error)

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error("[v0] Error loading projects:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadProjectSettings = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single()

      if (error) throw error
      if (data) {
        setSettings({
          projectName: data.name || "",
          companyName: data.company_name || "",
          logoUrl: data.company_logo_url || "",
          productOwner: data.product_owner || "",
          productManager: data.product_manager || "",
          budget: data.budget || "",
          duration: data.duration || "",
          githubRepo: data.github_repo || "",
          githubToken: data.github_token || "",
        })
      }
    } catch (error) {
      console.error("Error loading project settings:", error)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setSettings({ ...settings, logoUrl: previewUrl })
    }
  }

  const uploadLogo = async (file: File): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(fileName, file)

      if (uploadError) {
        // If bucket doesn't exist, just use the local preview
        console.warn("Logo upload failed, using local preview:", uploadError)
        return null
      }

      const { data: { publicUrl } } = supabase.storage
        .from("logos")
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error("Error uploading logo:", error)
      return null
    }
  }

  const handleSave = async () => {
    if (!settings.projectName.trim()) {
      alert("Please enter a project name")
      return
    }

    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert("Please log in to save projects")
        return
      }

      // Upload logo if new file selected
      let logoUrl = settings.logoUrl
      if (logoFile) {
        const uploadedUrl = await uploadLogo(logoFile)
        if (uploadedUrl) {
          logoUrl = uploadedUrl
        }
      }

      const projectData = {
        name: settings.projectName,
        company_name: settings.companyName || null,
        company_logo_url: logoUrl || null,
        product_owner: settings.productOwner || null,
        product_manager: settings.productManager || null,
        budget: settings.budget || null,
        duration: settings.duration || null,
        github_repo: settings.githubRepo || null,
        github_token: settings.githubToken || null,
        user_id: user.id,
      }

      let savedProjectId = selectedProjectId

      if (selectedProjectId) {
        // Update existing project
        const { error } = await supabase
          .from("projects")
          .update(projectData)
          .eq("id", selectedProjectId)

        if (error) {
          console.error("[v0] Error updating project:", error)
          throw error
        }
        console.log("[v0] Project updated successfully:", selectedProjectId)
      } else {
        // Create new project
        console.log("[v0] Creating new project with data:", projectData)
        const { data, error } = await supabase
          .from("projects")
          .insert(projectData)
          .select()
          .single()

        if (error) {
          console.error("[v0] Error creating project:", error)
          throw error
        }
        if (data) {
          console.log("[v0] Project created successfully:", data)
          savedProjectId = data.id
          setSelectedProjectId(data.id)
        }
      }

      // Also save to localStorage for backward compatibility
      localStorage.setItem("projectSettings", JSON.stringify({
        ...settings,
        logoUrl,
      }))

      // Notify parent of project change
      onProjectChange?.(savedProjectId, settings.projectName)

      await loadProjects()
      setActiveTab("projects")
    } catch (error) {
      console.error("Error saving project:", error)
      alert("Failed to save project")
    } finally {
      setIsSaving(false)
    }
  }

  const handleNewProject = () => {
    setSelectedProjectId(null)
    setSettings({
      companyName: "",
      productOwner: "",
      productManager: "",
      budget: "",
      duration: "",
      projectName: "",
      logoUrl: "",
      githubToken: "",
      githubRepo: "",
    })
    setLogoFile(null)
    setActiveTab("settings")
  }

  const handleOpenProject = (project: Project) => {
    setSelectedProjectId(project.id)
    onProjectChange?.(project.id, project.name)
    
    // Save to localStorage for components that still use it
    localStorage.setItem("projectSettings", JSON.stringify({
      projectName: project.name,
      companyName: project.company_name,
      logoUrl: project.company_logo_url,
      productOwner: project.product_owner,
      productManager: project.product_manager,
      budget: project.budget,
      duration: project.duration,
      githubRepo: project.github_repo,
      githubToken: project.github_token,
    }))
    
    onClose()
  }

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this project? All associated workflows will also be deleted.")) {
      return
    }

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId)

      if (error) throw error

      if (selectedProjectId === projectId) {
        setSelectedProjectId(null)
        onProjectChange?.(null, null)
      }

      await loadProjects()
    } catch (error) {
      console.error("Error deleting project:", error)
      alert("Failed to delete project")
    }
  }

  const handleEditProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedProjectId(project.id)
    setActiveTab("settings")
  }

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md ${
        isDarkMode
          ? "bg-gradient-to-br from-black/60 via-indigo-900/40 to-purple-900/40"
          : "bg-gradient-to-br from-black/40 via-indigo-900/30 to-purple-900/30"
      }`}
    >
      <div
        className={`backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col border ${
          isDarkMode ? "bg-[#111111]/95 border-white/10" : "bg-white/95 border-white/20"
        }`}
      >
        <div className="relative flex items-center justify-between p-6 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div>
            <h2 className="text-2xl font-bold text-white">Project Settings</h2>
            <p className="text-sm text-indigo-100 mt-1">
              {activeTab === "projects" ? "Select or create a project" : "Configure project details"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex border-b ${isDarkMode ? "border-white/10" : "border-gray-200"}`}>
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "projects"
                ? isDarkMode
                  ? "text-indigo-400 border-b-2 border-indigo-400 bg-indigo-500/10"
                  : "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                : isDarkMode
                  ? "text-gray-400 hover:text-gray-300"
                  : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <FolderOpen className="h-4 w-4 inline-block mr-2" />
            My Projects
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "settings"
                ? isDarkMode
                  ? "text-indigo-400 border-b-2 border-indigo-400 bg-indigo-500/10"
                  : "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                : isDarkMode
                  ? "text-gray-400 hover:text-gray-300"
                  : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Briefcase className="h-4 w-4 inline-block mr-2" />
            {selectedProjectId ? "Edit Project" : "New Project"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "projects" ? (
            /* Projects List Tab */
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Your Projects
                </h3>
                <Button
                  onClick={handleNewProject}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className={`h-8 w-8 animate-spin ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} />
                </div>
              ) : projects.length === 0 ? (
                <div className={`text-center py-12 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No projects yet</p>
                  <p className="text-sm mt-1">Create your first project to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => handleOpenProject(project)}
                      className={`p-4 rounded-xl cursor-pointer transition-all group ${
                        selectedProjectId === project.id
                          ? isDarkMode
                            ? "bg-indigo-500/20 border border-indigo-500/50"
                            : "bg-indigo-50 border border-indigo-200"
                          : isDarkMode
                            ? "bg-white/5 hover:bg-white/10 border border-white/10"
                            : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {project.company_logo_url ? (
                            <img 
                              src={project.company_logo_url} 
                              alt="Logo" 
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                              isDarkMode ? "bg-indigo-500/20" : "bg-indigo-100"
                            }`}>
                              <Briefcase className={`h-5 w-5 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} />
                            </div>
                          )}
                          <div>
                            <h4 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                              {project.name}
                            </h4>
                            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                              {project.company_name || "No company"} 
                              {project.product_owner && ` • ${project.product_owner}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {currentProjectId === project.id && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              isDarkMode ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-700"
                            }`}>
                              <Check className="h-3 w-3 inline-block mr-1" />
                              Active
                            </span>
                          )}
                          <button
                            onClick={(e) => handleEditProject(project, e)}
                            className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                              isDarkMode 
                                ? "hover:bg-white/10 text-gray-400 hover:text-white" 
                                : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                            }`}
                            title="Edit project"
                          >
                            <Briefcase className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteProject(project.id, e)}
                            className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                              isDarkMode 
                                ? "hover:bg-red-500/20 text-gray-400 hover:text-red-400" 
                                : "hover:bg-red-50 text-gray-500 hover:text-red-600"
                            }`}
                            title="Delete project"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className={`mt-2 text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                        Updated {new Date(project.updated_at).toLocaleDateString()}
                        {project.budget && ` • Budget: ${project.budget}`}
                        {project.duration && ` • Duration: ${project.duration}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Settings Tab */
            <div className="p-6 space-y-5">
              {/* Project Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="projectName"
                  className={`text-sm font-semibold flex items-center gap-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  <Briefcase className="h-4 w-4 text-indigo-500" />
                  Project Name *
                </Label>
                <Input
                  id="projectName"
                  value={settings.projectName}
                  onChange={(e) => setSettings({ ...settings, projectName: e.target.value })}
                  placeholder="Enter project name"
                  className={`w-full rounded-xl ${
                    isDarkMode
                      ? "bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500"
                      : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-400"
                  }`}
                />
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="companyName"
                  className={`text-sm font-semibold flex items-center gap-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  <Building2 className="h-4 w-4 text-indigo-500" />
                  Company Name
                </Label>
                <Input
                  id="companyName"
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  placeholder="Enter company name"
                  className={`w-full rounded-xl ${
                    isDarkMode
                      ? "bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500"
                      : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-400"
                  }`}
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label
                  htmlFor="logo"
                  className={`text-sm font-semibold flex items-center gap-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  <Upload className="h-4 w-4 text-indigo-500" />
                  Company Logo
                </Label>
                <div className="flex items-center gap-4">
                  {settings.logoUrl && (
                    <img 
                      src={settings.logoUrl} 
                      alt="Logo preview" 
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  )}
                  <label
                    htmlFor="logo"
                    className={`flex-1 flex items-center justify-center gap-3 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-all group ${
                      isDarkMode
                        ? "border-indigo-500/30 hover:border-indigo-500/60 hover:bg-indigo-500/10"
                        : "border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50"
                    }`}
                  >
                    <Upload
                      className={`h-5 w-5 transition-colors ${isDarkMode ? "text-indigo-400 group-hover:text-indigo-300" : "text-indigo-400 group-hover:text-indigo-600"}`}
                    />
                    <span
                      className={`text-sm font-medium transition-colors ${isDarkMode ? "text-gray-400 group-hover:text-indigo-300" : "text-gray-600 group-hover:text-indigo-600"}`}
                    >
                      {logoFile ? logoFile.name : "Click to upload logo"}
                    </span>
                  </label>
                  <input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </div>
              </div>

              {/* Two-column layout for roles */}
              <div className="grid grid-cols-2 gap-4">
                {/* Product Owner */}
                <div className="space-y-2">
                  <Label
                    htmlFor="productOwner"
                    className={`text-sm font-semibold flex items-center gap-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    <User className="h-4 w-4 text-indigo-500" />
                    Product Owner
                  </Label>
                  <Input
                    id="productOwner"
                    value={settings.productOwner}
                    onChange={(e) => setSettings({ ...settings, productOwner: e.target.value })}
                    placeholder="Owner name"
                    className={`w-full rounded-xl ${
                      isDarkMode
                        ? "bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500"
                        : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-400"
                    }`}
                  />
                </div>

                {/* Product Manager */}
                <div className="space-y-2">
                  <Label
                    htmlFor="productManager"
                    className={`text-sm font-semibold flex items-center gap-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    <User className="h-4 w-4 text-purple-500" />
                    Product Manager
                  </Label>
                  <Input
                    id="productManager"
                    value={settings.productManager}
                    onChange={(e) => setSettings({ ...settings, productManager: e.target.value })}
                    placeholder="Manager name"
                    className={`w-full rounded-xl ${
                      isDarkMode
                        ? "bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
                        : "border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                    }`}
                  />
                </div>
              </div>

              {/* Two-column layout for budget and duration */}
              <div className="grid grid-cols-2 gap-4">
                {/* Budget */}
                <div className="space-y-2">
                  <Label
                    htmlFor="budget"
                    className={`text-sm font-semibold flex items-center gap-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    Budget
                  </Label>
                  <Input
                    id="budget"
                    value={settings.budget}
                    onChange={(e) => setSettings({ ...settings, budget: e.target.value })}
                    placeholder="e.g., $50,000"
                    className={`w-full rounded-xl ${
                      isDarkMode
                        ? "bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500"
                        : "border-gray-200 focus:border-green-400 focus:ring-green-400"
                    }`}
                  />
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label
                    htmlFor="duration"
                    className={`text-sm font-semibold flex items-center gap-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Duration
                  </Label>
                  <Input
                    id="duration"
                    value={settings.duration}
                    onChange={(e) => setSettings({ ...settings, duration: e.target.value })}
                    placeholder="e.g., 6 months"
                    className={`w-full rounded-xl ${
                      isDarkMode
                        ? "bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
                        : "border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                    }`}
                  />
                </div>
              </div>

              {/* GitHub Integration Section */}
              <div className={`mt-6 pt-6 border-t ${isDarkMode ? "border-white/10" : "border-gray-200"}`}>
                <div className="flex items-center gap-2 mb-4">
                  <Github className={`h-5 w-5 ${isDarkMode ? "text-white" : "text-gray-800"}`} />
                  <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    GitHub Integration
                  </h3>
                </div>
                <p className={`text-sm mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Configure GitHub to import workflow templates directly from a repository
                </p>

                {/* GitHub Repository */}
                <div className="space-y-2 mb-4">
                  <Label
                    htmlFor="githubRepo"
                    className={`text-sm font-semibold flex items-center gap-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    <FolderGit2 className="h-4 w-4 text-orange-500" />
                    GitHub Repository
                  </Label>
                  <Input
                    id="githubRepo"
                    value={settings.githubRepo}
                    onChange={(e) => setSettings({ ...settings, githubRepo: e.target.value })}
                    placeholder="owner/repo (e.g., samshalayel/sfm-templates)"
                    className={`w-full rounded-xl ${
                      isDarkMode
                        ? "bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500"
                        : "border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                    }`}
                  />
                </div>

                {/* GitHub Token */}
                <div className="space-y-2">
                  <Label
                    htmlFor="githubToken"
                    className={`text-sm font-semibold flex items-center gap-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    <Github className="h-4 w-4 text-purple-500" />
                    GitHub Personal Access Token
                  </Label>
                  <div className="relative">
                    <Input
                      id="githubToken"
                      type={showToken ? "text" : "password"}
                      value={settings.githubToken}
                      onChange={(e) => setSettings({ ...settings, githubToken: e.target.value })}
                      placeholder="ghp_xxxxxxxxxxxx"
                      className={`w-full rounded-xl pr-10 ${
                        isDarkMode
                          ? "bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
                          : "border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          className={`flex items-center justify-end gap-3 p-6 border-t ${
            isDarkMode ? "border-white/10 bg-[#0a0a0a]/50" : "border-gray-100 bg-gray-50/50"
          }`}
        >
          <Button
            onClick={onClose}
            variant="outline"
            className={`rounded-xl px-6 ${
              isDarkMode
                ? "border-white/10 bg-transparent text-gray-300 hover:bg-white/10"
                : "border-gray-300 hover:bg-gray-100 bg-transparent"
            }`}
          >
            Cancel
          </Button>
          {activeTab === "settings" && (
            <Button
              onClick={handleSave}
              disabled={isSaving || !settings.projectName.trim()}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl px-6 shadow-lg shadow-indigo-500/30 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : selectedProjectId ? (
                "Update Project"
              ) : (
                "Create Project"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
