import httpx

from agents.utils.logging import get_logger
from tools.helper import MAX_RETRIES, _fetch_with_retry

logger = get_logger(__name__)

JIKAN_ANIME_URL = 'https://api.jikan.moe/v4/anime'
JIKAN_SEASONS_URL = 'https://api.jikan.moe/v4/seasons'
JIKAN_SCHEDULES_URL = 'https://api.jikan.moe/v4/schedules'

VALID_SEASONS = {'winter', 'spring', 'summer', 'fall'}
VALID_DAYS = {'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'}

GENRE_MAP = {
    'action': 1,
    'adventure': 2,
    'comedy': 4,
    'drama': 8,
    'fantasy': 10,
    'romance': 22,
    'sci-fi': 24,
    'slice of life': 36,
    'sports': 30,
    'supernatural': 37,
    'mecha': 18,
    'music': 19,
    'horror': 14,
    'mystery': 7,
    'psychological': 40,
}


def _extract_broadcast_info(anime: dict) -> tuple[str | None, str | None, str | None]:
    broadcast = anime.get('broadcast') or {}
    return broadcast.get('day'), broadcast.get('time'), broadcast.get('timezone')


def _extract_genres(anime: dict) -> list[str]:
    return [genre.get('name') for genre in anime.get('genres', []) if genre.get('name')]


def search_anime(
    query: str,
    min_score: float = 0.0,
    genre: str = '',
    anime_type: str = 'tv',
    limit: int = 10,
) -> dict:
    """
    Search for anime by name, genre, and minimum score.

    @query: The anime title or keywords to search for.
    @min_score: The minimum MyAnimeList score to include.
    @genre: An optional genre name that maps to a MyAnimeList genre ID.
    @anime_type: The anime type to filter on (e.g., "tv", "movie", "ova").
    @limit: The maximum number of results to return.
    @return: A dictionary with a `results` list and `total` count, or `{"error": "..."}` on failure.
    """
    logger.info(
        f"--- 🛠️ Tool: search_anime called with query='{query}', min_score={min_score}, genre='{genre}', anime_type='{anime_type}', limit={limit} ---"
    )

    if not query or not query.strip():
        logger.error('❌ Anime search query cannot be empty')
        return {'error': 'Anime search query cannot be empty.'}

    params = {
        'q': query.strip(),
        'type': anime_type.strip().lower() or 'tv',
        'min_score': min_score,
        'order_by': 'score',
        'sort': 'desc',
        'limit': max(1, limit),
    }

    genre_key = genre.strip().lower()
    if genre_key:
        genre_id = GENRE_MAP.get(genre_key)
        if genre_id is None:
            logger.error(f"❌ Unsupported genre: {genre}")
            return {'error': f"Unsupported genre: '{genre}'. Supported genres: {', '.join(sorted(GENRE_MAP))}."}
        params['genres'] = genre_id

    try:
        response = _fetch_with_retry(JIKAN_ANIME_URL, params=params, timeout=30.0)
        data = response.json()
        anime_list = data.get('data', [])
        total = data.get('pagination', {}).get('items', {}).get('total', len(anime_list))

        results = []
        for anime in anime_list:
            airing_day, broadcast_time, broadcast_timezone = _extract_broadcast_info(anime)
            results.append(
                {
                    'mal_id': anime.get('mal_id'),
                    'title': anime.get('title'),
                    'score': anime.get('score'),
                    'episodes': anime.get('episodes'),
                    'synopsis': anime.get('synopsis'),
                    'genres': _extract_genres(anime),
                    'url': anime.get('url'),
                    'airing_day': airing_day,
                    'broadcast_time': broadcast_time,
                    'broadcast_timezone': broadcast_timezone,
                }
            )

        result = {'results': results, 'total': total}
        logger.info(f"✅ search_anime returned {len(results)} results")
        return result
    except httpx.HTTPError as e:
        logger.error(f"❌ Anime API request failed: {e}")
        return {'error': f'Anime API request failed after {MAX_RETRIES} attempts: {e}'}
    except (ValueError, KeyError, TypeError) as e:
        logger.error(f"❌ Failed to parse anime search data: {e}")
        return {'error': f'Failed to parse anime search data: {e}'}


