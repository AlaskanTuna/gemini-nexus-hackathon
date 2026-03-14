import { Calendar, Radar, Sparkles, Wallet } from 'lucide-react'

import type { AgentKey } from '@/lib/a2a-client'
import { agentDirectory } from '@/lib/a2a-client'
import { cn } from '@/lib/utils'

const iconMap: Record<string, typeof Sparkles> = {
  sparkles: Sparkles,
  calendar: Calendar,
  wallet: Wallet,
  radar: Radar,
}

const glowMap: Record<AgentKey, string> = {
  router_agent: '',
  season_intel_agent: 'glow-purple',
  event_planner_agent: 'glow-cyan',
  budget_tracker_agent: 'glow-pink',
}

const borderMap: Record<AgentKey, string> = {
  router_agent: 'border-l-indigo-500',
  season_intel_agent: 'border-l-[#a855f7]',
  event_planner_agent: 'border-l-[#22d3ee]',
  budget_tracker_agent: 'border-l-[#f472b6]',
}

export function Sidebar({ activeAgent }: { activeAgent: AgentKey }) {
  const agents: AgentKey[] = ['season_intel_agent', 'event_planner_agent', 'budget_tracker_agent']

  return (
    <div className="flex h-full flex-col gap-3">
      {agents.map((agentKey) => {
        const agent = agentDirectory[agentKey]
        const isActive = activeAgent === agentKey
        const Icon = iconMap[agent.icon] ?? Radar

        return (
          <div
            key={agent.key}
            className={cn(
              'surface cursor-pointer rounded-2xl border-l-[3px] p-4 transition-all duration-200',
              borderMap[agentKey],
              isActive && glowMap[agentKey],
              !isActive && 'opacity-60'
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${agent.accentColor}20` }}
              >
                <Icon className="size-4" style={{ color: agent.accentColor }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-heading text-sm font-semibold text-[var(--text-primary)]">{agent.name}</p>
                  {isActive ? (
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-bold tracking-[0.12em] uppercase"
                      style={{
                        color: 'var(--accent-green)',
                        background: 'rgba(34, 197, 94, 0.15)',
                      }}
                    >
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold tracking-[0.12em] text-[var(--text-muted)] uppercase">
                      Idle
                    </span>
                  )}
                </div>
                <p className="font-mono text-[11px] text-[var(--text-muted)]">{agent.id}</p>
              </div>
            </div>
          </div>
        )
      })}

      <div className="mt-auto surface rounded-2xl px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-[var(--accent-green)] shadow-[0_0_6px_var(--accent-green)]" />
          <span className="font-heading text-[11px] font-semibold tracking-[0.12em] text-[var(--text-muted)] uppercase">
            All systems nominal
          </span>
        </div>
      </div>
    </div>
  )
}
