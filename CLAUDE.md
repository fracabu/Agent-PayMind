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

Next.js 16 application with App Router:
- **State**: Zustand store with localStorage persistence (`src/lib/store.ts`)
- **Database**: Prisma with SQLite (`prisma/schema.prisma`)
- **AI Integration**: Multi-provider abstraction via `callAI()` (`src/lib/ai-providers.ts`)
- **API Routes**: REST endpoints for each agent (`src/app/api/agents/*/route.ts`)

### Data Flow

1. **Frontend** → Zustand store manages UI state (agents, invoices, workflow steps, logs)
2. **API Routes** → Fetch invoices from Prisma DB, call AI provider, return analysis
3. **AI Providers** → Unified interface supporting Anthropic, OpenAI, OpenRouter, Gemini

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
| **ALTA** | >90 days overdue OR amount >1,000 OR disputed status |
| **MEDIA** | 60-90 days overdue |
| **BASSA** | <60 days overdue |

## CSV Invoice Format

Required columns: `invoice_id`, `customer_name`, `amount_total`, `amount_paid`, `due_date`, `status` (open/paid/disputed), `preferred_channel` (email/sms/whatsapp), `customer_email`, `customer_phone`

## Key Files

- `dashboard/src/lib/ai-providers.ts` - Multi-provider AI abstraction with `callAI()` function
- `dashboard/src/lib/agents.ts` - System prompts for each agent (PAYMENT_MONITOR_PROMPT, REMINDER_GENERATOR_PROMPT, RESPONSE_HANDLER_PROMPT)
- `dashboard/src/lib/store.ts` - Global state including `aiSettings` for provider/model selection
- `dashboard/src/types/index.ts` - TypeScript interfaces for Agent, Invoice, LogEntry, WorkflowStep
- `dashboard/prisma/schema.prisma` - Database models: Invoice, Message, ResponseAnalysis, WorkflowRun

## Language

Italian business communications. Agent prompts and generated messages use Italian.
