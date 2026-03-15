import hashlib
import os

from agents.utils.logging import get_logger

logger = get_logger(__name__)

# In-memory store for diagrams: short_id → mermaid_code
diagram_store: dict[str, str] = {}


def _get_tools_base_url() -> str:
    """Get the base URL for the tools server."""
    # In Cloud Run, use the service URL; locally, use localhost
    url = os.getenv("TOOLS_BASE_URL", "")
    if url:
        return url.rstrip("/")
    port = os.getenv("PORT", "8080")
    return f"http://localhost:{port}"


def render_diagram(mermaid_code: str):
    """
    Use this to create a Mermaid diagram and get a short clickable link for the user.

    @mermaid_code: Valid Mermaid diagram syntax.
    @return: A dictionary containing a short clickable diagram link.
    """
    logger.info("--- 📊 Tool: render_diagram called ---")
    if not mermaid_code or not mermaid_code.strip():
        return {"error": "No Mermaid code provided."}

    mermaid_code = mermaid_code.strip()
    if mermaid_code.startswith("```"):
        lines = mermaid_code.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        mermaid_code = "\n".join(lines).strip()

    try:
        import base64
        import zlib

        # Kroki encoding: zlib compress → base64url encode
        compressed = zlib.compress(mermaid_code.encode("utf-8"), 9)
        encoded = base64.urlsafe_b64encode(compressed).decode("ascii")
        kroki_url = f"https://kroki.io/mermaid/svg/{encoded}"

        # Best-effort validation — don't block on network errors
        import urllib.request
        try:
            req = urllib.request.Request(kroki_url, method="GET")
            req.add_header("User-Agent", "AniKrewe/1.0")
            resp = urllib.request.urlopen(req, timeout=5)
            if resp.status != 200:
                logger.warning(f"⚠️ Kroki returned status {resp.status}, Mermaid syntax may be invalid")
        except urllib.error.HTTPError as http_err:
            if http_err.code == 400:
                logger.warning(f"⚠️ Kroki returned 400 — invalid Mermaid syntax")
                return {
                    "error": f"The Mermaid syntax appears invalid. Kroki returned 400. Please fix the syntax and try again. Input was: {mermaid_code[:200]}",
                }
            logger.warning(f"⚠️ Kroki validation returned {http_err.code}, proceeding anyway")
        except Exception as validation_err:
            logger.warning(f"⚠️ Kroki validation skipped: {validation_err}")

        # Store diagram and generate short ID
        short_id = hashlib.md5(mermaid_code.encode()).hexdigest()[:8]
        diagram_store[short_id] = mermaid_code
        base_url = _get_tools_base_url()
        short_url = f"{base_url}/diagram/{short_id}"

        result = {
            "diagram_link": f"[📊 View Diagram]({short_url})",
            "instruction": (
                "IMPORTANT: You MUST include this exact text in your response: "
                f"[📊 View Diagram]({short_url}) "
                "— copy it exactly, do NOT modify the URL."
            ),
        }
        logger.info(f"✅ Diagram stored as {short_id}, short URL: {short_url}")
        return result
    except Exception as e:
        logger.error(f"❌ Failed to encode diagram: {e}")
        return {"error": f"Failed to encode diagram: {e}"}
