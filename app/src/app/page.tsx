'use client'

import { startTransition, useState } from 'react'

import { ChatPanel } from '@/components/chat/chat-panel'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import type { AgentKey, ChatMessage, ConnectionStatus } from '@/lib/a2a-client'
import { inferAgentFromText } from '@/lib/a2a-client'

const starterMessages: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    text:
      'AniKrewe operational. Ask about **seasonal anime**, **watch-party timing**, or **budget conversions** and the swarm will route it to the right specialist.',
    agentKey: 'router_agent',
    agentName: 'AniKrewe Router',
    thinking: [],
  },
]

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle')
  const [activeAgent, setActiveAgent] = useState<AgentKey>('router_agent')

  async function handleSendMessage(message: string) {
    const hintedAgent = inferAgentFromText(message)
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: message,
    }

    startTransition(() => {
      setMessages((current) => [...current, userMessage])
      setActiveAgent(hintedAgent)
    })
    setIsLoading(true)
    setConnectionStatus('loading')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error || 'Unable to reach AniKrewe right now.')
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: payload.text,
        agentKey: payload.activeAgent ?? hintedAgent,
        agentName: payload.agentName,
        thinking: Array.isArray(payload.thinking) ? payload.thinking : [],
      }

      startTransition(() => {
        setMessages((current) => [...current, assistantMessage])
        setActiveAgent(payload.activeAgent ?? hintedAgent)
      })
      setConnectionStatus('connected')
    } catch (error) {
      const fallbackMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text:
          error instanceof Error
            ? error.message
            : 'AniKrewe could not reach the agent stack. Check the A2A and MCP services and try again.',
        agentKey: 'router_agent',
        agentName: 'AniKrewe Router',
        thinking: [],
        isError: true,
      }

      startTransition(() => {
        setMessages((current) => [...current, fallbackMessage])
        setActiveAgent('router_agent')
      })
      setConnectionStatus('disconnected')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="shrink-0 border-b border-[var(--border-subtle)]">
        <Header status={connectionStatus} />
      </div>

      <main className="flex min-h-0 flex-1">
        <aside className="hidden shrink-0 border-r border-[var(--border-subtle)] lg:block">
          <Sidebar activeAgent={activeAgent} />
        </aside>
        <section className="min-h-0 min-w-0 flex-1">
          <ChatPanel activeAgent={activeAgent} isLoading={isLoading} messages={messages} onSendMessage={handleSendMessage} />
        </section>
      </main>
    </div>
  )
}
