"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, Trash2, ImagePlus, X, Loader2, Video, Play, Upload } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

type ProjectImage = {
  id: string
  url: string
  public_id: string
  caption: string
  order_index: number
}

type ProjectVideo = {
  id: string
  youtube_video_id: string
  title: string
  description: string
  thumbnail_url: string
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
  project_videos?: ProjectVideo[]
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState<"photos" | "videos">("photos")

  // New project form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    coverFile: null as File | null,
  })
  const [creating, setCreating] = useState(false)
  const [coverUploadProgress, setCoverUploadProgress] = useState(0)

  // Add project image state
  const [addingImage, setAddingImage] = useState(false)
  const [imageCaption, setImageCaption] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUploadProgress, setImageUploadProgress] = useState(0)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // Add video state (direct upload to Render backend)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoTitle, setVideoTitle] = useState("")
  const [videoDesc, setVideoDesc] = useState("")
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [videoUploadProgress, setVideoUploadProgress] = useState(0)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Cloudinary config
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  const RENDER_UPLOAD_URL = process.env.NEXT_PUBLIC_RENDER_UPLOAD_URL || "http://localhost:3001/upload"

  // Compression logic (same as before)
  const MAX_SIZE_MB = 9
  const TRIGGER_SIZE_MB = 9.5

  const compressImage = async (file: File): Promise<File> => {
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB <= TRIGGER_SIZE_MB) return file

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (e) => {
        const img = new window.Image()
        img.src = e.target?.result as string
        img.onerror = () => reject(new Error("Failed to load image"))
        img.onload = () => {
          const canvas = document.createElement("canvas")
          let width = img.width
          let height = img.height
          const maxWidth = 3840
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext("2d")
          if (!ctx) return reject(new Error("Canvas context failed"))
          ctx.drawImage(img, 0, 0, width, height)

          let quality = 0.95
          const tryCompress = () => {
            canvas.toBlob(
              (blob) => {
                if (!blob) return reject(new Error("Conversion failed"))
                const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), { type: "image/webp" })
                const newSizeMB = webpFile.size / (1024 * 1024)
                if (newSizeMB <= MAX_SIZE_MB || quality <= 0.75) {
                  resolve(webpFile)
                } else {
                  quality -= 0.05
                  tryCompress()
                }
              },
              "image/webp",
              quality
            )
          }
          tryCompress()
        }
      }
      reader.onerror = () => reject(new Error("File read failed"))
      setTimeout(() => reject(new Error("Compression timed out")), 30000)
    })
  }

  const uploadToCloudinary = (file: File, folder: string, onProgress?: (percent: number) => void): Promise<{ url: string; public_id: string }> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", UPLOAD_PRESET!)
      formData.append("folder", folder)

      const xhr = new XMLHttpRequest()
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) onProgress(Math.round((event.loaded / event.total) * 100))
      })
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText)
          resolve({ url: data.secure_url, public_id: data.public_id })
        } else {
          let errorMsg = `Upload failed (${xhr.status})`
          try {
            const err = JSON.parse(xhr.responseText)
            errorMsg = err.error?.message || err.message || errorMsg
          } catch {}
          reject(new Error(errorMsg))
        }
      })
      xhr.addEventListener("error", () => reject(new Error("Network error")))
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`)
      xhr.send(formData)
    })
  }

  // Fetch projects
  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    const res = await fetch("/api/projects")
    const data = await res.json()
    setProjects(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const fetchProjectVideos = async (projectId: string) => {
    const res = await fetch(`/api/projects/videos?project_id=${projectId}`)
    const videos = await res.json()
    return videos
  }

  // Create project
  const handleCreateProject = async () => {
    if (!form.title || !form.coverFile) {
      toast.error("Title and cover image are required")
      return
    }

    setCreating(true)
    setCoverUploadProgress(0)

    try {
      let fileToUpload = form.coverFile
      const sizeMB = form.coverFile.size / (1024 * 1024)
      if (sizeMB > TRIGGER_SIZE_MB) {
        toast.info("Optimising cover image...")
        fileToUpload = await compressImage(form.coverFile)
      }

      const { url, public_id } = await uploadToCloudinary(fileToUpload, "projects/covers", (p) =>
        setCoverUploadProgress(p)
      )

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          date: form.date,
          cover_image: url,
          cover_public_id: public_id,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success("Project created!")
        setForm({ title: "", description: "", category: "", date: "", coverFile: null })
        setShowForm(false)
        fetchProjects()
      } else {
        toast.error(data.error || "Failed to create project")
      }
    } catch (err: any) {
      toast.error(err.message || "Upload failed")
    } finally {
      setCreating(false)
      setCoverUploadProgress(0)
    }
  }

  const handleDeleteProject = async (project: Project) => {
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

  // Add project image
  const handleAddImage = async () => {
    if (!imageFile || !selectedProject) return

    setAddingImage(true)
    setImageUploadProgress(0)

    try {
      let fileToUpload = imageFile
      const sizeMB = imageFile.size / (1024 * 1024)
      if (sizeMB > TRIGGER_SIZE_MB) {
        toast.info("Optimising image...")
        fileToUpload = await compressImage(imageFile)
      }

      const { url, public_id } = await uploadToCloudinary(fileToUpload, "projects/images", (p) =>
        setImageUploadProgress(p)
      )

      const res = await fetch("/api/projects/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: selectedProject.id,
          url,
          public_id,
          caption: imageCaption,
          order_index: selectedProject.project_images.length,
        }),
      })

      if (res.ok) {
        const newImage = await res.json()
        setSelectedProject((prev) =>
          prev ? { ...prev, project_images: [...prev.project_images, newImage] } : prev
        )
        toast.success("Image added")
        setImageFile(null)
        setImageCaption("")
        if (imageInputRef.current) imageInputRef.current.value = ""
        fetchProjects()
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to save image")
      }
    } catch (err: any) {
      toast.error(err.message || "Upload failed")
    } finally {
      setAddingImage(false)
      setImageUploadProgress(0)
    }
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

  // Add project video (direct to Render backend) with REAL progress
  const handleAddVideo = async () => {
    if (!videoFile || !selectedProject) {
      toast.error("Please select a video file")
      return
    }

    setUploadingVideo(true)
    setVideoUploadProgress(0)

    const formData = new FormData()
    formData.append("video", videoFile)
    formData.append("title", videoTitle || videoFile.name)
    formData.append("description", videoDesc || "")
    formData.append("playlist_id", "")
    formData.append("youtube_playlist_id", "")

    const xhr = new XMLHttpRequest()
    // Real progress during file transfer
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100)
        setVideoUploadProgress(percent)
      }
    })
    xhr.addEventListener("load", async () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText)
        // After file upload completes, keep progress at 100% and show processing indicator
        setVideoUploadProgress(100)
        toast.info("Uploaded to server. Processing video on YouTube...")

        // Save to project_videos
        const saveRes = await fetch("/api/projects/videos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_id: selectedProject.id,
            youtube_video_id: data.youtubeVideoId,
            title: data.title,
            description: data.description,
            thumbnail_url: data.thumbnail_url,
            order_index: (selectedProject.project_videos?.length || 0),
          }),
        })
        if (saveRes.ok) {
          const newVideo = await saveRes.json()
          setSelectedProject((prev) => ({
            ...prev!,
            project_videos: [...(prev?.project_videos || []), newVideo],
          }))
          toast.success("Video uploaded and added to project!")
          setVideoFile(null)
          setVideoTitle("")
          setVideoDesc("")
          if (videoInputRef.current) videoInputRef.current.value = ""
          fetchProjects()
        } else {
          const err = await saveRes.json()
          toast.error(err.error || "Failed to save video metadata")
        }
      } else {
        let errorMsg = `Upload failed (${xhr.status})`
        try {
          const err = JSON.parse(xhr.responseText)
          errorMsg = err.error || errorMsg
        } catch {}
        toast.error(errorMsg)
      }
      setUploadingVideo(false)
      setVideoUploadProgress(0)
    })
    xhr.addEventListener("error", () => {
      toast.error("Network error – is your backend running?")
      setUploadingVideo(false)
      setVideoUploadProgress(0)
    })
    xhr.open("POST", RENDER_UPLOAD_URL)
    xhr.send(formData)
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Remove this video from the project?")) return
    const res = await fetch("/api/projects/videos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: videoId }),
    })
    if (res.ok) {
      setSelectedProject((prev) => ({
        ...prev!,
        project_videos: prev?.project_videos?.filter((v) => v.id !== videoId) || [],
      }))
      toast.success("Video removed")
      fetchProjects()
    } else {
      toast.error("Failed to remove video")
    }
  }

  // Load videos when a project is selected
  useEffect(() => {
    if (selectedProject) {
      fetchProjectVideos(selectedProject.id).then((videos) => {
        setSelectedProject((prev) => prev ? { ...prev, project_videos: videos } : prev)
      })
    }
  }, [selectedProject?.id])

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

      {/* Create Project Form */}
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
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Cover Image *</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setForm((p) => ({ ...p, coverFile: e.target.files?.[0] || null }))}
                className="rounded-none"
              />
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
          {creating && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Uploading cover...</span>
                <span>{coverUploadProgress}%</span>
              </div>
              <Progress value={coverUploadProgress} className="h-1" />
            </div>
          )}
          <div className="flex gap-3">
            <Button
              onClick={handleCreateProject}
              disabled={creating || !form.coverFile}
              className="bg-gold text-background hover:bg-gold/90 rounded-none"
            >
              {creating ? "Creating..." : "Create Project"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-none">
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
                  <p className="text-xs text-muted-foreground">
                    {project.project_images.length} images · {project.project_videos?.length || 0} videos
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); handleDeleteProject(project) }}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Project Detail Manager with Tabs */}
        <div className="lg:col-span-2">
          {!selectedProject ? (
            <div className="flex items-center justify-center h-48 border border-dashed border-border">
              <p className="text-sm text-muted-foreground">Select a project to manage its images and videos</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tab Switcher */}
              <div className="flex border-b border-border">
                <button
                  onClick={() => setActiveTab("photos")}
                  className={`px-4 py-2 text-sm uppercase tracking-widest transition-colors ${
                    activeTab === "photos"
                      ? "border-b-2 border-gold text-gold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Photos
                </button>
                <button
                  onClick={() => setActiveTab("videos")}
                  className={`px-4 py-2 text-sm uppercase tracking-widest transition-colors ${
                    activeTab === "videos"
                      ? "border-b-2 border-gold text-gold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Videos
                </button>
              </div>

              {/* PHOTOS TAB */}
              {activeTab === "photos" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm uppercase tracking-widest text-muted-foreground">
                      {selectedProject.title} — Images
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      {selectedProject.project_images.length} images
                    </span>
                  </div>

                  <div className="border border-border p-4 space-y-3">
                    <h3 className="text-xs uppercase tracking-widest text-muted-foreground">
                      Add Image
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex flex-col gap-1">
                        <Input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                          className="rounded-none"
                        />
                      </div>
                      <Input
                        value={imageCaption}
                        onChange={(e) => setImageCaption(e.target.value)}
                        placeholder="Caption (optional)"
                        className="rounded-none"
                      />
                    </div>
                    {addingImage && (
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Uploading...</span>
                          <span>{imageUploadProgress}%</span>
                        </div>
                        <Progress value={imageUploadProgress} className="h-1" />
                      </div>
                    )}
                    <Button
                      onClick={handleAddImage}
                      disabled={addingImage || !imageFile}
                      className="bg-gold text-background hover:bg-gold/90 rounded-none"
                    >
                      {addingImage ? "Uploading..." : <><ImagePlus className="h-4 w-4 mr-2" /> Add Image</>}
                    </Button>
                  </div>

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

              {/* VIDEOS TAB */}
              {activeTab === "videos" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm uppercase tracking-widest text-muted-foreground">
                      {selectedProject.title} — Videos
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      {selectedProject.project_videos?.length || 0} videos
                    </span>
                  </div>

                  {/* Upload new video */}
                  <div className="border border-border p-4 space-y-3">
                    <h3 className="text-xs uppercase tracking-widest text-muted-foreground">
                      Upload New Video
                    </h3>
                    <div className="grid gap-3">
                      <div className="flex flex-col gap-1">
                        <Input
                          ref={videoInputRef}
                          type="file"
                          accept="video/*"
                          onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                          className="rounded-none"
                        />
                      </div>
                      <Input
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        placeholder="Video title (optional)"
                        className="rounded-none"
                      />
                      <Textarea
                        value={videoDesc}
                        onChange={(e) => setVideoDesc(e.target.value)}
                        placeholder="Description (optional)"
                        className="rounded-none resize-none"
                        rows={2}
                      />
                    </div>
                    {uploadingVideo && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {videoUploadProgress < 100
                              ? `Uploading to server... ${videoUploadProgress}%`
                              : "Processing video on YouTube... (this may take a moment)"}
                          </span>
                          {videoUploadProgress < 100 && <span>{videoUploadProgress}%</span>}
                        </div>
                        {videoUploadProgress < 100 ? (
                          <Progress value={videoUploadProgress} className="h-1" />
                        ) : (
                          <div className="flex items-center justify-center py-2">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gold border-t-transparent" />
                          </div>
                        )}
                      </div>
                    )}
                    <Button
                      onClick={handleAddVideo}
                      disabled={uploadingVideo || !videoFile}
                      className="bg-gold text-background hover:bg-gold/90 rounded-none"
                    >
                      {uploadingVideo ? "Uploading..." : <><Upload className="h-4 w-4 mr-2" /> Upload Video</>}
                    </Button>
                  </div>

                  {/* List of existing videos */}
                  {(!selectedProject.project_videos || selectedProject.project_videos.length === 0) ? (
                    <div className="border border-dashed border-border p-8 text-center">
                      <p className="text-sm text-muted-foreground">No videos added yet.</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload a video using the form above.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {selectedProject.project_videos.map((video) => (
                        <div key={video.id} className="relative group border border-border overflow-hidden">
                          <div className="relative aspect-video">
                            <img
                              src={video.thumbnail_url}
                              alt={video.title || "Video thumbnail"}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                              <a
                                href={`https://www.youtube.com/watch?v=${video.youtube_video_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-background"
                              >
                                <Play className="h-5 w-5" />
                              </a>
                            </div>
                            <button
                              onClick={() => handleDeleteVideo(video.id)}
                              className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="p-2">
                            <p className="text-xs font-medium truncate">{video.title || "Untitled"}</p>
                            <p className="text-xs text-muted-foreground truncate">{video.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}