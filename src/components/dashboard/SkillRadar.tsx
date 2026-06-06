"use client"

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts"
import type { SkillCategories } from "@/lib/types"

interface SkillRadarProps {
  skillCategories: SkillCategories
}

export function SkillRadar({ skillCategories }: SkillRadarProps) {
  const data = [
    { subject: "Frontend", value: skillCategories.frontend },
    { subject: "Backend",  value: skillCategories.backend },
    { subject: "AI / ML",  value: skillCategories.ai },
    { subject: "Data",     value: skillCategories.data },
    { subject: "DevOps",   value: skillCategories.devops },
  ]

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Skill Radar
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke="#2e2e2e" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#aaaaaa", fontSize: 12, fontFamily: "var(--font-inter)" }}
          />
          <PolarRadiusAxis
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Skills"
            dataKey="value"
            stroke="#64c8be"
            fill="#64c8be"
            fillOpacity={0.35}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
