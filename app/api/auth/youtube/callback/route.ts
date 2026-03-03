import { NextResponse } from "next/server"
import { google } from "googleapis"
import { supabaseAdmin } from "@/lib/supabase"

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 })
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)

    // Save refresh token to Supabase permanently
    if (tokens.refresh_token) {
      await supabaseAdmin.from("app_settings").upsert({
        key: "youtube_refresh_token",
        value: tokens.refresh_token,
        updated_at: new Date().toISOString(),
      })
    }

    // Save access token to Supabase too
    if (tokens.access_token) {
      await supabaseAdmin.from("app_settings").upsert({
        key: "youtube_access_token",
        value: tokens.access_token,
        updated_at: new Date().toISOString(),
      })
    }

    return NextResponse.redirect(
      new URL("/admin/dashboard/settings", request.url)
    )
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}