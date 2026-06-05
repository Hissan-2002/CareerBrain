import type { JobAnalysisResult } from "@/lib/types"

interface GapAnalysisProps {
  missingSkills: JobAnalysisResult["missingSkills"]
  careerGapSummary: JobAnalysisResult["careerGapSummary"]
  recommendations: JobAnalysisResult["recommendations"]
}

export function GapAnalysis({
  missingSkills,
  careerGapSummary,
  recommendations,
}: GapAnalysisProps) {
  return (
    <div className="space-y-8">
      {/* Missing skills */}
      {missingSkills.length > 0 && (
        <section aria-labelledby="gaps-heading">
          <h3
            id="gaps-heading"
            className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Skill Gaps
          </h3>
          <div className="flex flex-wrap gap-2">
            {missingSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 rounded-md border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1 text-xs font-medium text-yellow-400"
              >
                <svg
                  className="h-3 w-3 shrink-0"
                  viewBox="0 0 12 12"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M6 1a5 5 0 100 10A5 5 0 006 1zM5.5 3.5a.5.5 0 011 0V6a.5.5 0 01-1 0V3.5zm.5 5a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                </svg>
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Gap summary */}
      {careerGapSummary && (
        <section aria-labelledby="gap-summary-heading">
          <h3
            id="gap-summary-heading"
            className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Gap Analysis
          </h3>
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {careerGapSummary}
            </p>
          </div>
        </section>
      )}

      {/* Project recommendations */}
      {recommendations.length > 0 && (
        <section aria-labelledby="recs-heading">
          <h3
            id="recs-heading"
            className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Close the Gap
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border bg-card p-5 space-y-3"
              >
                {/* Name */}
                <h4 className="font-display font-semibold text-foreground">
                  {rec.name}
                </h4>

                {/* Description */}
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {rec.description}
                </p>

                {/* Tags row */}
                <div className="flex flex-wrap items-center gap-2">
                  {rec.closesGap && (
                    <span className="inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      Closes: {rec.closesGap}
                    </span>
                  )}
                  <span className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground">
                    ~{rec.estimatedWeeks}{" "}
                    {rec.estimatedWeeks === 1 ? "week" : "weeks"}
                  </span>
                </div>

                {/* Tech stack */}
                {rec.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {rec.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
