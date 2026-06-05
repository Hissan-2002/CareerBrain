// ─── Core career data types ───────────────────────────────────────────────────

export interface Skill {
  name: string
  category: "frontend" | "backend" | "ai" | "data" | "devops" | "other"
  level: "beginner" | "intermediate" | "advanced"
}

export interface Experience {
  title: string
  company: string
  duration: string
  summary: string
}

export interface Project {
  name: string
  tech: string[]
  description: string
}

export interface Education {
  degree: string
  institution: string
  year: string
}

export interface SkillCategories {
  frontend: number // 0–100 scores
  backend: number
  ai: number
  data: number
  devops: number
}

export interface CareerProfile {
  skills: Skill[]
  experience: Experience[]
  projects: Project[]
  education: Education[]
  careerLevel: "junior" | "mid" | "senior"
  primaryDirection: string
  strengths: string[]
  skillCategories: SkillCategories
}

// ─── Job analysis types ────────────────────────────────────────────────────────

export interface ProjectRecommendation {
  name: string
  description: string
  closesGap: string
  estimatedWeeks: number
  techStack: string[]
}

export interface JobAnalysisResult {
  fitScore: number // 0–100
  decision: "strong-match" | "partial-match" | "not-ready"
  missingSkills: string[]
  careerGapSummary: string
  recommendations: ProjectRecommendation[]
  reasoning: string
}

// ─── RAG / chunk types ─────────────────────────────────────────────────────────

export interface Chunk {
  id: string
  content: string
  section: string
  metadata: Record<string, unknown>
}

// ─── Pipeline / UI types ───────────────────────────────────────────────────────

export interface PipelineStep {
  id: string
  label: string
  status: "pending" | "running" | "done" | "error"
}

// ─── Database row types ────────────────────────────────────────────────────────

export interface CareerProfileRow {
  id: string
  user_id: string
  structured_json: CareerProfile
  github_username: string | null
  completeness_score: number
  raw_cv_text: string | null
  raw_github_text: string | null
  updated_at: string
}

export interface JobAnalysisRow {
  id: string
  user_id: string
  job_title: string | null
  company: string | null
  job_text: string
  fit_score: number | null
  result_json: JobAnalysisResult | null
  retrieved_chunk_ids: string[] | null
  created_at: string
}

export interface ChatMessageRow {
  id: string
  user_id: string
  role: "user" | "assistant"
  content: string
  retrieved_chunk_ids: string[] | null
  created_at: string
}

export interface ChunkRow {
  id: string
  user_id: string
  document_id: string
  content: string
  section: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

// ─── API response types ────────────────────────────────────────────────────────

export interface ApiError {
  error: string
}

export interface BrainBuildResponse {
  success: true
  profile: CareerProfile
}

export interface AnalyzeResponse {
  analysisId: string
  result: JobAnalysisResult
  retrievedChunks: Chunk[]
}
