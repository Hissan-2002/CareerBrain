import { NextResponse, type NextRequest } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { extractTextFromPDF } from "@/lib/pdf"
import { fetchGitHubData, GitHubNotFoundError } from "@/lib/github"
import { parseCareerProfile } from "@/lib/ai/parse-career"
import { chunkText } from "@/lib/ai/chunk"
import { embedTexts } from "@/lib/ai/embed"

// Required for long-running AI + embedding pipeline on Vercel
export const maxDuration = 60

function calcCompletenessScore(
  profile: Awaited<ReturnType<typeof parseCareerProfile>>,
  hasGitHub: boolean
): number {
  let score = 0
  if (profile.skills.length > 0) score += 20
  if (profile.experience.length > 0) score += 20
  if (profile.projects.length > 0) score += 20
  if (profile.education.length > 0) score += 15
  if (hasGitHub) score += 15
  if (profile.strengths.length > 0) score += 10
  return score
}

export async function POST(request: NextRequest) {
  // ── Auth check ──────────────────────────────────────────────────────────────
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const service = createServiceRoleClient()

  // Track what we've uploaded for cleanup on failure
  let uploadedFilePath: string | null = null

  try {
    // ── Parse multipart form ───────────────────────────────────────────────────
    const formData = await request.formData()
    const cvFile = formData.get("cv") as File | null
    const githubUsername = (formData.get("githubUsername") as string | null)?.trim() || null

    if (!cvFile) {
      return NextResponse.json({ error: "Missing CV file" }, { status: 400 })
    }

    if (!cvFile.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "CV must be a PDF file" }, { status: 400 })
    }

    const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
    if (cvFile.size > MAX_BYTES) {
      return NextResponse.json({ error: "CV file must be under 10 MB" }, { status: 400 })
    }

    // ── Step 1: Upload PDF to Supabase Storage ─────────────────────────────────
    const fileBuffer = Buffer.from(await cvFile.arrayBuffer())
    const filename = `${Date.now()}-${cvFile.name.replace(/[^a-z0-9.\-_]/gi, "_")}`
    const storagePath = `${user.id}/${filename}`

    const { error: uploadError } = await service.storage
      .from("cvs")
      .upload(storagePath, fileBuffer, {
        contentType: "application/pdf",
        upsert: false,
      })

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`)
    }
    uploadedFilePath = storagePath

    // ── Step 2: Extract text from PDF ──────────────────────────────────────────
    const cvText = await extractTextFromPDF(fileBuffer)

    // ── Step 3: Fetch GitHub data ──────────────────────────────────────────────
    let githubText = ""
    if (githubUsername) {
      try {
        githubText = await fetchGitHubData(githubUsername)
      } catch (err) {
        if (err instanceof GitHubNotFoundError) {
          // Non-fatal: continue without GitHub data
          githubText = ""
        } else {
          throw err
        }
      }
    }

    // ── Step 4: Combine raw text ───────────────────────────────────────────────
    const combinedText = [cvText, githubText].filter(Boolean).join("\n\n")

    // ── Step 5–6: Parse with Gemini + Zod validation ──────────────────────────
    const profile = await parseCareerProfile(cvText, githubText)

    // ── Step 7: Upsert career_profiles ────────────────────────────────────────
    const { error: upsertError } = await service
      .from("career_profiles")
      .upsert(
        {
          user_id: user.id,
          structured_json: profile,
          github_username: githubUsername,
          raw_cv_text: cvText,
          raw_github_text: githubText || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )

    if (upsertError) {
      throw new Error(`Profile save failed: ${upsertError.message}`)
    }

    // ── Step 8: Chunk the combined text ────────────────────────────────────────
    const rawChunks = chunkText(combinedText)

    if (rawChunks.length === 0) {
      throw new Error("No content could be extracted from the provided documents.")
    }

    // ── Step 9: Delete old chunks for this user ────────────────────────────────
    const { error: deleteError } = await service
      .from("chunks")
      .delete()
      .eq("user_id", user.id)

    if (deleteError) {
      throw new Error(`Failed to clear old chunks: ${deleteError.message}`)
    }

    // ── Step 10: Embed all chunks in one batched call ──────────────────────────
    const chunkContents = rawChunks.map((c) => c.content)
    const embeddings = await embedTexts(chunkContents)

    // ── Step 11: Insert document + chunks ─────────────────────────────────────
    // First insert a document record to reference
    const { data: docData, error: docError } = await service
      .from("documents")
      .insert({
        user_id: user.id,
        type: "cv",
        raw_text: combinedText,
        filename: cvFile.name,
      })
      .select("id")
      .single()

    if (docError || !docData) {
      throw new Error(`Document insert failed: ${docError?.message}`)
    }

    const chunkRows = rawChunks.map((chunk, i) => ({
      user_id: user.id,
      document_id: docData.id,
      content: chunk.content,
      section: chunk.section,
      // Supabase pgvector accepts the embedding as a plain array
      embedding: embeddings[i],
      metadata: { section: chunk.section },
    }))

    const { error: chunkInsertError } = await service
      .from("chunks")
      .insert(chunkRows)

    if (chunkInsertError) {
      throw new Error(`Chunk insert failed: ${chunkInsertError.message}`)
    }

    // ── Steps 12–13: Calculate + save completeness score ──────────────────────
    const completenessScore = calcCompletenessScore(profile, !!githubText)

    await service
      .from("career_profiles")
      .update({ completeness_score: completenessScore })
      .eq("user_id", user.id)

    return NextResponse.json({ success: true, profile })
  } catch (err) {
    // Cleanup: remove the uploaded file if something failed after upload
    if (uploadedFilePath) {
      await service.storage.from("cvs").remove([uploadedFilePath]).catch(() => null)
    }

    const message = err instanceof Error ? err.message : "Pipeline failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
