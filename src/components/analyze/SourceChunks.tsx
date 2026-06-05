"use client"

import { useState } from "react"
import type { Chunk } from "@/lib/types"

interface SourceChunksProps {
  chunks: Chunk[]
}

function ChunkCard({ chunk }: { chunk: Chunk }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-1.5">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-primary">
        {chunk.section}
      </p>
      <div className="relative">
        <p
          className={`text-xs leading-relaxed text-muted-foreground ${
            expanded ? "" : "line-clamp-4"
          }`}
        >
          {chunk.content}
        </p>
        {!expanded && chunk.content.length > 200 && (
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-card to-transparent" />
        )}
      </div>
      {chunk.content.length > 200 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  )
}

export function SourceChunks({ chunks }: SourceChunksProps) {
  if (chunks.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-center">
        <p className="text-xs text-muted-foreground">No sources retrieved.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Sources Used
        </h3>
        <p className="text-xs text-muted-foreground/70">
          These profile sections informed this analysis
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
