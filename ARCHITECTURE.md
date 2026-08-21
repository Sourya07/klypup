# System Architecture & Technical Specifications

This document details the architectural design patterns, data pipelines, code layout, and interfaces of the **Klypup AI Investment Research & Finance Controller Platform**.

---

## 1. High-Level System Architecture & Overall Flow

```mermaid
flowchart TB
    %% ==========================================
    %% 1. CLIENT / USER INTERFACE LAYER
    %% ==========================================
    subgraph ClientLayer["🖥️ 1. Client & Presentation Tier (React 18 + Vite + Tailwind)"]
        Landing["☁️ Onyx Landing Showcase\n(Auto-Rotating 3s Preview & Cloud Canvas)"]
        AuthModal["🔐 Auth Modal Card\n(1-Click Fast Track Developer Demo)"]
        Dashboard["📊 Workspace Dashboard\n(Financial Telemetry & Hero Banner)"]
        ReportsView["📄 Attributed SEC Reports\n(DuPont 3-Step ROE & Citations)"]
        CompareView["⚖️ Multi-Company Matrix\n(Side-by-Side Benchmarks & CSV Export)"]
        WatchlistView["📈 Live Watchlist\n(WebSocket Price Ticker Grid)"]
        BotWidget["🤖 Floating AI Controller Bot\n(Ctrl + Shift + C | 3-Step Live Progress)"]
        QuantTerminal["⌨️ Bloomberg Quant Terminal\n(Ctrl + ~ | Monospace REPL Engine)"]
        ShellCLI["💻 Standalone Node.js CLI\n(scripts/klypup-cli.mjs)"]
    end

    %% ==========================================
    %% 2. API GATEWAY & WEBSOCKET LAYER
    %% ==========================================
    subgraph GatewayLayer["⚡ 2. API Gateway & Middleware Tier (Express.js + TypeScript)"]
        Router["🛣️ Express REST Router\n(/api/v1/*)"]
        ZodGuard["🛡️ Zod Validation Middleware\n(packages/shared Schemas)"]
        JWTAuth["🔑 JWT RS256 Auth & RBAC\n(ADMIN, ANALYST, VIEWER)"]
        WSServer["📡 Co-Hosted WebSocket Server\n(Broadcasts STOCK_UPDATE Events)"]
    end

    %% ==========================================
    %% 3. BUSINESS LOGIC & AGENTIC ENGINES
    %% ==========================================
    subgraph CoreServices["⚙️ 3. Core Domain Feature Modules & Agentic Services"]
        AuthService["Auth & Multi-Tenancy Service\n(Org Isolation & User Sessions)"]
        ResearchEngine["🔬 AI Research Engine\n(Asynchronous Report Generation)"]
        ControllerAgent["🤖 AI Financial Controller Service\n(Autonomous SEC 10-K & DuPont Auditor)"]
        DuPontEngine["📐 DuPont 3-Step ROE Calculator\n(Margin × Turnover × Leverage)"]
        RiskAuditor["🚨 Financial Risk & Red Flag Auditor\n(Accrual Anomaly & Solvency Scoring)"]
        WatchlistEngine["📈 Watchlist & Live Buffer Engine\n(RAM In-Memory Cache: 15-min TTL)"]
        CompareEngine["⚖️ Multi-Company Comparison Engine\n(Consensus Multiple Aggregator)"]
    end

    %% ==========================================
    %% 4. EXTERNAL DATA & AI PROVIDERS
    %% ==========================================
    subgraph ExternalAPIs["🌐 4. External Financial APIs & Foundation Models"]
        SEC_EDGAR["🏛️ U.S. SEC EDGAR API\n(data.sec.gov XBRL Company Facts)"]
        GeminiAI["🧠 Google Gemini API\n(gemini-3.6-flash Model)"]
        FinnhubWS["⚡ Finnhub WebSocket & REST\n(Live Tick Streams & Quotes)"]
        YahooFinance["📊 Yahoo Finance API\n(P/E Multiples & Consensus Market Data)"]
    end

    %% ==========================================
    %% 5. STORAGE & DATABASE TIER
    %% ==========================================
    subgraph StorageTier["💾 5. Database & Storage Tier"]
        PrismaORM["💎 Prisma ORM Client\n(Type-Safe Schema & Migrations)"]
        NeonDB[("🐘 Neon Serverless PostgreSQL\n(Multi-Tenant Org-Scoped Data)")]
    end

    %% ==========================================
    %% INTERACTION FLOW CONNECTIONS
    %% ==========================================
    Landing --> AuthModal
    AuthModal -->|Fast Track Sign-In| Router
    Dashboard & ReportsView & CompareView & BotWidget & QuantTerminal -->|REST API (Axios 60s)| Router
    ShellCLI -->|HTTP / Direct CLI| Router
    WatchlistView -.->|Live WS Subscriptions| WSServer

    Router --> ZodGuard --> JWTAuth
    JWTAuth --> AuthService
    JWTAuth --> ResearchEngine
    JWTAuth --> ControllerAgent
    JWTAuth --> WatchlistEngine
    JWTAuth --> CompareEngine

    ControllerAgent --> DuPontEngine
    ControllerAgent --> RiskAuditor
    ResearchEngine --> DuPontEngine
    ResearchEngine --> RiskAuditor

    ControllerAgent -->|1. Ingest XBRL Facts| SEC_EDGAR
    ResearchEngine -->|1. Ingest Form 10-K/10-Q| SEC_EDGAR
    ResearchEngine -->|2. Ingest Quote Snapshots| YahooFinance
    ResearchEngine -->|3. Grounded Synthesis| GeminiAI
    ControllerAgent -->|2. Grounded Synthesis| GeminiAI

    WatchlistEngine -->|Stream Real-Time Ticks| FinnhubWS
    WatchlistEngine -->|Emit Live Updates| WSServer
    WSServer -.->|STOCK_UPDATE Ticks| WatchlistView

    AuthService --> PrismaORM
    ResearchEngine --> PrismaORM
    WatchlistEngine --> PrismaORM
    CompareEngine --> PrismaORM
    PrismaORM --> NeonDB
```

