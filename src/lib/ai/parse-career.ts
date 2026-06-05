import { generateObject } from "ai"
import { z } from "zod"
import { geminiFlash } from "./gemini"
import type { CareerProfile } from "@/lib/types"

// ─── Zod schema matching the CareerProfile interface exactly ────────────────

const skillSchema = z.object({
  name: z.string(),
  category: z.enum(["frontend", "backend", "ai", "data", "devops", "other"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
})

const experienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  duration: z.string(),
  summary: z.string(),
})

const projectSchema = z.object({
  name: z.string(),
  tech: z.array(z.string()),
  description: z.string(),
})

const educationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  year: z.string(),
})

const skillCategoriesSchema = z.object({
  frontend: z.number().min(0).max(100),
  backend: z.number().min(0).max(100),
  ai: z.number().min(0).max(100),
  data: z.number().min(0).max(100),
  devops: z.number().min(0).max(100),
})

export const careerProfileSchema = z.object({
  skills: z.array(skillSchema),
  experience: z.array(experienceSchema),
  projects: z.array(projectSchema),
  education: z.array(educationSchema),
  careerLevel: z.enum(["junior", "mid", "senior"]),
  primaryDirection: z.string(),
  strengths: z.array(z.string()),
  skillCategories: skillCategoriesSchema,
})

// ─── Parser function ─────────────────────────────────────────────────────────

/**
 * Sends CV and GitHub text to Gemini 2.5 Flash to extract a structured
 * CareerProfile. Validates the response with Zod before returning.
 *
 * Throws if the model returns invalid JSON or the schema validation fails.
 */
export async function parseCareerProfile(
  cvText: string,
  githubText: string
): Promise<CareerProfile> {
  const prompt = `Extract a complete CareerProfile from this text:

[CV TEXT]
${cvText}

[GITHUB DATA]
${githubText || "No GitHub data provided."}

Return this exact JSON structure with no preamble, no markdown, no explanation — just the raw JSON object:
{
  "skills": [{"name": "", "category": "frontend|backend|ai|data|devops|other", "level": "beginner|intermediate|advanced"}],
  "experience": [{"title":"","company":"","duration":"","summary":""}],
  "projects": [{"name":"","tech":[],"description":""}],
  "education": [{"degree":"","institution":"","year":""}],
  "careerLevel": "junior|mid|senior",
  "primaryDirection": "",
  "strengths": [""],
  "skillCategories": {
    "frontend": 0,
    "backend": 0,
    "ai": 0,
    "data": 0,
    "devops": 0
  }
}

For skillCategories, score each area 0–100 based on evidence in the text. Be conservative — only score what you can verify from the provided content.`

  const { object } = await generateObject({
    model: geminiFlash,
    schema: careerProfileSchema,
    system:
      "You are a career profile extraction system. Extract structured career data from the provided text.",
    prompt,
  })

  return object as CareerProfile
}
