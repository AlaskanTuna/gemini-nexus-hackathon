import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from google.adk.agents.llm_agent import Agent
from google.adk.a2a.utils.agent_to_a2a import to_a2a
from google.adk.tools.agent_tool import AgentTool

from agents.config import (
    A2A_PORT,
    AGENTS_CONFIG,
    DEFAULT_MODEL,
    ENABLE_MODEL_ARMOR,
    GOOGLE_CLOUD_PROJECT,
    MODEL_ARMOR_LOCATION,
    MODEL_ARMOR_TEMPLATE_ID,
)
from agents.plugins import LlmJudge, ModelArmorClient, SafetyGuardianPlugin
from agents.subagents import (
    budget_tracker_agent,
    event_planner_agent,
    season_intel_agent,
)
from agents.utils.adk import build_thinking_planner


def _build_safety_guardian() -> SafetyGuardianPlugin:
    armor_client = None
    if ENABLE_MODEL_ARMOR:
        armor_client = ModelArmorClient(
            project_id=GOOGLE_CLOUD_PROJECT,
            location=MODEL_ARMOR_LOCATION,
            template_id=MODEL_ARMOR_TEMPLATE_ID,
        )

    judge = LlmJudge()
    return SafetyGuardianPlugin(model_armor_client=armor_client, judge=judge)


safety_guardian = _build_safety_guardian()


root_agent = Agent(
    model=DEFAULT_MODEL,
    planner=build_thinking_planner(),
    name=AGENTS_CONFIG['router_agent']['name'],
    description=AGENTS_CONFIG['router_agent']['description'],
    instruction=AGENTS_CONFIG['router_agent']['instruction'],
    before_model_callback=safety_guardian.before_model_callback,
    after_model_callback=safety_guardian.after_model_callback,
    tools=[
        AgentTool(agent=season_intel_agent),
        AgentTool(agent=event_planner_agent),
        AgentTool(agent=budget_tracker_agent),
    ],
)

a2a_app = to_a2a(root_agent, port=A2A_PORT)

if __name__ == '__main__':
    import uvicorn

    uvicorn.run(a2a_app, host='0.0.0.0', port=A2A_PORT)
