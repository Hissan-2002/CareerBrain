"use client"

export type StepStatus = "pending" | "running" | "done" | "error"

export interface PipelineStep {
  id: string
  label: string
  status: StepStatus
  errorMessage?: string
}

interface PipelineProgressProps {
  steps: PipelineStep[]
}

export function PipelineProgress({ steps }: PipelineProgressProps) {
  return (
    <div className="flex flex-col gap-3" role="list" aria-label="Build progress">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex items-start gap-3" role="listitem">
          {/* Step indicator */}
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
            {step.status === "pending" && (
              <span className="block h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
            )}
            {step.status === "running" && (
              <span className="block h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
            )}
            {step.status === "done" && (
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {step.status === "error" && (
              <svg
                className="h-5 w-5 text-destructive"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>

          {/* Label + connector line */}
          <div className="flex flex-1 flex-col pb-4">
            <div className="flex items-center gap-2">
              <span
                className={
                  step.status === "running"
                    ? "text-sm font-medium text-foreground"
                    : step.status === "done"
                      ? "text-sm text-muted-foreground line-through"
                      : step.status === "error"
                        ? "text-sm font-medium text-destructive"
                        : "text-sm text-muted-foreground/50"
                }
              >
                {idx + 1}. {step.label}
              </span>
              {step.status === "running" && (
                <span className="text-xs text-primary animate-pulse">
                  running…
                </span>
              )}
            </div>
            {step.status === "error" && step.errorMessage && (
              <p className="mt-1 text-xs text-destructive/80">
                {step.errorMessage}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
