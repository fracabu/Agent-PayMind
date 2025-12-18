<p align="center">
  <img src="https://img.shields.io/badge/PayMind-AI%20Payment%20System-blue?style=for-the-badge&logo=anthropic" alt="PayMind">
</p>

<h1 align="center">💰 PayMind</h1>

<p align="center">
  <strong>AI-Powered Payment Reminder System</strong>
</p>

<p align="center">
  <a href="#-italiano">Italiano</a> •
  <a href="#-english">English</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Claude-Sonnet%204-orange?style=flat-square&logo=anthropic" alt="Claude">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License">
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/fracabu/Agent-PayMind?style=social" alt="Stars">
  <img src="https://img.shields.io/github/forks/fracabu/Agent-PayMind?style=social" alt="Forks">
</p>

---

## 🇮🇹 Italiano

### Panoramica

**PayMind** è un sistema intelligente di gestione automatica dei solleciti di pagamento basato su **Agenti AI Claude Code**. Utilizza tre agenti specializzati che lavorano in team per analizzare fatture, generare messaggi personalizzati e gestire le risposte dei clienti.

### ✨ Caratteristiche

| Funzionalità | Descrizione |
|--------------|-------------|
| 🤖 **3 Agenti AI Specializzati** | Team di agenti che collaborano per gestire l'intero workflow |
| 📊 **Analisi Intelligente** | Identifica fatture scadute, calcola priorità e segmenta clienti |
| 📧 **Multi-Canale** | Genera messaggi per Email, SMS e WhatsApp |
| 💬 **NLP Avanzato** | Analizza risposte con intent recognition e sentiment analysis |
| 🎨 **Dashboard Moderna** | Interfaccia Next.js per visualizzare workflow in tempo reale |
| 🔌 **Multi-Provider AI** | Supporta Anthropic, OpenAI, OpenRouter e Google Gemini |
| 🗄️ **Database SQLite** | Persistenza dati con Prisma ORM |
| 🌙 **Dark/Light Mode** | Toggle tra tema scuro e chiaro |
| 🌍 **Bilingue** | Supporto completo Italiano e Inglese |

### 🤖 Gli Agenti

```
┌─────────────────────────────────────────────────────────────────┐
│                        PAYMIND WORKFLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📄 CSV ──▶ [📊 Payment Monitor] ──▶ Report Analisi             │
│                      │                                           │
│                      ▼                                           │
│              [📧 Reminder Generator] ──▶ Email/SMS/WhatsApp     │
│                      │                                           │
│                      ▼                                           │
│              [💬 Response Handler] ──▶ Azioni Suggerite         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

| Agente | Funzione | Output |
|--------|----------|--------|
| **Payment Monitor** | Analizza CSV, identifica scadute, calcola priorità | Report con metriche e segmentazione |
| **Reminder Generator** | Genera messaggi personalizzati per canale | Email formali, SMS concisi, WhatsApp friendly |
| **Response Handler** | Analizza risposte, identifica intent | Azioni suggerite + bozza risposta |

### 🚀 Quick Start

#### Prerequisiti

- [Claude Code CLI](https://claude.ai/code) installato
- Node.js 18+ (per la dashboard)
- Account Anthropic attivo

#### Installazione

```bash
# Clone repository
git clone https://github.com/fracabu/Agent-PayMind.git
cd Agent-PayMind

# Avvia dashboard
cd dashboard
npm install
npm run dev
```

#### Utilizzo CLI (Agenti Reali)

```bash
# Analizza fatture
claude "payment-monitor-agent: analizza invoices.csv"

# Genera solleciti
claude "reminder-generator-agent: genera email per FAT-2025-001"

# Analizza risposta
claude "response-handler-agent: analizza questa risposta: [testo]"
```

#### Utilizzo Dashboard

1. Apri `http://localhost:3000`
2. Clicca **"Carica CSV"** e seleziona il file fatture
3. Clicca **"Avvia Workflow"** per vedere gli agenti in azione
4. Visualizza gli output nella sezione **"Output Agenti"**

### 📁 Struttura Progetto

