"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Pencil, Trash2, FolderOpen } from "lucide-react"
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

type Category = {
  id: string
  name: string
  description?: string
}

export default function CategoriesManagementPage() {
  const [categoriesList, setCategoriesList] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [addOpen, setAddOpen] = useState(false)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null)

  const [newName, setNewName] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [editName, setEditName] = useState("")
  const [editDesc, setEditDesc] = useState("")

  // ==========================
  // FETCH ALL
  // ==========================
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories")
      const data = await res.json()
      setCategoriesList(Array.isArray(data) ? data : [])
    } catch (err) {
      toast.error("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  // ==========================
  // ADD CATEGORY
  // ==========================
  const handleAdd = async () => {
    if (!newName.trim()) return toast.error("Name is required")

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDesc.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed")

      setCategoriesList((prev) => [...prev, data])
      setNewName("")
      setNewDesc("")
      setAddOpen(false)

      toast.success("Category created")
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  // ==========================
  // EDIT CATEGORY
  // ==========================
  const handleEdit = async () => {
    if (!editCategory || !editName.trim()) return

    try {
      const res = await fetch("/api/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editCategory.id,
          name: editName.trim(),
          description: editDesc.trim(),
        }),
      })

      if (!res.ok) throw new Error("Update failed")

      setCategoriesList((prev) =>
        prev.map((cat) =>
          cat.id === editCategory.id
            ? { ...cat, name: editName.trim(), description: editDesc.trim() }
            : cat
        )
      )

      setEditCategory(null)
      toast.success("Category updated")
    } catch {
      toast.error("Failed to update category")
    }
  }

  // ==========================
  // DELETE CATEGORY
  // ==========================
  const handleDelete = async () => {
    if (!deleteCategory) return

    try {
      const res = await fetch("/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteCategory.id }),
      })

      if (!res.ok) throw new Error("Delete failed")

      setCategoriesList((prev) =>
        prev.filter((cat) => cat.id !== deleteCategory.id)
      )

      setDeleteCategory(null)
      toast.success("Category deleted")
    } catch {
      toast.error("Failed to delete category")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading..." : `${categoriesList.length} categories`}
        </p>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-gold text-background hover:bg-gold-light rounded-none text-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Categories List */}
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {categoriesList.map((category) => (
            <motion.div
              key={category.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center justify-between border border-border p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center border border-border text-gold">
                  <FolderOpen className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {category.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {category.description || "No description"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-gold"
                  onClick={() => {
                    setEditCategory(category)
                    setEditName(category.name)
                    setEditDesc(category.description || "")
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>

                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive-foreground"
                  onClick={() => setDeleteCategory(category)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>
              Create a new category.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Category name"
            />
            <Input
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Description (optional)"
            />
            <Button onClick={handleAdd} className="bg-gold text-background">
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editCategory}
        onOpenChange={() => setEditCategory(null)}
      >
        <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <Input
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />
            <Button onClick={handleEdit} className="bg-gold text-background">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteCategory}
        onOpenChange={() => setDeleteCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteCategory?.name}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}