import type { AgentKey } from '@/lib/a2a-client'
import { agentDirectory } from '@/lib/a2a-client'

export function AgentAvatar({ agentKey }: { agentKey: AgentKey }) {
  const agent = agentDirectory[agentKey]

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm dark:bg-white/10 dark:text-white">
      <span
        className="inline-flex size-6 items-center justify-center rounded-full text-sm"
        style={{ background: agent.softBackground, color: agent.accentColor }}
      >
        {agent.emoji}
      </span>
      <span>{agent.name}</span>
    </div>
  )
}
