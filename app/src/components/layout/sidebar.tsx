import type { AgentKey } from '@/lib/a2a-client'
import { agentDirectory } from '@/lib/a2a-client'
import { cn } from '@/lib/utils'

import { GlassCard } from './glass-card'

export function Sidebar({ activeAgent }: { activeAgent: AgentKey }) {
  return (
    <GlassCard className="h-full space-y-4 bg-white/55 p-4 dark:bg-slate-950/40">
      <div className="space-y-1 px-1">
        <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--text-muted))] uppercase">Agent Roster</p>
        <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Specialists on standby</h2>
        <p className="text-sm text-[rgb(var(--text-muted))]">
          The router delegates to the right specialist and keeps ambiguous asks at the top.
        </p>
      </div>

      <div className="glass rounded-3xl border-white/40 px-4 py-3 dark:border-white/10">
        <p className="text-xs font-semibold tracking-[0.18em] text-[rgb(var(--text-muted))] uppercase">Current focus</p>
        <p className="mt-2 text-base font-semibold text-[rgb(var(--text-primary))]">
          {activeAgent === 'router_agent' ? 'AniKrewe Router' : agentDirectory[activeAgent].name}
        </p>
      </div>

      <div className="space-y-3">
        {(['season_intel_agent', 'event_planner_agent', 'budget_tracker_agent'] as AgentKey[]).map((agentKey) => {
          const agent = agentDirectory[agentKey]
          const isActive = activeAgent === agentKey

          return (
            <div
              key={agent.key}
              className={cn(
                'rounded-3xl border px-4 py-4 transition-all',
                isActive
                  ? 'border-white/65 bg-white/75 shadow-[0_16px_48px_rgba(147,51,234,0.18)] dark:border-white/20 dark:bg-white/8'
                  : 'border-white/30 bg-white/45 dark:border-white/8 dark:bg-white/4'
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className="inline-flex size-11 items-center justify-center rounded-2xl text-lg shadow-sm"
                  style={{ background: agent.softBackground, color: agent.accentColor }}
                >
                  {agent.emoji}
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{agent.name}</p>
                    {isActive ? (
                      <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold tracking-[0.16em] uppercase text-slate-900 dark:bg-white/15 dark:text-white">
                        Active
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-[rgb(var(--text-muted))]">{agent.description}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}