---

## 2. Key Data Pipelines

### 2.1 SEC Grounded AI Research Pipeline

```
1.  Client (Browser / Terminal) → POST /api/v1/research/runs { ticker, prompt }
2.  Express Router → Controller (validates Zod schema) → Service
3.  Service creates DB record (status: PENDING), returns { runId }
4.  Service spawns an asynchronous worker pipeline:
      a. Pulls real-time market data & quote snapshot      ← Yahoo Finance / Finnhub
      b. Ingests official company facts (10-K, 10-Q XBRL)  ← SEC EDGAR (data.sec.gov)
      c. Normalizes GAAP concepts (Revenues, NetIncome, Assets, Liabilities, Equity)
      d. Injects structured fact JSON into Google Gemini (gemini-3.6-flash)
      e. Receives structured valuation report JSON with verifiable citations
      f. Persists completed report + sources               → Prisma → Neon DB
      g. Emits STOCK_UPDATE event via WebSocket           → All connected clients
5.  Client receives completion event / polls status → streams full report directly to screen
```

### 2.2 Quant Terminal Execution Pipeline

```
User Keybinding (Ctrl + `)
  │
  ▼
TerminalDrawer Component (React 18 + Tailwind)
  ├── Command Tokenizer: splits action and arguments
  ├── Tab Autocompleter: matches command list and top tickers (AAPL, NVDA, MSFT...)
  ├── Command History Stack: cycles past commands with Up/Down arrows
  ├── Action Dispatchers:
  │     ├── `quote`      → searchService / Yahoo quote snapshot
  │     ├── `research`   → researchService.createRun() + live status polling & full report streaming
  │     ├── `compare`    → compareService.compareCompanies() + ASCII comparison matrix
  │     ├── `watchlist`  → watchlistService.addToWatchlist() / getWatchlist()
  │     ├── `sec`        → SEC EDGAR CIK and filing registry lookup
  │     └── `theme`      → switches color palettes (matrix, amber, cyan, slate)
