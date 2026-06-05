import { NextResponse, type NextRequest } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { Chunk } from "@/lib/types"

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const idsParam = request.nextUrl.searchParams.get("ids")
  if (!idsParam?.trim()) {
    return NextResponse.json({ chunks: [] })
  }

  const ids = idsParam
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 20) // Safety cap

  if (ids.length === 0) {
    return NextResponse.json({ chunks: [] })
  }

  const { data: rows, error } = await supabase
    .from("chunks")
    .select("id, content, section, metadata")
    .in("id", ids)
    .eq("user_id", user.id) // RLS double-check

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Preserve retrieval order
  const rowMap = new Map((rows ?? []).map((r) => [r.id, r]))
  const chunks: Chunk[] = ids
    .map((id) => rowMap.get(id))
    .filter((r): r is NonNullable<typeof r> => !!r)
    .map((r) => ({
      id: r.id,
      content: r.content,
      section: r.section ?? "General",
      metadata: (r.metadata as Record<string, unknown>) ?? {},
    }))

  return NextResponse.json({ chunks })
}
