import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    const { data } = await supabaseAdmin
      .from("app_settings")
      .select("value")
      .eq("key", "youtube_refresh_token")
      .single()

    return NextResponse.json({ authenticated: !!data?.value })
  } catch {
    return NextResponse.json({ authenticated: false })
  }
}

export async function DELETE() {
  await supabaseAdmin
    .from("app_settings")
    .delete()
    .in("key", ["youtube_refresh_token", "youtube_access_token"])

  return NextResponse.json({ message: "Disconnected" })
}