```

### 2.3 Financial Risk & Red Flag Auditor Pipeline

```
1.  SEC Fact Extraction → Ingests usGaap:NetIncomeLoss, usGaap:Assets, usGaap:Liabilities, usGaap:StockholdersEquity.
2.  Accrual Quality Audit → Checks Net Income vs. Total Asset velocity to detect aggressive revenue recognition.
3.  Balance Sheet Leverage Stress-Test → Audits Liabilities / Equity ratio against investment-grade leverage thresholds.
4.  Margin Contraction & Pricing Power → Checks YoY revenue growth and net profit margins against inflation shocks.
5.  Composite Health Score → Synthesizes a 0-100 gauge (Strong >= 75, Moderate 50-74, High Risk < 50).
```

### 2.4 DuPont 3-Step ROE Decomposition

$$\text{ROE} = \left( \frac{\text{Net Income}}{\text{Revenue}} \right) \times \left( \frac{\text{Revenue}}{\text{Assets}} \right) \times \left( \frac{\text{Assets}}{\text{Equity}} \right)$$

* **Net Profit Margin**: Operating profitability & cost discipline.
* **Asset Turnover**: Asset efficiency & capital velocity.
* **Financial Leverage / Equity Multiplier**: Balance sheet solvency headroom.

### 2.5 Agentic Copilot & Floating Controller Architecture

```
User Query / Ticker (Floating Bot Ctrl + Shift + C or Quant Terminal Ctrl + ~)
  │
  ▼
API Gateway: POST /api/v1/research/ask-controller { ticker, question }
  │
  ├── 1. Dynamic SEC CIK Resolution (In-Memory Pre-Cache + data.sec.gov fallback)
  ├── 2. Live XBRL Company Facts Ingestion (data.sec.gov/api/xbrl/companyfacts/CIK...)
  ├── 3. GAAP Concept Normalization (Revenue, Net Income, Liabilities, Assets, Equity)
  ├── 4. DuPont & Health Score Computation
  └── 5. Grounded Gemini 3.6 Flash Synthesis (System Prompt with strict no-hallucination instruction)
  │
  ▼
