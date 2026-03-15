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

## Local Development

<details>
<summary>Prerequisites and local setup</summary>

### Prerequisites

- Python 3.12+
- [uv](https://docs.astral.sh/uv/)
- Node.js 20+
- [pnpm](https://pnpm.io/)
- a root `.env` file copied from `.env.example`

### Run locally

Start three services in parallel.

```bash
# Terminal 1 - MCP server
uv sync
uv run python tools/server.py

# Terminal 2 - A2A agents
uv run python agents/root_agent/agent.py

# Terminal 3 - frontend
cd app
pnpm install
pnpm dev
```

Open `http://localhost:3000` and start chatting.

</details>

## Deployment

AniKrewe is deployed as three Cloud Run services in `us-central1`.

<details>
<summary>Live URLs and deployment commands</summary>

| Service | URL |
| ------- | --- |
| Frontend | https://anikrewe-app-438706399773.us-central1.run.app |
| A2A Agents | https://anikrewe-agents-438706399773.us-central1.run.app |
| MCP Server | https://anikrewe-tools-bjqqkq5rpa-uc.a.run.app |

### Deployment order

1. MCP Server
2. A2A Agents with `MCP_SERVER_URL`
3. Frontend with `A2A_SERVER_URL`

### Build images

```bash
gcloud builds submit --config deploy/cloudbuild-tools.yaml --region us-central1
gcloud builds submit --config deploy/cloudbuild-agents.yaml --region us-central1
gcloud builds submit --config deploy/cloudbuild-app.yaml --region us-central1
```

### Deploy MCP Server

```bash
gcloud run deploy anikrewe-tools \
  --image us-central1-docker.pkg.dev/gemini-nexus-hackathon/cloud-run-source-deploy/anikrewe-tools \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=gemini-nexus-hackathon"
```

### Deploy A2A Agents

```bash
gcloud run deploy anikrewe-agents \
  --image us-central1-docker.pkg.dev/gemini-nexus-hackathon/cloud-run-source-deploy/anikrewe-agents \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --timeout 300 \
  --set-env-vars "\
GOOGLE_GENAI_USE_VERTEXAI=TRUE,\
GOOGLE_CLOUD_PROJECT=gemini-nexus-hackathon,\
GOOGLE_CLOUD_LOCATION=asia-southeast1,\
MCP_SERVER_URL=<TOOLS_URL>/mcp,\
A2A_PORT=10000,\
ADK_INCLUDE_THOUGHTS=true,\
ENABLE_MODEL_ARMOR=true,\
MODEL_ARMOR_TEMPLATE_ID=anikrewe-safety,\
MODEL_ARMOR_LOCATION=us-central1"
```

### Deploy Frontend

```bash
gcloud run deploy anikrewe-app \
  --image us-central1-docker.pkg.dev/gemini-nexus-hackathon/cloud-run-source-deploy/anikrewe-app \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "A2A_SERVER_URL=<AGENTS_URL>"
```

### Redeploy after code changes

If code changed, rebuild the image first and then redeploy the service. For code-only changes, you usually do not need to repeat the env var flags because Cloud Run keeps the existing service configuration.

#### Frontend

```bash
gcloud builds submit --config deploy/cloudbuild-app.yaml --region us-central1

gcloud run deploy anikrewe-app \
  --image us-central1-docker.pkg.dev/gemini-nexus-hackathon/cloud-run-source-deploy/anikrewe-app \
  --region us-central1
```

#### A2A Agents

```bash
gcloud builds submit --config deploy/cloudbuild-agents.yaml --region us-central1

gcloud run deploy anikrewe-agents \
  --image us-central1-docker.pkg.dev/gemini-nexus-hackathon/cloud-run-source-deploy/anikrewe-agents \
  --region us-central1
```

#### MCP Tools

```bash
gcloud builds submit --config deploy/cloudbuild-tools.yaml --region us-central1

gcloud run deploy anikrewe-tools \
  --image us-central1-docker.pkg.dev/gemini-nexus-hackathon/cloud-run-source-deploy/anikrewe-tools \
  --region us-central1
```

Redeploy order for cross-service changes:

1. `anikrewe-tools`
2. `anikrewe-agents`
3. `anikrewe-app`

</details>

## Safety and Scope

AniKrewe is intentionally scoped to anime community operations. It is designed to:

- answer only within scheduling, anime discovery, budgeting, and meetup planning
- avoid hallucinated or off-topic operational advice
- reject prompt injection and out-of-scope requests
- provide graceful fallbacks instead of silent failures

## License

MIT.
