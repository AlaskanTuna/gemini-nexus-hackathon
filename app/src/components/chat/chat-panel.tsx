'use client'

import { useEffect, useEffectEvent, useRef } from 'react'

import { InputBar } from '@/components/chat/input-bar'
import { MessageBubble } from '@/components/chat/message-bubble'
import { SuggestionChips } from '@/components/chat/suggestion-chips'
import { ThinkingLog } from '@/components/chat/thinking-log'
import { FlickeringGrid } from '@/components/ui/flickering-grid'
import { MessageLoading } from '@/components/ui/message-loading'
import type { AgentKey, ChatMessage } from '@/lib/a2a-client'

type ChatPanelProps = {
  activeAgent: AgentKey
  isLoading: boolean
  messages: ChatMessage[]
  onSendMessage: (message: string) => Promise<void>
}

export function ChatPanel({ activeAgent, isLoading, messages, onSendMessage }: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = useEffectEvent(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  })

  useEffect(() => {
    scrollToBottom()
  }, [messages.length, isLoading])

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <FlickeringGrid
        className="absolute inset-0 z-0"
        squareSize={4}
        gridGap={6}
        color="var(--neon-primary)"
        maxOpacity={0.15}
        flickerChance={0.08}
      />

      <div className="relative z-10 scrollbar-thin flex-1 space-y-4 overflow-y-auto px-5 py-5 md:px-10">
        {messages.map((message, index) => (
          <div key={message.id}>
            <MessageBubble message={message} />
            {message.role === 'assistant' ? (
              <ThinkingLog entries={message.thinking ?? []} defaultOpen={index === 1} />
            ) : null}
          </div>
        ))}

        {!isLoading && messages.length > 0 && messages[messages.length - 1].role === 'assistant' ? (
          <SuggestionChips activeAgent={activeAgent} disabled={isLoading} onSelect={(text) => onSendMessage(text)} />
        ) : null}

        {isLoading ? (
          <div className="flex justify-start">
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 px-5 py-4 backdrop-blur-xl">
              <MessageLoading />
            </div>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <div className="relative z-10 shrink-0 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-solid)]/80 px-5 py-4 backdrop-blur-xl md:px-10">
        <InputBar disabled={isLoading} onSendMessage={onSendMessage} />
      </div>
    </div>
  )
}
