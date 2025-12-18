# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PayMind is an AI-powered payment reminder system with two interfaces:
1. **CLI Agents** - Three specialized Claude Code agents for invoice analysis, message generation, and response handling
2. **Next.js Dashboard** - Web interface for visualizing workflows and managing invoices with real AI integration

## Architecture

### Agent Workflow

```
CSV Upload → [Payment Monitor] → Analysis Report
                    ↓
            [Reminder Generator] → Email/SMS/WhatsApp messages
                    ↓
            [Response Handler] → Intent analysis + Suggested actions
```

### CLI Agents (`.claude/agents/`)

| Agent | Purpose | Output |
|-------|---------|--------|
| **payment-monitor-agent** | Analyzes CSV, identifies overdue invoices, calculates priority | Report with metrics and segmentation |
| **reminder-generator-agent** | Generates personalized messages for Email/SMS/WhatsApp | Channel-appropriate reminder messages |
| **response-handler-agent** | Analyzes customer responses, identifies intent | Actions + draft response |

### Dashboard (`dashboard/`)

Next.js 16.0.10 application with App Router:
- **State**: Zustand store with localStorage persistence (`src/lib/store.ts`)
- **Database**: Prisma with SQLite (`prisma/schema.prisma`)
- **AI Integration**: Multi-provider abstraction via `callAI()` (`src/lib/ai-providers.ts`)
- **API Routes**: REST endpoints at `src/app/api/`
- **Theme**: Dark/light mode toggle persisted in Zustand (uses `.dark` class on `<html>`)
- **i18n**: Italian/English UI toggle (language stored in Zustand)
- **Styling**: Tailwind CSS v4 with `@custom-variant dark (&:is(.dark *))` for manual dark mode

### Data Flow

1. **Frontend** → Zustand store manages UI state (agents, invoices, workflow steps, logs, theme, language)
2. **API Routes** → Fetch invoices from Prisma DB, call AI provider, return analysis
3. **AI Providers** → Unified interface supporting Anthropic, OpenAI, OpenRouter, Gemini

### Zustand Persistence

The store persists to localStorage (`paymind-storage`): invoices, analysisResult, generatedMessages, responseAnalysis, aiSettings, theme, language, and visibility flags.

## Commands

```bash
# Dashboard development
cd dashboard
npm install
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build
npm run lint         # ESLint

# Database setup
npx prisma db push   # Apply schema to SQLite
npx prisma studio    # Database GUI

# CLI agent invocation
claude "payment-monitor-agent: analizza invoices.csv"
claude "reminder-generator-agent: genera email per FAT-2025-001"
claude "response-handler-agent: analizza questa risposta: [text]"
```

## Environment Variables

Create `dashboard/.env`:
```
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...           # Optional
OPENROUTER_API_KEY=...          # Optional
GEMINI_API_KEY=...              # Optional
```

## Priority Calculation

| Priority | Criteria |
|----------|----------|
| **ALTA** | >90 days overdue OR amount >€1,000 OR disputed status |
| **MEDIA** | 60-90 days overdue |
| **BASSA** | <60 days overdue |

## Response Handler Intents

The response handler recognizes these customer intents:
- `payment_confirmed` - Customer confirms payment was made
- `request_info` - Customer requests invoice copy or details
- `dispute` - Customer disputes the invoice
- `request_delay` - Customer requests payment extension/installments
- `payment_promise` - Customer promises to pay by specific date
- `already_paid` - Customer claims already paid
- `error_invoice` - Customer reports invoice error

## CSV Invoice Format

Required columns: `invoice_id`, `customer_name`, `amount_total`, `amount_paid`, `due_date`, `status` (open/paid/disputed), `preferred_channel` (email/sms/whatsapp), `customer_email`, `customer_phone`

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/agents/payment-monitor` | POST | Run invoice analysis |
| `/api/agents/reminder-generator` | POST | Generate reminder messages |
| `/api/agents/response-handler` | POST | Analyze customer response |
| `/api/invoices` | GET/POST/DELETE | CRUD for invoices |
| `/api/settings` | GET/POST | AI provider settings |
| `/api/workflow-runs` | GET/POST/DELETE | Workflow execution history |

## Dark Mode (Tailwind v4)

The app uses manual theme toggle with the `.dark` class selector, NOT the system `prefers-color-scheme`. Tailwind v4 requires explicit configuration in `globals.css`:

```css
@custom-variant dark (&:is(.dark *));
```

Theme flow:
1. `layout.tsx` injects inline script to read `localStorage('paymind-storage')` and apply `.dark` class before hydration
2. `page.tsx` useEffect syncs theme state to `document.documentElement.classList`
3. Store persists theme to localStorage via Zustand persist middleware

## Key Files

- `dashboard/src/lib/ai-providers.ts` - Multi-provider AI abstraction with `callAI()`, `AVAILABLE_MODELS`, `PROVIDER_INFO`
- `dashboard/src/lib/agents.ts` - System prompts: `PAYMENT_MONITOR_PROMPT`, `REMINDER_GENERATOR_PROMPT`, `RESPONSE_HANDLER_PROMPT`
- `dashboard/src/lib/store.ts` - Global Zustand state including `aiSettings`, `theme`, `language`
- `dashboard/src/lib/i18n.ts` - Translation system with `useTranslation()` hook and `formatMessage()` for parameterized strings
- `dashboard/src/types/index.ts` - TypeScript interfaces: Agent, Invoice, LogEntry, WorkflowStep, AnalysisResult
- `dashboard/prisma/schema.prisma` - Database models: Invoice, Message, ResponseAnalysis, WorkflowRun, WorkflowLog
- `dashboard/src/app/globals.css` - Tailwind v4 config with dark mode custom variant

## Language

Italian business communications. Agent prompts and generated messages use Italian. Dashboard UI supports Italian/English toggle.
