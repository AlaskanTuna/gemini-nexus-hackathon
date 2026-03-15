# AniKrewe

AniKrewe is an AI operations hub for Malaysian anime communities, built for **Track C - Operations Hub (Process Automation Swarm)** of the Gemini Nexus 2026 hackathon.

It helps community leaders answer practical operational questions in one place:

- what anime is worth watching this season
- when a group watch should happen across time zones
- how much a group buy costs in MYR
- whether a meetup plan is safe given the weather

Instead of acting like a generic chatbot, AniKrewe behaves like an operations teammate. A router agent delegates each request to a specialist, calls live APIs through MCP tools, and returns a practical answer with visible reasoning traces.

## Who It Is For

AniKrewe is designed for **Malaysian anime community leaders**:

- Discord server admins
- university anime club organizers
- cosplay and anime meetup planners
- group buy coordinators

The product assumes **MYT (GMT+8)** as the default operating context while still supporting communities with members across APAC and beyond.

## What It Solves

| Problem | Current Pain | AniKrewe Response |
| ------- | ------------ | ----------------- |
| Seasonal anime discovery overload | Leaders manually compare titles, genres, scores, and airing days across multiple sites | Pulls and filters seasonal anime from Jikan in one request |
| Cross-timezone watch planning | Hosts manually convert JST, MYT, EST, and other time zones in chat | Suggests practical watch slots across member time zones |
| Group buy budget chaos | Costs are split ad hoc across Discord messages and spreadsheets | Converts JPY to MYR, calculates totals, and supports crypto spot checks |
| Weather-dependent meetups | Outdoor plans fail when rain is checked too late | Checks weather and suggests safer alternatives |
| Untrusted AI outputs | Hallucinated anime, wrong prices, or off-topic behavior create risk | Uses a Safety Guardian to validate scope and block unsafe behavior |

## How To Use AniKrewe

AniKrewe is designed to work through plain natural language.

1. Open the web app.
2. Describe the task in one sentence.
3. The router agent delegates to the right specialist.
4. Review the answer and expand the thinking log if you want the reasoning trail.

<details>
<summary>Prompt starters</summary>

### Anime discovery

- "What fantasy anime is worth watching this season?"
- "Show me Saturday anime airing this week."

### Scheduling

- "Plan a watch party for members in KL, Tokyo, and London."
- "What time should we host this in MYT and EST?"

### Budgeting

- "Split Y15000 across 5 people in MYR."
- "Can we accept ETH for this group buy?"

### Meetups

- "Is Sunday good for an outdoor anime meetup in Kuala Lumpur?"
- "Suggest a backup if rain is likely."

</details>

## Representative Use Cases

| Use Case | Example Prompt | System Behavior |
| -------- | -------------- | --------------- |
| Seasonal discovery | "What action anime is airing this Spring 2026 with rating above 7.5?" | Fetches seasonal data, filters results, and returns a shortlist |
| Airing lookup | "When does One Piece air in Malaysian time?" | Looks up airing info and prioritizes MYT in the response |
| Group watch scheduling | "Plan a group watch for Frieren this Saturday for members in KL, Tokyo, and New York" | Compares time zones and suggests viable slots |
| Group buy splitting | "A figure costs Y15000, split across 5 members in MYR" | Converts currency and calculates per-person cost |
| Multi-item budgeting | "3 figures at Y12000, Y18500, and Y9800 - total in MYR and USD" | Converts line items and produces a full breakdown |
| Crypto option check | "What is Y40300 in ETH?" | Converts value and adds a volatility disclaimer |
| Meetup planning | "We want an outdoor cosplay meetup in KL this Sunday" | Checks weather and recommends safer alternatives if needed |
| Combined workflow | "Find a good seasonal anime, then plan a Saturday group watch and KL meetup" | Orchestrates multiple specialists in sequence |

## Agent System Overview

