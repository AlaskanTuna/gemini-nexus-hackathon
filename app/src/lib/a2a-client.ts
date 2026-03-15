export type AgentKey = 'router_agent' | 'season_intel_agent' | 'event_planner_agent' | 'budget_tracker_agent' | 'merch_scout_agent'
export type ConnectionStatus = 'idle' | 'loading' | 'connected' | 'disconnected'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  agentKey?: AgentKey
  agentName?: string
  thinking?: string[]
  isError?: boolean
}

export type AgentResponse = {
  text: string
  thinking: string[]
  activeAgent: AgentKey
  agentName: string
  raw: unknown
}

type FlatPart = {
  isThought: boolean
  text: string
}

type A2AHistoryEntry = {
  parts?: unknown[]
}

type A2AResult = {
  artifacts?: Array<{ parts?: unknown[]; metadata?: Record<string, unknown> }>
  history?: A2AHistoryEntry[]
  metadata?: Record<string, unknown>
  parts?: unknown[]
  status?: {
    message?: {
      parts?: unknown[]
      metadata?: Record<string, unknown>
    }
  }
}

export const agentDirectory: Record<
  AgentKey,
  {
    accentColor: string
    description: string
    icon: string
    id: string
    key: AgentKey
    name: string
  }
> = {
  router_agent: {
    key: 'router_agent',
    name: 'AniKrewe Router',
    description: 'Clarifies the goal and delegates to the right specialist',
    icon: 'radar',
    id: 'AGT-000 // ROUTER',
    accentColor: '#6366f1',
  },
  season_intel_agent: {
    key: 'season_intel_agent',
    name: 'Season Intel',
    description: 'Tracks seasonal lineups, airing days, and anime discovery',
    icon: 'sparkles',
    id: 'AGT-001 // SCRAPER',
    accentColor: '#a855f7',
  },
  event_planner_agent: {
    key: 'event_planner_agent',
    name: 'Event Planner',
    description: 'Coordinates meetup timing, weather, and event readiness',
    icon: 'calendar',
    id: 'AGT-002 // LOGISTICS',
    accentColor: '#22d3ee',
  },
  budget_tracker_agent: {
    key: 'budget_tracker_agent',
    name: 'Budget Tracker',
    description: 'Handles cost checks, exchange rates, and crypto spot prices',
    icon: 'wallet',
    id: 'AGT-003 // FINANCE',
    accentColor: '#f472b6',
  },
  merch_scout_agent: {
    key: 'merch_scout_agent',
    name: 'Merch Scout',
    description: 'Searches for anime merchandise, figures, and collectibles',
    icon: 'search',
    id: 'AGT-004 // SCOUT',
    accentColor: '#f59e0b',
  },
}

export async function sendMessage(text: string): Promise<AgentResponse> {
  const id = `anikrewe-${Date.now()}`
  const serverUrl = process.env.A2A_SERVER_URL ?? 'http://127.0.0.1:10000'

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 300_000)

  const response = await fetch(`${serverUrl}/`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'message/send',
      params: {
        message: {
          messageId: id,
          role: 'user',
          parts: [{ kind: 'text', text }],
        },
      },
      id,
    }),
    signal: controller.signal,
    cache: 'no-store',
  })

  clearTimeout(timeout)

  if (!response.ok) {
    throw new Error(`A2A request failed with ${response.status}`)
  }

  const payload = await response.json()
  if (payload?.error) {
    throw new Error(payload.error?.message || 'A2A request failed')
  }

  return normalizeA2AResponse(payload, text)
}

export function inferAgentFromText(text: string): AgentKey {
  const normalized = text.toLowerCase()

  if (
    /\b(budget|cost|price|prices|exchange|convert|conversion|crypto|bitcoin|btc|eth|usd|sgd|myr|jpy|yen|ringgit)\b/.test(
      normalized
    )
  ) {
    return 'budget_tracker_agent'
  }

  if (
    /\b(event|meetup|weather|rain|sunny|schedule|time|timezone|venue|plan|attendance|tomorrow|tonight|weekend)\b/.test(
      normalized
    )
  ) {
    return 'event_planner_agent'
  }

  if (/\b(merch|merchandise|figure|figurine|buy|shop|shopping|store|collectible|poster|artbook)\b/.test(normalized)) {
    return 'merch_scout_agent'
  }

  if (/\b(anime|season|airing|airs|watch|shows|lineup|jikan|spring|summer|fall|winter)\b/.test(normalized)) {
    return 'season_intel_agent'
  }

  return 'router_agent'
}

function normalizeA2AResponse(payload: unknown, sourceText: string): AgentResponse {
  const result = (payload as { result?: A2AResult })?.result
  const parts = collectParts(result)
  const thoughtParts = parts.filter((part) => part.isThought)
  const visibleParts = parts.filter((part) => !part.isThought)
  const activeAgent = detectActiveAgent(result) ?? inferAgentFromText(sourceText)
  const thinking = dedupeStrings([
    ...thoughtParts.map((part) => part.text),
    ...buildThinkingTrace(result),
  ])
  const text = visibleParts.map((part) => part.text).join('\n\n').trim() || 'I could not parse a response from the A2A server.'

  return {
    text,
    thinking,
    activeAgent,
    agentName: agentDirectory[activeAgent].name,
    raw: payload,
  }
}

