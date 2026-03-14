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
    <article className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[85%] space-y-2 md:max-w-[72%]', isUser ? 'items-end' : 'items-start')}>
        {!isUser && message.agentKey ? <AgentAvatar agentKey={message.agentKey} /> : null}

        <div
          className={cn(
            'rounded-[28px] px-5 py-4 text-sm leading-7 shadow-[0_20px_48px_rgba(15,23,42,0.08)]',
            isUser
              ? 'accent-gradient rounded-br-md text-white'
              : 'glass rounded-bl-md border border-white/45 text-[rgb(var(--text-primary))] dark:border-white/10'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.text}</p>
          ) : (
            <div className="prose prose-sm max-w-none break-words text-current prose-headings:text-current prose-p:text-current prose-strong:text-current prose-code:text-current prose-pre:bg-black/70 prose-pre:text-white">
              <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
