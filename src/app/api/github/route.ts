import { NextResponse, type NextRequest } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { fetchGitHubData, GitHubNotFoundError } from "@/lib/github"

export async function GET(request: NextRequest) {
  // Auth check
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const username = request.nextUrl.searchParams.get("username")
  if (!username?.trim()) {
    return NextResponse.json(
      { error: "Missing required query param: username" },
      { status: 400 }
    )
  }

  try {
    const text = await fetchGitHubData(username.trim())
    return NextResponse.json({ text })
  } catch (err) {
    if (err instanceof GitHubNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 })
    }
    const message = err instanceof Error ? err.message : "GitHub fetch failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
