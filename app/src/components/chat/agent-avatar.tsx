import { Calendar, Radar, Sparkles, Wallet } from 'lucide-react'

import type { AgentKey } from '@/lib/a2a-client'
import { agentDirectory } from '@/lib/a2a-client'

const iconMap: Record<string, typeof Sparkles> = {
  sparkles: Sparkles,
  calendar: Calendar,
  wallet: Wallet,
  radar: Radar,
}

export function AgentAvatar({ agentKey }: { agentKey: AgentKey }) {
  const agent = agentDirectory[agentKey]
  const Icon = iconMap[agent.icon] ?? Radar

  return (
    <div className="mb-1 flex items-center gap-2 text-xs">
      <span className="size-2 rounded-full" style={{ background: agent.accentColor }} />
      <span className="font-semibold" style={{ color: agent.accentColor }}>{agent.name}</span>
    </div>
  )
}
