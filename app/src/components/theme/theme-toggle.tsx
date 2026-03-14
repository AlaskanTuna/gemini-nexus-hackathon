'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'

import { cn } from '@/lib/utils'

const options = [
  { value: 'light', icon: Sun },
  { value: 'system', icon: Monitor },
  { value: 'dark', icon: Moon },
] as const

export function ThemeToggle() {
  const { resolvedTheme, setTheme, theme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const activeTheme = mounted ? (theme === 'system' ? 'system' : resolvedTheme ?? 'dark') : 'dark'

  return (
    <div className="flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] p-1">
      {options.map(({ value, icon: Icon }) => {
        const isActive = activeTheme === value
        return (
          <button
            key={value}
            type="button"
            className={cn(
              'flex size-7 cursor-pointer items-center justify-center rounded-md transition-colors',
              isActive
                ? 'bg-[var(--bg-surface-solid)] text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
            onClick={() => setTheme(value)}
          >
            <Icon className="size-3.5" />
          </button>
        )
      })}
    </div>
  )
}
