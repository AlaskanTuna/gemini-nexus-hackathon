'use client'

import { cn } from '@/lib/utils'

interface ShinyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
}

export default function ShinyButton({
  className,
  children = 'New Chat',
  ...props
}: ShinyButtonProps) {
  return (
    <button
      className={cn(
        'h-9 w-max cursor-pointer rounded-lg border-none bg-[linear-gradient(325deg,#0044ff_0%,#2ccfff_55%,#0044ff_90%)] bg-[length:280%_auto] px-4 py-1.5 text-xs font-semibold tracking-[0.08em] text-white uppercase shadow-[0px_0px_12px_rgba(71,184,255,0.4),0px_3px_3px_-1px_rgba(58,125,233,0.2),inset_2px_2px_4px_rgba(175,230,255,0.4),inset_-2px_-2px_4px_rgba(19,95,216,0.3)] transition-[background] duration-700 hover:bg-right-top focus:ring-blue-400 focus:ring-offset-1 focus:outline-none focus-visible:ring-2 dark:focus:ring-blue-500',
        className
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
}
