<p align="center">
  <img src="web/public/favicon.png" alt="BurnGuard" width="240" />
</p>

<h1 align="center">BurnGuard</h1>

<p align="center">
  <strong>Stop surprise AI API bills before they happen.</strong>
</p>

<p align="center">
  Real-time metering, hard budget caps, and a kill switch — sitting quietly between your app and every AI provider.
</p>

<p align="center">
  <a href="https://burnguard.run">Website</a> · <a href="https://burnguard.run/login">Dashboard</a> · <a href="https://github.com/Verifieddanny/BunGuard/releases">Releases</a>
</p>

---

## The Problem

A developer set up AWS Cost Anomaly Detection with a $100 threshold. 33 days later, they got a **$30,141 invoice**. The monitoring tool didn't cover Bedrock because it's billed through AWS Marketplace.

Another developer woke up to an **$18,000 Google Cloud bill** despite setting a $7 budget. An attacker found a public API key and hit 60,000+ requests overnight. Nine safety features existed — all turned off by default.

Enterprise FinOps tools that catch this start at **$6,000/year**. AWS Budgets has an **8-24 hour delay**. Indie developers and small teams have nothing.

BurnGuard fills that gap.

## How It Works

```mermaid
graph LR
    A[Your App] -->|localhost:8080| B[BurnGuard Proxy]
    B -->|Forward| C[Claude / GPT / Gemini]
    C -->|Response| B
    B -->|Count tokens\nCalculate cost\nEnforce budget| B
    B -->|Response| A
    B -->|Sync every 60s| D[BurnGuard Cloud]
    D --> E[Dashboard]
```

BurnGuard is a Go reverse proxy that sits between your application and AI providers. It intercepts every API call, counts tokens in real-time (including SSE streaming responses), calculates the cost, and blocks requests when your budget is exceeded. No 8-hour delays. No $6K/year tools. One binary.

## Features

- **Real-time cost tracking** — tokens counted as they stream through, not hours later
- **Hard budget enforcement** — requests blocked instantly when the limit is hit, before they reach the provider
- **Multi-provider** — Anthropic (Claude) and OpenAI (GPT) supported, route by path prefix
- **SSE streaming support** — token counting works on streaming responses without buffering
- **Persistent memory** — SQLite stores usage locally, budget enforcement survives restarts
- **Slack and Discord alerts** — get notified at 50%, 80%, 100% of your budget
- **Cloud dashboard** — sync usage data to burnguard.run for charts, breakdowns, and team visibility
- **Interactive setup** — `burnguard init` walks you through configuration, no YAML editing
- **Zero dependencies** — single binary, no runtime required

## Quick Start

### Install

```bash
# macOS (Homebrew)
brew tap verifieddanny/tap
brew install burnguard

# macOS / Linux (curl)
curl -sSL https://burnguard.run/install.sh | sh

# Windows (PowerShell)
irm https://burnguard.run/install.ps1 | iex

# Any platform (Go)
go install github.com/Verifieddanny/BunGuard/cmd/proxy@latest
```

### Setup

```bash
# Interactive setup wizard
burnguard init

# Start the proxy
burnguard start
```

### Use

Change one line in your app — the base URL:

```python
# Before
client = Anthropic()

# After
client = Anthropic(base_url="http://localhost:8080/anthropic")
```

```python
# Before
client = OpenAI()

# After
client = OpenAI(base_url="http://localhost:8080/openai/v1")
```

That's it. Every request now flows through BurnGuard.

## Architecture

```mermaid
graph TB
    subgraph Developer Machine
        App[Your App]
        Proxy[BurnGuard Proxy<br/>Go Binary]
        SQLite[(SQLite)]
        App --> Proxy
        Proxy --> SQLite
    end

    subgraph AI Providers
        Anthropic[Anthropic API]
        OpenAI[OpenAI API]
    end

    subgraph BurnGuard Cloud
        API[Backend API<br/>Go + PostgreSQL]
        PG[(PostgreSQL)]
        Frontend[Dashboard<br/>Next.js]
        API --> PG
        Frontend --> API
    end

    Proxy --> Anthropic
    Proxy --> OpenAI
    Proxy -->|Sync usage data| API
    Proxy -->|Slack/Discord| Webhooks[Webhook Alerts]

    User[Browser] --> Frontend
```

Three independent programs connected by HTTP:

| Component | Tech | Purpose |
|-----------|------|---------|
| **Proxy** | Go, SQLite | Runs locally, intercepts API calls, enforces budgets |
| **Backend API** | Go, PostgreSQL | Cloud service, stores synced usage data, serves dashboard |
| **Dashboard** | Next.js, GSAP, Recharts | Web UI at burnguard.run for analytics and configuration |

## Configuration

`burnguard init` generates a `burnguard.yaml` in your project directory:

