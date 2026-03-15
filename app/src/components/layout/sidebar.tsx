'use client'

import { Calendar, ChevronLeft, ChevronRight, Radar, Search, Sparkles, Wallet } from 'lucide-react'
import { useState } from 'react'

import { ChatHistory } from '@/components/chat/chat-history'
import type { AgentKey } from '@/lib/a2a-client'
import { agentDirectory } from '@/lib/a2a-client'
import type { ChatSession } from '@/lib/chat-store'
import { cn } from '@/lib/utils'

const iconMap: Record<string, typeof Sparkles> = {
  sparkles: Sparkles,
  calendar: Calendar,
  wallet: Wallet,
  radar: Radar,
  search: Search,
}

const glowMap: Record<AgentKey, string> = {
  router_agent: '',
  season_intel_agent: 'glow-purple',
  event_planner_agent: 'glow-cyan',
  budget_tracker_agent: 'glow-pink',
  merch_scout_agent: '',
}

const borderMap: Record<AgentKey, string> = {
  router_agent: 'border-l-indigo-500',
  season_intel_agent: 'border-l-[#a855f7]',
  event_planner_agent: 'border-l-[#22d3ee]',
  budget_tracker_agent: 'border-l-[#f472b6]',
  merch_scout_agent: 'border-l-[#f59e0b]',
}

type SidebarProps = {
  activeAgent: AgentKey
  sessions: ChatSession[]
  activeSessionId: string
  onSelectSession: (id: string) => void
  onDeleteSession: (id: string) => void
}

export function Sidebar({ activeAgent, sessions, activeSessionId, onSelectSession, onDeleteSession }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const agents: AgentKey[] = ['season_intel_agent', 'event_planner_agent', 'budget_tracker_agent', 'merch_scout_agent']

  return (
    <div
      className={cn(
        'relative flex h-full flex-col bg-[var(--bg-surface-solid)] transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-72'
      )}
    >
      <button
        type="button"
        className="absolute -right-3 top-4 z-10 flex size-6 cursor-pointer items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-solid)] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
      </button>

      <div className="flex flex-col gap-1 p-2">
        {agents.map((agentKey) => {
          const agent = agentDirectory[agentKey]
          const isActive = activeAgent === agentKey
          const Icon = iconMap[agent.icon] ?? Radar

          return (
            <div
              key={agent.key}
              className={cn(
                'cursor-pointer overflow-hidden rounded-xl border border-[var(--border-subtle)] border-l-[3px] p-4 transition-all duration-200',
                borderMap[agentKey],
                isActive && glowMap[agentKey],
                isActive ? 'bg-white/[0.04]' : 'opacity-50 hover:opacity-70'
              )}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${agent.accentColor}20` }}
                >
                  <Icon className="size-5" style={{ color: agent.accentColor }} />
                </div>
                {!collapsed ? (
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold text-[var(--text-primary)]">{agent.name}</p>
                      {isActive ? (
                        <span
                          className="rounded px-1.5 py-0.5 text-[9px] font-bold tracking-[0.12em] uppercase"
                          style={{
                            color: 'var(--accent-green)',
                            background: 'rgba(34, 197, 94, 0.15)',
                          }}
                        >
                          Active
                        </span>
                      ) : (
                        <span className="text-[9px] font-semibold tracking-[0.12em] text-[var(--text-muted)] uppercase">
                          Idle
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[10px] text-[var(--text-muted)]">{agent.id}</p>
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto border-t border-[var(--border-subtle)] p-2">
        <ChatHistory
          sessions={sessions}
          activeSessionId={activeSessionId}
          collapsed={collapsed}
          onSelectSession={onSelectSession}
          onDeleteSession={onDeleteSession}
        />
      </div>

      <div className="border-t border-[var(--border-subtle)] px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="size-1.5 shrink-0 rounded-full bg-[var(--accent-green)] shadow-[0_0_6px_var(--accent-green)]" />
          {!collapsed ? (
            <span className="text-[10px] font-semibold tracking-[0.12em] text-[var(--text-muted)] uppercase">
              All systems nominal
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
