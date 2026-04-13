import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { project_id, url, public_id, caption, order_index } = await req.json()

    if (!project_id || !url || !public_id) {
      return NextResponse.json({ error: "project_id, url and public_id required" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("project_images")
      .insert({
        project_id,
        url,
        public_id,
        caption: caption || "",
        order_index: order_index || 0,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err: any) {
    console.error("Project image save error:", err)
    return NextResponse.json({ error: err.message || "Failed to save image" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id, public_id } = await req.json()

    if (public_id) {
      const { v2: cloudinary } = await import("cloudinary")
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      })
      await cloudinary.uploader.destroy(public_id)
    }

    const { error } = await supabaseAdmin.from("project_images").delete().eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Project image delete error:", err)
    return NextResponse.json({ error: err.message || "Failed to delete image" }, { status: 500 })
  }
}