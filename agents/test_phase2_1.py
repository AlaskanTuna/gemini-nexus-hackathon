import asyncio
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from google.adk.tools.mcp_tool import MCPToolset

from agents.subagents import (
    budget_tracker_agent,
    event_planner_agent,
    season_intel_agent,
)
from agents.subagents.tool_filters import EXPECTED_SPECIALIST_TOOL_FILTERS


def expect(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def get_mcp_toolset(agent) -> MCPToolset:
    for tool in agent.tools:
        if isinstance(tool, MCPToolset):
            return tool
    raise AssertionError(f'{agent.name} is missing its MCPToolset')


async def verify_agent_tool_scope(agent_name: str, agent) -> None:
    toolset = get_mcp_toolset(agent)
    try:
        tools = await toolset.get_tools()
        tool_names = {tool.name for tool in tools}
        expected_tool_names = EXPECTED_SPECIALIST_TOOL_FILTERS[agent_name]

        expect(
            tool_names == expected_tool_names,
            f'{agent_name} tools mismatch: expected {sorted(expected_tool_names)}, got {sorted(tool_names)}',
        )

        for other_agent_name, other_tool_names in EXPECTED_SPECIALIST_TOOL_FILTERS.items():
            if other_agent_name == agent_name:
                continue
            overlap = tool_names & other_tool_names
            expect(
                not overlap,
                f'{agent_name} unexpectedly exposes cross-domain tools: {sorted(overlap)}',
            )

        print(f'PASS: {agent_name} tool scope -> {sorted(tool_names)}')
    finally:
        await toolset.close()


async def main() -> int:
    checks = [
        ('season_intel_agent', season_intel_agent),
        ('event_planner_agent', event_planner_agent),
        ('budget_tracker_agent', budget_tracker_agent),
    ]

    passed = 0
    failed = 0

    for agent_name, agent in checks:
        try:
            await verify_agent_tool_scope(agent_name, agent)
            passed += 1
        except Exception as exc:
            print(f'FAIL: {agent_name} - {exc}')
            failed += 1

    print(f'\nSummary: {passed} passed, {failed} failed, {len(checks)} total')
    return 1 if failed else 0


if __name__ == '__main__':
    raise SystemExit(asyncio.run(main()))
