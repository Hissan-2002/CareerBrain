import { SourceChunks } from "@/components/analyze/SourceChunks"
import type { Chunk } from "@/lib/types"

interface ChunkSidebarProps {
  chunks: Chunk[]
  isLoading?: boolean
}

export function ChunkSidebar({ chunks, isLoading }: ChunkSidebarProps) {
  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto px-4 py-4">
      <div className="space-y-0.5 shrink-0">
        <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Retrieved Sources
        </h2>
        <p className="text-xs text-muted-foreground/60">
          Profile sections used for this response
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg bg-muted/40"
            />
          ))}
        </div>
      ) : chunks.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border">
          <p className="px-4 text-center text-xs text-muted-foreground/60">
            Sources will appear here after your first question
          </p>
        </div>
      ) : (
        <SourceChunks chunks={chunks} />
      )}
    </div>
  )
}
