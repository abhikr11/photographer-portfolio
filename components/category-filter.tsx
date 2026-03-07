"use client"

import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

type Category = {
  id: string
  name: string
  description: string
}

type CategoryFilterProps = {
  activeCategory: string
  onCategoryChange: (category: string) => void
  categories: Category[]
}

export function CategoryFilter({
  activeCategory,
  onCategoryChange,
  categories,
}: CategoryFilterProps) {
  const allCategories = ["All", ...categories.map((c) => c.name)]

  const activeDescription =
    activeCategory === "All"
      ? "Browse through our complete collection of photographs."
      : categories.find((c) => c.name === activeCategory)?.description ?? ""

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {allCategories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={"px-5 py-1.5 text-xs uppercase tracking-widest transition-colors border " +
              (activeCategory === category
                ? "bg-gold text-background border-gold"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30")}
          >
            {category}
          </button>
        ))}
      </div>

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