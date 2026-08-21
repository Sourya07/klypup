# Klypup — AI Investment Research & Finance Controller Platform

> **Multi-tenant AI Financial Intelligence SaaS** for automated equity research and financial controller operations. Analysts and financial controllers can generate deep-dive SEC-grounded reports, execute live quantitative analysis via an in-app **Bloomberg-style Quant Terminal**, track watchlists with real-time price feeds, benchmark companies side-by-side, and collaborate securely within org-scoped workspaces.

> [!NOTE]
> **⚡ Serverless Cold-Starts**: If running or deployed on on-demand/serverless infrastructure (e.g., Neon Serverless PostgreSQL or free-tier hosting), the server and database connection pool will spin down during inactivity. Please allow **3–5 seconds on the very first API request** for the serverless container to wake up.

---

## Features at a Glance

| Feature | Description |
|---|---|
| **☁️ Cloud-Aesthetic Landing Showcase** | High-performance Onyx-inspired landing interface with atmospheric cloud canvas (`/cloud.jpg`), 3-second auto-rotating live mockup preview (`Valuation & Trade`, `Markets`, `Portfolio`, `Activity`), and self-contained **Auth Modal Card** with 1-click **Fast Track Developer Demo**. |
| **🤖 Floating Agentic AI Controller Bot** | Persistent, floating AI copilot widget (`Ctrl + Shift + C`) accessible across the entire application. Executes live multi-step SEC 10-K audits, DuPont 3-step ROE decompositions, and balance sheet stress tests with step-by-step agentic progress checkpoints. |
| **🚨 Financial Risk & Red Flag Auditor** | Automated GAAP accounting audit flagging accrual anomalies, debt-to-equity leverage stress, margin contraction risks, and calculating a composite **Controller Health Score (0-100)**. |
| **💬 "Ask the Controller" Copilot** | Agentic conversational copilot grounded in SEC 10-K filings. Answers corporate accounting queries, performs DuPont 3-step ROE breakdowns, and analyzes balance sheet liabilities without hallucinations. |
| **AI Research Engine** | Deep corporate financial analysis via **Google Gemini (`gemini-3.6-flash`)**. Generates structured reports with verified citations from official SEC EDGAR 10-K/10-Q filings and live market data. |
| **Quant Web Terminal** | In-app, keyboard-first Bloomberg-style terminal drawer (`Ctrl + ~`) with custom color themes, live trade polling, autocompletion, and direct report dispatching. |
| **Standalone Shell CLI** | Native Node.js CLI (`npm run cli`) for querying quotes, inspecting SEC filings, comparing tickers, and running interactive REPL sessions directly in the terminal. |
| **Live Watchlist** | Real-time price tracking via Finnhub WebSocket connection, buffered in-memory (15-min TTL) with REST fallback. |
| **Company Comparisons & CSV Export** | Multi-company financial matrices benchmarking P/E multiples, Diluted EPS, YoY Revenue Growth, Profit Margin, and Debt/Equity leverage with 1-click CSV spreadsheet export. |
| **Real-Time WebSocket Updates** | Co-hosted WebSocket server broadcasts `STOCK_UPDATE` events to all connected browser clients instantly. |
| **Multi-Tenancy & RBAC** | Organization-level data isolation via `organizationId`. Roles: `ADMIN`, `ANALYST`, `VIEWER`. |
| **Audited SEC Citations** | Eliminates AI hallucinations by grounding all balance sheet and financial claims with direct links to SEC EDGAR filing payloads. |

---

## Tech Stack

### Backend (`apps/api`)
| Layer | Technology |
|---|---|
| Server | Node.js · Express · TypeScript |
| ORM | Prisma |
| Database | Neon Serverless PostgreSQL |
| Auth | JWT (RS256) |
| Real-time | `ws` WebSocket Server & Finnhub WS Client |
| AI | Google Gemini API (`gemini-3.6-flash`) |
| Financial Data | Finnhub WebSocket/REST · Yahoo Finance API · SEC EDGAR (`data.sec.gov`) |

