"use client"

import { useRef, useEffect, useCallback } from "react"
import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { ChatMessage } from "./ChatMessage"
import { ChunkSidebar } from "./ChunkSidebar"
import type { Chunk } from "@/lib/types"

const STARTER_QUESTIONS = [
  "Why might I not be getting interviews?",
  "What skills should I learn next?",
  "Am I ready for a mid-level role?",
]

export function ChatInterface() {
  const [currentChunks, setCurrentChunks] = useState<Chunk[]>([])
  const [chunksLoading, setChunksLoading] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const pendingChunkIdsRef = useRef<string[]>([])
  // Keep a stable ref to the setter so it's safe to call from callbacks
  const setCurrentChunksRef = useRef(setCurrentChunks)
  setCurrentChunksRef.current = setCurrentChunks

  const fetchChunks = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return
    setChunksLoading(true)
    try {
      const res = await fetch(`/api/chat/chunks?ids=${ids.join(",")}`)
      if (res.ok) {
        const data = (await res.json()) as { chunks: Chunk[] }
        setCurrentChunksRef.current(data.chunks ?? [])
      }
    } finally {
      setChunksLoading(false)
    }
  }, [])

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      // Intercept the fetch to capture the x-retrieved-chunks header
      fetch: async (url, init) => {
        const res = await fetch(url as string, init as RequestInit)
        const ids =
          res.headers.get("x-retrieved-chunks")?.split(",").filter(Boolean) ?? []
        pendingChunkIdsRef.current = ids
        return res
      },
    }),
    onFinish: ({ isAbort, isError }) => {
      if (isAbort || isError) return
      const ids = pendingChunkIdsRef.current
      pendingChunkIdsRef.current = []
      // Async — runs after the callback returns (void return is intentional)
      void fetchChunks(ids)
    },
  })

  const isStreaming = status === "streaming" || status === "submitted"
  const lastAssistantIdx = [...messages]
    .reverse()
    .findIndex((m) => m.role === "assistant")
  const lastAssistantMessage =
    lastAssistantIdx >= 0 ? messages[messages.length - 1 - lastAssistantIdx] : null

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, status])

  // Auto-resize textarea
  function handleTextareaInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const ta = e.target
    setInputValue(ta.value)
    ta.style.height = "auto"
    ta.style.height = `${Math.min(ta.scrollHeight, 96)}px` // max ~3 lines
  }

  function handleSend() {
    const text = inputValue.trim()
    if (!text || isStreaming) return
    void sendMessage({ text })
    setInputValue("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends; Shift+Enter inserts newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleStarterQuestion(question: string) {
    void sendMessage({ text: question })
  }

  return (
    <div className="flex h-full">
      {/* ── Left panel — chat ─────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0 border-r border-border">
        {/* Message list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Typing indicator — shown while waiting for first token */}
          {status === "submitted" && (
            <div className="flex items-end gap-2">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-card border border-border px-4 py-3">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          {messages.length === 0 ? (
            /* Empty state — starter questions */
            <div className="flex h-full flex-col items-center justify-center gap-6 py-12">
              <div className="text-center space-y-1">
                <p className="font-display text-lg font-semibold text-foreground">
                  Career Brain
                </p>
                <p className="text-sm text-muted-foreground">
                  Ask anything about your career, grounded in your profile.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-sm">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleStarterQuestion(q)}
                    disabled={isStreaming}
                    className="rounded-lg border border-border bg-card px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => {
                const isLastAssistant =
                  msg === lastAssistantMessage && msg.role === "assistant"
                return (
                  <ChatMessage
                    key={msg.id ?? idx}
                    message={msg}
                    isStreaming={isLastAssistant && isStreaming}
                  />
                )
              })}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="shrink-0 border-t border-border bg-background p-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Ask about your career…"
              disabled={isStreaming}
              aria-label="Chat message"
              className="flex-1 resize-none rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              style={{ minHeight: "40px", maxHeight: "96px" }}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isStreaming}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground/50">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* ── Right panel — sources ─────────────────────────────────────────── */}
      <div className="hidden lg:flex w-80 shrink-0 flex-col overflow-hidden border-l border-border bg-card/30">
        <ChunkSidebar chunks={currentChunks} isLoading={chunksLoading && isStreaming} />
      </div>
    </div>
  )
}
