'use client'

import { useEffect, useEffectEvent, useRef } from 'react'

import { InputBar } from '@/components/chat/input-bar'
import { MessageBubble } from '@/components/chat/message-bubble'
import { ThinkingLog } from '@/components/chat/thinking-log'
import type { ChatMessage } from '@/lib/a2a-client'

type ChatPanelProps = {
  isLoading: boolean
  messages: ChatMessage[]
  onSendMessage: (message: string) => Promise<void>
}

export function ChatPanel({ isLoading, messages, onSendMessage }: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = useEffectEvent(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  })

  useEffect(() => {
    scrollToBottom()
  }, [messages.length, isLoading])

  return (
    <div className="surface flex h-full min-h-[72vh] flex-col gap-3 rounded-2xl p-4">
      <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-2 py-3">
        {messages.map((message, index) => (
          <div key={message.id}>
            <MessageBubble message={message} />
            {message.role === 'assistant' ? (
              <ThinkingLog entries={message.thinking ?? []} defaultOpen={index === 1} />
            ) : null}
          </div>
        ))}

        {isLoading ? (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-xl surface px-4 py-3">
              <span className="size-1.5 rounded-full bg-[var(--neon-primary)]" style={{ animation: 'typing-dot 1.4s ease-in-out infinite 0ms' }} />
              <span className="size-1.5 rounded-full bg-[var(--neon-primary)]" style={{ animation: 'typing-dot 1.4s ease-in-out infinite 150ms' }} />
              <span className="size-1.5 rounded-full bg-[var(--neon-primary)]" style={{ animation: 'typing-dot 1.4s ease-in-out infinite 300ms' }} />
            </div>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <InputBar disabled={isLoading} onSendMessage={onSendMessage} />
    </div>
  )
}
