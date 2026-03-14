import ReactMarkdown from 'react-markdown'

import { AgentAvatar } from '@/components/chat/agent-avatar'
import type { ChatMessage } from '@/lib/a2a-client'
import { cn } from '@/lib/utils'

type MessageBubbleProps = {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <article
      className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}
      style={{ animation: 'message-in 200ms ease-out' }}
    >
      <div className={cn('max-w-[85%] space-y-1 md:max-w-[75%]', isUser ? 'items-end' : 'items-start')}>
        {!isUser && message.agentKey ? <AgentAvatar agentKey={message.agentKey} /> : null}

        <div
          className={cn(
            'rounded-xl px-4 py-3 text-sm leading-7',
            isUser
              ? 'surface-solid rounded-br-sm text-[var(--text-primary)]'
              : 'surface rounded-bl-sm text-[var(--text-primary)]'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.text}</p>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none break-words prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-primary)] prose-strong:text-[var(--text-primary)] prose-code:text-[var(--neon-secondary)] prose-pre:bg-black/50 prose-pre:text-[var(--text-secondary)]">
              <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>
          )}
        </div>

        {isUser ? (
          <p className="mt-1 text-right text-[11px] text-[var(--text-muted)]">Commander</p>
        ) : null}
      </div>
    </article>
  )
}
