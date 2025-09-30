# 💰 PayMind - AI Payment Reminder System

Sistema intelligente di gestione automatica dei solleciti di pagamento basato su **Agenti AI Claude Code**.

PayMind utilizza agenti AI autonomi per analizzare fatture scadute, generare messaggi personalizzati per ogni canale di comunicazione (Email, SMS, WhatsApp) e analizzare le risposte dei clienti.

---

## 🎯 Caratteristiche Principali

### 🤖 Agenti AI Autonomi

Tre agenti specializzati che lavorano dalla CLI:

1. **payment-monitor-agent** 📊
   - Analizza file CSV fatture
   - Identifica fatture scadute, in scadenza, contestate
   - Calcola giorni di ritardo e importi residui
   - Segmenta per priorità (ALTA/MEDIA/BASSA)
   - Report dettagliati con metriche

2. **reminder-generator-agent** 📧
   - Genera messaggi personalizzati per canale (Email/SMS/WhatsApp)
   - Adatta tono in base a priorità e ritardo
   - Messaggi professionali e contestualizzati
   - Salva automaticamente i file .txt

3. **response-handler-agent** 💬
   - Analizza risposte clienti
   - Identifica intent (payment_confirmed, dispute, request_delay, etc.)
   - Sentiment analysis
   - Suggerimenti azioni immediate
   - Genera bozze di risposta appropriate

---

## 🚀 Quick Start

### Prerequisiti

- **Claude Code CLI** installato
- Account Anthropic con piano attivo
- Python 3.8+ (per gestione CSV opzionale)

### 1. Clone Repository

```bash
git clone https://github.com/fracabu/Agent-PayMind.git
cd Agent-PayMind
```

### 2. Configurazione

Gli agenti sono già configurati in `.claude/agents/`. Nessuna installazione richiesta!

### 3. Utilizzo Immediato

```bash
# Analizza fatture
"payment-monitor-agent: analizza invoices.csv e dammi report"

# Genera messaggi per fatture scadute
"reminder-generator-agent: genera email per FAT-2025-001"

# Analizza risposta cliente
"response-handler-agent: analizza questa risposta: [incolla testo]"
```

---

## 📋 Struttura Progetto

```
Agent-PayMind/
├── .claude/
│   └── agents/
│       ├── payment-monitor-agent.md       # Agente analisi fatture
│       ├── reminder-generator-agent.md    # Agente generazione messaggi
│       └── response-handler-agent.md      # Agente analisi risposte
│
├── invoices.csv                           # File CSV fatture esempio
├── .gitignore                             # Protezione file sensibili
├── README.md                              # Questa documentazione
│
└── [output generati]/
    ├── email_*.txt                        # Email generate
    ├── response_analysis_*.txt            # Analisi risposte
    └── reminder_*.txt                     # Altri messaggi
```

---

## 📄 Formato CSV Fatture

| Colonna | Tipo | Descrizione | Esempio |
|---------|------|-------------|---------|
| `invoice_id` | string | ID univoco fattura | FAT-2025-001 |
| `customer_name` | string | Nome cliente/azienda | ACME SpA |
| `amount_total` | float | Importo totale fattura | 2450.00 |
| `amount_paid` | float | Importo già pagato | 0.00 |
| `due_date` | date | Data scadenza (YYYY-MM-DD) | 2025-09-15 |
| `status` | string | Stato: open, paid, disputed | open |
| `preferred_channel` | string | Canale: email, sms, whatsapp | email |
| `customer_email` | string | Email cliente | info@acme.it |
| `customer_phone` | string | Telefono internazionale | +393401234567 |

### Esempio CSV

```csv
invoice_id,customer_name,amount_total,amount_paid,due_date,status,preferred_channel,customer_email,customer_phone
FAT-2025-001,ACME SpA,2450.00,0.00,2025-09-15,open,email,contabilita@acme.it,+393401234567
FAT-2025-002,Blu Srl,780.00,0.00,2025-10-03,open,whatsapp,admin@blu.it,+393471234567
FAT-2025-003,Verde SNC,120.00,50.00,2025-08-25,open,sms,info@verde.it,+393331234567
```

---

## 🎓 Esempi di Utilizzo

### Workflow Completo

```bash
# 1. Analizza tutte le fatture
"payment-monitor-agent: analizza invoices.csv e dammi report completo"

# Output: Report con fatture scadute, in scadenza, contestate, segmentate per priorità

# 2. Genera messaggi per fatture priorità ALTA
"reminder-generator-agent: genera email per tutte le fatture scadute nel file"

# Output: File email_*.txt con messaggi pronti per invio

# 3. Cliente risponde
"response-handler-agent: analizza questa risposta di ACME SpA: [incolla risposta]"

# Output: Intent identificato, sentiment, azioni suggerite, bozza risposta
```

### Esempi Specifici

**Analisi Fatture:**
```bash
"payment-monitor-agent: analizza invoices.csv data di oggi 2025-09-30"
```

**Generazione Email Singola:**
```bash
"reminder-generator-agent: genera email sollecito per FAT-2025-001, ACME SpA,
€2.450 scaduta da 15 giorni, priorità ALTA"
```

**Generazione SMS:**
```bash
"reminder-generator-agent: genera SMS urgente per Verde SNC, FAT-2025-003,
€70 residui, scaduta da 36 giorni"
```

