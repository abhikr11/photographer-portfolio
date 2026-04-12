"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ScrollProgress } from "@/components/scroll-progress"
import { Section, SectionHeader } from "@/components/section"
import { VideoCard, VideoModal } from "@/components/video-card"

type Playlist = {
  id: string
  name: string
  description: string
  youtube_playlist_id: string
}

type DBVideo = {
  id: string
  playlist_id: string
  youtube_video_id: string
  title: string
  description: string
  thumbnail_url: string
  video_playlists: { id: string; name: string }
}

type VideoCardFormat = {
  id: string
  title: string
  description: string
  category: string
  thumbnailUrl: string
  videoUrl: string
}

export default function VideosPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [videos, setVideos] = useState<DBVideo[]>([])
  const [activePlaylist, setActivePlaylist] = useState("all")
  const [selectedVideo, setSelectedVideo] = useState<VideoCardFormat | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [playlistsRes, videosRes] = await Promise.all([
      fetch("/api/youtube/playlists"),
      fetch("/api/youtube/videos"),
    ])
    const playlistsData = await playlistsRes.json()
    const videosData = await videosRes.json()
    setPlaylists(Array.isArray(playlistsData) ? playlistsData : [])
    setVideos(Array.isArray(videosData) ? videosData : [])
    setLoading(false)
  }

  const filteredVideos = activePlaylist === "all"
    ? videos
    : videos.filter((v) => v.playlist_id === activePlaylist)

  const activeDescription = activePlaylist === "all"
    ? "Watch our cinematic films and behind-the-scenes reels."
    : playlists.find((p) => p.id === activePlaylist)?.description ?? ""

  const toVideoCardFormat = (video: DBVideo): VideoCardFormat => ({
    id: video.id,
    title: video.title ?? "Untitled",
    description: video.description ?? "",
    category: video.video_playlists?.name ?? "",
    thumbnailUrl: video.thumbnail_url,
    videoUrl: "https://www.youtube.com/embed/" + video.youtube_video_id,
  })

  return (
    <main>
      <ScrollProgress />
      <Navbar />

      <div className="pt-32 pb-8">
        <SectionHeader
          title="Videos"
          subtitle="Watch our cinematic films and behind-the-scenes reels."
        />
      </div>

      <Section className="pt-4">

        {/* Playlist filter */}
        {playlists.length > 0 && (
          <div className="mb-10 flex flex-col items-center gap-4">
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setActivePlaylist("all")}
                className={`px-5 py-1.5 text-xs uppercase tracking-widest transition-all duration-300 border rounded-full ${
                  activePlaylist === "all"
                    ? "bg-gradient-to-r from-amber-500 via-gold to-amber-500 text-background border-transparent shadow-md"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 bg-transparent"
                }`}
              >
                All
              </button>
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => setActivePlaylist(playlist.id)}
                  className={`px-5 py-1.5 text-xs uppercase tracking-widest transition-all duration-300 border rounded-full ${
                    activePlaylist === playlist.id
                      ? "bg-gradient-to-r from-amber-500 via-gold to-amber-500 text-background border-transparent shadow-md"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 bg-transparent"
                  }`}
                >
                  {playlist.name}
                </button>
              ))}
            </div>

            {/* Playlist description */}
            <AnimatePresence mode="wait">
              <motion.p
                key={activePlaylist}
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
        )}

        {/* Loading */}
        {loading && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="aspect-video bg-muted animate-pulse" />
                <div className="h-3 w-16 bg-muted animate-pulse" />
                <div className="h-5 w-3/4 bg-muted animate-pulse" />
                <div className="h-3 w-full bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {/* Videos grid */}
        {!loading && filteredVideos.length > 0 && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVideos.map((video, i) => (
              <VideoCard
                key={video.id}
                video={toVideoCardFormat(video)}
                index={i}
                onClick={() => setSelectedVideo(toVideoCardFormat(video))}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredVideos.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <p className="text-sm text-muted-foreground">No videos yet.</p>
          </div>
        )}

      </Section>

      <AnimatePresence>
        <VideoModal
          video={selectedVideo}
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      </AnimatePresence>

      <Footer />
    </main>
  )
}