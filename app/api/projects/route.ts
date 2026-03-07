import { NextRequest, NextResponse } from "next/server"
import { supabase, supabaseAdmin } from "@/lib/supabase"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET() {
  const { data, error } = await supabase
    .from("projects")
    .select("*, project_images(*)")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const date = formData.get("date") as string
    const coverFile = formData.get("cover") as File

    if (!coverFile) {
      return NextResponse.json({ error: "Cover image is required" }, { status: 400 })
    }

    if (coverFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 })
    }

    const coverBuffer = Buffer.from(await coverFile.arrayBuffer())

    const coverUpload = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "projects/covers" },
        (err, result) => {
          if (err) reject(err)
          else resolve(result)
        }
      ).end(coverBuffer)
    })

    const { data: project, error } = await supabaseAdmin
      .from("projects")
      .insert({
        title,
        description,
        category,
        date,
        cover_image: coverUpload.secure_url,
        cover_public_id: coverUpload.public_id,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(project)
  } catch (err: any) {
    console.error("Project create error:", err)
    return NextResponse.json({ error: err.message || "Failed to create project" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id, cover_public_id } = await req.json()

    if (cover_public_id) await cloudinary.uploader.destroy(cover_public_id)

    const { data: images } = await supabaseAdmin
      .from("project_images")
      .select("public_id")
      .eq("project_id", id)

    if (images) {
      for (const img of images) {
        if (img.public_id) await cloudinary.uploader.destroy(img.public_id)
      }
    }

    const { error } = await supabaseAdmin.from("projects").delete().eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Project delete error:", err)
    return NextResponse.json({ error: err.message || "Failed to delete project" }, { status: 500 })
  }
}