"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ScrollProgress } from "@/components/scroll-progress"
import { Section, SectionHeader } from "@/components/section"
import { CategoryFilter } from "@/components/category-filter"
import { GalleryGrid, type GalleryImage } from "@/components/gallery-grid"
import { LightboxModal } from "@/components/lightbox-modal"
import { useInView } from "react-intersection-observer"

type Category = {
  id: string
  name: string
  description: string
}

const INITIAL_LOAD = 24   // number of images to load initially
const LOAD_MORE = 24       // how many more to load each time

// Deterministic skeleton heights (repeats after 10 items) – no Math.random()
const SKELETON_HEIGHTS = [320, 280, 360, 240, 300, 340, 260, 380, 220, 310]

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [allPhotos, setAllPhotos] = useState<GalleryImage[]>([])
  const [displayedPhotos, setDisplayedPhotos] = useState<GalleryImage[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Intersection observer for "load more" trigger
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: "200px",
  })

  // Fetch all data once
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

  // Reset pagination when category changes
  useEffect(() => {
    setDisplayedPhotos([])
    setHasMore(true)
    setLoadingMore(false)
  }, [activeCategory])

  // Filter images based on active category
  const filteredImages = useMemo(() => {
    if (activeCategory === "All") return allPhotos
    return allPhotos.filter((img) => img.categories?.name === activeCategory)
  }, [activeCategory, allPhotos])

  // Load initial batch when filteredImages changes
  useEffect(() => {
    if (!filteredImages.length) {
      setDisplayedPhotos([])
      setHasMore(false)
      return
    }
    const initial = filteredImages.slice(0, INITIAL_LOAD)
    setDisplayedPhotos(initial)
    setHasMore(initial.length < filteredImages.length)
  }, [filteredImages])

  // Load more when user scrolls to the trigger
  useEffect(() => {
    if (!inView || loadingMore || !hasMore) return
    setLoadingMore(true)

    const currentLength = displayedPhotos.length
    const nextBatch = filteredImages.slice(currentLength, currentLength + LOAD_MORE)
    if (nextBatch.length) {
      setTimeout(() => {
        setDisplayedPhotos((prev) => [...prev, ...nextBatch])
        setHasMore(currentLength + nextBatch.length < filteredImages.length)
        setLoadingMore(false)
      }, 300) // small delay to avoid overwhelming render
    } else {
      setHasMore(false)
      setLoadingMore(false)
    }
  }, [inView, loadingMore, hasMore, displayedPhotos.length, filteredImages])

  const handleImageClick = useCallback((index: number) => {
    // Map displayed photo index to original filtered index for lightbox navigation
    const originalIndex = filteredImages.findIndex(
      (img) => img.id === displayedPhotos[index]?.id
    )
    setLightboxIndex(originalIndex >= 0 ? originalIndex : 0)
    setLightboxOpen(true)
  }, [displayedPhotos, filteredImages])

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

  // Skeleton items (stable heights using CSS columns)
  const skeletonCount = 12

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
          // Stable skeleton grid using CSS columns – deterministic heights, no Math.random()
          <div className="columns-1 gap-4 sm:columns-2 md:columns-3 lg:columns-4">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className="mb-4 break-inside-avoid">
                <div 
                  className="animate-pulse bg-muted rounded-lg" 
                  style={{ height: `${SKELETON_HEIGHTS[i % SKELETON_HEIGHTS.length]}px` }}
                />
              </div>
            ))}
          </div>
        ) : displayedPhotos.length === 0 ? (
          <div className="flex items-center justify-center py-32">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              No photos found
            </p>
          </div>
        ) : (
          <>
            <GalleryGrid
              images={displayedPhotos}
              onImageClick={handleImageClick}
              eagerFirstImages={6}
            />
            {/* Load more trigger */}
            {hasMore && (
              <div ref={loadMoreRef} className="py-8 text-center">
                {loadingMore && (
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
                )}
              </div>
            )}
          </>
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