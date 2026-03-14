'use client'

import { LoaderCircle, SendHorizonal } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
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
    <div className="glass rounded-[28px] border border-white/45 p-3 shadow-[0_16px_48px_rgba(15,23,42,0.08)] dark:border-white/10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <label className="flex-1">
          <span className="sr-only">Message AniKrewe</span>
          <textarea
            value={message}
            disabled={disabled}
            rows={3}
            placeholder="Ask about airing anime, meetup timing, weather, or budget conversions..."
            className={cn(
              'min-h-[88px] w-full resize-none rounded-[22px] border border-transparent bg-white/55 px-4 py-3 text-sm leading-6 text-[rgb(var(--text-primary))] outline-none transition placeholder:text-[rgb(var(--text-muted))] focus:border-white/70 dark:bg-slate-950/35',
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

        <Button
          type="button"
          size="lg"
          className="accent-gradient h-12 rounded-full px-5 text-white shadow-[0_18px_38px_rgba(147,51,234,0.25)] hover:opacity-90"
          disabled={disabled || !message.trim()}
          onClick={submitMessage}
        >
          {disabled ? <LoaderCircle className="size-4 animate-spin" /> : <SendHorizonal className="size-4" />}
          {disabled ? 'Sending' : 'Send'}
        </Button>
      </div>
    </div>
  )
}
