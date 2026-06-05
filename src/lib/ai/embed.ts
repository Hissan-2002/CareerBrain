import { embed, embedMany } from "ai"
import { embeddingModel } from "./gemini"

/**
 * Embed a single text string.
 * Returns a 768-dimension float array.
 */
export async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
  })
  return embedding
}

/**
 * Embed multiple texts in a single batched request.
 * Use this for chunk embedding during brain build to avoid sequential timeouts.
 * Returns an array of 768-dimension float arrays in the same order as input.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []

  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: texts,
  })
  return embeddings
}
