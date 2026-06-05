"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { CareerProfile, Skill } from "@/lib/types"

interface ProfileCardProps {
  profile: CareerProfile
  completenessScore: number
}

const LEVEL_COLORS: Record<Skill["level"], string> = {
  beginner: "bg-yellow-500",
  intermediate: "bg-blue-400",
  advanced: "bg-green-400",
}

const CATEGORY_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  ai: "AI / ML",
  data: "Data",
  devops: "DevOps",
  other: "Other",
}

const CAREER_LEVEL_LABELS: Record<CareerProfile["careerLevel"], string> = {
  junior: "Junior",
  mid: "Mid-level",
  senior: "Senior",
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-green-500/20 text-green-300 border-green-500/30" :
    score >= 50 ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" :
                  "bg-red-500/20 text-red-300 border-red-500/30"

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${color}`}
    >
      <span className="font-mono">{score}%</span>
      <span>completeness</span>
    </span>
  )
}

export function ProfileCard({ profile, completenessScore }: ProfileCardProps) {
  const router = useRouter()
  const [rebuilding, setRebuilding] = useState(false)

  // Group skills by category
  const skillsByCategory = profile.skills.reduce<Record<string, Skill[]>>(
    (acc, skill) => {
      const cat = skill.category
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(skill)
      return acc
    },
    {}
  )

  function handleRebuild() {
    setRebuilding(true)
    // Navigate back to the profile page — the server component will re-check
    // brain status. We force a full navigation so the BrainBuilder is shown.
    router.push("/profile?rebuild=1")
    router.refresh()
  }

  return (
    <div className="space-y-8">
      {/* ── Header card ── */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {CAREER_LEVEL_LABELS[profile.careerLevel]}
            </span>
            <ScoreBadge score={completenessScore} />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground">
            {profile.primaryDirection}
          </h2>
          {profile.strengths.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {profile.strengths.map((s) => (
                <li
                  key={s}
                  className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={handleRebuild}
          disabled={rebuilding}
          className="shrink-0 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
        >
          {rebuilding ? "Redirecting…" : "Rebuild Brain"}
        </button>
      </div>

      {/* ── Skills ── */}
      {Object.keys(skillsByCategory).length > 0 && (
        <section aria-labelledby="skills-heading">
          <h3
            id="skills-heading"
            className="mb-4 font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Skills
          </h3>
          <div className="space-y-4">
            {Object.entries(skillsByCategory).map(([cat, skills]) => (
              <div key={cat}>
                <p className="mb-2 text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
                  {CATEGORY_LABELS[cat] ?? cat}
                </p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <div
                      key={skill.name}
                      className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1"
                      title={`${skill.level} level`}
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${LEVEL_COLORS[skill.level]}`}
                        aria-label={skill.level}
                      />
                      <span className="text-xs font-medium text-foreground">
                        {skill.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground/50">
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              beginner
            </span>{" "}
            <span className="inline-flex items-center gap-1 ml-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              intermediate
            </span>{" "}
            <span className="inline-flex items-center gap-1 ml-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              advanced
            </span>
          </p>
        </section>
      )}

      {/* ── Experience ── */}
      {profile.experience.length > 0 && (
        <section aria-labelledby="experience-heading">
          <h3
            id="experience-heading"
            className="mb-4 font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Experience
          </h3>
          <div className="space-y-3">
            {profile.experience.map((exp, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{exp.title}</p>
                    <p className="text-sm text-muted-foreground">{exp.company}</p>
                  </div>
                  <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {exp.duration}
                  </span>
                </div>
                {exp.summary && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {exp.summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Projects ── */}
      {profile.projects.length > 0 && (
        <section aria-labelledby="projects-heading">
          <h3
            id="projects-heading"
            className="mb-4 font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Projects
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {profile.projects.map((project, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4"
              >
                <p className="font-medium text-foreground">{project.name}</p>
                {project.description && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {project.description}
                  </p>
                )}
                {project.tech.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {project.tech.map((t) => (
                      <span
                        key={t}
                        className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Education ── */}
      {profile.education.length > 0 && (
        <section aria-labelledby="education-heading">
          <h3
            id="education-heading"
            className="mb-4 font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Education
          </h3>
          <div className="space-y-2">
            {profile.education.map((edu, idx) => (
              <div
                key={idx}
                className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-border bg-card px-4 py-3"
              >
                <div>
                  <p className="font-medium text-foreground">{edu.degree}</p>
                  <p className="text-sm text-muted-foreground">{edu.institution}</p>
                </div>
                <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {edu.year}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