**Generazione WhatsApp:**
```bash
"reminder-generator-agent: genera messaggio WhatsApp reminder per Blu Srl,
€780 in scadenza tra 3 giorni"
```

**Analisi Risposta:**
```bash
"response-handler-agent: analizza risposta cliente per FAT-2025-001:
'Buongiorno, confermiamo pagamento effettuato il 27/09. Allego contabile.'"
```

---

## 🔧 Workflow Tipico

```
📅 INIZIO MESE
   ↓
📊 Analizza CSV fatture con payment-monitor-agent
   ↓
🎯 Identifica fatture priorità ALTA/MEDIA
   ↓
📧 Genera messaggi con reminder-generator-agent
   ↓
✅ Rivedi e personalizza messaggi generati
   ↓
📤 Invia messaggi ai clienti
   ↓
⏳ Attendi risposte (3-7 giorni)
   ↓
💬 Analizza risposte con response-handler-agent
   ↓
✔️ Segui azioni suggerite (verifica pagamento, chiarimenti, etc.)
   ↓
🔄 Aggiorna CSV e ripeti
```

---

## 🤖 Agenti in Dettaglio

### payment-monitor-agent

**Cosa fa:**
- Legge file CSV fatture
- Calcola giorni di ritardo/scadenza
- Classifica fatture (scadute, in scadenza, contestate)
- Assegna priorità automatica
- Genera statistiche e report

**Output:**
- Report markdown con tabelle
- Segmentazione per canale
- Metriche aggregate
- Azioni consigliate

### reminder-generator-agent

**Cosa fa:**
- Genera messaggi personalizzati per canale
- Adatta tono a priorità e ritardo
- Crea oggetti email professionali
- Ottimizza lunghezza SMS (160 char)
- Usa emoji appropriate per WhatsApp

**Output:**
- Email formali strutturate
- SMS urgenti e concisi
- WhatsApp amichevoli
- File .txt pronti per l'uso

### response-handler-agent

**Cosa fa:**
- Identifica intent della risposta
- Analizza sentimento/tono
- Estrae informazioni chiave
- Suggerisce azioni immediate
- Genera bozze di risposta

**Intent riconosciuti:**
- `payment_confirmed`
- `request_info`
- `dispute`
- `request_delay`
- `payment_promise`
- `already_paid`
- `error_invoice`

---

## 🎯 Vantaggi Agenti vs App

### Perché Usare Agenti CLI?

✅ **Automazione Completa**
- Processano batch di fatture autonomamente
- Workflow multi-step senza intervento manuale
- Accesso a tutti i tool (file, comandi, ricerche)

✅ **Velocità**
- Analizzano 100 fatture in 30 secondi
- Generano decine di messaggi in batch
- Zero click, tutto da terminale

✅ **Flessibilità**
- Modificabili in real-time
- Integrabili in script bash
- Concatenabili con altri tool

✅ **Controllo**
- Output testuale revisabile
- File salvati automaticamente
- Nessuna interfaccia da gestire

---

## 📊 Modello AI

**Claude Sonnet 4** (`claude-sonnet-4-20250514`)

**Caratteristiche:**
- Context window 200k token
- Italiano nativo professionale
- Reasoning avanzato
- Tone adaptation
- Zero allucinazioni

**Costi:**
- Inclusi nel piano Claude Code
- Nessun costo API extra per utenti con piano attivo

---

## 🔒 Sicurezza

- ✅ File `.env` protetto da `.gitignore`
- ✅ CSV fatture non committate
- ✅ Messaggi generati esclusi da Git
- ✅ API key mai hardcoded

---

## 📈 Roadmap

### v1.1
- [ ] Agente per invio automatico email
- [ ] Integrazione con API WhatsApp Business
- [ ] Export report PDF

### v2.0
- [ ] Database SQLite per storico
- [ ] Dashboard analytics
- [ ] Integrazione gestionali (Fatture in Cloud)
- [ ] API REST per accesso remoto

---

## 🤝 Contribuire

Suggerimenti e feedback benvenuti!

1. Apri issue per bug o feature request
2. Fork il progetto
3. Crea branch (`git checkout -b feature/NewFeature`)
4. Commit (`git commit -m 'Add NewFeature'`)
5. Push (`git push origin feature/NewFeature`)
6. Apri Pull Request

---

## 📧 Supporto

- **Documentazione Claude Code**: https://docs.claude.com/claude-code
- **Documentazione Anthropic API**: https://docs.anthropic.com/
- **Status API**: https://status.anthropic.com/

---

## ⚡ Tips

### Performance
- Processa fatture in batch con un solo comando
- Genera tutti i messaggi insieme
- Usa template per personalizzazioni

### Best Practices
- Rivedi sempre i messaggi prima dell'invio
- Mantieni backup CSV aggiornati
- Traccia le risposte ricevute
- Aggiorna status fatture regolarmente

### Personalizzazione
- Modifica prompt agenti in `.claude/agents/`
- Adatta tono ai tuoi clienti
- Aggiungi informazioni aziendali specifiche

---

**PayMind v1.0** - Powered by Claude Code AI Agents 🤖

*Sistema di sollecito pagamenti completamente automatizzato con AI*