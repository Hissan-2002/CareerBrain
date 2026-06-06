"use client"

import { useState } from "react"
import type { Chunk } from "@/lib/types"

interface SourceChunksProps {
  chunks: Chunk[]
}

/** Split raw CV text into displayable lines, filtering noise */
function parseChunkLines(content: string): string[] {
  return content
    .split(/\n+/)
    .map((line) => line.replace(/^\s*[•\-–—*]\s*/, "").trim())
    .filter((line) => line.length > 2)
}

function ChunkCard({ chunk }: { chunk: Chunk }) {
  const [expanded, setExpanded] = useState(false)
  const lines = parseChunkLines(chunk.content)
  const preview = lines.slice(0, 4)
  const rest = lines.slice(4)
  const hasMore = rest.length > 0

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Section label */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card/80">
        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
        <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-primary truncate">
          {chunk.section ?? "General"}
        </p>
      </div>

      {/* Content lines */}
      <ul className="px-3 py-2.5 space-y-1">
        {(expanded ? lines : preview).map((line, i) => (
          <li
            key={i}
            className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground"
          >
            <span className="mt-[0.35em] h-1 w-1 rounded-full bg-border shrink-0" />
            <span>{line}</span>
          </li>
        ))}
      </ul>

      {/* Expand toggle */}
      {hasMore && (
        <div className="px-3 pb-2.5">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-[10px] font-medium text-muted-foreground/70 hover:text-primary transition-colors"
          >
            {expanded ? "Show less" : `+${rest.length} more lines`}
          </button>
        </div>
      )}
    </div>
  )
}

export function SourceChunks({ chunks }: SourceChunksProps) {
  if (chunks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-4 text-center">
        <p className="text-xs text-muted-foreground">No sources retrieved.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="space-y-0.5">
        <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Sources Used
        </h3>
        <p className="text-xs text-muted-foreground/60">
          Profile sections that informed this analysis
        </p>
      </div>
      <div className="space-y-2">
        {chunks.map((chunk) => (
          <ChunkCard key={chunk.id} chunk={chunk} />
        ))}
      </div>
    </div>
  )
}
