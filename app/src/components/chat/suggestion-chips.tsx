'use client'

import type { AgentKey } from '@/lib/a2a-client'

type SuggestionChipsProps = {
  activeAgent: AgentKey
  disabled: boolean
  onSelect: (text: string) => void
}

const suggestionsByAgent: Record<AgentKey, string[]> = {
  router_agent: [
    'What anime is airing this spring?',
    'Plan a watch party in KL this weekend',
    'Convert 10000 JPY to MYR',
  ],
  season_intel_agent: [
    'Show me top-rated action anime this season',
    'What airs on Saturday?',
    'Search for anime like Frieren',
  ],
  event_planner_agent: [
    'Weather in Kuala Lumpur today?',
    'Schedule a group watch at 8pm MYT for US and JP friends',
    'Plan an outdoor meetup in Penang',
  ],
  budget_tracker_agent: [
    'Split 50000 JPY merch order among 5 people',
    'How much is 1 ETH in MYR?',
    'Compare BTC vs SOL price in USD',
  ],
}

export function SuggestionChips({ activeAgent, disabled, onSelect }: SuggestionChipsProps) {
  const suggestions = suggestionsByAgent[activeAgent]

  return (
    <div className="flex flex-wrap gap-2 px-1 py-2">
      {suggestions.map((text) => (
        <button
          key={text}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(text)}
          className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-1.5 text-[12px] text-[var(--text-secondary)] transition-all hover:border-[var(--neon-primary)] hover:text-[var(--text-primary)] hover:shadow-[0_0_8px_rgba(209,37,244,0.2)] disabled:pointer-events-none disabled:opacity-40"
        >
          {text}
        </button>
      ))}
    </div>
  )
}
