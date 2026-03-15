'use client'

import { MessageSquare, Trash2 } from 'lucide-react'

import type { ChatSession } from '@/lib/chat-store'
import { cn } from '@/lib/utils'

type ChatHistoryProps = {
  sessions: ChatSession[]
  activeSessionId: string
  collapsed: boolean
  onSelectSession: (id: string) => void
  onDeleteSession: (id: string) => void
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export function ChatHistory({ sessions, activeSessionId, collapsed, onSelectSession, onDeleteSession }: ChatHistoryProps) {
  if (sessions.length === 0) return null

  return (
    <div className="flex flex-col gap-1">
      {!collapsed ? (
        <p className="px-2 pb-1 text-[10px] font-semibold tracking-[0.12em] text-[var(--text-muted)] uppercase">
          Chat History
        </p>
      ) : null}
      {sessions.slice(0, 8).map((session) => {
        const isActive = session.id === activeSessionId
        return (
          <div
            key={session.id}
            className={cn(
              'group flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 transition-colors',
              isActive ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
            )}
            onClick={() => onSelectSession(session.id)}
          >
            <MessageSquare className="size-3.5 shrink-0 text-[var(--text-muted)]" />
            {!collapsed ? (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] text-[var(--text-secondary)]">
                    {session.title}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {formatTime(session.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  className="cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteSession(session.id)
                  }}
                >
                  <Trash2 className="size-3 text-[var(--text-muted)] hover:text-[var(--accent-red)]" />
                </button>
              </>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
