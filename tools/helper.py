import time
import httpx
from agents.utils.logging import get_logger

logger = get_logger(__name__)

# CONSTANTS
MAX_RETRIES = 3
RETRY_DELAY = 2

def _fetch_with_retry(url: str, params: dict = None, headers: dict = None, timeout: float = 30.0) -> httpx.Response:
    """
    Make an HTTP GET request with automatic retries.
    """
    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = httpx.get(url, params=params, headers=headers, timeout=timeout)
            response.raise_for_status()
            return response
        except (httpx.HTTPError, httpx.TimeoutException) as e:
            last_error = e
            if attempt < MAX_RETRIES:
                logger.warning(f"⚠️ Attempt {attempt}/{MAX_RETRIES} failed: {e}. Retrying in {RETRY_DELAY}s...")
                time.sleep(RETRY_DELAY)
            else:
                logger.error(f"❌ All {MAX_RETRIES} attempts failed: {e}")
    raise last_error
