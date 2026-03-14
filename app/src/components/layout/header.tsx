import { Wifi, WifiOff } from 'lucide-react'

import { GlassCard } from '@/components/layout/glass-card'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import type { ConnectionStatus } from '@/lib/a2a-client'
import { cn } from '@/lib/utils'

const statusCopy: Record<ConnectionStatus, string> = {
  idle: 'Ready to connect',
  loading: 'Contacting swarm',
  connected: 'A2A connected',
  disconnected: 'Connection issue',
}

export function Header({ status }: { status: ConnectionStatus }) {
  const isOnline = status === 'connected' || status === 'loading'

  return (
    <GlassCard className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="accent-gradient inline-flex size-11 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-lg">
            AK
          </span>
          <div>
            <h1 className="gradient-text text-3xl font-semibold tracking-tight">AniKrewe</h1>
            <p className="text-sm text-[rgb(var(--text-muted))]">
              Anime ops cockpit for seasonal intel, event planning, and budget checks
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:items-end">
        <div
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.2em] uppercase',
            isOnline
              ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200'
              : 'border-rose-400/40 bg-rose-400/10 text-rose-700 dark:text-rose-200'
          )}
        >
          {isOnline ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
          {statusCopy[status]}
        </div>
        <ThemeToggle />
      </div>
    </GlassCard>
  )
}
