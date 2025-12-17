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
| 💾 **Persistenza Dati** | LocalStorage per mantenere stato tra sessioni |

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

### 📋 Formato CSV

```csv
invoice_id,customer_name,amount_total,amount_paid,due_date,status,preferred_channel,customer_email,customer_phone
FAT-2025-001,ACME SpA,2450.00,0.00,2025-09-15,open,email,contabilita@acme.it,+393401234567
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
| 💾 **Data Persistence** | LocalStorage to maintain state between sessions |

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
| **Claude Sonnet 4** | AI Agent Engine |
| **Next.js 16** | Dashboard Framework |
| **TypeScript** | Type Safety |
| **Tailwind CSS** | Styling |
| **Zustand** | State Management |
| **Lucide React** | Icons |

### 📊 Priority Levels

| Priority | Criteria | Action |
|----------|----------|--------|
| 🔴 **ALTA** | >90 days overdue OR >€1,000 OR disputed | Immediate contact |
| 🟠 **MEDIA** | 60-90 days overdue | Follow-up within 48h |
| ⚪ **BASSA** | <60 days overdue | Standard reminder |

### 🔒 Security

- ✅ `.env` files protected via `.gitignore`
- ✅ No API keys in repository
- ✅ Generated messages excluded from git
- ✅ CSV data files not committed

---

## 📈 Roadmap

- [ ] Real Claude API integration in dashboard
- [ ] SQLite/PostgreSQL database
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

**Francesco Caburlotto**

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
