'use client'

import { useState } from 'react'

type ThinkingLogProps = {
  entries: string[]
  defaultOpen?: boolean
}

export function ThinkingLog({ entries, defaultOpen = false }: ThinkingLogProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  if (!entries.length) {
    return null
  }

  return (
    <div className="mt-2 ml-3">
      <button
        type="button"
        className="flex cursor-pointer items-center gap-2 font-mono text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--neon-primary)]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className="inline-block transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          ▸
        </span>
        <span>View Thinking Trace</span>
      </button>

      {isOpen ? (
        <div className="mt-2 overflow-hidden rounded-lg border-l-2 border-[var(--neon-primary)]/40 bg-[var(--neon-primary)]/5 px-3 py-2">
          <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs leading-6 text-[var(--text-secondary)]">
            {entries.join('\n\n')}
          </pre>
        </div>
      ) : null}
    </div>
  )
}