| Agent | Role | Key Behavior |
| ----- | ---- | ------------ |
| Router Agent | Understands intent and delegates work | Routes to the correct specialist or asks a clarifying question |
| Season Intel Agent | Handles anime discovery and airing intelligence | Filters seasonal anime, schedule data, and search results |
| Event Planner Agent | Handles scheduling and meetup planning | Prioritizes MYT and balances timezone tradeoffs |
| Budget Tracker Agent | Handles prices, conversions, and splits | Returns MYR-first financial breakdowns |
| Safety Guardian | Protects the workflow | Blocks off-scope or unsafe content before it reaches the user |

## Track C and Judging Fit

AniKrewe is a strong Track C submission because it is an **operational swarm**, not just a chat interface with tools bolted on. It delegates work across specialists, orchestrates real API-backed tasks, exposes reasoning traces for recovery, and keeps the workflow safe through scoped tools and guardrails.

| Rubric | How AniKrewe Responds |
| ------ | --------------------- |
| Agentic Agency and Recovery (40%) | Router-to-specialist delegation, visible thinking logs, retries, fallback behavior, and graceful empty-result handling |
| Technical Depth - ADK / MCP (30%) | Google ADK agents, A2A transport, FastMCP server, streamable HTTP MCP, and 8 external-facing tools |
| System Robustness (20%) | Dual-layer safety, structured error returns, tool scoping, and defensive recovery behavior |
| Docs and Demo (10%) | Product framing, use cases, system overview, architecture, and a demo-friendly chat UI |

## System Architecture

```text
User
  |
  v
+--------------------------------------+
| AniKrewe Web App                     |
| Next.js frontend + /api/chat proxy   |
+--------------------------------------+
  |
  v
+--------------------------------------+
| Router Agent                         |
| Google ADK over A2A                  |
+--------------------------------------+
  |                 |                 |
  v                 v                 v
+---------------+ +---------------+ +----------------+
| Season Intel  | | Event Planner | | Budget Tracker |
+---------------+ +---------------+ +----------------+
         \             |             /
          \            |            /
           v           v           v
        +-----------------------------+
        | MCP Server (FastMCP)        |
        +-----------------------------+
        | Jikan | Weather | Timezone  |
        | FX    | Crypto  | Kroki     |
        +-----------------------------+

Safety Guardian runs before and after model output
to block unsafe or off-scope behavior.
```

## Technology Stack

| Layer | Technology |
| ----- | ---------- |
| Agent Framework | Google ADK 1.13.0 |
| MCP Server | FastMCP 2.11.3 |
| A2A Protocol | a2a-sdk 0.3.3 |
| LLM | Gemini 2.5 Flash via Vertex AI |
| Guardrails | GCP Model Armor plus LLM-as-a-Judge |
| Frontend | Next.js 15, Tailwind CSS 4, shadcn/ui |
| Deployment | Google Cloud Run |
| Package Manager | uv for Python, pnpm for frontend |

<details>
<summary>Repository structure</summary>

- `agents/` - ADK swarm logic, prompts, safety plugins, and agent tests
- `tools/` - FastMCP server, MCP tools, and integration tests
- `app/` - Next.js frontend and A2A proxy
- `deploy/` - Dockerfiles and Cloud Build configs
- `docs/` - PRD, TRD, roadmap, plan, and progress notes
- `requirements.txt` - compatibility dependency manifest for submission review

</details>

## Quick Start

### One-command deploy to your own GCP project

```bash
git clone https://github.com/your-org/gemini-nexus-hackathon.git
cd gemini-nexus-hackathon
./init.sh
```

The script will:
1. Check prerequisites (`gcloud`, `uv`, `pnpm`)
2. Create `.env` from `.env.example` (prompts for your GCP project ID)
3. Install Python and frontend dependencies
4. Authenticate with GCP and enable required APIs
5. Build 3 Docker images via Cloud Build
6. Deploy 3 Cloud Run services (MCP -> Agents -> Frontend)
7. Print 3 live URLs

### Local development

```bash
./init.sh --local
```

This installs dependencies, creates config files, and prints instructions for starting the 3 services locally.

