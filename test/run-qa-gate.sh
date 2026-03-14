#!/usr/bin/env bash
set -euo pipefail

PHASE="${1:-phase1}"
LIVE_FLAG="${2:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
PYTHON_BIN="${PROJECT_ROOT}/.venv/Scripts/python.exe"

if [[ ! -x "${PYTHON_BIN}" ]]; then
  if command -v python3 >/dev/null 2>&1; then
    PYTHON_BIN="python3"
  else
    PYTHON_BIN="python"
  fi
fi

ARGS=("${PROJECT_ROOT}/test/qa_gate.py" "--phase" "${PHASE}")
if [[ "${LIVE_FLAG}" == "--live" ]]; then
  ARGS+=("--live")
fi

"${PYTHON_BIN}" "${ARGS[@]}"
