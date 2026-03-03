"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ScrollProgress } from "@/components/scroll-progress"
import { Section, SectionHeader } from "@/components/section"
import { CategoryFilter } from "@/components/category-filter"
import { GalleryGrid, type GalleryImage } from "@/components/gallery-grid"
import { LightboxModal } from "@/components/lightbox-modal"

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [allPhotos, setAllPhotos] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Fetch all photos once on page load
  useEffect(() => {
    fetch("/api/photos")
      .then((res) => res.json())
      .then((data) => {
        // Make sure we always set an array
        setAllPhotos(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to fetch photos:", err)
        setLoading(false)
      })
  }, [])

  // Filter photos by active category on the frontend
  const filteredImages = useMemo(() => {
    if (activeCategory === "All") return allPhotos
    return allPhotos.filter(
      (img) => img.categories?.name === activeCategory
    )
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

      {/* Page header */}
      <div className="pt-32 pb-8">
        <SectionHeader
          title="Gallery"
          subtitle="Browse through our complete collection of photographs, organized by category."
        />
      </div>

      {/* Filters */}
      <div className="mx-auto max-w-7xl px-6 pb-8">
        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>

      {/* Gallery Grid */}
      <Section className="pt-4">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <p className="text-xs uppercase tracking-widest text-muted-foreground animate-pulse">
              Loading...
            </p>
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

      {/* Lightbox */}
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