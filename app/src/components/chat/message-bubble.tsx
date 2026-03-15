import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'

import { AgentAvatar } from '@/components/chat/agent-avatar'
import { AnimeCard, isJikanImage } from '@/components/chat/anime-card'
import type { ChatMessage } from '@/lib/a2a-client'
import { cn } from '@/lib/utils'

const DIAGRAM_PATTERN = /^https:\/\/(kroki\.io\/|anikrewe-tools[^/]*\/diagram\/)/

const markdownComponents: Partial<Components> = {
  a: ({ href, children, ...rest }) => {
    if (href && DIAGRAM_PATTERN.test(href)) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="my-3 inline-flex items-center gap-2 rounded-lg border border-[var(--neon-primary)]/30 bg-[var(--neon-primary)]/10 px-4 py-2.5 text-[var(--neon-primary)] no-underline transition-colors hover:bg-[var(--neon-primary)]/20"
          {...rest}
        >
          <span>📊</span>
          <span className="underline">{children}</span>
          <span className="text-xs opacity-60">↗</span>
        </a>
      )
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-[var(--neon-primary)] underline" {...rest}>
        {children}
      </a>
    )
  },
  img: ({ src, alt, ...rest }) => {
    const srcStr = typeof src === 'string' ? src : undefined
    if (isJikanImage(srcStr)) {
      return <AnimeCard src={srcStr} alt={alt} {...rest} />
    }
    if (srcStr && DIAGRAM_PATTERN.test(srcStr)) {
      return (
        <figure className="my-3 overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3">
          <img src={srcStr} alt={alt || 'Diagram'} loading="lazy" className="max-w-full" {...rest} />
          {alt ? <figcaption className="mt-2 text-[11px] text-[var(--text-muted)]">{alt}</figcaption> : null}
        </figure>
      )
    }
    return <img src={srcStr} alt={alt} loading="lazy" className="my-2 max-w-full rounded" {...rest} />
  }
}

type MessageBubbleProps = {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <article className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[88%] space-y-1 md:max-w-[78%]', isUser ? 'items-end' : 'items-start')}>
        {!isUser && message.agentKey ? <AgentAvatar agentKey={message.agentKey} /> : null}

        <div
          className={cn(
            'rounded-xl px-5 py-4 text-[14px] leading-relaxed shadow-lg',
            isUser
              ? 'rounded-br-sm border border-white/[0.06] bg-[var(--bg-surface-solid)]/80 text-[var(--text-primary)] backdrop-blur-xl dark:border-white/[0.06]'
              : 'rounded-bl-sm border border-white/[0.1] bg-[var(--bg-surface)]/80 text-[var(--text-primary)] shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-2xl dark:border-white/[0.1]'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.text}</p>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none break-words prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-primary)] prose-strong:text-[var(--text-primary)] prose-code:text-[var(--neon-secondary)] prose-pre:bg-black/50 prose-pre:text-[var(--text-secondary)] prose-li:text-[var(--text-primary)]">
              <ReactMarkdown components={markdownComponents}>{message.text}</ReactMarkdown>
            </div>
          )}
        </div>

        {isUser ? <p className="mt-0.5 text-right text-[10px] text-[var(--text-muted)]">Commander</p> : null}
      </div>
    </article>
  )
}
