import { Bot, Wifi, WifiOff } from 'lucide-react'

import { ThemeToggle } from '@/components/theme/theme-toggle'
import ShinyButton from '@/components/ui/shiny-button'
import type { ConnectionStatus } from '@/lib/a2a-client'
import { cn } from '@/lib/utils'

const statusCopy: Record<ConnectionStatus, string> = {
  idle: 'Standby',
  loading: 'Processing',
  connected: 'System Online',
  disconnected: 'Offline',
}

type HeaderProps = {
  status: ConnectionStatus
  onNewChat: () => void
}

export function Header({ status, onNewChat }: HeaderProps) {
  const isOnline = status === 'connected' || status === 'loading'

  return (
    <header className="flex h-12 items-center justify-between bg-[var(--bg-surface-solid)] px-4">
      <div className="flex items-center gap-2.5">
        <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--neon-primary)] to-[var(--neon-secondary)]">
          <Bot className="size-4 text-white" />
        </div>
        <h1 className="neon-text text-base font-bold tracking-[0.06em] uppercase">
          AniKrewe
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <ShinyButton onClick={onNewChat}>New Chat</ShinyButton>
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase',
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