### Frontend (`apps/web`)
| Layer | Technology |
|---|---|
| Framework | React 18 · TypeScript · Vite |
| Styling | Tailwind CSS (Dark/Light Modes + Quant Monospace Themes) |
| Quant Terminal | `TerminalDrawer` (Custom REPL, Themes, History & Tab Autocomplete) |
| Data Fetching | TanStack Query (React Query) |
| HTTP Client | Axios |
| Global State | Zustand |
| Real-time | WebSocketContext (Native Browser WS) |

### Shared / CLI / Infrastructure
| Layer | Technology |
|---|---|
| Shared Package | `packages/shared` — Zod schemas + TS types (client & server) |
| CLI Tool | `scripts/klypup-cli.mjs` — Native Node.js Readline + ANSI Box-Drawing |
| Containers | Docker · Docker Compose |
| CI/CD | GitHub Actions |

---

## Quant Terminal & CLI Interfaces

Klypup provides two dedicated terminal interfaces for fast, keyboard-first workflows:

### 1. In-App Bloomberg-Style Web Terminal
* **Open Terminal**: Press **`Ctrl + ` `** (or **`Cmd + ` `**) anywhere in the web app, or click the **`[>_ Quant Terminal]`** launcher.
* **Available Commands**:
  * `quote <TICKER>` — Live market snapshot & equity card (e.g. `quote NVDA`)
  * `research <TICKER> [focus prompt]` — Trigger Gemini AI research and stream the complete financial report directly into the terminal window
  * `compare <T1> <T2> [T3...]` — Render side-by-side comparative financial matrix
  * `sec <TICKER>` — Inspect SEC EDGAR 10-K/10-Q filing registry & CIK mapping
  * `watchlist [list|add|rm] <TICKER>` — Inspect or modify the organization's real-time watchlist
  * `theme [matrix|amber|cyan|slate]` — Switch terminal color theme
  * `clear` / `help` / `exit`

### 2. Standalone Shell CLI
Run quantitative commands directly from your local terminal shell without extra dependencies:

```bash
# View CLI manual
npm run cli -- --help

# Live quote snapshot
npm run cli quote NVDA

# Compare multiple companies in ASCII matrix
npm run cli compare AAPL MSFT NVDA

# Inspect verified SEC EDGAR filings
npm run cli sec TSLA

# Launch interactive terminal REPL shell
npm run cli interactive
```

---

## Getting Started

### Prerequisites

- **Node.js** v18+
- **Neon PostgreSQL** database (or local Docker Postgres)
- **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/app/apikey))

### 1. Clone & Install

```bash
git clone https://github.com/Sourya07/klypup.git
cd klypup
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Fill in your configuration:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon Serverless PostgreSQL connection string |
| `DIRECT_URL` | Direct connection URL for Prisma migrations |
| `JWT_SECRET` | Min. 32-char secret for JWT signing |
| `GEMINI_API_KEY` | Google Gemini API key (`gemini-3.6-flash`) |
| `FINNHUB_API_KEY` | Finnhub API key for live trade WebSocket feeds |
| `SEC_USER_AGENT` | Identifying `User-Agent` header for SEC EDGAR requests |
| `VITE_API_URL` | Frontend → Backend API base URL (`http://localhost:8000/api/v1`) |

### 3. Database Setup

```bash
npm run db:setup      # Pushes schema to Neon PostgreSQL
npm run db:seed       # Seeds default organization, users, and reports
```

### 4. Run in Development

```bash
npm run dev           # Starts both API (port 8000) and Web App (port 5173) concurrently
```

| Service | URL |
|---|---|
| REST API | `http://localhost:8000/api/v1` |
| WebSocket | `ws://localhost:8000` |
| Web App | `http://localhost:5173` |

---

## Security & Multi-Tenancy

- **Logical Tenant Isolation**: Every database query is strictly scoped by `organizationId` from validated JWT claims.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions (`ADMIN`, `ANALYST`, `VIEWER`) enforced via Express middleware.
- **Strict Anti-Hallucination Grounding**: Fact payloads are retrieved and verified against SEC EDGAR before triggering Gemini synthesis.

---

## License

ISC — see [LICENSE](./LICENSE) for details.
