'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const options = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'dark', label: 'Dark', icon: Moon },
] as const

export function ThemeToggle() {
  const { resolvedTheme, setTheme, theme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const activeTheme = mounted ? (theme === 'system' ? 'system' : resolvedTheme ?? 'light') : 'system'

  return (
    <div className="glass flex items-center gap-1 rounded-full p-1">
      {options.map(({ value, label, icon: Icon }) => {
        const isActive = activeTheme === value
        return (
          <Button
            key={value}
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              'rounded-full px-3 text-[11px] font-semibold tracking-[0.18em] uppercase',
              isActive
                ? 'bg-white/70 text-slate-900 shadow-sm dark:bg-white/15 dark:text-white'
                : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]'
            )}
            onClick={() => setTheme(value)}
          >
            <Icon className="size-3.5" />
            {label}
          </Button>
        )
      })}
    </div>
  )
}
