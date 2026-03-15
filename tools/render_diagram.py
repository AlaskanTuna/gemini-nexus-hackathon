from agents.utils.logging import get_logger

logger = get_logger(__name__)

def render_diagram(mermaid_code: str):
    """
    Use this to create a Mermaid diagram and get a clickable link for the user.

    @mermaid_code: Valid Mermaid diagram syntax.
    @return: A dictionary containing a clickable diagram URL.
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
        url = f"https://kroki.io/mermaid/svg/{encoded}"

        # Validate the URL works before returning
        import urllib.request
        try:
            req = urllib.request.Request(url, method="HEAD")
            resp = urllib.request.urlopen(req, timeout=5)
            if resp.status != 200:
                logger.warning(f"⚠️ Kroki returned status {resp.status}, Mermaid syntax may be invalid")
        except Exception as validation_err:
            logger.warning(f"⚠️ Kroki validation failed: {validation_err}")
            return {
                "error": f"The Mermaid syntax appears invalid. Kroki could not render it. Please fix the syntax and try again. Input was: {mermaid_code[:200]}",
            }

        # Pre-format as markdown image so the frontend renders inline
        markdown_image = f"![Diagram]({url})"

        result = {
            "clickable_link": markdown_image,
            "instruction": (
                "IMPORTANT: Copy the 'clickable_link' value EXACTLY as-is into your "
                "response. Do NOT modify it, do NOT type the URL separately, and do NOT "
                "attempt to reproduce the URL on its own. Just paste the clickable_link."
            ),
        }
        logger.info(f"✅ Diagram URL generated and validated ({len(encoded)} chars encoded)")
        return result
    except Exception as e:
        logger.error(f"❌ Failed to encode diagram: {e}")
        return {"error": f"Failed to encode diagram: {e}"}
