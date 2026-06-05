// pdf-parse v1.x is CommonJS; use require to avoid ESM/CJS mismatch
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>

/**
 * Extracts plain text from a PDF buffer using pdf-parse.
 * Returns the concatenated text content of all pages.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer)
    const text = data.text?.trim()
    if (!text) {
      throw new Error("PDF appears to be empty or image-only (no extractable text).")
    }
    return text
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`PDF parsing failed: ${err.message}`)
    }
    throw new Error("PDF parsing failed: unknown error")
  }
}
