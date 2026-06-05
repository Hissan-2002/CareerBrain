import { NextResponse, type NextRequest } from "next/server"
import { streamText, convertToModelMessages, isTextUIPart } from "ai"
import type { UIMessage } from "ai"
import { createSupabaseServerClient, createServiceRoleClient } from "@/lib/supabase/server"
import { geminiFlash } from "@/lib/ai/gemini"
import { embedText } from "@/lib/ai/embed"
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

  // ── Parse request body ────────────────────────────────────────────────────
  let messages: UIMessage[]
  try {
    const body = (await request.json()) as { messages?: UIMessage[] }
    messages = body.messages ?? []
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  if (messages.length === 0) {
    return NextResponse.json({ error: "No messages provided" }, { status: 400 })
  }

  // Extract the last user message text for embedding
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")
  const lastUserText = lastUserMsg?.parts
    .filter(isTextUIPart)
    .map((p) => p.text)
    .join("") ?? ""

  if (!lastUserText.trim()) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 })
  }

  // ── Fetch career profile ──────────────────────────────────────────────────
  const { data: profileRow } = await service
    .from("career_profiles")
    .select("structured_json")
    .eq("user_id", user.id)
    .single()

  const careerProfile = (profileRow?.structured_json ?? null) as CareerProfile | null

  // ── Embed + vector search ─────────────────────────────────────────────────
  let retrievedChunks: Chunk[] = []
  let chunkIds: string[] = []

  try {
    const queryEmbedding = await embedText(lastUserText)

    const { data: chunkRows } = await service.rpc("match_chunks", {
      query_embedding: queryEmbedding,
      match_user_id: user.id,
      match_count: 5,
    })

    retrievedChunks = ((chunkRows as MatchChunkRow[]) ?? []).map((row) => ({
      id: row.id,
      content: row.content,
      section: row.section,
      metadata: row.metadata ?? {},
    }))

    chunkIds = retrievedChunks.map((c) => c.id)
  } catch {
    // Non-fatal: continue without RAG context if embedding/search fails
    retrievedChunks = []
    chunkIds = []
  }

  // ── Build system prompt ───────────────────────────────────────────────────
  const profileSummary = careerProfile
    ? JSON.stringify(careerProfile)
    : "No career profile available yet."

  const chunkContext =
    retrievedChunks.length > 0
      ? retrievedChunks
          .map((c) => `[${c.section}]\n${c.content}`)
          .join("\n\n")
      : "No relevant profile sections found for this query."

  const systemPrompt = `You are CareerBrain, an AI career advisor with direct access to this user's career profile and experience history.

CANDIDATE PROFILE SUMMARY:
${profileSummary}

RELEVANT PROFILE CHUNKS FOR THIS QUERY:
${chunkContext}

Rules:
- Answer only based on what is in the profile and chunks above
- Be direct, specific, and actionable
- Reference specific projects, skills, or experience from the profile when relevant
- If the profile lacks information to answer a question, say so clearly rather than guessing
- Keep responses concise — 3–5 sentences unless a longer answer is clearly needed
- Never give generic career advice that ignores the profile`

  // ── Convert messages for streamText ──────────────────────────────────────
  const modelMessages = await convertToModelMessages(messages)

  // ── Stream response ───────────────────────────────────────────────────────
  const result = streamText({
    model: geminiFlash,
    system: systemPrompt,
    messages: modelMessages,
    onFinish: async ({ text }) => {
      // Save both user message and assistant reply to chat_messages
      try {
        await service
          .from("chat_messages")
          .insert([
            {
              user_id: user.id,
              role: "user",
              content: lastUserText,
              retrieved_chunk_ids: null,
            },
            {
              user_id: user.id,
              role: "assistant",
              content: text,
              retrieved_chunk_ids: chunkIds.length > 0 ? chunkIds : null,
            },
          ])
      } catch {
        // non-fatal if save fails
      }
    },
  })

  return result.toUIMessageStreamResponse({
    headers: {
      // Send chunk IDs so the client can fetch full content for the sources sidebar
      "x-retrieved-chunks": chunkIds.join(","),
    },
  })
}
