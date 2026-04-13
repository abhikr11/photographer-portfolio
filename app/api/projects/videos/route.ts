import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

// GET videos for a specific project
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const project_id = searchParams.get("project_id")

  if (!project_id) {
    return NextResponse.json({ error: "project_id required" }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from("project_videos")
    .select("*")
    .eq("project_id", project_id)
    .order("order_index", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST – add a video to a project (by YouTube ID)
export async function POST(req: NextRequest) {
  try {
    const { project_id, youtube_video_id, title, description, order_index } = await req.json()

    if (!project_id || !youtube_video_id) {
      return NextResponse.json({ error: "project_id and youtube_video_id required" }, { status: 400 })
    }

    // Auto‑generate thumbnail URL
    const thumbnail_url = `https://img.youtube.com/vi/${youtube_video_id}/maxresdefault.jpg`

    const { data, error } = await supabaseAdmin
      .from("project_videos")
      .insert({
        project_id,
        youtube_video_id,
        title: title || "",
        description: description || "",
        thumbnail_url,
        order_index: order_index || 0,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err: any) {
    console.error("Project video add error:", err)
    return NextResponse.json({ error: err.message || "Failed to add video" }, { status: 500 })
  }
}

// DELETE – remove a video from a project
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    const { error } = await supabaseAdmin
      .from("project_videos")
      .delete()
      .eq("id", id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Project video delete error:", err)
    return NextResponse.json({ error: err.message || "Failed to delete video" }, { status: 500 })
  }
}