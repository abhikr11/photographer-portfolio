"use client"

import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

type Category = {
  id: string
  name: string
  description: string
}

type CategoryFilterProps = {
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export function CategoryFilter({
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to fetch categories:", err))
  }, [])

  const allCategories = ["All", ...categories.map((c) => c.name)]

  // Find description of active category
  const activeDescription =
    activeCategory === "All"
      ? "Browse through our complete collection of photographs."
      : categories.find((c) => c.name === activeCategory)?.description ?? ""

  return (
    <div className="flex flex-col items-center gap-4">

      {/* Filter Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {allCategories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={cn(
              "relative px-5 py-2 text-xs uppercase tracking-widest transition-colors duration-300",
              activeCategory === category
                ? "text-gold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {activeCategory === category && (
              <motion.div
                layoutId="category-pill"
                className="absolute inset-0 rounded-full border border-gold/50 bg-gold/10"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">{category}</span>
          </button>
        ))}
      </div>

      {/* Category Description */}
      <AnimatePresence mode="wait">
        <motion.p
          key={activeCategory}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="text-center text-sm italic text-muted-foreground max-w-md"
        >
          {activeDescription}
        </motion.p>
      </AnimatePresence>

    </div>
  )
}