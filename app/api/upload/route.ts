import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { supabaseAdmin } from "@/lib/supabase"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// POST – Save image metadata after direct Cloudinary upload
export async function POST(request: Request) {
  try {
    const { cloudinary_url, public_id, title, category_id, width, height } = await request.json()

    if (!cloudinary_url || !category_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("photos")
      .insert([{
        category_id,
        cloudinary_url,
        public_id,
        title: title || "Untitled",
        width: width || 0,
        height: height || 0,
      }])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Saved!", photo: data[0] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE – Delete image from Cloudinary and Supabase (unchanged)
export async function DELETE(request: Request) {
  try {
    const { id, public_id } = await request.json()
    await cloudinary.uploader.destroy(public_id)
    const { error } = await supabaseAdmin.from("photos").delete().eq("id", id)
    if (error) throw error
    return NextResponse.json({ message: "Deleted!" })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}