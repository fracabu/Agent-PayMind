<h1 align="center">💰 PayMind</h1>
<h3 align="center">AI-Powered Payment Reminder System</h3>

<p align="center">
  <em>Autonomous invoice management with Claude AI Agents</em>
</p>

<p align="center">
  <img src="https://github.com/fracabu/Agent-PayMind/actions/workflows/ci.yml/badge.svg" alt="CI" />
  <img src="https://img.shields.io/badge/Claude_AI-8B5CF6?style=flat-square&logo=anthropic&logoColor=white" alt="Claude AI" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js" />
</p>

<p align="center">
  🇬🇧 <a href="#english">English</a> | 🇮🇹 <a href="#italiano">Italiano</a>
</p>

---

## Overview

![PayMind Overview](assets/paymind-overview.png)

> 🎬 **[Video Demo](#)** - Coming soon

---

<a name="english"></a>
## 🇬🇧 English

### What is PayMind?

PayMind uses **autonomous AI agents** to analyze overdue invoices, generate personalized reminder messages for each communication channel (Email, SMS, WhatsApp), and analyze customer responses.

### 🤖 AI Agents

| Agent | Function |
|-------|----------|
| **payment-monitor-agent** | Analyzes CSV invoices, identifies overdue/disputed invoices, segments by priority |
| **reminder-generator-agent** | Generates personalized messages by channel (Email/SMS/WhatsApp) |
| **response-handler-agent** | Analyzes customer responses, identifies intent, suggests actions |

### 🚀 Quick Start

```bash
# Clone
git clone https://github.com/fracabu/Agent-PayMind.git
cd Agent-PayMind

# Use agents (requires Claude Code CLI)
"payment-monitor-agent: analyze invoices.csv and give me a report"
"reminder-generator-agent: generate email for FAT-2025-001"
"response-handler-agent: analyze this response: [paste text]"
```

### 📋 Project Structure

```
Agent-PayMind/
├── .claude/agents/
│   ├── payment-monitor-agent.md      # Invoice analysis
│   ├── reminder-generator-agent.md   # Message generation
│   └── response-handler-agent.md     # Response analysis
├── invoices.csv                      # Sample invoices
└── README.md
```

### ⚡ Workflow

```
📊 Analyze invoices → 🎯 Identify priorities → 📧 Generate messages → 💬 Analyze responses
```

### 🎯 Why AI Agents?

| Feature | Benefit |
|---------|---------|
| **Full Automation** | Process batches autonomously |
| **Speed** | 100 invoices in 30 seconds |
| **Flexibility** | Modifiable in real-time |
| **Control** | Reviewable text output |

### 📈 Roadmap

- [ ] Auto email sending agent
- [ ] WhatsApp Business API integration
- [ ] PDF report export
- [ ] SQLite database for history
- [ ] Analytics dashboard

---

<a name="italiano"></a>
## 🇮🇹 Italiano

### Cos'è PayMind?

PayMind utilizza **agenti AI autonomi** per analizzare fatture scadute, generare messaggi personalizzati per ogni canale di comunicazione (Email, SMS, WhatsApp) e analizzare le risposte dei clienti.

### 🤖 Agenti AI

| Agente | Funzione |
|--------|----------|
| **payment-monitor-agent** | Analizza CSV fatture, identifica scadute/contestate, segmenta per priorità |
| **reminder-generator-agent** | Genera messaggi personalizzati per canale (Email/SMS/WhatsApp) |
| **response-handler-agent** | Analizza risposte clienti, identifica intent, suggerisce azioni |

### 🚀 Quick Start

```bash
# Clone
git clone https://github.com/fracabu/Agent-PayMind.git
cd Agent-PayMind

# Usa gli agenti (richiede Claude Code CLI)
"payment-monitor-agent: analizza invoices.csv e dammi report"
"reminder-generator-agent: genera email per FAT-2025-001"
"response-handler-agent: analizza questa risposta: [incolla testo]"
```

### 📋 Struttura Progetto

```
Agent-PayMind/
├── .claude/agents/
│   ├── payment-monitor-agent.md      # Analisi fatture
│   ├── reminder-generator-agent.md   # Generazione messaggi
│   └── response-handler-agent.md     # Analisi risposte
├── invoices.csv                      # Fatture esempio
└── README.md
```

### ⚡ Workflow

```
📊 Analizza fatture → 🎯 Identifica priorità → 📧 Genera messaggi → 💬 Analizza risposte
```

### 🎯 Perché Agenti AI?

| Caratteristica | Vantaggio |
|----------------|-----------|
| **Automazione Completa** | Processa batch autonomamente |
| **Velocità** | 100 fatture in 30 secondi |
| **Flessibilità** | Modificabili in real-time |
| **Controllo** | Output testuale revisionabile |

### 📈 Roadmap

- [ ] Agente per invio automatico email
- [ ] Integrazione WhatsApp Business API
- [ ] Export report PDF
- [ ] Database SQLite per storico
- [ ] Dashboard analytics

---

## 📄 CSV Format

```csv
invoice_id,customer_name,amount_total,amount_paid,due_date,status,preferred_channel,customer_email,customer_phone
FAT-2025-001,ACME SpA,2450.00,0.00,2025-09-15,open,email,info@acme.it,+393401234567
```

---

## 🔒 Security

- ✅ `.env` protected by `.gitignore`
- ✅ Invoice CSVs not committed
- ✅ Generated messages excluded from Git
- ✅ API keys never hardcoded

---

## 🤝 Contributing

1. Fork the project
2. Create branch (`git checkout -b feature/NewFeature`)
3. Commit (`git commit -m 'Add NewFeature'`)
4. Push (`git push origin feature/NewFeature`)
5. Open Pull Request

---

<p align="center">
  <strong>PayMind v1.0</strong> — Powered by Claude AI Agents 🤖
</p>

<p align="center">
  <a href="https://github.com/fracabu">
    <img src="https://img.shields.io/badge/Made_by-fracabu-8B5CF6?style=flat-square" alt="Made by fracabu" />
  </a>
</p>
