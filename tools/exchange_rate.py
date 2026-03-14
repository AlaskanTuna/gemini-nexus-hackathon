import httpx
from tools.helper import _fetch_with_retry, MAX_RETRIES
from agents.utils.logging import get_logger

logger = get_logger(__name__)

def get_exchange_rate(
    currency_from: str = "USD",
    currency_to: str = "EUR",
    currency_date: str = "latest",
):
    """
    Use this to get current exchange rate.

    @currency_from: The currency to convert from (e.g., "USD").
    @currency_to: The currency to convert to (e.g., "EUR").
    @currency_date: The date for the exchange rate or "latest". Defaults to "latest".
    @return: A dictionary containing the exchange rate data, or an error message if the request fails.
    """
    logger.info(
        f"--- 🛠️ Tool: get_exchange_rate called for converting {currency_from} to {currency_to} ---"
    )
    try:
        response = _fetch_with_retry(
            f"https://api.frankfurter.app/{currency_date}",
            params={"from": currency_from, "to": currency_to},
            timeout=30.0,
        )
        data = response.json()
        if "rates" not in data:
            logger.error(f"❌ rates not found in response: {data}")
            return {"error": "Invalid API response format."}
        logger.info(f"✅ API response: {data}")
        return data
    except httpx.HTTPError as e:
        return {"error": f"API request failed after {MAX_RETRIES} attempts: {e}"}
    except ValueError:
        return {"error": "Invalid JSON response from API."}
