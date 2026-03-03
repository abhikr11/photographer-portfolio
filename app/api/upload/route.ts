import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { supabaseAdmin } from "@/lib/supabase"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const category_id = formData.get("category_id") as string
    const title = formData.get("title") as string

    if (!file || !category_id) {
      return NextResponse.json(
        { error: "File and category are required" },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64, {
      folder: "photographer",
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
    })

    // Save to Supabase with width, height (auto from Cloudinary)
    const { data, error } = await supabaseAdmin
      .from("photos")
      .insert([{
        category_id,
        cloudinary_url: result.secure_url,
        public_id: result.public_id,
        title: title || file.name,
        width: result.width,
        height: result.height,
      }])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: "Uploaded successfully!",
      photo: data[0],
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE a photo
export async function DELETE(request: Request) {
  try {
    const { id, public_id } = await request.json()

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(public_id)

    // Delete from Supabase
    const { error } = await supabaseAdmin
      .from("photos")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Deleted successfully!" })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}