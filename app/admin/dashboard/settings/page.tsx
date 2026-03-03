"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Youtube, CheckCircle, XCircle, LogIn, LogOut } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  const [youtubeConnected, setYoutubeConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkYoutubeStatus()
  }, [])

  const checkYoutubeStatus = async () => {
    const res = await fetch("/api/auth/youtube/status")
    const data = await res.json()
    setYoutubeConnected(data.authenticated)
    setLoading(false)
  }

  const handleConnect = () => {
    window.location.href = "/api/auth/youtube"
  }

  const handleDisconnect = async () => {
    const res = await fetch("/api/auth/youtube/status", { method: "DELETE" })
    if (res.ok) {
      setYoutubeConnected(false)
      toast.success("YouTube disconnected")
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div>
        <h1 className="font-serif text-2xl text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your integrations and account settings.
        </p>
      </div>

      {/* YouTube Integration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border border-border p-6 flex flex-col gap-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-border text-gold">
            <Youtube className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">YouTube</p>
            <p className="text-xs text-muted-foreground">
              Upload and manage videos directly from admin
            </p>
          </div>
        </div>

        {/* Status */}
        {!loading && (
          <div className="flex items-center justify-between border border-border p-4">
            <div className="flex items-center gap-3">
              {youtubeConnected ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              <div>
                <p className="text-sm text-foreground">
                  {youtubeConnected ? "Connected" : "Not Connected"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {youtubeConnected
                    ? "Your YouTube account is linked. You can upload videos."
                    : "Connect your YouTube account to upload videos."}
                </p>
              </div>
            </div>

            {youtubeConnected ? (
              <Button
                variant="outline"
                onClick={handleDisconnect}
                className="rounded-none border-border text-foreground hover:border-destructive hover:text-destructive hover:bg-transparent text-sm"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            ) : (
              <Button
                onClick={handleConnect}
                className="bg-gold text-background hover:bg-gold-light rounded-none text-sm"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Connect
              </Button>
            )}
          </div>
        )}

        {loading && (
          <p className="text-sm text-muted-foreground animate-pulse">
            Checking connection...
          </p>
        )}

        {/* Info */}
        <div className="flex flex-col gap-1.5 border border-border/50 bg-muted/20 p-4">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            How it works
          </p>
          <p className="text-xs text-muted-foreground">
            Connect once — stays connected for 1 year automatically. Videos are uploaded as unlisted to your YouTube channel and organized into playlists you create from the Videos page.
          </p>
        </div>
      </motion.div>
    </div>
  )
}