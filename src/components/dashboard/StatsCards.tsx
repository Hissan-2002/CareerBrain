import type { CareerProfile } from "@/lib/types"

interface StatsCardsProps {
  profile: CareerProfile
  completenessScore: number
}

const CAREER_LEVEL_LABELS: Record<CareerProfile["careerLevel"], string> = {
  junior: "Junior",
  mid: "Mid-level",
  senior: "Senior",
}

interface StatCardProps {
  label: string
  value: React.ReactNode
  sub?: string
}

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-1">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="font-display text-3xl font-bold leading-none">{value}</div>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

export function StatsCards({ profile, completenessScore }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label="Career Level"
        value={
          <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-base font-semibold text-primary">
            {CAREER_LEVEL_LABELS[profile.careerLevel]}
          </span>
        }
      />
      <StatCard
        label="Total Skills"
        value={
          <span className="text-foreground">{profile.skills.length}</span>
        }
        sub="extracted from your CV"
      />
      <StatCard
        label="Total Projects"
        value={
          <span className="text-foreground">{profile.projects.length}</span>
        }
        sub="identified in your profile"
      />
      <StatCard
        label="Completeness"
        value={
          <span className="text-primary">{completenessScore}%</span>
        }
        sub="of your brain is populated"
      />
    </div>
  )
}
