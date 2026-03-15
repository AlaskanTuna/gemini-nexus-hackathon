import type { ChatMessage } from '@/lib/a2a-client'

const SESSIONS_KEY = 'anikrewe-sessions'
const ACTIVE_KEY = 'anikrewe-active-session'

export type ChatSession = {
  id: string
  title: string
  createdAt: number
  messages: ChatMessage[]
}

function readSessions(): ChatSession[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeSessions(sessions: ChatSession[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

export function getActiveSessionId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACTIVE_KEY)
}

export function setActiveSessionId(id: string) {
  localStorage.setItem(ACTIVE_KEY, id)
}

export function listSessions(): ChatSession[] {
  return readSessions().sort((a, b) => b.createdAt - a.createdAt)
}

export function getSession(id: string): ChatSession | null {
  return readSessions().find((s) => s.id === id) ?? null
}

export function saveSession(session: ChatSession) {
  const sessions = readSessions()
  const index = sessions.findIndex((s) => s.id === session.id)
  if (index >= 0) {
    sessions[index] = session
  } else {
    sessions.push(session)
  }
  writeSessions(sessions)
  setActiveSessionId(session.id)
}

export function deleteSession(id: string) {
  const sessions = readSessions().filter((s) => s.id !== id)
  writeSessions(sessions)
}

export function createSession(): ChatSession {
  return {
    id: crypto.randomUUID(),
    title: 'New Chat',
    createdAt: Date.now(),
    messages: [],
  }
}

export function deriveTitle(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === 'user')
  if (!firstUser) return 'New Chat'
  const text = firstUser.text.slice(0, 50)
  return text.length < firstUser.text.length ? `${text}...` : text
}
