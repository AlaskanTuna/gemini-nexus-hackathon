import asyncio
import os
import sys

from fastmcp import Client

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from tools.server import mcp

EXPECTED_TOOLS = {
    'search_anime',
    'get_seasonal_anime',
    'get_anime_schedule',
    'get_exchange_rate',
    'get_weather',
    'get_current_time',
    'get_crypto_price',
    'render_diagram',
}


def expect(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


async def call_tool(client: Client, name: str, arguments: dict | None = None) -> dict:
    result = await client.call_tool(name, arguments or {})
    expect(not result.is_error, f'{name} returned an MCP error')
    expect(isinstance(result.data, dict), f'{name} did not return a dict payload')
    return result.data


async def call_jikan_tool(client: Client, name: str, arguments: dict | None = None) -> dict:
    data = await call_tool(client, name, arguments)
    await asyncio.sleep(1)
    return data


async def test_registered_tools(client: Client) -> None:
    tools = await client.list_tools()
    tool_names = {tool.name for tool in tools}
    expect(tool_names == EXPECTED_TOOLS, f'Expected 8 tools, got {sorted(tool_names)}')


async def test_search_anime(client: Client) -> None:
    data = await call_jikan_tool(client, 'search_anime', {'query': 'Naruto'})
    expect('error' not in data, f"search_anime returned error: {data.get('error')}")
    expect(isinstance(data.get('results'), list), 'search_anime results must be a list')
    expect(isinstance(data.get('total'), int), 'search_anime total must be an int')
    expect(len(data['results']) > 0, 'search_anime should return at least one Naruto result')

    first = data['results'][0]
    for key in ['mal_id', 'title', 'score', 'episodes', 'synopsis', 'genres', 'url']:
        expect(key in first, f'search_anime result missing `{key}`')


async def test_search_anime_empty_result(client: Client) -> None:
    data = await call_jikan_tool(client, 'search_anime', {'query': 'xyznonexistent123'})
    expect('error' not in data, f"empty anime search returned error: {data.get('error')}")
    expect(data.get('results') == [], 'nonexistent anime search should return an empty results list')
    expect(data.get('total') == 0, 'nonexistent anime search should return total=0')


async def test_get_seasonal_anime(client: Client) -> None:
    data = await call_jikan_tool(client, 'get_seasonal_anime', {'year': 2025, 'season': 'winter'})
    expect('error' not in data, f"get_seasonal_anime returned error: {data.get('error')}")
    expect(isinstance(data.get('results'), list), 'get_seasonal_anime results must be a list')
    expect(isinstance(data.get('total'), int), 'get_seasonal_anime total must be an int')
    expect(len(data['results']) > 0, 'get_seasonal_anime should return at least one result')

    first = data['results'][0]
    for key in ['mal_id', 'title', 'score', 'genres', 'airing_day', 'broadcast_time', 'url']:
        expect(key in first, f'get_seasonal_anime result missing `{key}`')


async def test_get_seasonal_anime_invalid(client: Client) -> None:
    data = await call_tool(client, 'get_seasonal_anime', {'year': 2025, 'season': 'autumn'})
    expect('error' in data, 'invalid season should return an error dict')


async def test_get_anime_schedule(client: Client) -> None:
    data = await call_jikan_tool(client, 'get_anime_schedule', {'day': 'saturday'})
    expect('error' not in data, f"get_anime_schedule returned error: {data.get('error')}")
    expect(data.get('day') == 'saturday', 'get_anime_schedule should echo the requested day')
    expect(isinstance(data.get('results'), list), 'get_anime_schedule results must be a list')
    expect(len(data['results']) > 0, 'get_anime_schedule should return at least one result')

    first = data['results'][0]
    for key in ['mal_id', 'title', 'score', 'broadcast_time', 'broadcast_timezone', 'url']:
        expect(key in first, f'get_anime_schedule result missing `{key}`')


async def test_get_anime_schedule_invalid(client: Client) -> None:
    data = await call_tool(client, 'get_anime_schedule', {'day': 'funday'})
    expect('error' in data, 'invalid day should return an error dict')


async def test_get_weather(client: Client) -> None:
    data = await call_tool(client, 'get_weather', {'city': 'Kuala Lumpur'})
    expect('error' not in data, f"get_weather returned error: {data.get('error')}")
    expect('temperature_c' in data, 'get_weather should include temperature_c')


async def test_get_current_time(client: Client) -> None:
    data = await call_tool(client, 'get_current_time', {'timezone': 'Asia/Kuala_Lumpur'})
    expect('error' not in data, f"get_current_time returned error: {data.get('error')}")
    for key in ['timezone', 'date', 'time', 'day_of_week', 'formatted']:
        expect(key in data, f'get_current_time result missing `{key}`')


async def test_get_exchange_rate(client: Client) -> None:
    data = await call_tool(client, 'get_exchange_rate', {'currency_from': 'USD', 'currency_to': 'MYR'})
    expect('error' not in data, f"get_exchange_rate returned error: {data.get('error')}")
    expect('rates' in data and 'MYR' in data['rates'], 'get_exchange_rate should include MYR in rates')


async def test_get_crypto_price(client: Client) -> None:
    data = await call_tool(client, 'get_crypto_price', {'crypto': 'BTC'})
    expect('error' not in data, f"get_crypto_price returned error: {data.get('error')}")
    for key in ['crypto', 'fiat', 'price', 'pair']:
        expect(key in data, f'get_crypto_price result missing `{key}`')


async def test_render_diagram(client: Client) -> None:
    data = await call_tool(client, 'render_diagram', {'mermaid_code': 'graph TD\nA-->B'})
    expect('error' not in data, f"render_diagram returned error: {data.get('error')}")
    expect('clickable_link' in data, 'render_diagram should return clickable_link')
    expect('kroki.io/mermaid/svg/' in data['clickable_link'], 'render_diagram should include a Kroki SVG URL')


async def main() -> int:
    tests = [
        ('registered_tools', test_registered_tools),
        ('search_anime', test_search_anime),
        ('search_anime_empty_result', test_search_anime_empty_result),
        ('get_seasonal_anime', test_get_seasonal_anime),
        ('get_seasonal_anime_invalid', test_get_seasonal_anime_invalid),
        ('get_anime_schedule', test_get_anime_schedule),
        ('get_anime_schedule_invalid', test_get_anime_schedule_invalid),
        ('get_weather', test_get_weather),
        ('get_current_time', test_get_current_time),
        ('get_exchange_rate', test_get_exchange_rate),
        ('get_crypto_price', test_get_crypto_price),
        ('render_diagram', test_render_diagram),
    ]

    passed = 0
    failed = 0

    async with Client(mcp) as client:
        for test_name, test_fn in tests:
            try:
                await test_fn(client)
                print(f'PASS: {test_name}')
                passed += 1
            except Exception as exc:
                print(f'FAIL: {test_name} - {exc}')
                failed += 1

    print(f'\nSummary: {passed} passed, {failed} failed, {len(tests)} total')
    return 1 if failed else 0


if __name__ == '__main__':
    raise SystemExit(asyncio.run(main()))
