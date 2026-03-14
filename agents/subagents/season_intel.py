import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from google.adk.agents.llm_agent import Agent
from google.adk.tools.mcp_tool import MCPToolset, StreamableHTTPConnectionParams

from agents.config import AGENTS_CONFIG, DEFAULT_MODEL, MCP_SERVER_URL
from agents.subagents.tool_filters import SEASON_INTEL_TOOL_FILTER
from agents.utils.adk import build_thinking_planner


season_intel_agent = Agent(
    model=DEFAULT_MODEL,
    planner=build_thinking_planner(),
    name=AGENTS_CONFIG['season_intel_agent']['name'],
    description=AGENTS_CONFIG['season_intel_agent']['description'],
    instruction=AGENTS_CONFIG['season_intel_agent']['instruction'],
    tools=[
        MCPToolset(
            connection_params=StreamableHTTPConnectionParams(url=MCP_SERVER_URL),
            tool_filter=SEASON_INTEL_TOOL_FILTER,
        ),
    ],
)
