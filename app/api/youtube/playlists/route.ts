import { NextResponse } from "next/server"
import { google } from "googleapis"
import { supabase, supabaseAdmin } from "@/lib/supabase"

async function getAuthenticatedClient() {
  // Get tokens from Supabase
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

  // Auto refresh access token if expired
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

// GET all playlists
export async function GET() {
  const { data, error } = await supabase
    .from("video_playlists")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST create playlist
export async function POST(request: Request) {
  const auth = await getAuthenticatedClient()
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated with YouTube" }, { status: 401 })
  }

  const { name, description } = await request.json()

  try {
    const youtube = google.youtube({ version: "v3", auth })
    const ytResponse = await youtube.playlists.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: { title: name, description: description ?? "" },
        status: { privacyStatus: "unlisted" },
      },
    })

    const youtubePlaylistId = ytResponse.data.id!

    const { data, error } = await supabaseAdmin
      .from("video_playlists")
      .insert([{ name, description, youtube_playlist_id: youtubePlaylistId }])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE playlist
export async function DELETE(request: Request) {
  const auth = await getAuthenticatedClient()
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated with YouTube" }, { status: 401 })
  }

  const { id, youtube_playlist_id } = await request.json()

  try {
    const youtube = google.youtube({ version: "v3", auth })
    await youtube.playlists.delete({ id: youtube_playlist_id })

    const { error } = await supabaseAdmin
      .from("video_playlists")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Playlist deleted!" })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const auth = await getAuthenticatedClient()
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated with YouTube" }, { status: 401 })
  }

  const { id, youtube_playlist_id, name, description } = await request.json()

  try {
    const youtube = google.youtube({ version: "v3", auth })
    await youtube.playlists.update({
      part: ["snippet"],
      requestBody: {
        id: youtube_playlist_id,
        snippet: { title: name, description: description ?? "" },
      },
    })

    const { data, error } = await supabaseAdmin
      .from("video_playlists")
      .update({ name, description })
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