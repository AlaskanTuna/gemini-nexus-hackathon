import logging

def setup_logging():
    """
    Configure basic logging.
    """
    logging.basicConfig(format="[%(levelname)s]: %(message)s", level=logging.INFO)
    logging.getLogger("google.adk.tools.base_authenticated_tool").setLevel(logging.ERROR)

# Initialize logging on module import
setup_logging()

def get_logger(name: str) -> logging.Logger:
    """
    Returns a logger with the given name.

    @name: The name of the logger.
    @return: A logger with the given name.
    """
    return logging.getLogger(name)
