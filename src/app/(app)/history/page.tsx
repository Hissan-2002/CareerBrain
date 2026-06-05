import type { Metadata } from "next"
import Link from "next/link"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { JobAnalysisResult } from "@/lib/types"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "History" }

const DECISION_CONFIG: Record<
  JobAnalysisResult["decision"],
  { label: string; color: string; bg: string; border: string }
> = {
  "strong-match": {
    label: "Strong Match",
    color: "text-green-400",
    bg: "bg-green-500/15",
    border: "border-green-500/30",
  },
  "partial-match": {
    label: "Partial Match",
    color: "text-yellow-400",
    bg: "bg-yellow-500/15",
    border: "border-yellow-500/30",
  },
  "not-ready": {
    label: "Not Ready",
    color: "text-red-400",
    bg: "bg-red-500/15",
    border: "border-red-500/30",
  },
}

interface AnalysisRow {
  id: string
  job_title: string | null
  company: string | null
  fit_score: number | null
  result_json: { decision?: JobAnalysisResult["decision"] } | null
  created_at: string
}

export default async function HistoryPage() {
  const supabase = await createSupabaseServerClient()

  const { data: analyses } = await supabase
    .from("job_analyses")
    .select("id, job_title, company, fit_score, result_json, created_at")
    .order("created_at", { ascending: false })

  const rows = (analyses ?? []) as AnalysisRow[]

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          History
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All past job analyses. Click any row to review the full result.
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            No analyses yet.
          </p>
          <Link
            href="/analyze"
            className="mt-3 inline-block text-sm text-primary hover:underline underline-offset-2"
          >
            Run your first job analysis →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => {
            const decision = row.result_json?.decision
            const config = decision ? DECISION_CONFIG[decision] : null
            const label = [row.job_title, row.company].filter(Boolean).join(" at ")
            const date = new Date(row.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })

            return (
              <Link
                key={row.id}
                href={`/analyze/${row.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:border-border/80 hover:bg-card/80"
              >
                {/* Left — title + date */}
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground text-sm">
                    {label || "Untitled analysis"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{date}</p>
                </div>

                {/* Right — score + decision */}
                <div className="flex shrink-0 items-center gap-3">
                  {row.fit_score !== null && (
                    <span className="font-display text-lg font-bold text-primary">
                      {row.fit_score}
                      <span className="text-xs font-normal text-muted-foreground">
                        /100
                      </span>
                    </span>
                  )}
                  {config && (
                    <span
                      className={`hidden sm:inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.color} ${config.bg} ${config.border}`}
                    >
                      {config.label}
                    </span>
                  )}
                  {/* Chevron */}
                  <svg
                    className="h-4 w-4 shrink-0 text-muted-foreground/50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
