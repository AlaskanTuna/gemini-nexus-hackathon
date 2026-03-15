'use client'

import { LoaderCircle, Send } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

type InputBarProps = {
  disabled?: boolean
  onSendMessage: (message: string) => Promise<void> | void
}

export function InputBar({ disabled = false, onSendMessage }: InputBarProps) {
  const [message, setMessage] = useState('')

  async function submitMessage() {
    const trimmed = message.trim()
    if (!trimmed || disabled) {
      return
    }

    setMessage('')
    await onSendMessage(trimmed)
  }

  return (
    <div className="flex items-end gap-3">
      <label className="flex-1">
        <span className="sr-only">Command sequence</span>
        <textarea
          value={message}
          disabled={disabled}
          rows={2}
          placeholder="Command sequence..."
          className={cn(
            'w-full resize-none rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] px-5 py-3.5 text-[14px] leading-6 text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] placeholder:italic focus:border-[var(--neon-secondary)]/50 focus:shadow-[0_0_16px_rgba(0,240,255,0.12)]',
            disabled && 'cursor-not-allowed opacity-70'
          )}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={async (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              await submitMessage()
            }
          }}
        />
      </label>

      <button
        type="button"
        className={cn(
          'flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[var(--neon-secondary)] text-[var(--bg-base)] transition-all hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]',
          (disabled || !message.trim()) && 'cursor-not-allowed opacity-40'
        )}
        disabled={disabled || !message.trim()}
        onClick={submitMessage}
      >
        {disabled ? <LoaderCircle className="size-5 animate-spin" /> : <Send className="size-5" />}
      </button>
    </div>
  )
}