```
Agent-PayMind/
├── .claude/agents/          # Definizioni agenti AI
│   ├── payment-monitor-agent.md
│   ├── reminder-generator-agent.md
│   └── response-handler-agent.md
├── dashboard/               # Next.js Dashboard
│   ├── src/
│   │   ├── app/            # App Router
│   │   ├── components/     # React Components
│   │   ├── lib/            # State Management
│   │   └── types/          # TypeScript Types
│   └── package.json
├── invoices.csv             # File esempio fatture
├── CLAUDE.md                # Guida per Claude Code
└── README.md
```

### 🛠️ Tech Stack

| Tecnologia | Utilizzo |
|------------|----------|
| **Multi-Provider AI** | Claude, GPT, Gemini via OpenRouter |
| **Next.js 16** | Dashboard Framework (App Router) |
| **TypeScript 5** | Type Safety |
| **Tailwind CSS 4** | Styling + Dark Mode (class-based) |
| **Zustand** | State Management + localStorage persistence |
| **Prisma + SQLite** | Database ORM |
| **Lucide React** | Icone |

### 📋 Formato CSV

```csv
invoice_id,customer_name,amount_total,amount_paid,due_date,status,preferred_channel,customer_email,customer_phone
FAT-2025-001,ACME SpA,2450.00,0.00,2025-09-15,open,email,contabilita@acme.it,+393401234567
```

### 🔌 OpenRouter - 18+ Modelli AI

PayMind supporta **OpenRouter** per accedere a 18+ modelli da diversi provider con una sola API key.

#### 🆓 Modelli GRATUITI

| Modello | Provider | Ideale per |
|---------|----------|------------|
| Gemini 2.0 Flash | Google | Uso generale (**Default**) |
| DeepSeek R1 | DeepSeek | Ragionamento |
| Llama 3.3 70B | Meta | Risposte di qualità |
| Devstral | Mistral | Coding |
| Mistral Small 3.1 | Mistral | Risposte veloci |

#### 💰 Modelli a Pagamento (prezzo per 1M token)

| Modello | Input | Output |
|---------|-------|--------|
| Gemini 2.5 Pro | $1.25 | $10 |
| Claude Sonnet 4 | $3 | $15 |
| Claude 3.5 Haiku | $0.80 | $4 |
| GPT-4o | $2.50 | $10 |
| GPT-4o Mini | $0.15 | $0.60 |
| DeepSeek V3.2 | $0.26 | $0.38 |
| Llama 4 Scout | $0.08 | $0.30 |

### ⚙️ Variabili d'Ambiente

Crea `dashboard/.env`:
```env
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...           # Opzionale
OPENROUTER_API_KEY=...          # Opzionale - accesso a 18+ modelli!
GEMINI_API_KEY=...              # Opzionale
```

---

## 🇬🇧 English

### Overview

**PayMind** is an intelligent automated payment reminder management system powered by **Claude Code AI Agents**. It uses three specialized agents working as a team to analyze invoices, generate personalized messages, and handle customer responses.

### ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **3 Specialized AI Agents** | Team of agents collaborating to manage the entire workflow |
| 📊 **Smart Analysis** | Identifies overdue invoices, calculates priorities, segments customers |
| 📧 **Multi-Channel** | Generates messages for Email, SMS, and WhatsApp |
| 💬 **Advanced NLP** | Analyzes responses with intent recognition and sentiment analysis |
| 🎨 **Modern Dashboard** | Next.js interface for real-time workflow visualization |
| 🔌 **Multi-Provider AI** | Supports Anthropic, OpenAI, OpenRouter, and Google Gemini |
| 🗄️ **SQLite Database** | Data persistence with Prisma ORM |
| 🌙 **Dark/Light Mode** | Toggle between dark and light themes |
| 🌍 **Bilingual** | Full support for Italian and English |

### 🤖 The Agents

| Agent | Function | Output |
|-------|----------|--------|
| **Payment Monitor** | Analyzes CSV, identifies overdue, calculates priority | Report with metrics and segmentation |
| **Reminder Generator** | Generates channel-specific personalized messages | Formal emails, concise SMS, friendly WhatsApp |
| **Response Handler** | Analyzes responses, identifies intent | Suggested actions + draft response |

