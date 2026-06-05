"use client"

interface JobFormProps {
  onSubmit: (jobText: string, jobTitle: string, company: string) => void
  isLoading: boolean
  defaultValues?: { jobText?: string; jobTitle?: string; company?: string }
}

export function JobForm({ onSubmit, isLoading, defaultValues }: JobFormProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    onSubmit(
      (data.get("jobText") as string).trim(),
      (data.get("jobTitle") as string).trim(),
      (data.get("company") as string).trim()
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label
          htmlFor="jobText"
          className="text-sm font-medium text-foreground"
        >
          Job description{" "}
          <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <textarea
          id="jobText"
          name="jobText"
          required
          minLength={50}
          rows={8}
          defaultValue={defaultValues?.jobText}
          placeholder="Paste the full job description here…"
          disabled={isLoading}
          className="w-full resize-y rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="jobTitle"
            className="text-sm font-medium text-foreground"
          >
            Job title{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            id="jobTitle"
            name="jobTitle"
            type="text"
            defaultValue={defaultValues?.jobTitle}
            placeholder="e.g. Senior Frontend Engineer"
            disabled={isLoading}
            className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="company"
            className="text-sm font-medium text-foreground"
          >
            Company{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            id="company"
            name="company"
            type="text"
            defaultValue={defaultValues?.company}
            placeholder="e.g. Stripe"
            disabled={isLoading}
            className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isLoading ? "Analyzing…" : "Analyze Job Fit"}
      </button>
    </form>
  )
}
