"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { JobForm } from "./JobForm"
import { FitScoreMeter } from "./FitScoreMeter"
import { GapAnalysis } from "./GapAnalysis"
import { SourceChunks } from "./SourceChunks"
import type { JobAnalysisResult, Chunk } from "@/lib/types"

interface AnalysisResult {
  analysisId: string
  result: JobAnalysisResult
  retrievedChunks: Chunk[]
}

// Simple skeleton block
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted/50 ${className ?? ""}`}
    />
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[65fr_35fr]">
      <div className="space-y-8">
        <div className="flex flex-col items-center gap-4 py-2">
          <Skeleton className="h-36 w-36 rounded-full" />
          <Skeleton className="h-7 w-32 rounded-full" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <div className="flex flex-wrap gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-20 rounded-md" />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export function AnalyzeJobClient() {
  const router = useRouter()
  const [analysisState, setAnalysisState] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle")
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [lastJob, setLastJob] = useState<{
    text: string
    title: string
    company: string
  } | null>(null)

  async function handleSubmit(
    jobText: string,
    jobTitle: string,
    company: string
  ) {
    setAnalysisState("loading")
    setErrorMsg(null)
    setLastJob({ text: jobText, title: jobTitle, company })

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobText, jobTitle, company }),
      })

      const data = (await res.json()) as Partial<AnalysisResult> & {
        error?: string
      }

      if (!res.ok || !data.result) {
        setErrorMsg(data.error ?? "Analysis failed. Please try again.")
        setAnalysisState("error")
        return
      }

      setAnalysis({
        analysisId: data.analysisId!,
        result: data.result,
        retrievedChunks: data.retrievedChunks ?? [],
      })
      setAnalysisState("done")

      // Update the URL so the user can bookmark/share
      router.push(`/analyze?id=${data.analysisId}`, { scroll: false })
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Unexpected error. Please try again."
      )
      setAnalysisState("error")
    }
  }

  function handleNewAnalysis() {
    setAnalysisState("idle")
    setAnalysis(null)
    setErrorMsg(null)
    router.push("/analyze", { scroll: false })
  }

  return (
    <div className="space-y-8">
      {/* Form — shown always on idle/error, shown collapsed on done */}
      {(analysisState === "idle" || analysisState === "error") && (
        <div className="space-y-4">
          <JobForm
            onSubmit={handleSubmit}
            isLoading={false}
            defaultValues={
              lastJob
                ? {
                    jobText: lastJob.text,
                    jobTitle: lastJob.title,
                    company: lastJob.company,
                  }
                : undefined
            }
          />
          {analysisState === "error" && errorMsg && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMsg}
            </div>
          )}
        </div>
      )}

      {/* Loading state */}
      {analysisState === "loading" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
            <span className="block h-2 w-2 animate-pulse rounded-full bg-primary" />
            <p className="text-sm text-muted-foreground">
              Analyzing job fit against your career brain…
            </p>
          </div>
          <LoadingSkeleton />
        </div>
      )}

      {/* Results */}
      {analysisState === "done" && analysis && (
        <div className="space-y-6">
          {/* Condensed form + new analysis button */}
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {lastJob?.title
                  ? `${lastJob.title}${lastJob.company ? ` at ${lastJob.company}` : ""}`
                  : "Job analysis"}
              </p>
              <p className="text-xs text-muted-foreground">
                Analysis saved.{" "}
                <a
                  href={`/analyze/${analysis.analysisId}`}
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  view permalink
                </a>
              </p>
            </div>
            <button
              onClick={handleNewAnalysis}
              className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              New analysis
            </button>
          </div>

          {/* Two-column results layout */}
          <div className="grid gap-8 lg:grid-cols-[65fr_35fr]">
            {/* Left — score + gap */}
            <div className="space-y-8">
              <FitScoreMeter
                score={analysis.result.fitScore}
                decision={analysis.result.decision}
                reasoning={analysis.result.reasoning}
              />
              <GapAnalysis
                missingSkills={analysis.result.missingSkills}
                careerGapSummary={analysis.result.careerGapSummary}
                recommendations={analysis.result.recommendations}
              />
            </div>

            {/* Right — sources */}
            <div>
              <SourceChunks chunks={analysis.retrievedChunks} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
