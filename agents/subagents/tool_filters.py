SEASON_INTEL_TOOL_FILTER = [
    'search_anime',
    'get_seasonal_anime',
    'get_anime_schedule',
]

EVENT_PLANNER_TOOL_FILTER = [
    'get_current_time',
    'get_weather',
    'render_diagram',
]

BUDGET_TRACKER_TOOL_FILTER = [
    'get_exchange_rate',
    'get_crypto_price',
]

EXPECTED_SPECIALIST_TOOL_FILTERS = {
    'season_intel_agent': set(SEASON_INTEL_TOOL_FILTER),
    'event_planner_agent': set(EVENT_PLANNER_TOOL_FILTER),
    'budget_tracker_agent': set(BUDGET_TRACKER_TOOL_FILTER),
}
