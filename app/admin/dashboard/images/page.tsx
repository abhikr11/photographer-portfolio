"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Upload,
  Grid3X3,
  List,
  Pencil,
  Trash2,
  ImageIcon,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

type Category = {
  id: string
  name: string
  description: string
}

type Photo = {
  id: string
  title: string
  category_id: string
  cloudinary_url: string
  public_id: string
  width: number
  height: number
  created_at: string
  categories: {
    id: string
    name: string
  }
}

export default function ImagesManagementPage() {
  const [images, setImages] = useState<Photo[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadMode, setUploadMode] = useState<"single" | "bulk">("single")
  const [editImage, setEditImage] = useState<Photo | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editCategoryId, setEditCategoryId] = useState("")
  const [deleteImage, setDeleteImage] = useState<Photo | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)

  // Single upload fields
  const [singleFile, setSingleFile] = useState<File | null>(null)
  const [singleTitle, setSingleTitle] = useState("")
  const [singleCategoryId, setSingleCategoryId] = useState("")
  const singleInputRef = useRef<HTMLInputElement>(null)

  // Bulk upload fields
  const [bulkFiles, setBulkFiles] = useState<File[]>([])
  const [bulkCategoryId, setBulkCategoryId] = useState("")
  const bulkInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchImages()
    fetchCategories()
  }, [])

  const fetchImages = async () => {
    const res = await fetch("/api/photos")
    const data = await res.json()
    setImages(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const fetchCategories = async () => {
    const res = await fetch("/api/categories")
    const data = await res.json()
    setCategories(Array.isArray(data) ? data : [])
  }

  const filteredImages = useMemo(() => {
    if (!searchQuery) return images
    const q = searchQuery.toLowerCase()
    return images.filter(
      (img) =>
        img.title?.toLowerCase().includes(q) ||
        img.categories?.name?.toLowerCase().includes(q)
    )
  }, [images, searchQuery])

  // Single upload
  const handleSingleUpload = async () => {
    if (!singleFile || !singleCategoryId) {
      toast.error("Please select a file and category")
      return
    }
    setUploading(true)
    setUploadProgress(20)
    const formData = new FormData()
    formData.append("file", singleFile)
    formData.append("category_id", singleCategoryId)
    formData.append("title", singleTitle || singleFile.name)
    try {
      setUploadProgress(50)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      setUploadProgress(100)
      if (res.ok) {
        toast.success("Image uploaded successfully!")
        setSingleFile(null)
        setSingleTitle("")
        setSingleCategoryId("")
        setUploadOpen(false)
        fetchImages()
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
    if (!bulkFiles.length || !bulkCategoryId) {
      toast.error("Please select files and a category")
      return
    }
    setUploading(true)
    let uploaded = 0
    for (const file of bulkFiles) {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("category_id", bulkCategoryId)
      formData.append("title", file.name)
      try {
        await fetch("/api/upload", { method: "POST", body: formData })
        uploaded++
        setUploadProgress(Math.round((uploaded / bulkFiles.length) * 100))
      } catch {
        toast.error(`Failed to upload ${file.name}`)
      }
    }
    toast.success(`${uploaded} image${uploaded > 1 ? "s" : ""} uploaded!`)
    setBulkFiles([])
    setBulkCategoryId("")
    setUploadOpen(false)
    setUploading(false)
    setUploadProgress(0)
    fetchImages()
  }

  // ✅ FIXED: Edit title and category
  const handleEdit = async () => {
    if (!editImage) return
    if (!editTitle.trim()) {
      toast.error("Title cannot be empty")
      return
    }
    if (!editCategoryId) {
      toast.error("Please select a category")
      return
    }
    const res = await fetch("/api/photos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editImage.id,
        title: editTitle.trim(),
        category_id: editCategoryId,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success("Image updated!")
      setEditImage(null)
      fetchImages()
    } else {
      toast.error(data.error ?? "Failed to update image")
    }
  }

  // Delete image
  const handleDelete = async (image: Photo) => {
    const res = await fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: image.id, public_id: image.public_id }),
    })
    if (res.ok) {
      setImages((prev) => prev.filter((img) => img.id !== image.id))
      setDeleteImage(null)
      toast.success(`"${image.title}" deleted`)
    } else {
      toast.error("Failed to delete")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-none border-border bg-card pl-9 text-foreground placeholder:text-muted-foreground focus:border-gold"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-border">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${
                viewMode === "grid"
                  ? "bg-gold text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${
                viewMode === "list"
                  ? "bg-gold text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button
            onClick={() => setUploadOpen(true)}
            className="bg-gold text-background hover:bg-gold-light rounded-none text-sm"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      {/* Image count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredImages.length} of {images.length} images
      </p>

      {loading && (
        <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filteredImages.map((image) => (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative overflow-hidden border border-border"
              >
                <div className="relative aspect-square">
                  <Image
                    src={image.cloudinary_url}
                    alt={image.title ?? "Photo"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-background/60 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      size="icon-sm"
                      variant="outline"
                      className="rounded-none border-foreground/30 text-foreground hover:border-gold hover:text-gold hover:bg-transparent"
                      onClick={() => {
                        setEditImage(image)
                        setEditTitle(image.title ?? "")
                        setEditCategoryId(image.category_id)
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="outline"
                      className="rounded-none border-foreground/30 text-foreground hover:border-destructive-foreground hover:text-destructive-foreground hover:bg-transparent"
                      onClick={() => setDeleteImage(image)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-gold">{image.categories?.name}</p>
                  <p className="mt-1 text-sm text-foreground truncate">
                    {image.title ?? "Untitled"}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="overflow-hidden border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-muted-foreground">Image</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-muted-foreground">Title</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-muted-foreground sm:table-cell">Category</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-muted-foreground md:table-cell">Date</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-widest text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredImages.map((image) => (
                <tr key={image.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2">
                    <div className="relative h-10 w-10 overflow-hidden">
                      <Image
                        src={image.cloudinary_url}
                        alt={image.title ?? "Photo"}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm text-foreground">{image.title ?? "Untitled"}</td>
                  <td className="hidden px-4 py-2 text-xs text-gold sm:table-cell">{image.categories?.name}</td>
                  <td className="hidden px-4 py-2 text-sm text-muted-foreground md:table-cell">
                    {new Date(image.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-gold"
                        onClick={() => {
                          setEditImage(image)
                          setEditTitle(image.title ?? "")
                          setEditCategoryId(image.category_id)
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive-foreground"
                        onClick={() => setDeleteImage(image)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Upload Image</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Upload one image or multiple at once.
            </DialogDescription>
          </DialogHeader>

          <div className="flex border border-border">
            <button
              onClick={() => setUploadMode("single")}
              className={`flex-1 py-2 text-xs uppercase tracking-widest transition-colors ${
                uploadMode === "single"
                  ? "bg-gold text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Single
            </button>
            <button
              onClick={() => setUploadMode("bulk")}
              className={`flex-1 py-2 text-xs uppercase tracking-widest transition-colors ${
                uploadMode === "bulk"
                  ? "bg-gold text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Bulk
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                const files = Array.from(e.dataTransfer.files).filter((f) =>
                  f.type.startsWith("image/")
                )
                if (uploadMode === "single") {
                  setSingleFile(files[0] ?? null)
                } else {
                  setBulkFiles(files)
                }
              }}
              className={`flex cursor-pointer flex-col items-center justify-center border-2 border-dashed p-12 transition-colors ${
                dragOver ? "border-gold bg-gold/5" : "border-border hover:border-gold/50"
              }`}
              onClick={() => {
                uploadMode === "single"
                  ? singleInputRef.current?.click()
                  : bulkInputRef.current?.click()
              }}
              role="button"
              tabIndex={0}
            >
              <ImageIcon className="mb-3 h-10 w-10 text-muted-foreground" />
              {uploadMode === "single" ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {singleFile ? singleFile.name : "Drop your image here or click to browse"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/60">JPG, PNG, WEBP up to 50MB</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    {bulkFiles.length > 0 ? `${bulkFiles.length} files selected` : "Drop multiple images or click to browse"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/60">Select multiple files at once</p>
                </>
              )}
            </div>

            <input
              ref={singleInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setSingleFile(e.target.files?.[0] ?? null)}
            />
            <input
              ref={bulkInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => setBulkFiles(Array.from(e.target.files ?? []))}
            />

            {uploading && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-1" />
              </div>
            )}

            {uploadMode === "single" && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                    Title (optional)
                  </Label>
                  <Input
                    placeholder="Image title"
                    value={singleTitle}
                    onChange={(e) => setSingleTitle(e.target.value)}
                    className="rounded-none border-border bg-background text-foreground focus:border-gold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                    Category
                  </Label>
                  <Select value={singleCategoryId} onValueChange={setSingleCategoryId}>
                    <SelectTrigger className="rounded-none border-border bg-background text-foreground">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {uploadMode === "bulk" && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Category
                </Label>
                <Select value={bulkCategoryId} onValueChange={setBulkCategoryId}>
                  <SelectTrigger className="rounded-none border-border bg-background text-foreground">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
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
                ? `Upload ${bulkFiles.length > 0 ? bulkFiles.length + " Images" : "Images"}`
                : "Upload Image"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editImage} onOpenChange={() => setEditImage(null)}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Edit Image</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update the image title and category.
            </DialogDescription>
          </DialogHeader>
          {editImage && (
            <div className="flex flex-col gap-4">
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={editImage.cloudinary_url}
                  alt={editImage.title ?? "Photo"}
                  fill
                  className="object-cover"
                  sizes="500px"
                />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                    Title
                  </Label>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="rounded-none border-border bg-background text-foreground focus:border-gold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                    Category
                  </Label>
                  <Select value={editCategoryId} onValueChange={setEditCategoryId}>
                    <SelectTrigger className="rounded-none border-border bg-background text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                className="w-full bg-gold text-background hover:bg-gold-light rounded-none text-sm uppercase tracking-widest"
                onClick={handleEdit}
              >
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteImage} onOpenChange={() => setDeleteImage(null)}>
        <AlertDialogContent className="border-border bg-card text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl text-foreground">
              Delete Image
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete &quot;{deleteImage?.title}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none border-border text-foreground hover:bg-accent">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteImage && handleDelete(deleteImage)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}