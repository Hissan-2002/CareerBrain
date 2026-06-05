export interface TextChunk {
  content: string
  section: string
}

const MAX_CHUNK_SIZE = 1500
const MIN_CHUNK_SIZE = 50

/**
 * Known section header keywords (case-insensitive).
 * Text is split at lines that match one of these patterns.
 */
const SECTION_PATTERNS = [
  "education",
  "experience",
  "work history",
  "employment history",
  "skills",
  "technical skills",
  "projects",
  "certifications",
  "achievements",
  "awards",
  "summary",
  "professional summary",
  "about",
  "github",
  "open source",
]

/**
 * Builds a regex that matches lines containing a section header keyword
 * as a standalone word (not buried inside a word).
 */
function buildSectionRegex(): RegExp {
  const escaped = SECTION_PATTERNS.map((p) =>
    p.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&")
  )
  return new RegExp(
    `^\\s*(${escaped.join("|")})\\s*[:\\-]?\\s*$`,
    "im"
  )
}

const SECTION_HEADER_RE = buildSectionRegex()

/**
 * Detects the section label from a header line.
 * Falls back to the first few words if no known keyword matches.
 */
function detectSection(line: string): string {
  const lower = line.toLowerCase().trim()
  for (const pattern of SECTION_PATTERNS) {
    if (lower.includes(pattern)) {
      return pattern.charAt(0).toUpperCase() + pattern.slice(1)
    }
  }
  return line.trim().slice(0, 40) || "General"
}

/**
 * Splits a section that exceeds MAX_CHUNK_SIZE at double-newlines.
 * Each sub-chunk inherits the parent section label.
 */
function splitLargeSection(text: string, section: string): TextChunk[] {
  const parts = text.split(/\n\s*\n/)
  const chunks: TextChunk[] = []

  let buffer = ""
  for (const part of parts) {
    if ((buffer + "\n\n" + part).trim().length <= MAX_CHUNK_SIZE) {
      buffer = buffer ? buffer + "\n\n" + part : part
    } else {
      if (buffer.trim().length >= MIN_CHUNK_SIZE) {
        chunks.push({ content: buffer.trim(), section })
      }
      buffer = part
    }
  }

  if (buffer.trim().length >= MIN_CHUNK_SIZE) {
    chunks.push({ content: buffer.trim(), section })
  }

  return chunks
}

/**
 * Section-based chunking as defined in the spec (Section 9).
 *
 * 1. Split raw text at section header boundaries
 * 2. Each section becomes one chunk
 * 3. If a section > 1500 chars, split further at double-newlines
 * 4. Discard chunks shorter than 50 chars
 */
export function chunkText(rawText: string): TextChunk[] {
  const lines = rawText.split("\n")
  const chunks: TextChunk[] = []

  let currentSection = "General"
  let currentLines: string[] = []

  function flushSection() {
    const content = currentLines.join("\n").trim()
    if (content.length < MIN_CHUNK_SIZE) return

    if (content.length <= MAX_CHUNK_SIZE) {
      chunks.push({ content, section: currentSection })
    } else {
      chunks.push(...splitLargeSection(content, currentSection))
    }
  }

  for (const line of lines) {
    if (SECTION_HEADER_RE.test(line)) {
      flushSection()
      currentSection = detectSection(line)
      currentLines = [line]
    } else {
      currentLines.push(line)
    }
  }

  // Flush the last section
  flushSection()

  return chunks
}
