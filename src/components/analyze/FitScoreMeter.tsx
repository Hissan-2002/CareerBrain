"use client"

import { useEffect, useRef } from "react"
import type { JobAnalysisResult } from "@/lib/types"

interface FitScoreMeterProps {
  score: number
  decision: JobAnalysisResult["decision"]
  reasoning: string
}

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

// SVG arc helpers
const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const SIZE = 140
const STROKE = 10

function scoreToOffset(score: number): number {
  const clamped = Math.max(0, Math.min(100, score))
  return CIRCUMFERENCE * (1 - clamped / 100)
}

export function FitScoreMeter({ score, decision, reasoning }: FitScoreMeterProps) {
  const progressRef = useRef<SVGCircleElement>(null)
  const config = DECISION_CONFIG[decision]

  useEffect(() => {
    const circle = progressRef.current
    if (!circle) return
    // Animate from full offset (empty) to the target offset
    circle.style.strokeDashoffset = String(CIRCUMFERENCE)
    const target = scoreToOffset(score)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        circle.style.transition = "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)"
        circle.style.strokeDashoffset = String(target)
      })
    })
  }, [score])

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      {/* Circular arc */}
      <div className="relative">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          aria-label={`Fit score: ${score} out of 100`}
          role="img"
        >
          {/* Background track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE}
            className="text-muted/30"
          />
          {/* Progress arc */}
          <circle
            ref={progressRef}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-4xl font-bold text-primary leading-none">
            {score}
          </span>
          <span className="text-xs text-muted-foreground mt-0.5">/ 100</span>
        </div>
      </div>

      {/* Decision badge */}
      <span
        className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${config.color} ${config.bg} ${config.border}`}
      >
        {config.label}
      </span>

      {/* Reasoning */}
      {reasoning && (
        <p className="text-center text-sm leading-relaxed text-muted-foreground max-w-prose">
          {reasoning}
        </p>
      )}
    </div>
  )
}