### 🚀 Quick Start

#### Prerequisites

- [Claude Code CLI](https://claude.ai/code) installed
- Node.js 18+ (for dashboard)
- Active Anthropic account

#### Installation

```bash
# Clone repository
git clone https://github.com/fracabu/Agent-PayMind.git
cd Agent-PayMind

# Start dashboard
cd dashboard
npm install
npm run dev
```

#### CLI Usage (Real Agents)

```bash
# Analyze invoices
claude "payment-monitor-agent: analyze invoices.csv"

# Generate reminders
claude "reminder-generator-agent: generate email for FAT-2025-001"

# Analyze response
claude "response-handler-agent: analyze this response: [text]"
```

#### Dashboard Usage

1. Open `http://localhost:3000`
2. Click **"Carica CSV"** and select invoice file
3. Click **"Avvia Workflow"** to see agents in action
4. View outputs in **"Output Agenti"** section

### 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Multi-Provider AI** | Claude, GPT, Gemini via OpenRouter |
| **Next.js 16** | Dashboard Framework (App Router) |
| **TypeScript 5** | Type Safety |
| **Tailwind CSS 4** | Styling + Dark Mode (class-based) |
| **Zustand** | State Management + localStorage persistence |
| **Prisma + SQLite** | Database ORM |
| **Lucide React** | Icons |

### 📊 Priority Levels

| Priority | Criteria | Action |
|----------|----------|--------|
| 🔴 **ALTA** | >90 days overdue OR >€1,000 OR disputed | Immediate contact |
| 🟠 **MEDIA** | 60-90 days overdue | Follow-up within 48h |
| ⚪ **BASSA** | <60 days overdue | Standard reminder |

### 🔌 OpenRouter - 18+ AI Models

PayMind supports **OpenRouter** to access 18+ models from multiple providers with a single API key.

#### 🆓 FREE Models

| Model | Provider | Best For |
|-------|----------|----------|
| Gemini 2.0 Flash | Google | General purpose (**Default**) |
| DeepSeek R1 | DeepSeek | Reasoning tasks |
| Llama 3.3 70B | Meta | High-quality responses |
| Devstral | Mistral | Coding tasks |
| Mistral Small 3.1 | Mistral | Fast responses |

#### 💰 Paid Models (price per 1M tokens)

| Model | Input | Output |
|-------|-------|--------|
| Gemini 2.5 Pro | $1.25 | $10 |
| Claude Sonnet 4 | $3 | $15 |
| Claude 3.5 Haiku | $0.80 | $4 |
| GPT-4o | $2.50 | $10 |
| GPT-4o Mini | $0.15 | $0.60 |
| DeepSeek V3.2 | $0.26 | $0.38 |
| Llama 4 Scout | $0.08 | $0.30 |

### ⚙️ Environment Variables

Create `dashboard/.env`:
```env
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...           # Optional
OPENROUTER_API_KEY=...          # Optional - access to 18+ models!
GEMINI_API_KEY=...              # Optional
```

### 🔒 Security

- `.env` files protected via `.gitignore`
- No API keys in repository
- Generated messages excluded from git
- CSV data files not committed

---

## 📈 Roadmap

- [x] Real AI API integration in dashboard (Multi-provider)
- [x] SQLite database with Prisma
- [x] Dark/Light mode toggle
- [x] Bilingual support (IT/EN)
- [x] OpenRouter integration with 18+ models (5 FREE!)
- [ ] Email sending via SMTP
- [ ] WhatsApp Business API integration
- [ ] PDF report export
- [ ] Multi-tenant support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

- GitHub: [@fracabu](https://github.com/fracabu)

---

<p align="center">
  Made with ❤️ and 🤖 Claude Code AI
</p>

<p align="center">
  <a href="https://claude.ai/code">
    <img src="https://img.shields.io/badge/Powered%20by-Claude%20Code-orange?style=for-the-badge&logo=anthropic" alt="Powered by Claude Code">
  </a>
</p>
