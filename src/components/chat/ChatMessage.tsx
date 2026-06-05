import { isTextUIPart } from "ai"
import type { UIMessage } from "ai"
import ReactMarkdown from "react-markdown"

interface ChatMessageProps {
  message: UIMessage
  isStreaming?: boolean
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === "user"

  const textContent = message.parts
    .filter(isTextUIPart)
    .map((p) => p.text)
    .join("")

  if (!textContent && !isStreaming) return null

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      role="article"
      aria-label={isUser ? "Your message" : "Assistant message"}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-tl-sm bg-card border border-border text-foreground"
        }`}
      >
        {textContent ? (
          isUser ? (
            <span>{textContent}</span>
          ) : (
            <div className="prose-chat">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>,
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  code: ({ children }) => (
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">{children}</code>
                  ),
                  h1: ({ children }) => <h1 className="mb-2 font-display text-base font-bold">{children}</h1>,
                  h2: ({ children }) => <h2 className="mb-2 font-display text-sm font-bold">{children}</h2>,
                  h3: ({ children }) => <h3 className="mb-1 font-display text-sm font-semibold">{children}</h3>,
                }}
              >
                {textContent}
              </ReactMarkdown>
              {isStreaming && (
                <span
                  className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-current align-text-bottom"
                  aria-hidden="true"
                />
              )}
            </div>
          )
        ) : (
          isStreaming && (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
            </span>
          )
        )}
      </div>
    </div>
  )
}