function collectParts(result?: A2AResult): FlatPart[] {
  if (!result) {
    return []
  }

  const artifactParts = result.artifacts?.flatMap((artifact) => extractParts(artifact.parts)) ?? []
  const statusParts = extractParts(result.status?.message?.parts)
  const directParts = extractParts(result.parts)

  return [...artifactParts, ...statusParts, ...directParts]
}

function extractParts(parts?: unknown[]): FlatPart[] {
  if (!Array.isArray(parts)) {
    return []
  }

  return parts.flatMap((part) => {
    const root = isRecord(part) && isRecord(part.root) ? part.root : isRecord(part) ? part : null
    const text = typeof root?.text === 'string' ? root.text.trim() : ''
    if (!text) {
      return []
    }

    const metadata = isRecord(root?.metadata) ? root.metadata : {}
    return [
      {
        text,
        isThought: Boolean(metadata.adk_thought ?? metadata.thought),
      },
    ]
  })
}

function detectActiveAgent(result?: A2AResult): AgentKey | null {
  const historyAgent = detectHistoryAgent(result?.history)
  if (historyAgent) {
    return historyAgent
  }

  const metadataCandidates = [
    result?.metadata,
    ...(result?.artifacts?.map((artifact) => artifact.metadata) ?? []),
    result?.status?.message?.metadata,
  ]

  for (const metadata of metadataCandidates) {
    if (!isRecord(metadata)) {
      continue
    }

    const candidate =
      metadata.activeAgent ??
      metadata.agentName ??
      metadata.agent ??
      metadata.author ??
      metadata.adk_author ??
      metadata.adk_app_name
    const normalized = normalizeAgentKey(candidate)
    if (normalized) {
      return normalized
    }
  }

  return null
}

function buildThinkingTrace(result?: A2AResult): string[] {
  const entries = buildMetadataThinking(result)

  for (const item of result?.history ?? []) {
    if (!Array.isArray(item?.parts)) {
      continue
    }

    for (const part of item.parts) {
      const root = isRecord(part) ? part : null
      const metadata = isRecord(root?.metadata) ? root.metadata : {}
      const data = isRecord(root?.data) ? root.data : {}
      const historyAgent = normalizeAgentKey(data.name)

      if (metadata.adk_type === 'function_call' && historyAgent) {
        entries.push(`Delegated to ${agentDirectory[historyAgent].name} for specialist handling.`)
        continue
      }

      if (metadata.adk_type === 'function_response' && historyAgent) {
        entries.push(`${agentDirectory[historyAgent].name} returned a specialist result.`)
      }
    }
  }

  return entries
}

function buildMetadataThinking(result?: A2AResult): string[] {
  const metadataCandidates = [
    result?.metadata,
    ...(result?.artifacts?.map((artifact) => artifact.metadata) ?? []),
    result?.status?.message?.metadata,
  ]

  const entries: string[] = []

  for (const metadata of metadataCandidates) {
    if (!isRecord(metadata)) {
      continue
    }

    const customMetadata =
      typeof metadata.adk_custom_metadata === 'string'
        ? metadata.adk_custom_metadata
        : JSON.stringify(metadata.adk_custom_metadata ?? '')
    const normalizedMetadata = customMetadata.toLowerCase()

    if (normalizedMetadata.includes('guardrail') && normalizedMetadata.includes('blocked')) {
      entries.push('Safety Guardian blocked the request before specialist routing.')
    }
  }

  return entries
}

function dedupeStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))]
}

function detectHistoryAgent(history?: A2AHistoryEntry[]): AgentKey | null {
  if (!Array.isArray(history)) {
    return null
  }

  for (const item of [...history].reverse()) {
    if (!Array.isArray(item?.parts)) {
      continue
    }

    for (const part of item.parts) {
      const historyAgent = extractHistoryAgent(part)
      if (historyAgent) {
        return historyAgent
      }
    }
  }

  return null
}

function extractHistoryAgent(part: unknown): AgentKey | null {
  if (!isRecord(part)) {
    return null
  }

  const data = isRecord(part.data) ? part.data : {}
  const metadata = isRecord(part.metadata) ? part.metadata : {}

  return (
    normalizeAgentKey(data.name) ??
    normalizeAgentKey(metadata.agentName) ??
    normalizeAgentKey(metadata.author) ??
    null
  )
}

function normalizeAgentKey(value: unknown): AgentKey | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim().toLowerCase()
  if (normalized.includes('season')) {
    return 'season_intel_agent'
  }
  if (normalized.includes('event')) {
    return 'event_planner_agent'
  }
  if (normalized.includes('budget')) {
    return 'budget_tracker_agent'
  }
  if (normalized.includes('merch') || normalized.includes('scout')) {
    return 'merch_scout_agent'
  }
  if (normalized.includes('router') || normalized.includes('root')) {
    return 'router_agent'
  }

  return null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
