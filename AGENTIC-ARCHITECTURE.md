# Agentic Application Architecture

This document describes the architecture pattern used in PayMind for building AI-powered agentic applications. It can be replicated for other projects.

## Overview

The architecture consists of:
1. **CLI Agents** - Claude Code agents defined in `.claude/agents/`
2. **Dashboard** - Next.js web interface for visualization and control
3. **Multi-Provider AI** - Abstraction layer supporting multiple AI providers
4. **Workflow Engine** - Sequential/parallel agent orchestration

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AGENTIC ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │   Agent 1   │───▶│   Agent 2   │───▶│   Agent 3   │                 │
│  │  (Analyze)  │    │  (Generate) │    │  (Process)  │                 │
│  └─────────────┘    └─────────────┘    └─────────────┘                 │
│         │                  │                  │                         │
│         ▼                  ▼                  ▼                         │
│  ┌─────────────────────────────────────────────────────┐               │
│  │              Zustand Store (State)                   │               │
│  │  - Agent states, logs, results, settings            │               │
│  └─────────────────────────────────────────────────────┘               │
│         │                  │                  │                         │
│         ▼                  ▼                  ▼                         │
│  ┌─────────────────────────────────────────────────────┐               │
│  │              Next.js API Routes                      │               │
│  │  /api/agents/*  /api/workflow-runs  /api/settings   │               │
│  └─────────────────────────────────────────────────────┘               │
│         │                                                               │
│         ▼                                                               │
│  ┌─────────────────────────────────────────────────────┐               │
│  │           AI Provider Abstraction Layer             │               │
│  │  Anthropic | OpenAI | OpenRouter | Gemini           │               │
│  └─────────────────────────────────────────────────────┘               │
│         │                                                               │
│         ▼                                                               │
│  ┌─────────────────────────────────────────────────────┐               │
│  │              Prisma + SQLite Database               │               │
│  │  Invoices | Messages | WorkflowRuns | Logs          │               │
│  └─────────────────────────────────────────────────────┘               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
project/
├── .claude/
│   └── agents/                    # Claude Code agent definitions
│       ├── agent-1.md             # Agent 1 system prompt & instructions
│       ├── agent-2.md             # Agent 2 system prompt & instructions
│       └── agent-3.md             # Agent 3 system prompt & instructions
├── dashboard/
│   ├── prisma/
│   │   └── schema.prisma          # Database models
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── agents/        # Agent API endpoints
│   │   │   │   │   ├── agent-1/route.ts
│   │   │   │   │   ├── agent-2/route.ts
│   │   │   │   │   └── agent-3/route.ts
│   │   │   │   ├── workflow-runs/route.ts  # Workflow history
│   │   │   │   └── settings/route.ts       # AI settings
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx           # Main dashboard
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── AgentCard.tsx      # Agent status display
│   │   │   ├── WorkflowTimeline.tsx
│   │   │   ├── WorkflowHistory.tsx
│   │   │   ├── LogsPanel.tsx
│   │   │   └── SettingsModal.tsx
│   │   ├── lib/
│   │   │   ├── ai-providers.ts    # Multi-provider abstraction
│   │   │   ├── agents.ts          # Agent system prompts
│   │   │   ├── store.ts           # Zustand global state
│   │   │   ├── i18n.ts            # Internationalization
│   │   │   └── prisma.ts          # Prisma client
│   │   └── types/
│   │       └── index.ts           # TypeScript interfaces
│   └── package.json
├── CLAUDE.md                      # Claude Code instructions
└── README.md
```

## Key Components

### 1. Agent Definition (`.claude/agents/*.md`)

Each agent is a Markdown file with:
- **Role description** - What the agent does
- **Input format** - Expected input data
- **Output format** - Structured output specification
- **System prompt** - Detailed instructions

Example structure:
```markdown
# Agent Name

## Role
[Description of what this agent does]

## Input
[Expected input format]

## Output Format
[Structured output specification - JSON, text, etc.]

## Instructions
[Detailed step-by-step instructions for the agent]
```

### 2. AI Provider Abstraction (`lib/ai-providers.ts`)

Unified interface for multiple AI providers:

```typescript
interface AIProvider {
  id: string;
  name: string;
  models: string[];
  requiresKey: boolean;
}

async function callAI(
  provider: string,
  model: string,
  systemPrompt: string,
  userMessage: string,
  apiKey?: string
): Promise<{ content: string; tokensUsed?: number }>
```

Supported providers:
- **Anthropic** - Claude models (claude-sonnet-4, claude-opus-4, etc.)
- **OpenAI** - GPT models (gpt-4o, gpt-4-turbo, etc.)
- **OpenRouter** - Unified gateway to multiple providers
- **Google Gemini** - Gemini models

### 3. Zustand Store (`lib/store.ts`)

Global state management with localStorage persistence:

```typescript
interface AppState {
  // Agent states
  agents: Agent[];
  setAgentStatus: (id: string, status: Status) => void;

  // Workflow
  workflowSteps: WorkflowStep[];
  currentStep: number;
  isWorkflowRunning: boolean;

  // Results
  analysisResult: AnalysisResult | null;
  generatedMessages: Message[];

  // Settings
  aiSettings: { provider: string; model: string; apiKey?: string };
  theme: 'light' | 'dark';
  language: 'it' | 'en';

  // Logs
  logs: LogEntry[];
  addLog: (log: LogEntry) => void;
}

// Persistence configuration
persist(store, {
  name: 'app-storage',
  partialize: (state) => ({
    // Select which state to persist
    aiSettings: state.aiSettings,
    theme: state.theme,
    language: state.language,
  }),
});
```

### 4. API Route Pattern (`app/api/agents/*/route.ts`)

Each agent has a dedicated API endpoint:

```typescript
export async function POST(request: NextRequest) {
  const { provider, model, apiKey } = await request.json();

  // 1. Fetch data from database
  const data = await prisma.model.findMany();

  // 2. Build prompt with data context
  const systemPrompt = AGENT_SYSTEM_PROMPT;
  const userMessage = formatDataForAgent(data);

  // 3. Call AI provider
  const response = await callAI(provider, model, systemPrompt, userMessage, apiKey);

  // 4. Parse and validate response
  const result = parseAgentResponse(response.content);

  // 5. Save to database (optional)
  await prisma.result.create({ data: result });

  // 6. Return structured response
  return NextResponse.json({ result, tokensUsed: response.tokensUsed });
}
```

### 5. Workflow Orchestration

The main page orchestrates agents sequentially:

```typescript
const runWorkflow = async () => {
  setWorkflowRunning(true);

  try {
    // Step 1: Agent 1
    setAgentStatus('agent-1', 'running');
    const result1 = await fetch('/api/agents/agent-1', { method: 'POST', ... });
    setAgentStatus('agent-1', 'completed');

    // Step 2: Agent 2 (uses output from Agent 1)
    setAgentStatus('agent-2', 'running');
    const result2 = await fetch('/api/agents/agent-2', { method: 'POST', ... });
    setAgentStatus('agent-2', 'completed');

    // Step 3: Agent 3
    setAgentStatus('agent-3', 'running');
    const result3 = await fetch('/api/agents/agent-3', { method: 'POST', ... });
    setAgentStatus('agent-3', 'completed');

    // Save workflow run
    await saveWorkflowRun({ result1, result2, result3 });

  } catch (error) {
    handleError(error);
  } finally {
    setWorkflowRunning(false);
  }
};
```

### 6. Database Schema Pattern (`prisma/schema.prisma`)

```prisma
// Core domain model
model Entity {
  id        String   @id @default(cuid())
  // ... domain fields
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Workflow tracking
model WorkflowRun {
  id              String   @id @default(cuid())
  status          String   // running, completed, failed
  aiProvider      String?
  aiModel         String?
  // Store full results as JSON strings
  analysisReport  String?
  generatedData   String?  // JSON
  startedAt       DateTime @default(now())
  completedAt     DateTime?
  logs            WorkflowLog[]
}

model WorkflowLog {
  id         String      @id @default(cuid())
  workflowId String
  workflow   WorkflowRun @relation(fields: [workflowId], references: [id])
  agent      String
  message    String
  type       String      // info, success, warning, error
  timestamp  DateTime    @default(now())
}
```

## Feature Patterns

### Export Results

```typescript
const handleExport = () => {
  const data = {
    exportDate: new Date().toISOString(),
    results: currentResults,
    // ... other data
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `export-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
```

### Workflow History

```typescript
// Save to history
await fetch('/api/workflow-runs', {
  method: 'POST',
  body: JSON.stringify({
    status: 'completed',
    analysisReport,
    generatedData: JSON.stringify(messages),
  }),
});

// Load from history
const handleLoadRun = (run) => {
  setAnalysisResult(run.analysisReport);
  setGeneratedMessages(JSON.parse(run.generatedData));
};
```

### Dark Mode (Tailwind v4)

```css
/* globals.css */
@import "tailwindcss";
@custom-variant dark (&:is(.dark *));

:root {
  --background: #f9fafb;
  --foreground: #111827;
}

.dark {
  --background: #111827;
  --foreground: #f9fafb;
}
```

```typescript
// Theme toggle
const toggleTheme = () => {
  const newTheme = theme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  document.documentElement.classList.toggle('dark', newTheme === 'dark');
};
```

### Internationalization

```typescript
// lib/i18n.ts
export const translations = {
  it: { key: 'Valore italiano' },
  en: { key: 'English value' },
};

export function useTranslation(language: Language) {
  const dict = translations[language];
  return {
    t: (key: TranslationKey) => dict[key] || key,
  };
}
```

## Replication Checklist

To create a new agentic application:

1. **Define agents** in `.claude/agents/` with clear roles and output formats
2. **Create database schema** with domain models and WorkflowRun tracking
3. **Implement AI provider abstraction** or copy from this project
4. **Build API routes** for each agent
5. **Create Zustand store** with agent states, results, and settings
6. **Build dashboard components**: AgentCard, WorkflowTimeline, LogsPanel
7. **Implement workflow orchestration** in main page
8. **Add export/history features** for result persistence
9. **Configure i18n** if multi-language support needed
10. **Set up dark mode** with Tailwind v4 custom variant

## Environment Variables

```env
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...           # Optional
OPENROUTER_API_KEY=...          # Optional
GEMINI_API_KEY=...              # Optional
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| State | Zustand + localStorage |
| Database | Prisma + SQLite |
| AI | Multi-provider (Anthropic, OpenAI, etc.) |
| Icons | Lucide React |
