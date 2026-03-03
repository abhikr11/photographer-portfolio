"use client"

import { Play, X } from "lucide-react"
import { motion } from "framer-motion"

type Video = {
  id: string
  title: string
  description: string
  category: string
  thumbnailUrl: string
  videoUrl: string
}

type VideoCardProps = {
  video: Video
  index: number
  onClick: () => void
}

export function VideoCard({ video, index, onClick }: VideoCardProps) {
  const youtubeId = video.videoUrl.split("/embed/")[1]?.split("?")[0] ?? ""
  const thumbnailUrl = "https://i.ytimg.com/vi/" + youtubeId + "/hqdefault.jpg"

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-background/30 transition-colors group-hover:bg-background/50">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-foreground/50 text-foreground transition-all group-hover:border-gold group-hover:text-gold group-hover:scale-110">
            <Play className="h-6 w-6 fill-current" />
          </div>
        </div>
      </div>
      <div className="mt-3">
        <p className="text-xs uppercase tracking-widest text-gold">
          {video.category}
        </p>
        <h3 className="mt-1 font-serif text-lg text-foreground">
          {video.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {video.description}
        </p>
      </div>
    </motion.div>
  )
}

type VideoModalProps = {
  video: Video | null
  isOpen: boolean
  onClose: () => void
}

export function VideoModal({ video, isOpen, onClose }: VideoModalProps) {
  if (!isOpen || !video) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-background/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 z-10 p-2 text-foreground transition-colors hover:text-gold"
        onClick={onClose}
        aria-label="Close video"
      >
        <X className="h-6 w-6" />
      </button>

      <div
        className="w-full max-w-4xl px-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-video w-full overflow-hidden">
          <iframe
            src={video.videoUrl + "?autoplay=1"}
            title={video.title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="mt-4 text-center">
          <p className="text-xs uppercase tracking-widest text-gold">
            {video.category}
          </p>
          <p className="mt-1 font-serif text-xl text-foreground">
            {video.title}
          </p>
        </div>
      </div>
    </motion.div>
  )
}