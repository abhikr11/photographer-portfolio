"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import NextImage from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Upload,
  Grid3X3,
  List,
  Pencil,
  Trash2,
  ImageIcon,
  Plus,
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
  description?: string
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
  const [activeCategory, setActiveCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")

  // Upload state
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadMode, setUploadMode] = useState<"single" | "bulk">("single")
  const [singleFile, setSingleFile] = useState<File | null>(null)
  const [singleTitle, setSingleTitle] = useState("")
  const [singleCategoryId, setSingleCategoryId] = useState("")
  const singleInputRef = useRef<HTMLInputElement>(null)
  const [bulkFiles, setBulkFiles] = useState<File[]>([])
  const [bulkCategoryId, setBulkCategoryId] = useState("")
  const bulkInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)          // overall batch progress (0-100)
  const [currentFileProgress, setCurrentFileProgress] = useState(0) // current file upload % (0-100)
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [totalFiles, setTotalFiles] = useState(0)
  const [dragOver, setDragOver] = useState(false)

  // Edit/Delete state
  const [editImage, setEditImage] = useState<Photo | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editCategoryId, setEditCategoryId] = useState("")
  const [deleteImage, setDeleteImage] = useState<Photo | null>(null)

  // Category management
  const [addCategoryOpen, setAddCategoryOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryDesc, setNewCategoryDesc] = useState("")
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [editCategoryName, setEditCategoryName] = useState("")
  const [editCategoryDesc, setEditCategoryDesc] = useState("")
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null)

  // Cloudinary config from env
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  const FOLDER = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER

  // Fetch data
  useEffect(() => {
    fetchImages()
    fetchCategories()
  }, [])

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/photos")
      const data = await res.json()
      setImages(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Failed to load images")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories")
      const data = await res.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Failed to load categories")
    }
  }

  const filteredImages = useMemo(() => {
    let filtered = images
    if (activeCategory !== "all") {
      filtered = filtered.filter((img) => img.category_id === activeCategory)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (img) =>
          img.title?.toLowerCase().includes(q) ||
          img.categories?.name?.toLowerCase().includes(q)
      )
    }
    return filtered
  }, [images, activeCategory, searchQuery])

  // Category CRUD
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return toast.error("Name is required")
    setCreatingCategory(true)
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newCategoryName.trim(),
        description: newCategoryDesc.trim(),
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setCategories((prev) => [...prev, data])
      setNewCategoryName("")
      setNewCategoryDesc("")
      setAddCategoryOpen(false)
      toast.success("Category created")
    } else {
      toast.error(data.error ?? "Failed to create category")
    }
    setCreatingCategory(false)
  }

  const handleEditCategory = async () => {
    if (!editCategory || !editCategoryName.trim()) return
    const res = await fetch("/api/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editCategory.id,
        name: editCategoryName.trim(),
        description: editCategoryDesc.trim(),
      }),
    })
    if (res.ok) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editCategory.id
            ? { ...c, name: editCategoryName.trim(), description: editCategoryDesc.trim() }
            : c
        )
      )
      setEditCategory(null)
      toast.success("Category updated")
    } else {
      toast.error("Failed to update category")
    }
  }

  const handleDeleteCategory = async (category: Category) => {
    const res = await fetch("/api/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: category.id }),
    })
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== category.id))
      if (activeCategory === category.id) setActiveCategory("all")
      setDeleteCategory(null)
      toast.success("Category deleted")
    } else {
      toast.error("Failed to delete category")
    }
  }

  // ==========================
  // QUALITY PRESERVING CONVERSION – only if >9.5MB
  // ==========================
  const MAX_SIZE_MB = 9        // target under 10MB
  const TRIGGER_SIZE_MB = 9.5  // only convert if larger than this

  // Convert to WebP with high quality (0.95 start)
  const convertToWebPAndCompress = async (file: File): Promise<File> => {
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
          // Only resize if image is extremely large (e.g., >3840px) – optional, adjust as needed
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

          let quality = 0.95   // start with very high quality
          const tryCompress = () => {
            canvas.toBlob(
              (blob) => {
                if (!blob) return reject(new Error("Conversion failed"))
                const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
                  type: "image/webp",
                })
                const sizeMB = webpFile.size / (1024 * 1024)
                if (sizeMB <= MAX_SIZE_MB || quality <= 0.75) {
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
      setTimeout(() => reject(new Error("Conversion timed out")), 30000)
    })
  }

  // Fallback to JPEG (if WebP fails)
  const fallbackToJPEG = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (e) => {
        const img = new window.Image()
        img.src = e.target?.result as string
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
          ctx?.drawImage(img, 0, 0, width, height)
          let quality = 0.95
          const tryCompress = () => {
            canvas.toBlob(
              (blob) => {
                if (!blob) return reject(new Error("JPEG conversion failed"))
                const jpegFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                  type: "image/jpeg",
                })
                const sizeMB = jpegFile.size / (1024 * 1024)
                if (sizeMB <= MAX_SIZE_MB || quality <= 0.75) {
                  resolve(jpegFile)
                } else {
                  quality -= 0.05
                  tryCompress()
                }
              },
              "image/jpeg",
              quality
            )
          }
          tryCompress()
        }
        img.onerror = reject
      }
      reader.onerror = reject
    })
  }

  // Upload to Cloudinary (unsigned) with optional progress callback
  const uploadToCloudinary = (
    file: File,
    title: string,
    categoryId: string,
    onProgress?: (percent: number) => void
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", UPLOAD_PRESET!)
      if (FOLDER) formData.append("folder", FOLDER)

      const xhr = new XMLHttpRequest()
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100)
          if (onProgress) onProgress(percent)
          if (uploadMode === "single") setUploadProgress(percent)
        }
      })
      xhr.addEventListener("load", async () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText)
          const saveRes = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cloudinary_url: data.secure_url,
              public_id: data.public_id,
              title: title || file.name,
              category_id: categoryId,
              width: data.width,
              height: data.height,
            }),
          })
          if (saveRes.ok) {
            const saved = await saveRes.json()
            resolve(saved.photo)
          } else {
            reject(new Error("Failed to save metadata"))
          }
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

  // Single upload – only convert if >9.5MB
  const handleSingleUpload = async () => {
    if (!singleFile || !singleCategoryId) {
      toast.error("Please select an image and a category")
      return
    }
    setUploading(true)
    setUploadProgress(0)
    try {
      let fileToUpload = singleFile
      const sizeMB = singleFile.size / (1024 * 1024)
      if (sizeMB > TRIGGER_SIZE_MB) {
        toast.info("Large image detected – optimising to under 10MB...")
        let converted
        try {
          converted = await convertToWebPAndCompress(singleFile)
        } catch (webpErr) {
          console.warn("WebP failed, using JPEG fallback", webpErr)
          converted = await fallbackToJPEG(singleFile)
        }
        fileToUpload = converted
      } else {
        toast.info("File already under 9.5MB – uploading original")
      }
      await uploadToCloudinary(fileToUpload, singleTitle, singleCategoryId)
      toast.success("Image uploaded!")
      setSingleFile(null)
      setSingleTitle("")
      setSingleCategoryId("")
      setUploadOpen(false)
      fetchImages()
    } catch (err: any) {
      toast.error(err.message || "Upload failed")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  // Bulk upload – process each file, convert only if >9.5MB, show per‑file progress
  const handleBulkUpload = async () => {
    if (!bulkFiles.length || !bulkCategoryId) {
      toast.error("Please select images and a category")
      return
    }
    setUploading(true)
    setTotalFiles(bulkFiles.length)
    setCurrentFileIndex(0)
    setCurrentFileProgress(0)
    setUploadProgress(0)

    let uploaded = 0
    let failed = 0

    for (let i = 0; i < bulkFiles.length; i++) {
      const file = bulkFiles[i]
      setCurrentFileIndex(i + 1)
      setCurrentFileProgress(0)
      try {
        let fileToUpload = file
        const sizeMB = file.size / (1024 * 1024)
        if (sizeMB > TRIGGER_SIZE_MB) {
          toast.info(`Optimising ${file.name}...`)
          let converted
          try {
            converted = await convertToWebPAndCompress(file)
          } catch (webpErr) {
            console.warn(`WebP failed for ${file.name}, using JPEG`, webpErr)
            converted = await fallbackToJPEG(file)
          }
          fileToUpload = converted
        }
        // Upload with progress callback to update current file percentage
        await uploadToCloudinary(fileToUpload, file.name, bulkCategoryId, (percent) => {
          setCurrentFileProgress(percent)
        })
        uploaded++
        setUploadProgress(Math.round((uploaded / bulkFiles.length) * 100))
      } catch (err) {
        console.error(`Failed: ${file.name}`, err)
        failed++
      }
    }

    if (failed > 0) {
      toast.warning(`${uploaded} uploaded, ${failed} failed`)
    } else {
      toast.success(`Successfully uploaded ${uploaded} image${uploaded > 1 ? "s" : ""}!`)
    }
    setBulkFiles([])
    setBulkCategoryId("")
    setUploadOpen(false)
    setUploading(false)
    setUploadProgress(0)
    setCurrentFileProgress(0)
    fetchImages()
  }

  // Edit image metadata
  const handleEditImage = async () => {
    if (!editImage) return
    const res = await fetch("/api/photos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editImage.id,
        title: editTitle.trim(),
        category_id: editCategoryId,
      }),
    })
    if (res.ok) {
      toast.success("Image updated")
      setEditImage(null)
      fetchImages()
    } else {
      toast.error("Failed to update image")
    }
  }

  // Delete image
  const handleDeleteImage = async (image: Photo) => {
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
      toast.error("Failed to delete image")
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
            className="rounded-none border-border bg-card pl-9 text-foreground focus:border-gold"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-border">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${
                viewMode === "grid" ? "bg-gold text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${
                viewMode === "list" ? "bg-gold text-background" : "text-muted-foreground hover:text-foreground"
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

      {/* Categories filter tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-4 py-1.5 text-xs uppercase tracking-widest transition-colors border ${
            activeCategory === "all"
              ? "bg-gold text-background border-gold"
              : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center">
            <button
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 text-xs uppercase tracking-widest transition-colors border ${
                activeCategory === cat.id
                  ? "bg-gold text-background border-gold"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.name}
            </button>
            <button
              onClick={() => {
                setEditCategory(cat)
                setEditCategoryName(cat.name)
                setEditCategoryDesc(cat.description || "")
              }}
              className="ml-0.5 p-1.5 text-muted-foreground hover:text-gold transition-colors border border-border"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              onClick={() => setDeleteCategory(cat)}
              className="ml-0.5 p-1.5 text-muted-foreground hover:text-destructive transition-colors border border-border"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAddCategoryOpen(true)}
          className="rounded-none border-border text-foreground hover:border-gold hover:text-gold text-xs"
        >
          <Plus className="mr-1 h-3 w-3" />
          New Category
        </Button>
      </div>

      {/* Image count */}
      <p className="text-sm text-muted-foreground">
        {filteredImages.length} of {images.length} images
      </p>

      {loading && <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>}

      {/* Grid View */}
      {viewMode === "grid" && !loading && (
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
                  <NextImage
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
                  <p className="mt-1 text-sm text-foreground truncate">{image.title ?? "Untitled"}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && !loading && (
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
                      <NextImage
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
              Images under 9.5 MB are uploaded as‑is. Larger images are converted to high‑quality WebP.
            </DialogDescription>
          </DialogHeader>

          <div className="flex border border-border">
            <button
              onClick={() => setUploadMode("single")}
              className={`flex-1 py-2 text-xs uppercase tracking-widest transition-colors ${
                uploadMode === "single" ? "bg-gold text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Single
            </button>
            <button
              onClick={() => setUploadMode("bulk")}
              className={`flex-1 py-2 text-xs uppercase tracking-widest transition-colors ${
                uploadMode === "bulk" ? "bg-gold text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Bulk
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"))
                if (uploadMode === "single") {
                  setSingleFile(files[0] ?? null)
                } else {
                  setBulkFiles(files)
                }
              }}
              className={`flex cursor-pointer flex-col items-center justify-center border-2 border-dashed p-12 transition-colors ${
                dragOver ? "border-gold bg-gold/5" : "border-border hover:border-gold/50"
              }`}
              onClick={() => (uploadMode === "single" ? singleInputRef.current?.click() : bulkInputRef.current?.click())}
              role="button"
              tabIndex={0}
            >
              <ImageIcon className="mb-3 h-10 w-10 text-muted-foreground" />
              {uploadMode === "single" ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {singleFile ? singleFile.name : "Drop your image here or click to browse"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/60">Any format – optimised only if &gt;9.5 MB</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    {bulkFiles.length > 0 ? `${bulkFiles.length} files selected` : "Drop multiple images or click to browse"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/60">Each file checked & optimised only if needed</p>
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
                  <span>
                    {uploadMode === "bulk" && totalFiles > 0
                      ? `Uploading ${currentFileIndex} of ${totalFiles} - ${currentFileProgress}%`
                      : `Uploading... ${uploadProgress}%`}
                  </span>
                  <span>{uploadMode === "bulk" ? `${uploadProgress}%` : `${uploadProgress}%`}</span>
                </div>
                <Progress value={uploadProgress} className="h-1" />
              </div>
            )}

            {uploadMode === "single" && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Title (optional)</Label>
                  <Input
                    placeholder="Image title"
                    value={singleTitle}
                    onChange={(e) => setSingleTitle(e.target.value)}
                    className="rounded-none border-border bg-background focus:border-gold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Category</Label>
                  <Select value={singleCategoryId} onValueChange={setSingleCategoryId}>
                    <SelectTrigger className="rounded-none border-border bg-background">
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
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Category</Label>
                <Select value={bulkCategoryId} onValueChange={setBulkCategoryId}>
                  <SelectTrigger className="rounded-none border-border bg-background">
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
                ? uploadMode === "bulk"
                  ? `Processing ${currentFileIndex} of ${totalFiles}`
                  : `Processing...`
                : uploadMode === "bulk"
                ? `Upload ${bulkFiles.length > 0 ? bulkFiles.length + " Images" : "Images"}`
                : "Upload Image"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={addCategoryOpen} onOpenChange={setAddCategoryOpen}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">New Category</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a new category for your images.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name"
              className="rounded-none border-border bg-background focus:border-gold"
            />
            <Input
              value={newCategoryDesc}
              onChange={(e) => setNewCategoryDesc(e.target.value)}
              placeholder="Description (optional)"
              className="rounded-none border-border bg-background focus:border-gold"
            />
            <Button
              disabled={creatingCategory}
              className="bg-gold text-background hover:bg-gold-light rounded-none"
              onClick={handleCreateCategory}
            >
              {creatingCategory ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={!!editCategory} onOpenChange={() => setEditCategory(null)}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Edit Category</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Input
              value={editCategoryName}
              onChange={(e) => setEditCategoryName(e.target.value)}
              className="rounded-none border-border bg-background focus:border-gold"
            />
            <Input
              value={editCategoryDesc}
              onChange={(e) => setEditCategoryDesc(e.target.value)}
              className="rounded-none border-border bg-background focus:border-gold"
            />
            <Button className="bg-gold text-background rounded-none" onClick={handleEditCategory}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Image Dialog */}
      <Dialog open={!!editImage} onOpenChange={() => setEditImage(null)}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Edit Image</DialogTitle>
          </DialogHeader>
          {editImage && (
            <div className="flex flex-col gap-4">
              <div className="relative aspect-video overflow-hidden">
                <NextImage
                  src={editImage.cloudinary_url}
                  alt={editImage.title ?? "Photo"}
                  fill
                  className="object-cover"
                  sizes="500px"
                />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Title</Label>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="rounded-none border-border bg-background focus:border-gold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Category</Label>
                  <Select value={editCategoryId} onValueChange={setEditCategoryId}>
                    <SelectTrigger className="rounded-none border-border bg-background">
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
              <Button className="bg-gold text-background rounded-none" onClick={handleEditImage}>
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Category Alert */}
      <AlertDialog open={!!deleteCategory} onOpenChange={() => setDeleteCategory(null)}>
        <AlertDialogContent className="border-border bg-card text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl">Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteCategory?.name}"? Images in this category will become uncategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-none bg-destructive text-destructive-foreground"
              onClick={() => deleteCategory && handleDeleteCategory(deleteCategory)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Image Alert */}
      <AlertDialog open={!!deleteImage} onOpenChange={() => setDeleteImage(null)}>
        <AlertDialogContent className="border-border bg-card text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl">Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteImage?.title}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-none bg-destructive text-destructive-foreground"
              onClick={() => deleteImage && handleDeleteImage(deleteImage)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}