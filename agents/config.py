import os

from dotenv import load_dotenv

load_dotenv()


def _env_flag(name: str, default: str = '') -> bool:
    value = os.getenv(name, default)
    return value.lower() in {'1', 'true', 'yes', 'on'}


# MODEL
DEFAULT_MODEL = 'gemini-2.5-flash'
INCLUDE_THOUGHTS = _env_flag('ADK_INCLUDE_THOUGHTS', 'true')

# MCP
MCP_SERVER_URL = os.getenv('MCP_SERVER_URL', 'http://localhost:8080/mcp')

# A2A
A2A_PORT = int(os.getenv('A2A_PORT', '10000'))

# MODEL ARMOR
ENABLE_MODEL_ARMOR = _env_flag('ENABLE_MODEL_ARMOR', 'false')
GOOGLE_CLOUD_PROJECT = os.getenv('GOOGLE_CLOUD_PROJECT', '')
MODEL_ARMOR_LOCATION = os.getenv('MODEL_ARMOR_LOCATION', 'asia-southeast1')
MODEL_ARMOR_TEMPLATE_ID = os.getenv('MODEL_ARMOR_TEMPLATE_ID', 'anikrewe-safety')

# AGENTS CONFIG
engine_config_path = os.path.join(os.path.dirname(__file__), '..', 'agents.toml')
try:
    import tomllib
except ModuleNotFoundError:
    import tomli as tomllib

with open(engine_config_path, 'rb') as f:
    AGENTS_CONFIG = tomllib.load(f)
