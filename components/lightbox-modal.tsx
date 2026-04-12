"use client"

import { useEffect, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { GalleryImage } from "@/components/gallery-grid"

type LightboxModalProps = {
  images: GalleryImage[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

export function LightboxModal({
  images,
  currentIndex,
  isOpen,
  onClose,
  onPrev,
  onNext,
}: LightboxModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") onPrev()
      if (e.key === "ArrowRight") onNext()
    },
    [onClose, onPrev, onNext]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen || !images[currentIndex]) return null

  const current = images[currentIndex]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md"
          onClick={onClose}
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:text-gold"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Close lightbox</span>
          </Button>

          {/* Counter */}
          <div className="absolute top-5 left-6 z-10 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
            <span className="font-medium">{currentIndex + 1}</span>
            <span className="text-white/70"> / {images.length}</span>
          </div>

          {/* Prev button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 z-10 text-white hover:text-gold"
            onClick={(e) => {
              e.stopPropagation()
              onPrev()
            }}
          >
            <ChevronLeft className="h-8 w-8" />
            <span className="sr-only">Previous image</span>
          </Button>

          {/* Image container – centered */}
          <div
            className="relative max-h-[85vh] max-w-[85vw] overflow-hidden rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative flex h-full w-full items-center justify-center"
            >
              <Image
                src={current.cloudinary_url}
                alt={current.title ?? "Gallery image"}
                width={current.width}
                height={current.height}
                className="h-auto w-auto max-h-[85vh] max-w-[85vw] object-contain"
                sizes="85vw"
                priority
              />
            </motion.div>

            {/* Caption overlay – always visible on the image */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pt-12">
              <p className="text-xs uppercase tracking-widest text-gold">
                {current.categories?.name || "Uncategorized"}
              </p>
              <p className="mt-1 font-serif text-xl text-white">
                {current.title || "Untitled"}
              </p>
              {current.categories?.description && (
                <p className="mt-1 text-sm text-white/80">
                  {current.categories.description}
                </p>
              )}
            </div>
          </div>

          {/* Next button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 z-10 text-white hover:text-gold"
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
          >
            <ChevronRight className="h-8 w-8" />
            <span className="sr-only">Next image</span>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}