from google.adk.planners import BuiltInPlanner
from google.genai.types import ThinkingConfig

from agents.config import INCLUDE_THOUGHTS


def build_thinking_planner() -> BuiltInPlanner:
    """Create a planner that forwards Gemini thought parts to the ADK UI."""
    return BuiltInPlanner(
        thinking_config=ThinkingConfig(include_thoughts=INCLUDE_THOUGHTS)
    )
