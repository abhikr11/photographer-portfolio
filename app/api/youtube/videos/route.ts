import { NextResponse } from "next/server"
import { google } from "googleapis"
import { supabase, supabaseAdmin } from "@/lib/supabase"
import { Readable } from "stream"

async function getAuthenticatedClient() {
  const { data: tokenData } = await supabaseAdmin
    .from("app_settings")
    .select("key, value")
    .in("key", ["youtube_refresh_token", "youtube_access_token"])

  const refreshToken = tokenData?.find((t) => t.key === "youtube_refresh_token")?.value
  const accessToken = tokenData?.find((t) => t.key === "youtube_access_token")?.value

  if (!refreshToken) return null

  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
  )

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  // Auto save new access token when refreshed
  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      await supabaseAdmin.from("app_settings").upsert({
        key: "youtube_access_token",
        value: tokens.access_token,
        updated_at: new Date().toISOString(),
      })
    }
  })

  return oauth2Client
}

// GET videos (all or by playlist)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const playlist_id = searchParams.get("playlist_id")

  let query = supabase
    .from("videos")
    .select("*, video_playlists(id, name)")
    .order("created_at", { ascending: false })

  if (playlist_id && playlist_id !== "all") {
    query = query.eq("playlist_id", playlist_id)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST upload video to YouTube + save to Supabase
export async function POST(request: Request) {
  const auth = await getAuthenticatedClient()
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated with YouTube" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const playlist_id = formData.get("playlist_id") as string
  const youtube_playlist_id = formData.get("youtube_playlist_id") as string

  if (!file || !playlist_id) {
    return NextResponse.json({ error: "File and playlist are required" }, { status: 400 })
  }

  try {
    const youtube = google.youtube({ version: "v3", auth })

    // Convert file to stream
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const stream = Readable.from(buffer)

    // Upload video to YouTube as unlisted
    const ytResponse = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: title || file.name,
          description: description ?? "",
        },
        status: {
          privacyStatus: "unlisted",
        },
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
    })

    const youtubeVideoId = ytResponse.data.id!

    // Add video to playlist on YouTube
    if (youtube_playlist_id) {
      await youtube.playlistItems.insert({
        part: ["snippet"],
        requestBody: {
          snippet: {
            playlistId: youtube_playlist_id,
            resourceId: {
              kind: "youtube#video",
              videoId: youtubeVideoId,
            },
          },
        },
      })
    }

    // Save to Supabase
    const thumbnailUrl = "https://img.youtube.com/vi/" + youtubeVideoId + "/maxresdefault.jpg"

    const { data, error } = await supabaseAdmin
      .from("videos")
      .insert([{
        playlist_id,
        youtube_video_id: youtubeVideoId,
        title: title || file.name,
        description,
        thumbnail_url: thumbnailUrl,
      }])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Video uploaded!", video: data[0] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE video from YouTube + Supabase
export async function DELETE(request: Request) {
  const auth = await getAuthenticatedClient()
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated with YouTube" }, { status: 401 })
  }

  const { id, youtube_video_id } = await request.json()

  try {
    const youtube = google.youtube({ version: "v3", auth })
    await youtube.videos.delete({ id: youtube_video_id })

    const { error } = await supabaseAdmin
      .from("videos")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Video deleted!" })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const auth = await getAuthenticatedClient()
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated with YouTube" }, { status: 401 })
  }

  const { id, youtube_video_id, title, description, playlist_id } = await request.json()

  try {
    const youtube = google.youtube({ version: "v3", auth })
    await youtube.videos.update({
      part: ["snippet"],
      requestBody: {
        id: youtube_video_id,
        snippet: {
          title,
          description: description ?? "",
          categoryId: "22",
        },
      },
    })

    const { data, error } = await supabaseAdmin
      .from("videos")
      .update({ title, description, playlist_id })
      .eq("id", id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}