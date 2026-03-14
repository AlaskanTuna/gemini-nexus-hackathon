from __future__ import annotations

import argparse
import importlib
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


class CheckFailure(RuntimeError):
    pass


def require(condition: bool, message: str) -> None:
    if not condition:
        raise CheckFailure(message)


def require_files(paths: list[str]) -> None:
    missing = [path for path in paths if not (PROJECT_ROOT / path).exists()]
    require(not missing, f"Missing required file(s): {', '.join(missing)}")


def import_module(module_name: str):
    return importlib.import_module(module_name)


def run_check(name: str, func) -> bool:
    try:
        func()
        print(f"[PASS] {name}")
        return True
    except Exception as exc:
        print(f"[FAIL] {name}: {exc}")
        return False


def check_phase1_required_files() -> None:
    require_files(
        [
            ".env.example",
            "pyproject.toml",
            "tools/anime.py",
            "tools/server.py",
            "tools/helper.py",
            "tools/weather.py",
            "tools/current_time.py",
            "tools/exchange_rate.py",
            "tools/crypto_price.py",
            "tools/render_diagram.py",
        ]
    )


def check_phase1_imports() -> None:
    for module_name in [
        "tools.anime",
        "tools.server",
        "tools.helper",
        "tools.weather",
        "tools.current_time",
        "tools.exchange_rate",
        "tools.crypto_price",
        "tools.render_diagram",
        "agents.config",
        "agents.utils.adk",
        "agents.utils.logging",
    ]:
        import_module(module_name)


def check_current_time_tool() -> None:
    module = import_module("tools.current_time")
    valid = module.get_current_time("Asia/Kuala_Lumpur")
    require(valid.get("timezone") == "Asia/Kuala_Lumpur", "Valid timezone result is malformed")

    invalid = module.get_current_time("Invalid/Zone")
    require("error" in invalid, "Invalid timezone should return an error payload")


def check_render_diagram_tool() -> None:
    module = import_module("tools.render_diagram")
    result = module.render_diagram("graph TD\nA-->B")
    require("clickable_link" in result, "Diagram response should include clickable_link")
    require(
        "https://kroki.io/mermaid/svg/" in result["clickable_link"],
        "Diagram link should point to Kroki",
    )


def check_phase2_required_files() -> None:
    require_files(
        [
            "agents/agents.toml",
            "agents/config.py",
            "agents/root_agent/agent.py",
            "agents/subagents/season_intel.py",
            "agents/subagents/event_planner.py",
            "agents/subagents/budget_tracker.py",
            "agents/plugins/safety_guardian.py",
        ]
    )


def check_phase2_imports() -> None:
    for module_name in [
        "agents.root_agent.agent",
        "agents.subagents.season_intel",
        "agents.subagents.event_planner",
        "agents.subagents.budget_tracker",
        "agents.plugins.safety_guardian",
    ]:
        import_module(module_name)


def check_agents_config_contract() -> None:
    config = import_module("agents.config")
    keys = {
        "router_agent",
        "season_intel_agent",
        "event_planner_agent",
        "budget_tracker_agent",
    }
    require(hasattr(config, "AGENTS_CONFIG"), "agents.config must expose AGENTS_CONFIG")
    require(keys.issubset(set(config.AGENTS_CONFIG.keys())), "AGENTS_CONFIG is missing required agent entries")


def check_root_agent_contract() -> None:
    module = import_module("agents.root_agent.agent")
    require(hasattr(module, "root_agent"), "agents.root_agent.agent must expose root_agent")


def check_live_phase1_integrations() -> None:
    anime = import_module("tools.anime")
    exchange = import_module("tools.exchange_rate")
    crypto = import_module("tools.crypto_price")
    weather = import_module("tools.weather")

    anime_result = anime.search_anime("Sousou no Frieren", limit=1)
    require("error" not in anime_result, f"search_anime returned error: {anime_result.get('error')}")

    seasonal_result = anime.get_seasonal_anime(year=2026, season="spring", limit=3)
    require("error" not in seasonal_result, f"get_seasonal_anime returned error: {seasonal_result.get('error')}")

    schedule_result = anime.get_anime_schedule(day="saturday")
    require("error" not in schedule_result, f"get_anime_schedule returned error: {schedule_result.get('error')}")

    exchange_result = exchange.get_exchange_rate("USD", "MYR")
    require("rates" in exchange_result, "Exchange rate response should include rates")

    crypto_result = crypto.get_crypto_price("BTC", "MYR")
    require("price" in crypto_result and crypto_result["price"] != "N/A", "Crypto response should include a price")

    weather_result = weather.get_weather("Kuala Lumpur")
    require("error" not in weather_result, f"get_weather returned error: {weather_result.get('error')}")


def main() -> int:
    parser = argparse.ArgumentParser(description="AniKrewe QA gate")
    parser.add_argument(
        "--phase",
        choices=["phase1", "phase2"],
        default="phase1",
        help="Choose the highest implementation phase to validate",
    )
    parser.add_argument(
        "--live",
        action="store_true",
        help="Run live external API checks in addition to local smoke checks",
    )
    args = parser.parse_args()

    checks: list[tuple[str, callable]] = [
        ("Phase 1 required files", check_phase1_required_files),
        ("Phase 1 imports", check_phase1_imports),
        ("Current time tool contract", check_current_time_tool),
        ("Render diagram tool contract", check_render_diagram_tool),
    ]

    if args.phase == "phase2":
        checks.extend(
            [
                ("Phase 2 required files", check_phase2_required_files),
                ("Phase 2 imports", check_phase2_imports),
                ("Agents config contract", check_agents_config_contract),
                ("Root agent export contract", check_root_agent_contract),
            ]
        )

    if args.live:
        checks.append(("Live Phase 1 integrations", check_live_phase1_integrations))

    failures = 0
    for name, func in checks:
        if not run_check(name, func):
            failures += 1

    if failures:
        print(f"\nQA gate failed: {failures} check(s) failed.")
        return 1

    print("\nQA gate passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
