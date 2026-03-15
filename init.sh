#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
# AniKrewe — One-command setup & deploy
#
# Usage:
#   ./init.sh           Deploy to Google Cloud Run (interactive)
#   ./init.sh --local   Local development setup only
# ─────────────────────────────────────────────────────────────

REGION="us-central1"
VERTEX_REGION="asia-southeast1"
REPO_NAME="cloud-run-source-deploy"

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

log()   { echo -e "${CYAN}[AniKrewe]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail()  { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ─── Prerequisite checks ───────────────────────────────────

check_prereqs() {
  log "Checking prerequisites..."

  command -v gcloud &>/dev/null || fail "gcloud CLI not found. Install: https://cloud.google.com/sdk/docs/install"
  ok "gcloud CLI found"

  command -v uv &>/dev/null || fail "uv not found. Install: https://docs.astral.sh/uv/getting-started/installation/"
  ok "uv found"

  command -v pnpm &>/dev/null || fail "pnpm not found. Install: npm install -g pnpm"
  ok "pnpm found"

  if [[ "${MODE}" == "deploy" ]]; then
    command -v docker &>/dev/null || warn "docker not found — Cloud Build will be used instead"
  fi
}

# ─── Environment setup ─────────────────────────────────────

setup_env() {
  if [[ ! -f .env ]]; then
    log "Creating .env from .env.example..."
    cp .env.example .env

    read -rp "$(echo -e "${CYAN}Enter your GCP project ID: ${NC}")" PROJECT_ID
    [[ -z "${PROJECT_ID}" ]] && fail "GCP project ID is required."

    if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' "s/^GOOGLE_CLOUD_PROJECT=.*/GOOGLE_CLOUD_PROJECT=${PROJECT_ID}/" .env
    else
      sed -i "s/^GOOGLE_CLOUD_PROJECT=.*/GOOGLE_CLOUD_PROJECT=${PROJECT_ID}/" .env
    fi

    ok "Created .env with project: ${PROJECT_ID}"
  else
    ok ".env already exists"
    PROJECT_ID=$(grep -E '^GOOGLE_CLOUD_PROJECT=' .env | cut -d'=' -f2 | tr -d ' ')
    [[ -z "${PROJECT_ID}" ]] && fail "GOOGLE_CLOUD_PROJECT is empty in .env"
  fi
}

# ─── Install dependencies ──────────────────────────────────

install_deps() {
  log "Installing Python dependencies..."
  uv sync
  ok "Python dependencies installed"

  log "Installing frontend dependencies..."
  cd app && pnpm install && cd ..
  ok "Frontend dependencies installed"
}

# ─── Local mode ─────────────────────────────────────────────

run_local() {
  log "Setting up for local development..."
  setup_env
  install_deps

  if [[ ! -f app/.env.local ]]; then
    echo "A2A_SERVER_URL=http://127.0.0.1:10000" > app/.env.local
    ok "Created app/.env.local"
  fi

  echo ""
  echo -e "${BOLD}${GREEN}Local setup complete!${NC}"
  echo ""
  echo -e "Start the services in 3 terminals:"
  echo -e "  ${CYAN}Terminal 1 (MCP):${NC}    uv run python tools/server.py"
  echo -e "  ${CYAN}Terminal 2 (Agents):${NC} uv run python agents/root_agent/agent.py"
  echo -e "  ${CYAN}Terminal 3 (App):${NC}    cd app && pnpm dev"
  echo ""
  echo -e "Then open ${BOLD}http://localhost:3000${NC}"
}

# ─── Cloud deploy ───────────────────────────────────────────

deploy_cloud() {
  log "Starting cloud deployment..."
  setup_env
  install_deps

  # Authenticate
  log "Authenticating with GCP..."
  gcloud auth login --quiet 2>/dev/null || true
  gcloud config set project "${PROJECT_ID}" --quiet
  ok "GCP project set to: ${PROJECT_ID}"

  # Enable APIs
  log "Enabling required APIs (this may take a minute)..."
  gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    aiplatform.googleapis.com \
    modelarmor.googleapis.com \
    --quiet
  ok "APIs enabled"

  # Create Artifact Registry repo if it doesn't exist
  if ! gcloud artifacts repositories describe "${REPO_NAME}" --location="${REGION}" &>/dev/null; then
    log "Creating Artifact Registry repository..."
    gcloud artifacts repositories create "${REPO_NAME}" \
      --repository-format=docker \
      --location="${REGION}" \
      --quiet
    ok "Artifact Registry repo created"
  else
    ok "Artifact Registry repo already exists"
  fi

  # ── Build all 3 images ──
  log "Building Docker images via Cloud Build (this takes 2-5 minutes)..."

  log "  Building MCP server..."
  gcloud builds submit --config deploy/cloudbuild-tools.yaml --region "${REGION}" --quiet
  ok "  MCP server image built"

  log "  Building A2A agents server..."
  gcloud builds submit --config deploy/cloudbuild-agents.yaml --region "${REGION}" --quiet
  ok "  A2A agents image built"

  log "  Building frontend..."
  gcloud builds submit --config deploy/cloudbuild-app.yaml --region "${REGION}" --quiet
  ok "  Frontend image built"

  IMAGE_PREFIX="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}"

  # ── Deploy MCP server ──
  log "Deploying MCP server..."
  gcloud run deploy anikrewe-tools \
    --image "${IMAGE_PREFIX}/anikrewe-tools" \
    --region "${REGION}" \
    --port 8080 \
    --allow-unauthenticated \
    --memory 512Mi \
    --quiet
  MCP_URL=$(gcloud run services describe anikrewe-tools --region "${REGION}" --format='value(status.url)')
  ok "MCP server deployed: ${MCP_URL}"

  # ── Deploy A2A agents server ──
  log "Deploying A2A agents server..."
  gcloud run deploy anikrewe-agents \
    --image "${IMAGE_PREFIX}/anikrewe-agents" \
    --region "${REGION}" \
    --port 10000 \
    --allow-unauthenticated \
    --memory 1Gi \
    --timeout 300 \
    --set-env-vars "\
MCP_SERVER_URL=${MCP_URL}/mcp,\
GOOGLE_GENAI_USE_VERTEXAI=TRUE,\
GOOGLE_CLOUD_PROJECT=${PROJECT_ID},\
GOOGLE_CLOUD_LOCATION=${VERTEX_REGION},\
ADK_INCLUDE_THOUGHTS=true,\
ENABLE_MODEL_ARMOR=false,\
A2A_PORT=10000" \
    --quiet
  A2A_URL=$(gcloud run services describe anikrewe-agents --region "${REGION}" --format='value(status.url)')
  ok "A2A agents deployed: ${A2A_URL}"

  # ── Deploy frontend ──
  log "Deploying frontend..."
  gcloud run deploy anikrewe-app \
    --image "${IMAGE_PREFIX}/anikrewe-app" \
    --region "${REGION}" \
    --port 3000 \
    --allow-unauthenticated \
    --memory 512Mi \
    --set-env-vars "A2A_SERVER_URL=${A2A_URL}" \
    --quiet
  APP_URL=$(gcloud run services describe anikrewe-app --region "${REGION}" --format='value(status.url)')
  ok "Frontend deployed: ${APP_URL}"

  # ── Done ──
  echo ""
  echo -e "${BOLD}${GREEN}=========================================${NC}"
  echo -e "${BOLD}${GREEN}  AniKrewe deployed successfully!${NC}"
  echo -e "${BOLD}${GREEN}=========================================${NC}"
  echo ""
  echo -e "  ${CYAN}Frontend:${NC}  ${APP_URL}"
  echo -e "  ${CYAN}Agents:${NC}    ${A2A_URL}"
  echo -e "  ${CYAN}MCP Tools:${NC} ${MCP_URL}"
  echo ""
  echo -e "  Open ${BOLD}${APP_URL}${NC} in your browser to start."
  echo -e "  First request may take 10-15s (Cloud Run cold start)."
  echo ""
}

# ─── Main ───────────────────────────────────────────────────

MODE="deploy"
if [[ "${1:-}" == "--local" ]]; then
  MODE="local"
fi

echo ""
echo -e "${BOLD}${CYAN}  ╔══════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}  ║       AniKrewe — Init Script         ║${NC}"
echo -e "${BOLD}${CYAN}  ║  Anime Community Operations Hub      ║${NC}"
echo -e "${BOLD}${CYAN}  ╚══════════════════════════════════════╝${NC}"
echo ""

check_prereqs

if [[ "${MODE}" == "local" ]]; then
  run_local
else
  deploy_cloud
fi