Response JSON: { answer, relatedMetrics: { Revenue, NetIncome, ROE, HealthScore }, citations }
```

---

## 3. Directory Tree

```
klypup/
├── .github/
│   └── workflows/
│       ├── ci.yml                  # Lint → Test → Build pipeline
│       └── cd.yml                  # Deployment pipeline
│
├── apps/
│   ├── api/                        # Express.js REST API + WebSocket Server
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Prisma ORM schema (all models & relations)
│   │   │   └── seed.ts             # Seed script: orgs, users, sample data
│   │   ├── src/
│   │   │   ├── index.ts            # App entry point: server bootstrap, middleware chain
│   │   │   ├── config/             # Environment config loaders & validation
│   │   │   ├── middleware/         # Global Express middleware (auth, RBAC, error handler)
│   │   │   ├── lib/                # Shared singletons (prisma, websocket, finnhubWs)
│   │   │   ├── utils/              # Formatters, errors, response helpers
│   │   │   └── modules/            # Layered domain feature modules:
│   │   │       ├── auth/           #   Register, login, JWT issuance
│   │   │       ├── organizations/  #   Org management, member invitations
│   │   │       ├── users/          #   User profile & preferences
│   │   │       ├── research/       #   AI research engine, SEC facts & Controller copilot
│   │   │       ├── watchlist/      #   Company watchlist + live price merge
│   │   │       ├── compare/        #   Multi-company AI financial matrix & CSV export
│   │   │       ├── citations/      #   Report citations & SEC filing sources
│   │   │       ├── search/         #   Global ticker autocomplete & search
│   │   │       └── webhooks/       #   Finnhub webhook ingestion & verification
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                        # React 18 + Vite Frontend SPA
│       ├── public/
│       │   └── cloud.jpg           # Atmospheric hero background canvas
│       ├── src/
│       │   ├── app/                # Root providers: Router, QueryClient, ThemeContext
│       │   ├── pages/              # Route view shells:
│       │   │   ├── Landing.tsx     #   Onyx-inspired cloud showcase & 3s auto-rotating mockup
│       │   │   ├── Dashboard.tsx   #   Organization workspace, recent reports & stats
│       │   │   ├── ResearchResults #   SEC citations, DuPont cards & Red Flag Auditor
│       │   │   ├── Compare.tsx     #   Multi-equity benchmarking matrix & CSV export
│       │   │   ├── Reports.tsx     #   Attributed research reports library
│       │   │   ├── Watchlist.tsx   #   Real-time WebSocket price tracking
│       │   │   └── Team.tsx        #   Multi-tenant member & invite management
│       │   ├── components/         # Design-system UI components:
│       │   │   ├── Layout.tsx      #   Navigation sidebar, topbar, tenant context
│       │   │   ├── AuthModal.tsx   #   Access Dashboard dialog with Fast Track Demo
│       │   │   ├── FloatingControllerBot.tsx # Persistent AI Financial Controller copilot
│       │   │   ├── TerminalDrawer.tsx # In-app Bloomberg-style Quant Terminal (Ctrl + ~)
│       │   │   └── UI.tsx          #   Button, Card, Modal, MetricCard primitives
│       │   ├── features/           # Domain feature modules (auth, research, watchlist, compare...)
│       │   ├── lib/                # Axios instance (60s timeout), QueryClient setup
│       │   ├── services/           # Typed API service wrappers
│       │   └── types/              # Frontend TypeScript interfaces
│       ├── Dockerfile
│       ├── index.html
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   └── shared/                     # Shared data contracts (Zod schemas & TypeScript types)
│
├── scripts/
│   ├── klypup-cli.mjs              # Standalone Node.js Shell CLI & REPL
│   └── setup-db.sh                 # Database migration & seed helper
│
├── image.png                       # High-level architecture & API flow diagram
├── .env.example                    # Monorepo environment variable template
├── docker-compose.yml              # Local Postgres & Redis containers
└── package.json                    # Monorepo root configuration & npm workspaces
```

---

## 4. Layered Backend Design (N-Tier)

Every module under `apps/api/src/modules/` enforces a strict six-layer separation of concerns:

```
HTTP Request
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  Routes (routes/)                                           │
│  Maps HTTP verbs → controller actions.                      │
│  Registers per-route middleware (auth, RBAC, Zod validate). │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Controller (controller/)                                   │
│  Express boundary layer. Parses req params/body/query.      │
│  Extracts { userId, organizationId, role } from req.user.   │
│  Calls service, formats JSON response. No direct DB access. │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Service (service/)                                         │
│  Core business logic & AI orchestration.                    │
│  Integrates: SEC EDGAR, Gemini API, Finnhub, Yahoo Finance, │
│  in-memory cache reads/writes, and WebSocket broadcasting.  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Repository (repository/)                                   │
│  Data-access only. All Prisma queries live here.            │
│  Always scoped by organizationId for tenant isolation.      │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Schema (schema/)                                           │
│  Zod schemas for request payload validation.                │
│  Shared schemas imported from packages/shared.              │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Security & Multi-Tenancy

* **Logical Tenant Isolation**: Every tenant-scoped entity carries an `organizationId`. Queries must enforce `WHERE organizationId = ?` sourced from verified JWT claims.
* **Role-Based Access Control (RBAC)**:
  * `ADMIN`: Full CRUD on workspace resources, user roles, and team invites.
  * `ANALYST`: Create/edit research runs, manage watchlists, run comparisons.
  * `VIEWER`: Read-only access to published reports, financial matrices, and feeds.
* **Strict Grounding**: Gemini is constrained to verified SEC fact payloads, eliminating numerical hallucination in GAAP financial metrics.
