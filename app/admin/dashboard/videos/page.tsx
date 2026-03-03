"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Upload, Trash2, FolderOpen, Play, VideoIcon, LogIn, Pencil } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"

type Playlist = {
  id: string
  name: string
  description: string
  youtube_playlist_id: string
  created_at: string
}

type Video = {
  id: string
  playlist_id: string
  youtube_video_id: string
  title: string
  description: string
  thumbnail_url: string
  created_at: string
  video_playlists: { id: string; name: string }
}

export default function VideosManagementPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [activePlaylist, setActivePlaylist] = useState("all")
  const [loading, setLoading] = useState(true)

  // Add playlist
  const [addPlaylistOpen, setAddPlaylistOpen] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("")
  const [creatingPlaylist, setCreatingPlaylist] = useState(false)

  // Edit playlist
  const [editPlaylist, setEditPlaylist] = useState<Playlist | null>(null)
  const [editPlaylistName, setEditPlaylistName] = useState("")
  const [editPlaylistDesc, setEditPlaylistDesc] = useState("")

  // Delete playlist
  const [deletePlaylist, setDeletePlaylist] = useState<Playlist | null>(null)

  // Upload
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadMode, setUploadMode] = useState<"single" | "bulk">("single")

  // Single upload
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoTitle, setVideoTitle] = useState("")
  const [videoDesc, setVideoDesc] = useState("")
  const [videoPlaylistId, setVideoPlaylistId] = useState("")
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Bulk upload
  const [bulkFiles, setBulkFiles] = useState<File[]>([])
  const [bulkPlaylistId, setBulkPlaylistId] = useState("")
  const bulkInputRef = useRef<HTMLInputElement>(null)

  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)

  // Edit video
  const [editVideo, setEditVideo] = useState<Video | null>(null)
  const [editVideoTitle, setEditVideoTitle] = useState("")
  const [editVideoDesc, setEditVideoDesc] = useState("")
  const [editVideoPlaylistId, setEditVideoPlaylistId] = useState("")

  // Delete video
  const [deleteVideo, setDeleteVideo] = useState<Video | null>(null)

  useEffect(() => { checkAuth() }, [])

  const checkAuth = async () => {
    const res = await fetch("/api/auth/youtube/status")
    const data = await res.json()
    setIsAuthenticated(data.authenticated)
    if (data.authenticated) {
      fetchPlaylists()
      fetchVideos()
    }
    setLoading(false)
  }

  const fetchPlaylists = async () => {
    const res = await fetch("/api/youtube/playlists")
    const data = await res.json()
    setPlaylists(Array.isArray(data) ? data : [])
  }

  const fetchVideos = async () => {
    const res = await fetch("/api/youtube/videos")
    const data = await res.json()
    setVideos(Array.isArray(data) ? data : [])
  }

  const filteredVideos = activePlaylist === "all"
    ? videos
    : videos.filter((v) => v.playlist_id === activePlaylist)

  const handleYouTubeLogin = () => {
    window.location.href = "/api/auth/youtube"
  }

  // Create playlist
  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return toast.error("Name is required")
    setCreatingPlaylist(true)
    const res = await fetch("/api/youtube/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newPlaylistName.trim(), description: newPlaylistDesc.trim() }),
    })
    const data = await res.json()
    if (res.ok) {
      setPlaylists((prev) => [data, ...prev])
      setNewPlaylistName("")
      setNewPlaylistDesc("")
      setAddPlaylistOpen(false)
      toast.success("Playlist created on YouTube!")
    } else {
      toast.error(data.error ?? "Failed to create playlist")
    }
    setCreatingPlaylist(false)
  }

  // Edit playlist
  const handleEditPlaylist = async () => {
    if (!editPlaylist || !editPlaylistName.trim()) return
    const res = await fetch("/api/youtube/playlists", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editPlaylist.id,
        youtube_playlist_id: editPlaylist.youtube_playlist_id,
        name: editPlaylistName.trim(),
        description: editPlaylistDesc.trim(),
      }),
    })
    if (res.ok) {
      setPlaylists((prev) =>
        prev.map((p) =>
          p.id === editPlaylist.id
            ? { ...p, name: editPlaylistName.trim(), description: editPlaylistDesc.trim() }
            : p
        )
      )
      setEditPlaylist(null)
      toast.success("Playlist updated!")
    } else {
      toast.error("Failed to update playlist")
    }
  }

  // Delete playlist
  const handleDeletePlaylist = async (playlist: Playlist) => {
    const res = await fetch("/api/youtube/playlists", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: playlist.id, youtube_playlist_id: playlist.youtube_playlist_id }),
    })
    if (res.ok) {
      setPlaylists((prev) => prev.filter((p) => p.id !== playlist.id))
      setVideos((prev) => prev.filter((v) => v.playlist_id !== playlist.id))
      setDeletePlaylist(null)
      toast.success("Playlist deleted!")
    } else {
      toast.error("Failed to delete playlist")
    }
  }

  // Single upload
  const handleSingleUpload = async () => {
    if (!videoFile || !videoPlaylistId) {
      toast.error("Please select a video and playlist")
      return
    }
    setUploading(true)
    setUploadProgress(10)
    const selectedPlaylist = playlists.find((p) => p.id === videoPlaylistId)
    const formData = new FormData()
    formData.append("file", videoFile)
    formData.append("title", videoTitle || videoFile.name)
    formData.append("description", videoDesc)
    formData.append("playlist_id", videoPlaylistId)
    formData.append("youtube_playlist_id", selectedPlaylist?.youtube_playlist_id ?? "")
    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 85) { clearInterval(progressInterval); return 85 }
          return prev + 5
        })
      }, 1000)
      const res = await fetch("/api/youtube/videos", { method: "POST", body: formData })
      clearInterval(progressInterval)
      setUploadProgress(100)
      const data = await res.json()
      if (res.ok) {
        toast.success("Video uploaded to YouTube!")
        setVideoFile(null)
        setVideoTitle("")
        setVideoDesc("")
        setVideoPlaylistId("")
        setUploadOpen(false)
        fetchVideos()
      } else {
        toast.error(data.error ?? "Upload failed")
      }
    } catch {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  // Bulk upload
  const handleBulkUpload = async () => {
    if (!bulkFiles.length || !bulkPlaylistId) {
      toast.error("Please select videos and a playlist")
      return
    }
    setUploading(true)
    const selectedPlaylist = playlists.find((p) => p.id === bulkPlaylistId)
    let uploaded = 0
    for (const file of bulkFiles) {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", file.name)
      formData.append("description", "")
      formData.append("playlist_id", bulkPlaylistId)
      formData.append("youtube_playlist_id", selectedPlaylist?.youtube_playlist_id ?? "")
      try {
        await fetch("/api/youtube/videos", { method: "POST", body: formData })
        uploaded++
        setUploadProgress(Math.round((uploaded / bulkFiles.length) * 100))
      } catch {
        toast.error("Failed to upload " + file.name)
      }
    }
    toast.success(uploaded + " video" + (uploaded > 1 ? "s" : "") + " uploaded!")
    setBulkFiles([])
    setBulkPlaylistId("")
    setUploadOpen(false)
    setUploading(false)
    setUploadProgress(0)
    fetchVideos()
  }

  // Edit video
  const handleEditVideo = async () => {
    if (!editVideo) return
    const res = await fetch("/api/youtube/videos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editVideo.id,
        youtube_video_id: editVideo.youtube_video_id,
        title: editVideoTitle.trim(),
        description: editVideoDesc.trim(),
        playlist_id: editVideoPlaylistId,
      }),
    })
    if (res.ok) {
      setEditVideo(null)
      fetchVideos()
      toast.success("Video updated!")
    } else {
      toast.error("Failed to update video")
    }
  }

  // Delete video
  const handleDeleteVideo = async (video: Video) => {
    const res = await fetch("/api/youtube/videos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: video.id, youtube_video_id: video.youtube_video_id }),
    })
    if (res.ok) {
      setVideos((prev) => prev.filter((v) => v.id !== video.id))
      setDeleteVideo(null)
      toast.success("Video deleted!")
    } else {
      toast.error("Failed to delete video")
    }
  }

  const openVideoOnYoutube = (videoId: string) => {
    window.open("https://www.youtube.com/watch?v=" + videoId, "_blank")
  }

  if (!loading && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24">
        <div className="flex h-16 w-16 items-center justify-center border border-border text-gold">
          <VideoIcon className="h-8 w-8" />
        </div>
        <div className="text-center">
          <h2 className="font-serif text-2xl text-foreground">YouTube Not Connected</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Go to Settings to connect your YouTube account before uploading videos.
          </p>
        </div>
        <Button
          onClick={handleYouTubeLogin}
          className="bg-gold text-background hover:bg-gold-light rounded-none text-sm uppercase tracking-widest"
        >
          <LogIn className="mr-2 h-4 w-4" />
          Connect YouTube Account
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {filteredVideos.length} video{filteredVideos.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setAddPlaylistOpen(true)}
            className="rounded-none border-border text-foreground hover:border-gold hover:text-gold hover:bg-transparent text-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Playlist
          </Button>
          <Button
            onClick={() => setUploadOpen(true)}
            disabled={playlists.length === 0}
            className="bg-gold text-background hover:bg-gold-light rounded-none text-sm"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Video
          </Button>
        </div>
      </div>

      {/* Playlist filter tabs */}
      {playlists.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActivePlaylist("all")}
            className={"px-4 py-1.5 text-xs uppercase tracking-widest transition-colors border " + (activePlaylist === "all" ? "bg-gold text-background border-gold" : "border-border text-muted-foreground hover:text-foreground")}
          >
            All
          </button>
          {playlists.map((playlist) => (
            <div key={playlist.id} className="flex items-center">
              <button
                onClick={() => setActivePlaylist(playlist.id)}
                className={"px-4 py-1.5 text-xs uppercase tracking-widest transition-colors border " + (activePlaylist === playlist.id ? "bg-gold text-background border-gold" : "border-border text-muted-foreground hover:text-foreground")}
              >
                {playlist.name}
              </button>
              <button
                onClick={() => {
                  setEditPlaylist(playlist)
                  setEditPlaylistName(playlist.name)
                  setEditPlaylistDesc(playlist.description ?? "")
                }}
                className="ml-0.5 p-1.5 text-muted-foreground hover:text-gold transition-colors border border-border"
              >
                <Pencil className="h-3 w-3" />
              </button>
              <button
                onClick={() => setDeletePlaylist(playlist)}
                className="ml-0.5 p-1.5 text-muted-foreground hover:text-destructive transition-colors border border-border"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty playlists */}
      {playlists.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center gap-4 border border-dashed border-border py-16">
          <FolderOpen className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No playlists yet. Create one to get started.</p>
          <Button
            onClick={() => setAddPlaylistOpen(true)}
            className="bg-gold text-background hover:bg-gold-light rounded-none text-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Playlist
          </Button>
        </div>
      )}

      {/* Videos Grid */}
      {filteredVideos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filteredVideos.map((video) => (
              <motion.div
                key={video.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative overflow-hidden border border-border"
              >
                <div className="relative aspect-video">
                  <img
                    src={"https://i.ytimg.com/vi/" + video.youtube_video_id + "/hqdefault.jpg"}
                    alt={video.title ?? "Video"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon-sm"
                        variant="outline"
                        className="rounded-none border-foreground/30 text-foreground hover:border-gold hover:text-gold hover:bg-transparent"
                        onClick={() => openVideoOnYoutube(video.youtube_video_id)}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="outline"
                        className="rounded-none border-foreground/30 text-foreground hover:border-gold hover:text-gold hover:bg-transparent"
                        onClick={() => {
                          setEditVideo(video)
                          setEditVideoTitle(video.title ?? "")
                          setEditVideoDesc(video.description ?? "")
                          setEditVideoPlaylistId(video.playlist_id)
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="outline"
                        className="rounded-none border-foreground/30 text-foreground hover:border-destructive-foreground hover:text-destructive-foreground hover:bg-transparent"
                        onClick={() => setDeleteVideo(video)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-gold">{video.video_playlists?.name}</p>
                  <p className="mt-1 text-sm text-foreground truncate">{video.title ?? "Untitled"}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty videos */}
      {filteredVideos.length === 0 && playlists.length > 0 && (
        <div className="flex flex-col items-center justify-center gap-4 border border-dashed border-border py-16">
          <VideoIcon className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No videos yet. Upload one to get started.</p>
        </div>
      )}

      {/* Add Playlist Dialog */}
      <Dialog open={addPlaylistOpen} onOpenChange={setAddPlaylistOpen}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">New Playlist</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Creates an unlisted playlist on your YouTube account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Playlist Name</Label>
              <Input
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="e.g. Wedding Films"
                className="rounded-none border-border bg-background text-foreground focus:border-gold"
                onKeyDown={(e) => { if (e.key === "Enter") handleCreatePlaylist() }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Description (optional)</Label>
              <Input
                value={newPlaylistDesc}
                onChange={(e) => setNewPlaylistDesc(e.target.value)}
                placeholder="Brief description"
                className="rounded-none border-border bg-background text-foreground focus:border-gold"
              />
            </div>
            <Button
              disabled={creatingPlaylist}
              className="w-full bg-gold text-background hover:bg-gold-light rounded-none text-sm uppercase tracking-widest disabled:opacity-50"
              onClick={handleCreatePlaylist}
            >
              {creatingPlaylist ? "Creating on YouTube..." : "Create Playlist"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Playlist Dialog */}
      <Dialog open={!!editPlaylist} onOpenChange={() => setEditPlaylist(null)}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Edit Playlist</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Updates the playlist name and description on YouTube.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Playlist Name</Label>
              <Input
                value={editPlaylistName}
                onChange={(e) => setEditPlaylistName(e.target.value)}
                className="rounded-none border-border bg-background text-foreground focus:border-gold"
                onKeyDown={(e) => { if (e.key === "Enter") handleEditPlaylist() }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Description</Label>
              <Input
                value={editPlaylistDesc}
                onChange={(e) => setEditPlaylistDesc(e.target.value)}
                className="rounded-none border-border bg-background text-foreground focus:border-gold"
              />
            </div>
            <Button
              className="w-full bg-gold text-background hover:bg-gold-light rounded-none text-sm uppercase tracking-widest"
              onClick={handleEditPlaylist}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Video Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Upload Video</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Video will be uploaded to YouTube as unlisted.
            </DialogDescription>
          </DialogHeader>

          {/* Single / Bulk Toggle */}
          <div className="flex border border-border">
            <button
              onClick={() => setUploadMode("single")}
              className={"flex-1 py-2 text-xs uppercase tracking-widest transition-colors " + (uploadMode === "single" ? "bg-gold text-background" : "text-muted-foreground hover:text-foreground")}
            >
              Single
            </button>
            <button
              onClick={() => setUploadMode("bulk")}
              className={"flex-1 py-2 text-xs uppercase tracking-widest transition-colors " + (uploadMode === "bulk" ? "bg-gold text-background" : "text-muted-foreground hover:text-foreground")}
            >
              Bulk
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("video/"))
                if (uploadMode === "single") {
                  setVideoFile(files[0] ?? null)
                } else {
                  setBulkFiles(files)
                }
              }}
              onClick={() => uploadMode === "single" ? videoInputRef.current?.click() : bulkInputRef.current?.click()}
              className={"flex cursor-pointer flex-col items-center justify-center border-2 border-dashed p-12 transition-colors " + (dragOver ? "border-gold bg-gold/5" : "border-border hover:border-gold/50")}
              role="button"
              tabIndex={0}
            >
              <VideoIcon className="mb-3 h-10 w-10 text-muted-foreground" />
              {uploadMode === "single" ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {videoFile ? videoFile.name : "Drop your video here or click to browse"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/60">MP4, MOV, AVI up to 256MB</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    {bulkFiles.length > 0 ? bulkFiles.length + " videos selected" : "Drop multiple videos or click to browse"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/60">Select multiple video files at once</p>
                </>
              )}
            </div>

            {/* Hidden inputs */}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
            />
            <input
              ref={bulkInputRef}
              type="file"
              accept="video/*"
              multiple
              className="hidden"
              onChange={(e) => setBulkFiles(Array.from(e.target.files ?? []))}
            />

            {/* Progress */}
            {uploading && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Uploading to YouTube...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-1" />
              </div>
            )}

            {/* Single fields */}
            {uploadMode === "single" && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Title (optional)</Label>
                  <Input
                    placeholder="Video title"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    className="rounded-none border-border bg-background text-foreground focus:border-gold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Description (optional)</Label>
                  <Textarea
                    placeholder="Video description"
                    value={videoDesc}
                    onChange={(e) => setVideoDesc(e.target.value)}
                    rows={2}
                    className="rounded-none border-border bg-background text-foreground resize-none focus:border-gold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Playlist</Label>
                  <Select value={videoPlaylistId} onValueChange={setVideoPlaylistId}>
                    <SelectTrigger className="rounded-none border-border bg-background text-foreground">
                      <SelectValue placeholder="Select playlist" />
                    </SelectTrigger>
                    <SelectContent>
                      {playlists.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Bulk fields — only playlist */}
            {uploadMode === "bulk" && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Playlist</Label>
                <Select value={bulkPlaylistId} onValueChange={setBulkPlaylistId}>
                  <SelectTrigger className="rounded-none border-border bg-background text-foreground">
                    <SelectValue placeholder="Select playlist" />
                  </SelectTrigger>
                  <SelectContent>
                    {playlists.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              disabled={uploading}
              className="w-full bg-gold text-background hover:bg-gold-light rounded-none text-sm uppercase tracking-widest disabled:opacity-50"
              onClick={uploadMode === "single" ? handleSingleUpload : handleBulkUpload}
            >
              {uploading
                ? "Uploading..."
                : uploadMode === "bulk"
                ? "Upload " + (bulkFiles.length > 0 ? bulkFiles.length + " Videos" : "Videos")
                : "Upload to YouTube"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Video Dialog */}
      <Dialog open={!!editVideo} onOpenChange={() => setEditVideo(null)}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Edit Video</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update the video title, description and playlist.
            </DialogDescription>
          </DialogHeader>
          {editVideo && (
            <div className="flex flex-col gap-4">
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={"https://i.ytimg.com/vi/" + editVideo.youtube_video_id + "/hqdefault.jpg"}
                  alt={editVideo.title ?? "Video"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Title</Label>
                  <Input
                    value={editVideoTitle}
                    onChange={(e) => setEditVideoTitle(e.target.value)}
                    className="rounded-none border-border bg-background text-foreground focus:border-gold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Description</Label>
                  <Textarea
                    value={editVideoDesc}
                    onChange={(e) => setEditVideoDesc(e.target.value)}
                    rows={3}
                    className="rounded-none border-border bg-background text-foreground resize-none focus:border-gold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Playlist</Label>
                  <Select value={editVideoPlaylistId} onValueChange={setEditVideoPlaylistId}>
                    <SelectTrigger className="rounded-none border-border bg-background text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {playlists.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                className="w-full bg-gold text-background hover:bg-gold-light rounded-none text-sm uppercase tracking-widest"
                onClick={handleEditVideo}
              >
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Playlist */}
      <AlertDialog open={!!deletePlaylist} onOpenChange={() => setDeletePlaylist(null)}>
        <AlertDialogContent className="border-border bg-card text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl text-foreground">Delete Playlist</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete &quot;{deletePlaylist?.name}&quot;?
              This will delete it from YouTube and all its videos from your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none border-border text-foreground hover:bg-accent">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletePlaylist && handleDeletePlaylist(deletePlaylist)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Video */}
      <AlertDialog open={!!deleteVideo} onOpenChange={() => setDeleteVideo(null)}>
        <AlertDialogContent className="border-border bg-card text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl text-foreground">Delete Video</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete &quot;{deleteVideo?.title}&quot;?
              This will permanently delete the video from YouTube.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none border-border text-foreground hover:bg-accent">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteVideo && handleDeleteVideo(deleteVideo)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}