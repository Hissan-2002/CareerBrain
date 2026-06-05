import { NextResponse, type NextRequest } from "next/server"
import { createSupabaseServerClient, createServiceRoleClient } from "@/lib/supabase/server"
import { embedText } from "@/lib/ai/embed"
import { analyzeJob } from "@/lib/ai/analyze-job"
import type { CareerProfile, Chunk } from "@/lib/types"

export const maxDuration = 60

interface MatchChunkRow {
  id: string
  content: string
  section: string
  metadata: Record<string, unknown>
  similarity: number
}

export async function POST(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const service = createServiceRoleClient()

  // ── Parse body ────────────────────────────────────────────────────────────
  let jobText: string
  let jobTitle: string | null = null
  let company: string | null = null

  try {
    const body = (await request.json()) as {
      jobText?: string
      jobTitle?: string
      company?: string
    }
    jobText = body.jobText?.trim() ?? ""
    jobTitle = body.jobTitle?.trim() || null
    company = body.company?.trim() || null
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!jobText || jobText.length < 50) {
    return NextResponse.json(
      { error: "Job description is too short (minimum 50 characters)" },
      { status: 400 }
    )
  }

  // ── Fetch career profile ──────────────────────────────────────────────────
  const { data: profileRow, error: profileError } = await service
    .from("career_profiles")
    .select("structured_json")
    .eq("user_id", user.id)
    .single()

  if (profileError || !profileRow?.structured_json) {
    return NextResponse.json(
      { error: "No career brain found. Build your brain first on the Profile page." },
      { status: 400 }
    )
  }

  const careerProfile = profileRow.structured_json as CareerProfile

  // ── Embed job description ─────────────────────────────────────────────────
  let jobEmbedding: number[]
  try {
    jobEmbedding = await embedText(jobText)
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Embedding failed"
    return NextResponse.json({ error: `Embedding failed: ${msg}` }, { status: 500 })
  }

  // ── Vector search: top 8 chunks via match_chunks RPC ─────────────────────
  const { data: chunkRows, error: rpcError } = await service.rpc("match_chunks", {
    query_embedding: jobEmbedding,
    match_user_id: user.id,
    match_count: 8,
  })

  if (rpcError) {
    return NextResponse.json(
      { error: `Vector search failed: ${rpcError.message}` },
      { status: 500 }
    )
  }

  const retrievedChunks: Chunk[] = (chunkRows as MatchChunkRow[] ?? []).map(
    (row) => ({
      id: row.id,
      content: row.content,
      section: row.section,
      metadata: row.metadata ?? {},
    })
  )

  if (retrievedChunks.length === 0) {
    return NextResponse.json(
      { error: "No career chunks found. Rebuild your brain to generate embeddings." },
      { status: 400 }
    )
  }

  // ── Run Gemini analysis ───────────────────────────────────────────────────
  let result
  try {
    result = await analyzeJob(careerProfile, retrievedChunks, jobText)
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Analysis failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  // ── Persist to job_analyses ───────────────────────────────────────────────
  const chunkIds = retrievedChunks.map((c) => c.id)

  const { data: savedAnalysis, error: insertError } = await service
    .from("job_analyses")
    .insert({
      user_id: user.id,
      job_title: jobTitle,
      company,
      job_text: jobText,
      fit_score: result.fitScore,
      result_json: result,
      retrieved_chunk_ids: chunkIds,
    })
    .select("id")
    .single()

  if (insertError || !savedAnalysis) {
    return NextResponse.json(
      { error: `Failed to save analysis: ${insertError?.message}` },
      { status: 500 }
    )
  }

  return NextResponse.json({
    analysisId: savedAnalysis.id,
    result,
    retrievedChunks,
  })
}