def get_seasonal_anime(
    year: int = 2026,
    season: str = 'spring',
    min_score: float = 0.0,
    limit: int = 15,
) -> dict:
    """
    Get anime airing in a specific season, optionally filtered by minimum score.

    @year: The anime season year.
    @season: The season name: winter, spring, summer, or fall.
    @min_score: The minimum MyAnimeList score to include.
    @limit: The maximum number of filtered seasonal results to return.
    @return: A dictionary with a `results` list and filtered `total`, or `{"error": "..."}` on failure.
    """
    logger.info(
        f"--- 🛠️ Tool: get_seasonal_anime called with year={year}, season='{season}', min_score={min_score}, limit={limit} ---"
    )

    season_key = season.strip().lower()
    if season_key not in VALID_SEASONS:
        logger.error(f"❌ Invalid season: {season}")
        return {'error': f"Invalid season: '{season}'. Use one of: {', '.join(sorted(VALID_SEASONS))}."}

    try:
        response = _fetch_with_retry(
            f'{JIKAN_SEASONS_URL}/{year}/{season_key}',
            params={'limit': 25},
            timeout=30.0,
        )
        data = response.json()
        anime_list = data.get('data', [])

        filtered_results = []
        for anime in anime_list:
            score = anime.get('score')
            if score is None and min_score > 0:
                continue
            if score is not None and score < min_score:
                continue

            airing_day, broadcast_time, broadcast_timezone = _extract_broadcast_info(anime)
            filtered_results.append(
                {
                    'mal_id': anime.get('mal_id'),
                    'title': anime.get('title'),
                    'score': score,
                    'genres': _extract_genres(anime),
                    'airing_day': airing_day,
                    'broadcast_time': broadcast_time,
                    'broadcast_timezone': broadcast_timezone,
                    'url': anime.get('url'),
                }
            )

        result = {'results': filtered_results[: max(1, limit)], 'total': len(filtered_results)}
        logger.info(
            f"✅ get_seasonal_anime returned {len(result['results'])} results ({result['total']} matched after filtering)"
        )
        return result
    except httpx.HTTPError as e:
        logger.error(f"❌ Seasonal anime API request failed: {e}")
        return {'error': f'Seasonal anime API request failed after {MAX_RETRIES} attempts: {e}'}
    except (ValueError, KeyError, TypeError) as e:
        logger.error(f"❌ Failed to parse seasonal anime data: {e}")
        return {'error': f'Failed to parse seasonal anime data: {e}'}


def get_anime_schedule(day: str = 'saturday') -> dict:
    """
    Get anime airing schedule for a specific day of the week.

    @day: The weekday filter, from monday through sunday.
    @return: A dictionary with the requested `day` and `results`, or `{"error": "..."}` on failure.
    """
    logger.info(f"--- 🛠️ Tool: get_anime_schedule called with day='{day}' ---")

    day_key = day.strip().lower()
    if day_key not in VALID_DAYS:
        logger.error(f"❌ Invalid day: {day}")
        return {'error': f"Invalid day: '{day}'. Use one of: {', '.join(sorted(VALID_DAYS))}."}

    try:
        response = _fetch_with_retry(
            JIKAN_SCHEDULES_URL,
            params={'filter': day_key},
            timeout=30.0,
        )
        data = response.json()
        anime_list = data.get('data', [])

        results = []
        for anime in anime_list:
            _, broadcast_time, broadcast_timezone = _extract_broadcast_info(anime)
            results.append(
                {
                    'mal_id': anime.get('mal_id'),
                    'title': anime.get('title'),
                    'score': anime.get('score'),
                    'broadcast_time': broadcast_time,
                    'broadcast_timezone': broadcast_timezone,
                    'url': anime.get('url'),
                }
            )

        result = {'day': day_key, 'results': results}
        logger.info(f"✅ get_anime_schedule returned {len(results)} results")
        return result
    except httpx.HTTPError as e:
        logger.error(f"❌ Anime schedule API request failed: {e}")
        return {'error': f'Anime schedule API request failed after {MAX_RETRIES} attempts: {e}'}
    except (ValueError, KeyError, TypeError) as e:
        logger.error(f"❌ Failed to parse anime schedule data: {e}")
        return {'error': f'Failed to parse anime schedule data: {e}'}
