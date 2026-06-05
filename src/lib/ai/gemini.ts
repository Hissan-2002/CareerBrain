import { createGoogleGenerativeAI } from "@ai-sdk/google"

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
})

/** Gemini 2.5 Flash — used for career parsing, job analysis, and chat */
export const geminiFlash = google("gemini-2.5-flash")

/** gemini-embedding-001 — 768-dimension embeddings for RAG (replaces text-embedding-004 for AQ. keys) */
export const embeddingModel = google.textEmbeddingModel("gemini-embedding-001")
