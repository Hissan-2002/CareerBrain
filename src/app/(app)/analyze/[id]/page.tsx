import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { FitScoreMeter } from "@/components/analyze/FitScoreMeter"
import { GapAnalysis } from "@/components/analyze/GapAnalysis"
import { SourceChunks } from "@/components/analyze/SourceChunks"
import type { JobAnalysisResult, Chunk } from "@/lib/types"

export const dynamic = "force-dynamic"

interface AnalysisDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: AnalysisDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from("job_analyses")
    .select("job_title, company")
    .eq("id", id)
    .single()

  if (!data) return { title: "Analysis" }
  const label = [data.job_title, data.company].filter(Boolean).join(" at ")
  return { title: label || "Job Analysis" }
}

export default async function AnalysisDetailPage({
  params,
}: AnalysisDetailPageProps) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  // Fetch the analysis row (RLS ensures it belongs to the current user)
  const { data: analysis, error } = await supabase
    .from("job_analyses")
    .select(
      "id, job_title, company, fit_score, result_json, retrieved_chunk_ids, created_at"
    )
    .eq("id", id)
    .single()

  if (error || !analysis?.result_json) {
    notFound()
  }

  const result = analysis.result_json as JobAnalysisResult
  const chunkIds: string[] = analysis.retrieved_chunk_ids ?? []

  // Fetch the referenced chunks
  let retrievedChunks: Chunk[] = []
  if (chunkIds.length > 0) {
    const { data: chunkRows } = await supabase
      .from("chunks")
      .select("id, content, section, metadata")
      .in("id", chunkIds)

    if (chunkRows) {
      // Preserve the original retrieval order
      const chunkMap = new Map(chunkRows.map((c) => [c.id, c]))
      retrievedChunks = chunkIds
        .map((cid) => chunkMap.get(cid))
        .filter((c): c is NonNullable<typeof c> => !!c)
        .map((c) => ({
          id: c.id,
          content: c.content,
          section: c.section ?? "General",
          metadata: (c.metadata as Record<string, unknown>) ?? {},
        }))
    }
  }

  const jobLabel = [analysis.job_title, analysis.company]
    .filter(Boolean)
    .join(" at ")

  const date = new Date(analysis.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link
              href="/analyze"
              className="hover:text-foreground transition-colors"
            >
              Analyze
            </Link>
            <span>/</span>
            <span>{jobLabel || "Job Analysis"}</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            {jobLabel || "Job Analysis"}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">{date}</p>
        </div>
        <Link
          href="/analyze"
          className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          New analysis
        </Link>
      </header>

      {/* Two-column results */}
      <div className="grid gap-8 lg:grid-cols-[65fr_35fr]">
        <div className="space-y-8">
          <FitScoreMeter
            score={result.fitScore}
            decision={result.decision}
            reasoning={result.reasoning}
          />
          <GapAnalysis
            missingSkills={result.missingSkills}
            careerGapSummary={result.careerGapSummary}
            recommendations={result.recommendations}
          />
        </div>

        <div>
          <SourceChunks chunks={retrievedChunks} />
        </div>
      </div>
    </div>
  )
}
