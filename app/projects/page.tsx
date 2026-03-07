"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ScrollProgress } from "@/components/scroll-progress"
import { Section, SectionHeader } from "@/components/section"

type ProjectImage = {
  id: string
  url: string
  caption: string
  order_index: number
}

type Project = {
  id: string
  title: string
  description: string
  category: string
  date: string
  cover_image: string
  project_images: ProjectImage[]
}

function ProjectCard({
  project,
  index,
  onClick,
}: {
  project: Project
  index: number
  onClick: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={project.cover_image}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 translate-y-4 p-6 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex items-center gap-2 text-gold">
            <span className="text-sm">View Project</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-xs uppercase tracking-widest text-gold">
          {project.category} &middot; {project.date}
        </p>
        <h3 className="mt-2 font-serif text-2xl text-foreground">
          {project.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {project.description}
        </p>
      </div>
    </motion.div>
  )
}

function ProjectDetail({
  project,
  onClose,
}: {
  project: Project
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] overflow-y-auto bg-background"
    >
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-10 text-foreground hover:text-gold"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      <div className="relative h-[50vh]">
        <Image
          src={project.cover_image}
          alt={project.title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-4xl px-6 pb-12">
          <p className="text-xs uppercase tracking-widest text-gold">
            {project.category} &middot; {project.date}
          </p>
          <h1 className="mt-2 font-serif text-4xl text-foreground md:text-5xl">
            {project.title}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-lg leading-relaxed text-muted-foreground">
          {project.description}
        </p>

        <div className="mt-12 flex flex-col gap-8">
          {project.project_images
            .sort((a, b) => a.order_index - b.order_index)
            .map((img, i) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="overflow-hidden"
              >
                <Image
                  src={img.url}
                  alt={img.caption || "Project image"}
                  width={1200}
                  height={800}
                  className="w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 896px"
                />
                {img.caption && (
                  <p className="mt-3 text-center text-sm italic text-muted-foreground">
                    {img.caption}
                  </p>
                )}
              </motion.div>
            ))}
        </div>

        <div className="mt-16 text-center">
          <Button
            variant="outline"
            className="rounded-none border-foreground/20 px-8 text-sm uppercase tracking-widest text-foreground hover:border-gold hover:text-gold hover:bg-transparent"
            onClick={onClose}
          >
            Back to Projects
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        setProjects(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <main>
      <ScrollProgress />
      <Navbar />

      <div className="pt-32 pb-8">
        <SectionHeader
          title="Projects"
          subtitle="Explore our featured projects, each telling a unique visual story from start to finish."
        />
      </div>

      <Section className="pt-4">
        {loading ? (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[16/10] bg-muted animate-pulse" />
                <div className="h-3 w-24 bg-muted animate-pulse" />
                <div className="h-6 w-3/4 bg-muted animate-pulse" />
                <div className="h-3 w-full bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex items-center justify-center py-32">
            <p className="text-sm text-muted-foreground">No projects yet.</p>
          </div>
        ) : (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                onClick={() => setSelectedProject(project)}
              />
            ))}
          </div>
        )}
      </Section>

      <AnimatePresence>
        {selectedProject && (
          <ProjectDetail
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>

      <Footer />
    </main>
  )
}