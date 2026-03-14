import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from google.adk.agents.llm_agent import Agent
from google.adk.a2a.utils.agent_to_a2a import to_a2a
from google.adk.tools.agent_tool import AgentTool

from agents.config import A2A_PORT, AGENTS_CONFIG, DEFAULT_MODEL
from agents.subagents import (
    budget_tracker_agent,
    event_planner_agent,
    season_intel_agent,
)
from agents.utils.adk import build_thinking_planner


root_agent = Agent(
    model=DEFAULT_MODEL,
    planner=build_thinking_planner(),
    name=AGENTS_CONFIG['router_agent']['name'],
    description=AGENTS_CONFIG['router_agent']['description'],
    instruction=AGENTS_CONFIG['router_agent']['instruction'],
    tools=[
        AgentTool(agent=season_intel_agent),
        AgentTool(agent=event_planner_agent),
        AgentTool(agent=budget_tracker_agent),
    ],
)

a2a_app = to_a2a(root_agent, port=A2A_PORT)
