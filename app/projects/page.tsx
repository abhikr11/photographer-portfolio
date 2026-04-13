"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, X, Play } from "lucide-react"
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

type ProjectVideo = {
  id: string
  youtube_video_id: string
  title: string
  description: string
  thumbnail_url: string
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
  project_videos?: ProjectVideo[]
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
          loading={index < 3 ? "eager" : "lazy"}
          fetchPriority={index === 0 ? "high" : undefined}
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
  const [videos, setVideos] = useState<ProjectVideo[]>(project.project_videos || [])

  // Optionally fetch videos if not included in project object
  useEffect(() => {
    if (!project.project_videos && project.id) {
      fetch(`/api/projects/videos?project_id=${project.id}`)
        .then((res) => res.json())
        .then((data) => setVideos(Array.isArray(data) ? data : []))
        .catch(() => setVideos([]))
    }
  }, [project.id, project.project_videos])

  const allMedia = [
    ...(project.project_images || []).map((img) => ({ type: "image", data: img })),
    ...(videos || []).map((vid) => ({ type: "video", data: vid })),
  ].sort((a, b) => (a.data.order_index || 0) - (b.data.order_index || 0))

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
          loading="eager"
          fetchPriority="high"
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
          {allMedia.map((item, idx) => (
            <motion.div
              key={item.type === "image" ? (item.data as ProjectImage).id : (item.data as ProjectVideo).id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="overflow-hidden"
            >
              {item.type === "image" ? (
                <>
                  <Image
                    src={(item.data as ProjectImage).url}
                    alt={(item.data as ProjectImage).caption || "Project image"}
                    width={1200}
                    height={800}
                    className="w-full object-cover"
                    sizes="(max-width: 1024px) 100vw, 896px"
                    loading="lazy"
                  />
                  {(item.data as ProjectImage).caption && (
                    <p className="mt-3 text-center text-sm italic text-muted-foreground">
                      {(item.data as ProjectImage).caption}
                    </p>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <div className="relative aspect-video overflow-hidden rounded-lg">
                    <iframe
                      src={`https://www.youtube.com/embed/${(item.data as ProjectVideo).youtube_video_id}`}
                      title={(item.data as ProjectVideo).title || "Project video"}
                      className="absolute inset-0 h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  {(item.data as ProjectVideo).title && (
                    <p className="text-center text-sm font-medium text-foreground">
                      {(item.data as ProjectVideo).title}
                    </p>
                  )}
                  {(item.data as ProjectVideo).description && (
                    <p className="text-center text-sm text-muted-foreground">
                      {(item.data as ProjectVideo).description}
                    </p>
                  )}
                </div>
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
        // Ensure each project has project_videos array (even if empty)
        const projectsWithVideos = (Array.isArray(data) ? data : []).map((p) => ({
          ...p,
          project_videos: p.project_videos || [],
        }))
        setProjects(projectsWithVideos)
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