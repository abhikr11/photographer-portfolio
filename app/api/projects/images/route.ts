import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const project_id = formData.get("project_id") as string
    const caption = formData.get("caption") as string
    const order_index = parseInt(formData.get("order_index") as string) || 0
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const upload = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "projects/images" },
        (err, result) => {
          if (err) reject(err)
          else resolve(result)
        }
      ).end(buffer)
    })

    const { data, error } = await supabaseAdmin
      .from("project_images")
      .insert({
        project_id,
        url: upload.secure_url,
        public_id: upload.public_id,
        caption,
        order_index,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err: any) {
    console.error("Project image upload error:", err)
    return NextResponse.json({ error: err.message || "Failed to upload image" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id, public_id } = await req.json()

    if (public_id) await cloudinary.uploader.destroy(public_id)

    const { error } = await supabaseAdmin
      .from("project_images")
      .delete()
      .eq("id", id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Project image delete error:", err)
    return NextResponse.json({ error: err.message || "Failed to delete image" }, { status: 500 })
  }
}