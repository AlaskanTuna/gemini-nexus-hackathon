import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

type GlassCardProps = HTMLAttributes<HTMLDivElement>

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        'glass rounded-[28px] border border-white/35 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.14)] dark:border-white/10',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
