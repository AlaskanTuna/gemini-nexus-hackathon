'use client'

import { useEffect, useEffectEvent, useRef } from 'react'

import { InputBar } from '@/components/chat/input-bar'
import { MessageBubble } from '@/components/chat/message-bubble'
import { ThinkingLog } from '@/components/chat/thinking-log'
import { GlassCard } from '@/components/layout/glass-card'
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
    <GlassCard className="flex h-full min-h-[72vh] flex-col gap-4 p-4 md:p-5">
      <div className="space-y-1 px-1">
        <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--text-muted))] uppercase">Live Swarm Chat</p>
        <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">Plan, route, and verify in one place</h2>
      </div>

      <div className="glass flex-1 overflow-hidden rounded-[30px] border border-white/40 bg-white/45 dark:border-white/10 dark:bg-slate-950/30">
        <div className="scrollbar-thin h-full max-h-[58vh] space-y-5 overflow-y-auto px-4 py-5 md:px-6">
          {messages.map((message) => (
            <div key={message.id}>
              <MessageBubble message={message} />
              {message.role === 'assistant' ? <ThinkingLog entries={message.thinking ?? []} /> : null}
            </div>
          ))}

          {isLoading ? (
            <div className="flex justify-start">
              <div className="glass rounded-[24px] rounded-bl-md px-4 py-3 text-sm text-[rgb(var(--text-secondary))]">
                AniKrewe is coordinating the request...
              </div>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>
      </div>

      <InputBar disabled={isLoading} onSendMessage={onSendMessage} />
    </GlassCard>
  )
}
