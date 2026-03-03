import { NextResponse } from "next/server"
import { supabase, supabaseAdmin } from "@/lib/supabase"

// GET photos (all or filtered by category)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category_id = searchParams.get("category_id")

  let query = supabase
    .from("photos")
    .select(`
      *,
      categories (
        id,
        name,
        description
      )
    `)
    .order("created_at", { ascending: false })

  if (category_id && category_id !== "all") {
    query = query.eq("category_id", category_id)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// PATCH update photo title and category
export async function PATCH(request: Request) {
  const { id, title, category_id } = await request.json()

  const { data, error } = await supabaseAdmin
    .from("photos")
    .update({ title, category_id })
    .eq("id", id)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data[0])
}