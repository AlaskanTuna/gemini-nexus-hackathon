import asyncio
import os
import sys

# Ensure project root is in sys.path for absolute imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from fastmcp import FastMCP
from agents.utils.logging import get_logger

# Import tools
from tools.exchange_rate import get_exchange_rate
from tools.weather import get_weather
from tools.current_time import get_current_time
from tools.crypto_price import get_crypto_price
from tools.render_diagram import render_diagram

logger = get_logger(__name__)

mcp = FastMCP('AniKrewe MCP Server')

# Register tools
mcp.tool()(get_exchange_rate)
mcp.tool()(get_weather)
mcp.tool()(get_current_time)
mcp.tool()(get_crypto_price)
mcp.tool()(render_diagram)

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8080))
    logger.info(f'🚀 AniKrewe MCP server starting on port {port}')
    asyncio.run(
        mcp.run_async(
            transport='http',
            host='0.0.0.0',
            port=port,
        )
    )
