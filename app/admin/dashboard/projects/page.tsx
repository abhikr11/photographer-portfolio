"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, ImagePlus, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

type ProjectImage = {
  id: string
  url: string
  public_id: string
  caption: string
  order_index: number
}

type Project = {
  id: string
  title: string
  description: string
  category: string
  date: string
  cover_image: string
  cover_public_id: string
  project_images: ProjectImage[]
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [addingImage, setAddingImage] = useState(false)

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    cover: null as File | null,
  })

  const [imageForm, setImageForm] = useState({
    caption: "",
    file: null as File | null,
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    const res = await fetch("/api/projects")
    const data = await res.json()
    setProjects(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const handleCreate = async () => {
    if (!form.title || !form.cover) {
      toast.error("Title and cover image are required")
      return
    }

    if (form.cover.size > 10 * 1024 * 1024) {
      toast.error("Cover image too large. Maximum size is 10MB.")
      return
    }

    setUploading(true)
    const fd = new FormData()
    fd.append("title", form.title)
    fd.append("description", form.description)
    fd.append("category", form.category)
    fd.append("date", form.date)
    fd.append("cover", form.cover)

    const res = await fetch("/api/projects", { method: "POST", body: fd })
    const data = await res.json()

    if (data.error) {
      toast.error(data.error)
    } else {
      toast.success("Project created!")
      setForm({ title: "", description: "", category: "", date: "", cover: null })
      setShowForm(false)
      fetchProjects()
    }
    setUploading(false)
  }

  const handleDelete = async (project: Project) => {
    if (!confirm(`Delete "${project.title}"?`)) return
    await fetch("/api/projects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: project.id, cover_public_id: project.cover_public_id }),
    })
    toast.success("Project deleted")
    if (selectedProject?.id === project.id) setSelectedProject(null)
    fetchProjects()
  }

  const handleAddImage = async () => {
    if (!imageForm.file || !selectedProject) return

    if (imageForm.file.size > 10 * 1024 * 1024) {
      toast.error("Image too large. Maximum size is 10MB.")
      return
    }

    setAddingImage(true)
    const fd = new FormData()
    fd.append("project_id", selectedProject.id)
    fd.append("caption", imageForm.caption)
    fd.append("order_index", String(selectedProject.project_images.length))
    fd.append("image", imageForm.file)

    const res = await fetch("/api/projects/images", { method: "POST", body: fd })
    const data = await res.json()

    if (data.error) {
      toast.error(data.error)
    } else {
      toast.success("Image added!")
      setImageForm({ caption: "", file: null })
      setSelectedProject((prev) =>
        prev ? { ...prev, project_images: [...prev.project_images, data] } : prev
      )
      fetchProjects()
    }
    setAddingImage(false)
  }

  const handleDeleteImage = async (img: ProjectImage) => {
    await fetch("/api/projects/images", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: img.id, public_id: img.public_id }),
    })
    toast.success("Image removed")
    setSelectedProject((prev) =>
      prev
        ? { ...prev, project_images: prev.project_images.filter((i) => i.id !== img.id) }
        : prev
    )
    fetchProjects()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif">Projects</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gold text-background hover:bg-gold/90 rounded-none"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="border border-border p-6 space-y-4">
          <h2 className="text-sm uppercase tracking-widest text-muted-foreground">New Project</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Project title"
                className="rounded-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Category</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                placeholder="e.g. Wedding, Portrait"
                className="rounded-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Date</Label>
              <Input
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                placeholder="e.g. March 2025"
                className="rounded-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                Cover Image * (max 10MB)
              </Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setForm((p) => ({ ...p, cover: e.target.files?.[0] || null }))}
                className="rounded-none"
              />
              {form.cover && form.cover.size > 10 * 1024 * 1024 && (
                <p className="text-xs text-destructive">File too large. Maximum size is 10MB.</p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Project description..."
              className="rounded-none resize-none"
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleCreate}
              disabled={uploading}
              className="bg-gold text-background hover:bg-gold/90 rounded-none"
            >
              {uploading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {uploading ? "Creating..." : "Create Project"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              className="rounded-none"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Projects List */}
        <div className="space-y-3 lg:col-span-1">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground">All Projects</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted animate-pulse" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No projects yet</p>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`flex items-center gap-3 p-3 cursor-pointer border transition-colors ${
                  selectedProject?.id === project.id
                    ? "border-gold bg-gold/5"
                    : "border-border hover:border-foreground/30"
                }`}
              >
                <div className="relative h-14 w-20 shrink-0 overflow-hidden">
                  <Image src={project.cover_image} alt={project.title} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{project.title}</p>
                  <p className="text-xs text-muted-foreground">{project.category} · {project.date}</p>
                  <p className="text-xs text-muted-foreground">{project.project_images.length} images</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); handleDelete(project) }}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Project Images Manager */}
        <div className="lg:col-span-2">
          {!selectedProject ? (
            <div className="flex items-center justify-center h-48 border border-dashed border-border">
              <p className="text-sm text-muted-foreground">Select a project to manage its images</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm uppercase tracking-widest text-muted-foreground">
                  {selectedProject.title} — Images
                </h2>
                <span className="text-xs text-muted-foreground">
                  {selectedProject.project_images.length} images
                </span>
              </div>

              {/* Add Image Form */}
              <div className="border border-border p-4 space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground">
                  Add Image (max 10MB)
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageForm((p) => ({ ...p, file: e.target.files?.[0] || null }))}
                      className="rounded-none"
                    />
                    {imageForm.file && imageForm.file.size > 10 * 1024 * 1024 && (
                      <p className="text-xs text-destructive">File too large. Maximum size is 10MB.</p>
                    )}
                  </div>
                  <Input
                    value={imageForm.caption}
                    onChange={(e) => setImageForm((p) => ({ ...p, caption: e.target.value }))}
                    placeholder="Caption (optional)"
                    className="rounded-none"
                  />
                </div>
                <Button
                  onClick={handleAddImage}
                  disabled={addingImage || !imageForm.file}
                  className="bg-gold text-background hover:bg-gold/90 rounded-none"
                >
                  {addingImage ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ImagePlus className="h-4 w-4 mr-2" />}
                  {addingImage ? "Uploading..." : "Add Image"}
                </Button>
              </div>

              {/* Images Grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                {selectedProject.project_images
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((img) => (
                    <div key={img.id} className="relative group">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={img.url}
                          alt={img.caption || "Project image"}
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() => handleDeleteImage(img)}
                          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      {img.caption && (
                        <p className="mt-1 text-xs text-muted-foreground truncate">{img.caption}</p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}