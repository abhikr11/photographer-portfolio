"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ImageIcon,
  Video,
  FolderOpen,
  Upload,
  ListVideo,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Stats = {
  totalImages: number
  totalVideos: number
  totalCategories: number
  totalPlaylists: number
  recentImages: { id: string; title: string; created_at: string; categories: { name: string } }[]
  recentVideos: { id: string; title: string; created_at: string; video_playlists: { name: string } }[]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalImages: 0,
    totalVideos: 0,
    totalCategories: 0,
    totalPlaylists: 0,
    recentImages: [],
    recentVideos: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const [imagesRes, videosRes, categoriesRes, playlistsRes] = await Promise.all([
      fetch("/api/photos"),
      fetch("/api/youtube/videos"),
      fetch("/api/categories"),
      fetch("/api/youtube/playlists"),
    ])

    const images = await imagesRes.json()
    const videos = await videosRes.json()
    const categories = await categoriesRes.json()
    const playlists = await playlistsRes.json()

    setStats({
      totalImages: Array.isArray(images) ? images.length : 0,
      totalVideos: Array.isArray(videos) ? videos.length : 0,
      totalCategories: Array.isArray(categories) ? categories.length : 0,
      totalPlaylists: Array.isArray(playlists) ? playlists.length : 0,
      recentImages: Array.isArray(images) ? images.slice(0, 5) : [],
      recentVideos: Array.isArray(videos) ? videos.slice(0, 5) : [],
    })
    setLoading(false)
  }

  const statCards = [
    {
      title: "Total Images",
      value: stats.totalImages,
      icon: ImageIcon,
      href: "/admin/dashboard/images",
    },
    {
      title: "Total Categories",
      value: stats.totalCategories,
      icon: FolderOpen,
      href: "/admin/dashboard/categories",
    },
    {
      title: "Total Videos",
      value: stats.totalVideos,
      icon: Video,
      href: "/admin/dashboard/videos",
    },
    {
      title: "Total Playlists",
      value: stats.totalPlaylists,
      icon: ListVideo,
      href: "/admin/dashboard/videos",
    },
  ]

  return (
    <div className="flex flex-col gap-8">

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Link href={stat.href}>
              <Card className="border-border bg-card hover:border-gold transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-normal text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-gold" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-8 w-16 bg-muted animate-pulse" />
                  ) : (
                    <p className="text-2xl font-semibold text-foreground">
                      {stat.value}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button
            asChild
            className="bg-gold text-background hover:bg-gold-light rounded-none text-sm"
          >
            <Link href="/admin/dashboard/images">
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-none border-border text-foreground hover:border-gold hover:text-gold hover:bg-transparent"
          >
            <Link href="/admin/dashboard/videos">
              <Video className="mr-2 h-4 w-4" />
              Upload Video
            </Link>
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Recent Images */}
        <div>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-gold" />
            Recent Images
          </h2>
          <div className="overflow-hidden border border-border">
            {loading ? (
              <div className="flex flex-col gap-0">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
                    <div className="h-4 w-32 bg-muted animate-pulse" />
                    <div className="h-3 w-20 bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            ) : stats.recentImages.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">No images yet</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-muted-foreground">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-muted-foreground">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentImages.map((image) => (
                    <tr key={image.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-sm text-foreground truncate max-w-[120px]">
                        {image.title ?? "Untitled"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gold uppercase tracking-wider">
                        {image.categories?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(image.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Videos */}
        <div>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-gold" />
            Recent Videos
          </h2>
          <div className="overflow-hidden border border-border">
            {loading ? (
              <div className="flex flex-col gap-0">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
                    <div className="h-4 w-32 bg-muted animate-pulse" />
                    <div className="h-3 w-20 bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            ) : stats.recentVideos.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">No videos yet</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-muted-foreground">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-muted-foreground">Playlist</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentVideos.map((video) => (
                    <tr key={video.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-sm text-foreground truncate max-w-[120px]">
                        {video.title ?? "Untitled"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gold uppercase tracking-wider">
                        {video.video_playlists?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(video.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}