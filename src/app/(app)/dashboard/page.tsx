import type { Metadata } from "next"
import Link from "next/link"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { StatsCards } from "@/components/dashboard/StatsCards"
import { SkillRadar } from "@/components/dashboard/SkillRadar"
import type { CareerProfile, JobAnalysisRow, SkillCategories } from "@/lib/types"

export const dynamic = "force-dynamic"

export const metadata: Metadata = { title: "Dashboard" }

const LEVEL_DOT: Record<string, string> = {
  beginner:     "bg-yellow-500",
  intermediate: "bg-blue-500",
  advanced:     "bg-primary",
}

const DECISION_BADGE: Record<string, string> = {
  "strong-match":  "bg-primary/10 text-primary border-primary/30",
  "partial-match": "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  "not-ready":     "bg-red-500/10 text-red-400 border-red-500/30",
}

const DECISION_LABEL: Record<string, string> = {
  "strong-match":  "Strong Match",
  "partial-match": "Partial Match",
  "not-ready":     "Not Ready",
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [profileRes, analysesRes] = await Promise.all([
    supabase
      .from("career_profiles")
      .select("structured_json, completeness_score")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("job_analyses")
      .select("id, job_title, company, fit_score, result_json, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
  ])

  const profile: CareerProfile | null = profileRes.data?.structured_json ?? null
  const completenessScore: number = profileRes.data?.completeness_score ?? 0
  const analyses: JobAnalysisRow[] = (analysesRes.data as JobAnalysisRow[]) ?? []

  if (!profile) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center gap-6 py-24">
        <div className="rounded-xl border border-border bg-card p-10 text-center max-w-md w-full space-y-4">
          <div className="text-4xl">🧠</div>
          <h2 className="text-lg font-semibold">Your career brain hasn&apos;t been built yet.</h2>
          <p className="text-sm text-muted-foreground">
            Upload your CV and GitHub profile to generate your personalised career intelligence dashboard.
          </p>
          <Link
            href="/profile"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Build your brain →
          </Link>
        </div>
      </div>
    )
  }

  // Group skills by category for the right-panel list
  const CATEGORIES: Array<{ key: keyof SkillCategories; label: string }> = [
    { key: "frontend", label: "Frontend" },
    { key: "backend",  label: "Backend" },
    { key: "ai",       label: "AI / ML" },
    { key: "data",     label: "Data" },
    { key: "devops",   label: "DevOps" },
  ]

  const skillsByCategory = CATEGORIES.map(({ key, label }) => ({
    key,
    label,
    skills: profile.skills.filter((s) => s.category === key),
  })).filter((g) => g.skills.length > 0)

  const otherSkills = profile.skills.filter((s) => s.category === "other")

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your career intelligence overview
        </p>
      </div>

      {/* ROW 1 — Stats */}
      <StatsCards profile={profile} completenessScore={completenessScore} />

      {/* ROW 2 — Radar + skills list */}
      <div className="grid gap-4 lg:grid-cols-[60fr_40fr]">
        <SkillRadar skillCategories={profile.skillCategories} />

        <div className="rounded-xl border border-border bg-card p-5 overflow-y-auto max-h-80">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Skills
          </p>
          <div className="space-y-4">
            {skillsByCategory.map(({ key, label, skills }) => (
              <div key={key}>
                <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <span
                      key={skill.name}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs"
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${LEVEL_DOT[skill.level] ?? "bg-muted"}`} />
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {otherSkills.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Other</p>
                <div className="flex flex-wrap gap-1.5">
                  {otherSkills.map((skill) => (
                    <span
                      key={skill.name}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs"
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${LEVEL_DOT[skill.level] ?? "bg-muted"}`} />
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROW 3 — Recent analyses */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Recent Analyses
        </p>
        {analyses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No analyses yet.{" "}
            <Link href="/analyze" className="text-primary hover:underline">
              Try Analyze Job
            </Link>
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {analyses.map((a) => {
              const decision = a.result_json?.decision ?? "partial-match"
              return (
                <Link
                  key={a.id}
                  href={`/analyze/${a.id}`}
                  className="rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {a.job_title ?? "Untitled Role"}
                      </p>
                      {a.company && (
                        <p className="text-xs text-muted-foreground truncate">{a.company}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-2xl font-bold text-primary leading-none">
                      {a.fit_score ?? "?"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${DECISION_BADGE[decision] ?? ""}`}
                    >
                      {DECISION_LABEL[decision] ?? decision}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(a.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
