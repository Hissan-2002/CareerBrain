import type { Metadata } from "next"
import { ChatInterface } from "@/components/chat/ChatInterface"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Career Chat" }

export default function ChatPage() {
  return (
    /*
     * -m-6 cancels the app layout's p-6 wrapper so the chat fills edge-to-edge.
     * h-[calc(100dvh-3.5rem)] accounts for the mobile top bar (pt-14 = 3.5rem).
     * On desktop (md:) the top bar is hidden (md:pt-0), so md:h-screen fills fully.
     */
    <div className="-m-6 flex h-[calc(100dvh-3.5rem)] flex-col md:h-screen overflow-hidden">
      <ChatInterface />
    </div>
  )
}
