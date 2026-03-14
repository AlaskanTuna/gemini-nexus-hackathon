from datetime import datetime
from zoneinfo import ZoneInfo
from agents.utils.logging import get_logger

logger = get_logger(__name__)

def get_current_time(timezone: str = "Asia/Kuala_Lumpur"):
    """
    Use this to get the current date and time in a specific timezone.

    @timezone: The IANA timezone name (e.g., "Asia/Tokyo").
    @return: A dictionary containing the current time information for the specified timezone.
    """
    logger.info(f"--- 🕐 Tool: get_current_time called for {timezone} ---")
    try:
        tz = ZoneInfo(timezone)
        now = datetime.now(tz)
        time_info = {
            "timezone": timezone,
            "date": now.strftime("%Y-%m-%d"),
            "time": now.strftime("%H:%M:%S"),
            "day_of_week": now.strftime("%A"),
            "formatted": now.strftime("%A, %B %d, %Y at %I:%M %p %Z"),
        }
        logger.info(f"✅ Time response: {time_info}")
        return time_info
    except KeyError:
        logger.error(f"❌ Unknown timezone: {timezone}")
        return {"error": f"Unknown timezone: '{timezone}'. Use IANA format like 'Asia/Tokyo'."}
