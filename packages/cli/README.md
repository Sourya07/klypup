# Klypup CLI — Autonomous AI Financial Controller & Quant Terminal

> A terminal command-line interface for quant analysis, real-time equity quotes, SEC EDGAR 10-K filings, DuPont 3-Step ROE breakdowns, and automated financial controller auditing.

---

## ⚡ Instant Usage via NPX (No Installation Required)

Anyone with Node.js can run the Klypup Terminal directly from their command line:

```bash
# Instant Quote Snapshot
npx klypup quote NVDA

# AI Financial Controller Copilot Audit
npx klypup ask AAPL "What is the DuPont 3-Step ROE breakdown?"

# Automated Accounting Red Flag & Solvency Audit
npx klypup audit MSFT

# Multi-Company Valuation & Solvency Matrix
npx klypup compare NVDA AMD INTC

# Query U.S. SEC EDGAR 10-K / 10-Q Registry
npx klypup sec TSLA

# Launch Interactive Bloomberg-Style Terminal REPL
npx klypup interactive
```

---

## 📦 Global Installation

```bash
npm install -g klypup

# Run directly:
klypup quote AAPL
klypup interactive
```

---

## ⌨️ Interactive Bloomberg REPL Commands

When running `npx klypup interactive`:

| Command | Description | Example |
|---|---|---|
| `quote <TICKER>` | Live quote snapshot & market telemetry | `quote NVDA` |
| `ask <TICKER> [Q]` | Query AI Financial Controller Copilot | `ask AAPL DuPont ROE` |
| `audit <TICKER>` | Financial Risk & Health Score (0-100) | `audit MSFT` |
| `compare <T1> <T2>` | Multi-equity benchmarking matrix | `compare AAPL MSFT NVDA` |
| `sec <TICKER>` | Inspect SEC EDGAR 10-K filings | `sec GOOGL` |
| `research <TICKER>` | Simulate full equity research run | `research TSLA` |
| `clear` / `help` / `exit` | Terminal controls | `help` |

---

## 📄 License
MIT © [Sourya](https://github.com/Sourya07/klypup)
