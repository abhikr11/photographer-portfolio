"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ScrollProgress } from "@/components/scroll-progress"
import { Section, SectionHeader } from "@/components/section"
import { CategoryFilter } from "@/components/category-filter"
import { GalleryGrid, type GalleryImage } from "@/components/gallery-grid"
import { LightboxModal } from "@/components/lightbox-modal"

type Category = {
  id: string
  name: string
  description: string
}

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [allPhotos, setAllPhotos] = useState<GalleryImage[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  useEffect(() => {
    Promise.all([
      fetch("/api/photos").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([photos, cats]) => {
        setAllPhotos(Array.isArray(photos) ? photos : [])
        setCategories(Array.isArray(cats) ? cats : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredImages = useMemo(() => {
    if (activeCategory === "All") return allPhotos
    return allPhotos.filter((img) => img.categories?.name === activeCategory)
  }, [activeCategory, allPhotos])

  const handleImageClick = useCallback((index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }, [])

  const handlePrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === 0 ? filteredImages.length - 1 : prev - 1
    )
  }, [filteredImages.length])

  const handleNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === filteredImages.length - 1 ? 0 : prev + 1
    )
  }, [filteredImages.length])

  return (
    <main>
      <ScrollProgress />
      <Navbar />

      <div className="pt-32 pb-8">
        <SectionHeader
          title="Gallery"
          subtitle="Browse through our complete collection of photographs, organized by category."
        />
      </div>

      {/* Filters */}
      <div className="mx-auto max-w-7xl px-6 pb-8">
        {loading ? (
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-20 bg-muted animate-pulse rounded-full" />
            ))}
          </div>
        ) : (
          <CategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            categories={categories}
          />
        )}
      </div>

      <Section className="pt-4">
        {loading ? (
          <div className="masonry-grid">
            {[300, 400, 250, 350, 300, 450, 280, 320, 380].map((h, i) => (
              <div
                key={i}
                className="animate-pulse bg-muted"
                style={{ height: h }}
              />
            ))}
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="flex items-center justify-center py-32">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              No photos found
            </p>
          </div>
        ) : (
          <GalleryGrid
            images={filteredImages}
            onImageClick={handleImageClick}
          />
        )}
      </Section>

      <LightboxModal
        images={filteredImages}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      <Footer />
    </main>
  )
}