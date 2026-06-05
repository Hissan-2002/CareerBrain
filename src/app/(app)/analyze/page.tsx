import type { Metadata } from "next"
import { AnalyzeJobClient } from "@/components/analyze/AnalyzeJobClient"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Analyze Job" }

export default function AnalyzePage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Analyze Job Fit
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste a job description to get a fit score, skill gap analysis, and
          project recommendations, grounded in your career brain.
        </p>
      </header>

      <AnalyzeJobClient />
    </div>
  )
}
