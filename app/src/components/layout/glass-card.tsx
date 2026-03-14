import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

type GlassCardProps = HTMLAttributes<HTMLDivElement>

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn('surface rounded-2xl p-5', className)}
      {...props}
    >
      {children}
    </div>
  )
}
