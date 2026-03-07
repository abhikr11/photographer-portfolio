"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Section, SectionHeader } from "@/components/section"

type Photo = {
  id: string
  title: string
  cloudinary_url: string
  width: number
  height: number
  categories: { name: string }
}

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function FeaturedGallery() {
  const [featured, setFeatured] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/photos")
      .then((r) => r.json())
      .then((data: Photo[]) => {
        const featuredPhotos = Array.isArray(data)
          ? data.filter((p) => p.categories?.name === "Featured").slice(0, 6)
          : []
        setFeatured(featuredPhotos)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Section>
        <SectionHeader
          title="Featured Work"
          subtitle="A curated selection of our finest captures."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`animate-pulse bg-muted ${i === 1 ? "aspect-[4/3] sm:col-span-2" : "aspect-[3/4]"}`}
            />
          ))}
        </div>
      </Section>
    )
  }

  if (featured.length === 0) return null

  return (
    <Section>
      <SectionHeader
        title="Featured Work"
        subtitle="A curated selection of our finest captures, from intimate weddings to breathtaking landscapes."
      />

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {featured.map((photo, i) => (
          <motion.div
            key={photo.id}
            variants={item}
            className={`group relative overflow-hidden ${
              i === 0 ? "sm:col-span-2 sm:row-span-2" : ""
            }`}
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={photo.cloudinary_url}
                alt={photo.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes={i === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                priority={i === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 translate-y-4 p-6 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="text-xs uppercase tracking-widest text-gold">
                  {photo.categories?.name}
                </p>
                <p className="mt-1 font-serif text-lg text-foreground">
                  {photo.title}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-12 text-center">
        <Button
          asChild
          variant="outline"
          size="lg"
          className="rounded-none border-foreground/20 px-8 text-sm uppercase tracking-widest text-foreground hover:border-gold hover:text-gold hover:bg-transparent"
        >
          <Link href="/gallery">
            View Full Gallery
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Section>
  )
}