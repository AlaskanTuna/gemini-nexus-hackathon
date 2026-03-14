import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from google.adk.agents.llm_agent import Agent
from google.adk.tools.mcp_tool import MCPToolset, StreamableHTTPConnectionParams

from agents.config import AGENTS_CONFIG, DEFAULT_MODEL, MCP_SERVER_URL
from agents.utils.adk import build_thinking_planner


budget_tracker_agent = Agent(
    model=DEFAULT_MODEL,
    planner=build_thinking_planner(),
    name=AGENTS_CONFIG['budget_tracker_agent']['name'],
    description=AGENTS_CONFIG['budget_tracker_agent']['description'],
    instruction=AGENTS_CONFIG['budget_tracker_agent']['instruction'],
    tools=[
        MCPToolset(
            connection_params=StreamableHTTPConnectionParams(url=MCP_SERVER_URL)
        ),
    ],
)
