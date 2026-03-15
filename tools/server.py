import asyncio
import base64
import os
import sys
import zlib

# Ensure project root is in sys.path for absolute imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from fastmcp import FastMCP
from starlette.requests import Request
from starlette.responses import RedirectResponse, Response
from agents.utils.logging import get_logger

# Import tools
from tools.anime import get_anime_schedule, get_seasonal_anime, search_anime
from tools.exchange_rate import get_exchange_rate
from tools.weather import get_weather
from tools.current_time import get_current_time
from tools.crypto_price import get_crypto_price
from tools.render_diagram import render_diagram, diagram_store

logger = get_logger(__name__)

mcp = FastMCP('AniKrewe MCP Server')

# Register tools
mcp.tool()(search_anime)
mcp.tool()(get_seasonal_anime)
mcp.tool()(get_anime_schedule)
mcp.tool()(get_exchange_rate)
mcp.tool()(get_weather)
mcp.tool()(get_current_time)
mcp.tool()(get_crypto_price)
mcp.tool()(render_diagram)


# Custom route: redirect short diagram IDs to Kroki SVG
@mcp.custom_route('/diagram/{diagram_id}', methods=['GET'])
async def diagram_redirect(request: Request) -> Response:
    diagram_id = request.path_params['diagram_id']
    mermaid_code = diagram_store.get(diagram_id)
    if not mermaid_code:
        return Response('Diagram not found', status_code=404)

    compressed = zlib.compress(mermaid_code.encode('utf-8'), 9)
    encoded = base64.urlsafe_b64encode(compressed).decode('ascii')
    kroki_url = f'https://kroki.io/mermaid/svg/{encoded}'
    return RedirectResponse(url=kroki_url, status_code=302)


if __name__ == '__main__':
    port = int(os.getenv('PORT', 8080))
    logger.info(f'🚀 AniKrewe MCP server starting on port {port}')
    asyncio.run(
        mcp.run_async(
            transport='streamable-http',
            host='0.0.0.0',
            port=port,
        )
    )
