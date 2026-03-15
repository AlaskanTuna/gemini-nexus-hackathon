import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from google.adk.agents.llm_agent import Agent
from google.adk.tools import google_search

from agents.config import AGENTS_CONFIG, DEFAULT_MODEL
from agents.utils.adk import build_thinking_planner


merch_scout_agent = Agent(
    model=DEFAULT_MODEL,
    planner=build_thinking_planner(),
    name=AGENTS_CONFIG['merch_scout_agent']['name'],
    description=AGENTS_CONFIG['merch_scout_agent']['description'],
    instruction=AGENTS_CONFIG['merch_scout_agent']['instruction'],
    tools=[google_search],
)
