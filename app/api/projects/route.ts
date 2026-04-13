import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { google } from "googleapis"

// Helper to get authenticated YouTube client (same as your video upload API)
async function getYouTubeAuth() {
  const { data: tokenData } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", "youtube_refresh_token")
    .single()

  if (!tokenData?.value) throw new Error("No YouTube refresh token")

  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
  )

  oauth2Client.setCredentials({ refresh_token: tokenData.value })
  return oauth2Client
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("projects")
    .select(`
      *,
      project_images (*),
      project_videos (*)
    `)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, category, date, cover_image, cover_public_id } = await req.json()

    if (!title || !cover_image) {
      return NextResponse.json({ error: "Title and cover_image are required" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("projects")
      .insert({
        title,
        description: description || "",
        category: category || "",
        date: date || "",
        cover_image,
        cover_public_id,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err: any) {
    console.error("Project create error:", err)
    return NextResponse.json({ error: err.message || "Failed to create project" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id, cover_public_id } = await req.json()

    // 1. Delete cover image from Cloudinary
    if (cover_public_id) {
      const { v2: cloudinary } = await import("cloudinary")
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      })
      await cloudinary.uploader.destroy(cover_public_id)
    }

    // 2. Delete project images from Cloudinary
    const { data: images } = await supabaseAdmin
      .from("project_images")
      .select("public_id")
      .eq("project_id", id)

    if (images && images.length) {
      const { v2: cloudinary } = await import("cloudinary")
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      })
      for (const img of images) {
        if (img.public_id) await cloudinary.uploader.destroy(img.public_id)
      }
    }

    // 3. Delete project videos from YouTube
    const { data: videos } = await supabaseAdmin
      .from("project_videos")
      .select("youtube_video_id")
      .eq("project_id", id)

    if (videos && videos.length) {
      const auth = await getYouTubeAuth()
      const youtube = google.youtube({ version: "v3", auth })
      for (const video of videos) {
        try {
          await youtube.videos.delete({ id: video.youtube_video_id })
        } catch (err) {
          console.error(`Failed to delete YouTube video ${video.youtube_video_id}:`, err)
          // Continue with other deletions even if one fails
        }
      }
    }

    // 4. Remove database records (videos, images, project)
    const { error: deleteVideosError } = await supabaseAdmin
      .from("project_videos")
      .delete()
      .eq("project_id", id)
    if (deleteVideosError) console.warn("Failed to delete project videos from DB:", deleteVideosError)

    const { error: deleteImagesError } = await supabaseAdmin
      .from("project_images")
      .delete()
      .eq("project_id", id)
    if (deleteImagesError) console.warn("Failed to delete project images from DB:", deleteImagesError)

    const { error } = await supabaseAdmin.from("projects").delete().eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Project delete error:", err)
    return NextResponse.json({ error: err.message || "Failed to delete project" }, { status: 500 })
  }
}