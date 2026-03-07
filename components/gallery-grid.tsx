"use client"

import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

export type GalleryImage = {
  id: string
  title: string
  category_id: string
  cloudinary_url: string
  public_id: string
  width: number
  height: number
  aspect_ratio: number
  created_at: string
  categories: {
    id: string
    name: string
    description: string
  }
}

type GalleryGridProps = {
  images: GalleryImage[]
  onImageClick: (index: number) => void
}

export function GalleryGrid({ images = [], onImageClick }: GalleryGridProps) {
  return (
    <div className="masonry-grid">
      <AnimatePresence mode="popLayout">
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.3) }}
            className="group cursor-pointer overflow-hidden"
            onClick={() => onImageClick(index)}
          >
            <div className="relative overflow-hidden">
              <Image
                src={image.cloudinary_url}
                alt={image.title ?? "Gallery image"}
                width={image.width}
                height={image.height}
                className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                loading={index < 6 ? "eager" : "lazy"}
                priority={index < 3}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 translate-y-4 p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="text-xs uppercase tracking-widest text-gold">
                  {image.categories?.name}
                </p>
                <p className="mt-1 font-serif text-lg text-foreground">
                  {image.title}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}