<details>
<summary>Manual local setup (if you prefer not to use init.sh)</summary>

Prerequisites: Python 3.12+, [uv](https://docs.astral.sh/uv/), Node.js 20+, [pnpm](https://pnpm.io/)

```bash
# Setup
cp .env.example .env
# Edit .env and set GOOGLE_CLOUD_PROJECT
uv sync
cd app && pnpm install && cd ..

# Terminal 1 - MCP server
uv run python tools/server.py

# Terminal 2 - A2A agents
uv run python agents/root_agent/agent.py

# Terminal 3 - frontend
cd app && pnpm dev
```

Open `http://localhost:3000` and start chatting.

</details>

## Deployment

AniKrewe is deployed as three Cloud Run services in `us-central1`.

| Service | URL |
| ------- | --- |
| Frontend | https://anikrewe-app-438706399773.us-central1.run.app |
| A2A Agents | https://anikrewe-agents-438706399773.us-central1.run.app |
| MCP Server | https://anikrewe-tools-bjqqkq5rpa-uc.a.run.app |

<details>
<summary>Manual deployment commands (if you prefer not to use init.sh)</summary>

### Deploy order

Services must be deployed in order because each depends on the previous service's URL.

```bash
# 1. Build all images
gcloud builds submit --config deploy/cloudbuild-tools.yaml --region us-central1
gcloud builds submit --config deploy/cloudbuild-agents.yaml --region us-central1
gcloud builds submit --config deploy/cloudbuild-app.yaml --region us-central1

# 2. Deploy MCP server
gcloud run deploy anikrewe-tools \
  --image us-central1-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/anikrewe-tools \
  --region us-central1 --port 8080 --allow-unauthenticated --memory 512Mi

# 3. Get MCP URL, then deploy agents
MCP_URL=$(gcloud run services describe anikrewe-tools --region us-central1 --format='value(status.url)')

gcloud run deploy anikrewe-agents \
  --image us-central1-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/anikrewe-agents \
  --region us-central1 --port 10000 --allow-unauthenticated --memory 1Gi --timeout 300 \
  --set-env-vars "MCP_SERVER_URL=${MCP_URL}/mcp,GOOGLE_GENAI_USE_VERTEXAI=TRUE,GOOGLE_CLOUD_PROJECT=$PROJECT_ID,GOOGLE_CLOUD_LOCATION=asia-southeast1,ADK_INCLUDE_THOUGHTS=true,ENABLE_MODEL_ARMOR=false,A2A_PORT=10000"

# 4. Get A2A URL, then deploy frontend
A2A_URL=$(gcloud run services describe anikrewe-agents --region us-central1 --format='value(status.url)')

gcloud run deploy anikrewe-app \
  --image us-central1-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/anikrewe-app \
  --region us-central1 --port 3000 --allow-unauthenticated --memory 512Mi \
  --set-env-vars "A2A_SERVER_URL=${A2A_URL}"
```

### Redeploy after code changes

Rebuild the image, then redeploy. Env vars are preserved from the previous deploy.

```bash
# Frontend only
gcloud builds submit --config deploy/cloudbuild-app.yaml --region us-central1
gcloud run deploy anikrewe-app \
  --image us-central1-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/anikrewe-app \
  --region us-central1

# Agents only
gcloud builds submit --config deploy/cloudbuild-agents.yaml --region us-central1
gcloud run deploy anikrewe-agents \
  --image us-central1-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/anikrewe-agents \
  --region us-central1

# MCP tools only
gcloud builds submit --config deploy/cloudbuild-tools.yaml --region us-central1
gcloud run deploy anikrewe-tools \
  --image us-central1-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/anikrewe-tools \
  --region us-central1
```

</details>

## Safety and Scope

AniKrewe is intentionally scoped to anime community operations. It is designed to:

- answer only within scheduling, anime discovery, budgeting, and meetup planning
- avoid hallucinated or off-topic operational advice
- reject prompt injection and out-of-scope requests
- provide graceful fallbacks instead of silent failures

## License

MIT.
