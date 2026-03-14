import httpx
from tools.helper import _fetch_with_retry, MAX_RETRIES
from agents.utils.logging import get_logger

logger = get_logger(__name__)

CITY_COORDS = {
    "tokyo": (35.6762, 139.6503),
    "kuala lumpur": (3.1390, 101.6869),
    "singapore": (1.3521, 103.8198),
    "new york": (40.7128, -74.0060),
    "london": (51.5074, -0.1278),
    "paris": (48.8566, 2.3522),
    "sydney": (-33.8688, 151.2093),
    "osaka": (34.6937, 135.5023),
    "bangkok": (13.7563, 100.5018),
    "seoul": (37.5665, 126.9780),
    "beijing": (39.9042, 116.4074),
    "dubai": (25.2048, 55.2708),
    "johor bahru": (1.4927, 103.7414),
    "penang": (5.4164, 100.3327),
} # Common city coordinates for quick lookup (lat, lon)

WMO_CODES = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Foggy", 48: "Depositing rime fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
    80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
    95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail",
} # WMO Weather interpretation codes

def _get_city_coords(city: str) -> tuple[float, float] | None:
    """
    Look up coordinates for a city name.

    @city: The city name to look up.
    @return: A tuple containing the latitude and longitude of the city, or None if the city is not found.
    """
    key = city.strip().lower()
    if key in CITY_COORDS:
        return CITY_COORDS[key]

    # Fallback: use Open-Meteo geocoding API
    try:
        response = _fetch_with_retry(
            "https://geocoding-api.open-meteo.com/v1/search",
            params={"name": city, "count": 1},
            timeout=15.0,
        )
        data = response.json()
        results = data.get("results", [])
        if results:
            return (results[0]["latitude"], results[0]["longitude"])
    except Exception as e:
        logger.warning(f"⚠️ Geocoding failed for '{city}': {e}")
    return None

def get_weather(city: str = "Kuala Lumpur"):
    """
    Use this to get current weather information for a city.

    @city: The city name to get weather for (e.g., "Tokyo", "Kuala Lumpur").
    @return: A dictionary containing weather data, or an error message if the request fails.
    """
    logger.info(f"--- 🌤️ Tool: get_weather called for {city} ---")

    coords = _get_city_coords(city)
    if not coords:
        return {"error": f"Could not find coordinates for city: '{city}'."}

    lat, lon = coords
    try:
        response = _fetch_with_retry(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": lat,
                "longitude": lon,
                "current": "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m",
                "timezone": "auto",
            },
            timeout=30.0,
        )
        data = response.json()
        current = data.get("current", {})
        weather_code = current.get("weather_code", -1)
        weather_info = {
            "city": city,
            "temperature_c": current.get("temperature_2m", "N/A"),
            "feels_like_c": current.get("apparent_temperature", "N/A"),
            "humidity": current.get("relative_humidity_2m", "N/A"),
            "description": WMO_CODES.get(weather_code, "Unknown"),
            "wind_speed_kmh": current.get("wind_speed_10m", "N/A"),
            "wind_direction_deg": current.get("wind_direction_10m", "N/A"),
        }
        logger.info(f"✅ Weather response: {weather_info}")
        return weather_info
    except httpx.HTTPError as e:
        return {"error": f"Weather API request failed after {MAX_RETRIES} attempts: {e}"}
    except (ValueError, KeyError, IndexError) as e:
        return {"error": f"Failed to parse weather data: {e}"}