```yaml
server:
  proxy_port: ":8080"
  db_path: burnguard.db

budget:
  limit: 50.00

providers:
  anthropic:
    base_url: https://api.anthropic.com
  openai:
    base_url: https://api.openai.com

alerts:
  slack_webhook: "https://hooks.slack.com/services/..."
  discord_webhook: ""
  thresholds:
    - 0.5
    - 0.8
    - 1.0

sync:
  enabled: true
  token: "bg_your_sync_token_here"
  url: "https://api.burnguard.run"
  interval: 60
```

## Cloud Dashboard

Sign up at [burnguard.run](https://burnguard.run) to get a sync token. The proxy sends usage data to the cloud every 60 seconds. The dashboard shows:

- Total spend and budget utilization
- Daily spend chart (7/30/90 day views)
- Provider and model cost breakdown
- Recent request log with token counts
- Budget and alert configuration
- Sync token management

### Authentication

Three sign-in methods:
- GitHub OAuth
- Google OAuth
- WebAuthn Passkeys (Touch ID, Face ID, Windows Hello)

## Supported Providers

| Provider | Routing Path | Streaming | Cache-Aware Pricing |
|----------|-------------|-----------|-------------------|
| Anthropic (Claude) | `/anthropic/v1/messages` | Yes | Yes |
| OpenAI (GPT) | `/openai/v1/chat/completions` | Yes | Yes |
| Google (Gemini) | Coming soon | — | — |

## How Cost Calculation Works

BurnGuard parses token usage from every API response and calculates cost using the provider's published pricing:

**Anthropic:**
- Standard input tokens at full rate
- Cache creation tokens at 1.25x rate (25% premium)
- Cache read tokens at 0.10x rate (90% discount)
- Output tokens at standard output rate

**OpenAI:**
- Standard prompt tokens at full rate
- Cached prompt tokens at 0.50x rate (older models) or 0.10x rate (GPT-5.4+)
- Completion tokens at standard output rate

Pricing tables are built into the binary and updated with each release.

## Project Structure

```
BunGuard/
├── cmd/
│   ├── proxy/              # CLI binary (init + start)
│   │   ├── main.go
│   │   └── init.go         # Interactive setup wizard
│   └── server/
│       └── api/            # Backend API server
├── internal/
│   ├── ai_models/          # Provider parsers (Anthropic, OpenAI)
│   ├── alerts/             # Slack/Discord webhook sender
│   ├── budget/             # In-memory spend tracker with mutex
│   ├── config/             # YAML config loader
│   ├── db/                 # SQLite (proxy) + PostgreSQL (server) connectors
│   ├── db_store/           # PostgreSQL repositories (server)
│   ├── proxy/              # Reverse proxy + SSE stream reader
│   ├── storage/            # SQLite repositories (proxy)
│   └── sync/               # Background sync goroutine
├── web/                    # Next.js dashboard frontend
├── scripts/                # Install scripts
├── burnguard.yaml          # Proxy config (generated by init)
├── .goreleaser.yaml        # Release automation
├── Dockerfile              # Backend container
└── docker-compose.yml      # Local PostgreSQL for development
```

## Development

### Prerequisites

- Go 1.23+
- Node.js 20+
- Docker (for PostgreSQL)
- [Air](https://github.com/air-verse/air) (hot reload)

### Setup

```bash
# Clone
git clone https://github.com/Verifieddanny/BunGuard.git
cd BunGuard

# Start PostgreSQL
docker compose up -d

# Run migrations
make migrate-up

# Start the backend API (terminal 1)
make dev-server

# Start the proxy (terminal 2)
make dev-proxy

# Start the frontend (terminal 3)
cd web && npm install && npm run dev
```

### Environment Variables

Backend (`.envrc`):
```
DATABASE_URL=postgres://bunguardadmin:bunguardadminpassword@localhost:5432/bunguard?sslmode=disable
ADDR=:3001
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FRONTEND_URL=http://localhost:3000
WEBAUTHN_RP_ID=localhost
```

Frontend (`web/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MAX_AGE=your_max_age_value
```

## Research

BurnGuard was built in response to documented, real-world billing disasters:

- **$30,141** AWS Bedrock surprise bill — [The Register, May 2026](https://www.theregister.com/saas/2026/05/14/bedrock-and-a-hard-place-claude-adventure-leaves-aws-user-staring-down-30k-invoice/5238153)
- **$18,000+** Google Cloud bill on a $7 budget — [Tom's Hardware, April 2026](https://www.tomshardware.com/tech-industry/artificial-intelligence/google-cloud-customer-wakes-up-to-usd18-000-bill-despite-usd7-budget-thanks-to-forgotten-public-api-key-attacker-put-in-60-000-requests-and-blasted-through-usd1-400-spending-cap)
- **$3K-$127K** surprise AI bills across Google Cloud — [The Register, May 2026](https://www.theregister.com/ai-ml/2026/05/18/surprise-ai-bills-leave-aws-and-google-cloud-users-aghast/5241348)

See [research.md](./research.md) for the full source compilation.

## License

MIT

---

<p align="center">
  Built by <a href="https://github.com/Verifieddanny">DevDanny</a> · <a href="https://burnguard.run">burnguard.run</a>
</p>