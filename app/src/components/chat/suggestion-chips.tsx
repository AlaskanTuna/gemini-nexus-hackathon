'use client'

import { useMemo } from 'react'

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
    'Is it going to rain in KL tomorrow?',
    'What are the best fantasy anime this season?',
    'How much is 1 BTC in MYR?',
    'Schedule a meetup for Saturday afternoon',
    'Search for anime similar to Attack on Titan',
    'Split a 30000 JPY order among 4 people',
    'Where can I buy anime figures in Malaysia?',
  ],
  season_intel_agent: [
    'Show me top-rated action anime this season',
    'What airs on Saturday?',
    'Search for anime like Frieren',
    'Any romance anime above 8.0 this season?',
    'What new isekai anime is airing?',
    'Show me Spring 2026 anime lineup',
    'Find sci-fi anime with rating above 7.5',
    'What anime airs on Sunday in MYT?',
    'Top comedy anime this season?',
    'Search for anime with "demon" in the title',
  ],
  event_planner_agent: [
    'Weather in Kuala Lumpur today?',
    'Schedule a group watch at 8pm MYT for US and JP friends',
    'Plan an outdoor meetup in Penang',
    'What time is 9pm JST in Malaysian time?',
    'Is Sunday good for a cosplay meetup in KL?',
    'Plan a watch party for members in KL, Tokyo, and London',
    'Check the weather in Johor Bahru this weekend',
    'Best time slot for KL and New York members?',
    'Draw a flowchart for planning an anime convention',
    'Rain forecast for Kuala Lumpur this Saturday?',
  ],
  budget_tracker_agent: [
    'Split 50000 JPY merch order among 5 people',
    'How much is 1 ETH in MYR?',
    'Compare BTC vs SOL price in USD',
    'Convert 12000 JPY to MYR and USD',
    'What is 25000 JPY in Malaysian ringgit?',
    '3 figures at 8000, 12000, and 15000 JPY — total in MYR?',
    'Can we pay with ETH for a 40000 JPY group buy?',
    'Current DOGE price in MYR?',
    'Split 80000 JPY across 8 members in MYR',
    'How much is 500 USD in MYR right now?',
  ],
  merch_scout_agent: [
    'Find Frieren figures under 200 MYR',
    'Where to buy Jujutsu Kaisen merch in Malaysia?',
    'Search for One Piece artbooks with international shipping',
    'Best stores for anime figures in Southeast Asia?',
    'Find Chainsaw Man figurines on Shopee Malaysia',
    'Where to get Demon Slayer posters in KL?',
    'Search for Spy x Family merchandise online',
    'Affordable anime keychains and accessories in Malaysia?',
    'Find limited edition Evangelion collectibles',
    'Where can I pre-order upcoming anime figures?',
  ],
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export function SuggestionChips({ activeAgent, disabled, onSelect }: SuggestionChipsProps) {
  const suggestions = useMemo(
    () => pickRandom(suggestionsByAgent[activeAgent], 3),
    [activeAgent]
  )

  return (
    <div className="flex flex-wrap gap-2 px-1 py-2">
      {suggestions.map((text) => (
        <button
          key={text}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(text)}
          className="cursor-pointer rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-1.5 text-[12px] text-[var(--text-secondary)] backdrop-blur-sm transition-all hover:border-[var(--neon-primary)] hover:text-[var(--text-primary)] hover:shadow-[0_0_8px_rgba(209,37,244,0.2)] disabled:pointer-events-none disabled:opacity-40"
        >
          {text}
        </button>
      ))}
    </div>
  )
}
