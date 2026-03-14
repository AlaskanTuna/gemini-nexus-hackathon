import httpx
from tools.helper import _fetch_with_retry, MAX_RETRIES
from agents.utils.logging import get_logger

logger = get_logger(__name__)

def get_crypto_price(
    crypto: str = "BTC",
    fiat: str = "USD",
):
    """
    Use this to get the current spot price of a cryptocurrency.

    @crypto: The cryptocurrency symbol (e.g., "BTC", "ETH", "SOL", "DOGE").
    @fiat: The fiat currency to get the price in (e.g., "USD", "MYR", "JPY").
    @return: A dictionary containing the crypto price data, or an error message if the request fails.
    """
    pair = f"{crypto.upper()}-{fiat.upper()}"
    logger.info(f"--- 🪙 Tool: get_crypto_price called for {pair} ---")
    try:
        response = _fetch_with_retry(
            f"https://api.coinbase.com/v2/prices/{pair}/spot",
            timeout=30.0,
        )
        data = response.json()
        price_data = data.get("data", {})
        result = {
            "crypto": crypto.upper(),
            "fiat": fiat.upper(),
            "price": price_data.get("amount", "N/A"),
            "pair": pair,
        }
        logger.info(f"✅ Crypto price response: {result}")
        return result
    except httpx.HTTPError as e:
        return {"error": f"Crypto API request failed after {MAX_RETRIES} attempts: {e}"}
    except (ValueError, KeyError) as e:
        return {"error": f"Failed to parse crypto data: {e}"}
