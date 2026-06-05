import { generateObject } from "ai"
import { z } from "zod"
import { geminiFlash } from "./gemini"
import type { CareerProfile, Chunk, JobAnalysisResult } from "@/lib/types"

// ─── Zod schema ──────────────────────────────────────────────────────────────

const projectRecommendationSchema = z.object({
  name: z.string(),
  description: z.string(),
  closesGap: z.string(),
  estimatedWeeks: z.number().int().positive(),
  techStack: z.array(z.string()),
})

export const jobAnalysisSchema = z.object({
  fitScore: z.number().int().min(0).max(100),
  decision: z.enum(["strong-match", "partial-match", "not-ready"]),
  missingSkills: z.array(z.string()),
  careerGapSummary: z.string(),
  recommendations: z.array(projectRecommendationSchema).length(3),
  reasoning: z.string(),
})

// ─── Analyzer function ────────────────────────────────────────────────────────

/**
 * Analyzes job fit by reasoning over the candidate's career profile
 * and semantically retrieved experience chunks.
 *
 * Returns a Zod-validated JobAnalysisResult. Throws on model or parse failure.
 */
export async function analyzeJob(
  careerProfile: CareerProfile,
  chunks: Chunk[],
  jobText: string
): Promise<JobAnalysisResult> {
  const chunkContext = chunks
    .map((c, i) => `[Chunk ${i + 1} — ${c.section}]\n${c.content}`)
    .join("\n\n")

  const prompt = `CANDIDATE CAREER PROFILE:
${JSON.stringify(careerProfile)}

RELEVANT EXPERIENCE CHUNKS (retrieved via semantic search):
${chunkContext}

JOB DESCRIPTION:
${jobText}

Analyze fit and return this exact JSON:
{
  "fitScore": 0-100,
  "decision": "strong-match|partial-match|not-ready",
  "missingSkills": [""],
  "careerGapSummary": "2-3 sentence plain English summary",
  "recommendations": [
    {
      "name": "",
      "description": "",
      "closesGap": "",
      "estimatedWeeks": 0,
      "techStack": []
    }
  ],
  "reasoning": "3-4 sentences explaining the score"
}

Provide exactly 3 project recommendations. Each should be a concrete, buildable project — not generic advice.
fitScore thresholds: strong-match >= 75, partial-match 45-74, not-ready < 45.`

  const { object } = await generateObject({
    model: geminiFlash,
    schema: jobAnalysisSchema,
    system:
      "You are a career intelligence system. Analyze job fit by reasoning over the candidate's career profile and retrieved experience chunks.",
    prompt,
  })

  return object as JobAnalysisResult
}
