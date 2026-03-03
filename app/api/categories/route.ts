import { NextResponse } from "next/server"
import { supabase, supabaseAdmin } from "@/lib/supabase"

// GET all categories (public read)
export async function GET() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST create new category (admin write)
export async function POST(request: Request) {
  const { name, description } = await request.json()

  const { data, error } = await supabaseAdmin
    .from("categories")
    .insert([{ name, description }])
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data[0])
}

// PATCH update category (admin write)
export async function PATCH(request: Request) {
  const { id, name, description } = await request.json()

  const { data, error } = await supabaseAdmin
    .from("categories")
    .update({ name, description })
    .eq("id", id)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data[0])
}

// DELETE a category (admin write)
export async function DELETE(request: Request) {
  const { id } = await request.json()

  const { error } = await supabaseAdmin
    .from("categories")
    .delete()
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: "Deleted successfully" })
}