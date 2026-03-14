import { Wifi, WifiOff } from 'lucide-react'

import { ThemeToggle } from '@/components/theme/theme-toggle'
import type { ConnectionStatus } from '@/lib/a2a-client'
import { cn } from '@/lib/utils'

const statusCopy: Record<ConnectionStatus, string> = {
  idle: 'Standby',
  loading: 'Processing',
  connected: 'System Online',
  disconnected: 'Offline',
}

export function Header({ status }: { status: ConnectionStatus }) {
  const isOnline = status === 'connected' || status === 'loading'

  return (
    <header className="surface flex h-14 items-center justify-between rounded-2xl px-5">
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--neon-primary)] to-[var(--neon-secondary)]">
          <span className="text-xs font-bold text-white">AK</span>
        </div>
        <h1 className="neon-text font-heading text-lg font-bold tracking-[0.04em] uppercase">
          AniKrewe
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase',
            isOnline
              ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)]'
              : 'bg-[var(--accent-red)]/10 text-[var(--accent-red)]'
          )}
        >
          {isOnline ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
          {statusCopy[status]}
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
