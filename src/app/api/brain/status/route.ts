import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { CareerProfile } from "@/lib/types"

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("career_profiles")
    .select("structured_json, completeness_score, github_username, updated_at")
    .eq("user_id", user.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ built: false })
  }

  return NextResponse.json({
    built: true,
    profile: data.structured_json as CareerProfile,
    completenessScore: data.completeness_score,
    githubUsername: data.github_username,
    updatedAt: data.updated_at,
  })
}
