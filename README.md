# 💰 PayMind - AI Payment Reminder System

Sistema intelligente di gestione automatica dei solleciti di pagamento basato su AI (Claude Anthropic).

PayMind analizza le fatture scadute, genera messaggi personalizzati per ogni canale di comunicazione (Email, SMS, WhatsApp) e analizza le risposte dei clienti con AI.

---

## 🎯 Caratteristiche Principali

### 📊 Analisi Automatica Fatture
- Upload CSV con dati fatture
- Classificazione automatica: scadute, in scadenza, contestate
- Segmentazione per priorità (ALTA/MEDIA/BASSA)
- Dashboard con metriche real-time
- Calcolo automatico giorni di ritardo e importi residui

### 🤖 Generazione Messaggi AI
- **Email**: Messaggi formali con oggetto e corpo strutturato
- **SMS**: Messaggi brevi, diretti, max 160 caratteri
- **WhatsApp**: Tono amichevole con emoji appropriate

Personalizzazione automatica basata su:
- Importo fattura
- Giorni di ritardo/scadenza
- Priorità (ALTA/MEDIA/BASSA)
- Canale di comunicazione preferito
- Storico pagamenti

### 💬 Analisi Risposte Clienti
- Identificazione intent (payment_confirmed, dispute, request_delay, etc.)
- Sentiment analysis
- Estrazione automatica informazioni chiave
- Suggerimenti azioni immediate
- Generazione bozze di risposta

### 🎨 Interfaccia Web Intuitiva
- Dashboard interattiva con Streamlit
- Visualizzazione dati in tempo reale
- Export messaggi generati
- Nessuna configurazione complessa

---

## 🚀 Quick Start

### Prerequisiti

- Python 3.8 o superiore
- Account Anthropic (piano gratuito o a pagamento)
- API Key Anthropic

### 1. Installazione

```bash
# Clone o scarica il progetto
cd Agent-PayMind

# Installa le dipendenze
pip install -r requirements.txt
```

### 2. Configurazione API Key

Crea un file `.env` nella root del progetto (già creato, modifica quello esistente):

```bash
ANTHROPIC_API_KEY=sk-ant-your_key_here
```

**Come ottenere la tua API Key:**
1. Vai su https://console.anthropic.com/
2. Accedi con il tuo account Anthropic
3. Naviga in "API Keys"
4. Crea una nuova chiave o copia quella esistente
5. Incollala nel file `.env`

⚠️ **IMPORTANTE**: Non condividere mai la tua API key e non commitarla su Git (già protetta da `.gitignore`)

### 3. Avvio Applicazione

```bash
# Dalla cartella del progetto
streamlit run app.py
```

L'applicazione si aprirà automaticamente nel browser su: `http://localhost:8501`

---

## 📋 Struttura Progetto

```
Agent-PayMind/
├── app.py                          # Applicazione Streamlit principale
├── requirements.txt                # Dipendenze Python
├── .env                           # Configurazione API key (NON committare)
├── .env.example                   # Template per .env
├── .gitignore                     # File da escludere da Git
├── README.md                      # Questa documentazione
├── README_STREAMLIT.md            # Documentazione tecnica Streamlit
│
├── invoices.csv                   # File CSV fatture di esempio
│
├── .agents/                       # Configurazione agenti Claude Code
│   ├── payment-monitor-agent.md
│   ├── reminder-generator-agent.md
│   └── response-handler-agent.md
│
└── [messaggi generati]/           # File .txt con messaggi generati
    ├── reminder_email_*.txt
    ├── reminder_sms_*.txt
    ├── reminder_whatsapp_*.txt
    └── response_analysis_*.txt
```

---

## 📄 Formato Dati CSV

Il file CSV delle fatture deve contenere le seguenti colonne:

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
| `customer_phone` | string | Telefono (formato internazionale) | +393401234567 |

### Esempio CSV Completo

```csv
invoice_id,customer_name,amount_total,amount_paid,due_date,status,preferred_channel,customer_email,customer_phone
FAT-2025-001,ACME SpA,2450.00,0.00,2025-09-15,open,email,contabilita@acme.it,+393401234567
FAT-2025-002,Blu Srl,780.00,0.00,2025-10-03,open,whatsapp,admin@blu.it,+393471234567
FAT-2025-003,Verde SNC,120.00,50.00,2025-08-25,open,sms,info@verde.it,+393331234567
FAT-2025-004,Rossi SRL,560.00,560.00,2025-09-10,paid,email,fatture@rossi.it,+393291234567
FAT-2025-005,Neri SRL,300.00,0.00,2025-07-30,disputed,email,admin@neri.it,+393221234567
```

Il file `invoices.csv` di esempio è già incluso nel progetto.

---

## 🎓 Guida Utilizzo

### 1. Dashboard Fatture 📊

**Funzionalità:**
- Upload file CSV fatture
- Analisi automatica con classificazione
- Visualizzazione metriche aggregate
- Tabelle separate per: scadute, in scadenza, contestate

**Come usare:**
1. Clicca su "📊 Dashboard Fatture" nel menu laterale
2. Upload il tuo file CSV
3. Seleziona la data di riferimento (default: oggi)
4. Visualizza l'analisi automatica

**Metriche visualizzate:**
- 🔴 **Fatture Scadute**: numero e importo totale
- ⚠️ **In Scadenza**: fatture che scadono nei prossimi 7 giorni
- ⚡ **Contestate**: fatture con status "disputed"
- 💰 **Totale Crediti**: somma di tutti gli importi in sospeso

**Priorità automatica:**
- **ALTA**: scadute oltre 30 giorni OR importo > €1,000
- **MEDIA**: scadute 15-30 giorni OR importo €500-1,000
- **BASSA**: scadute < 15 giorni OR in scadenza
- **CONTESTATE**: status = disputed

### 2. Genera Messaggi 📧

**Funzionalità:**
- Selezione fattura problematica
- Generazione AI messaggio personalizzato
- Adattamento automatico al canale
- Download messaggio generato

**Come usare:**
1. Vai su "📧 Genera Messaggi"
2. Seleziona una fattura dalla lista
3. Visualizza i dettagli fattura
4. Clicca "🤖 Genera Messaggio AI"
5. Attendi la generazione (5-10 secondi)
6. Scarica il messaggio con il pulsante "💾 Scarica Messaggio"

**Tipi di messaggi generati:**

**Email (per canale: email)**
- Oggetto professionale e chiaro
- Corpo formale strutturato
- Dettagli fattura completi
- Modalità di pagamento
- Offerta supporto/rateizzazione
- Tono: formale, cortese ma fermo

**SMS (per canale: sms)**
- Massimo 160 caratteri
- Diretto e urgente
- Dati essenziali: ID, importo, giorni ritardo
- Deadline precisa (48h)
- Menzione conseguenze se appropriato
- Tono: fermo, decisivo

**WhatsApp (per canale: whatsapp)**
- Tono amichevole e colloquiale
- Emoji contestuali (2-4)
- Messaggio breve ma completo
- Rassicurazione ("se hai già pagato, ignora")
- Call-to-action chiaro
- Tono: cordiale, professionale informale

### 3. Analizza Risposte 💬

**Funzionalità:**
- Analisi AI risposte clienti
- Identificazione intent automatica
- Sentiment analysis
- Suggerimenti azioni immediate
- Generazione bozza risposta

**Come usare:**
1. Vai su "💬 Analizza Risposte"
2. Compila i dati fattura (ID, cliente, importo, canale)
3. Incolla la risposta ricevuta dal cliente
4. Clicca "🔍 Analizza Risposta"
5. Visualizza l'analisi AI completa
6. Scarica l'analisi con "💾 Scarica Analisi"

**Intent riconosciuti:**
- `payment_confirmed`: cliente conferma pagamento effettuato
- `request_info`: richiesta informazioni/chiarimenti
- `dispute`: contestazione fattura
- `request_delay`: richiesta proroga/rateizzazione
- `payment_promise`: impegno a pagare entro data
- `already_paid`: sostiene di aver già pagato
- `error_invoice`: segnala errori in fattura

**Output analisi:**
1. Intent principale identificato
2. Sentimento/tono (positivo, neutro, negativo, collaborativo)
3. Informazioni chiave estratte
4. Urgenza situazione
5. Azioni consigliate passo-passo
6. Bozza risposta appropriata (se necessaria)

### 4. Impostazioni ⚙️

- Verifica stato API key
- Informazioni modello AI utilizzato
- Guida rapida integrata
- Link documentazione

---

## 🔧 Workflow Completo

### Scenario: Gestione Fatture Mensile

```
1. [INIZIO MESE] Upload CSV fatture
   ↓
2. [DASHBOARD] Visualizza analisi automatica
   ↓
3. [FILTRA] Identifica fatture priorità ALTA
   ↓
4. [GENERA] Crea messaggi AI per ogni fattura
   ↓
5. [RIVEDI] Controlla e personalizza se necessario
   ↓
6. [INVIA] Invia messaggi tramite i canali appropriati
   ↓
7. [MONITORA] Attendi risposte clienti (3-7 giorni)
   ↓
8. [RICEVI] Cliente risponde via email/SMS/WhatsApp
   ↓
9. [ANALIZZA] Usa "Analizza Risposte" per ogni risposta
   ↓
10. [AGISCI] Segui suggerimenti AI (verifica pagamento, invia chiarimenti, etc.)
   ↓
11. [AGGIORNA] Modifica status fatture in CSV
   ↓
12. [RIPETI] Ricarica CSV aggiornato e verifica metriche
```

---

## 🤖 Tecnologie Utilizzate

### Core
- **Python 3.12**: Linguaggio principale
- **Streamlit 1.31.0**: Framework web app interattiva
- **Pandas 2.2.0**: Analisi e manipolazione dati

### AI
- **Anthropic Claude API**: Modello AI per generazione e analisi
- **Modello**: `claude-sonnet-4-20250514`
- **Tokenizers 0.22.1**: Gestione tokenizzazione

### Utilities
- **python-dotenv 1.0.1**: Gestione variabili ambiente
- **openpyxl 3.1.2**: Supporto file Excel (opzionale)

---

## 📊 Modello AI: Claude Sonnet 4

**Caratteristiche:**
- 200k token context window
- Multilingua (italiano nativo)
- Reasoning avanzato
- Tone adaptation
- Analisi sentimento

**Costi (piano a pagamento):**
- Input: $3 per 1M token
- Output: $15 per 1M token
- Esempio: 100 messaggi ≈ $0.20-0.50

**Limiti rate (dipendono dal piano):**
- Piano gratuito: 50 richieste/giorno
- Piano €21/mese: rate limits più alti

---

## 🔒 Sicurezza e Privacy

### Protezione API Key
- ✅ File `.env` escluso da Git (`.gitignore`)
- ✅ Mai hardcoded nel codice
- ✅ Caricamento sicuro con `python-dotenv`

### Dati Clienti
- ✅ Processati solo in locale durante sessione
- ✅ Non memorizzati permanentemente dall'app
- ✅ Inviati ad Anthropic solo per generazione/analisi
- ✅ Conformità GDPR: i dati non sono usati per training

### Best Practices
- Non committare file `.env`
- Non condividere screenshot con API key visibili
- Ruota la chiave API se compromessa
- Usa variabili ambiente in produzione

---

## 🐛 Troubleshooting

### Errore: "ANTHROPIC_API_KEY non trovata"

**Causa**: File `.env` mancante o chiave non configurata

**Soluzione:**
```bash
# Verifica esistenza file .env
ls .env

# Verifica contenuto
cat .env

# Deve contenere:
ANTHROPIC_API_KEY=sk-ant-your_actual_key
```

**Se il problema persiste:**
- Riavvia l'applicazione Streamlit
- Verifica che non ci siano spazi extra nella chiave
- Controlla che la chiave inizi con `sk-ant-`

### Errore: "Upload CSV fallisce"

**Causa**: Formato CSV non corretto

**Soluzione:**
- Verifica che tutte le colonne richieste siano presenti
- Controlla formato date: `YYYY-MM-DD` (es: 2025-09-15)
- Usa punto (.) come separatore decimale, non virgola
- Verifica encoding UTF-8
- Rimuovi righe vuote

### Errore: "Timeout API"

**Causa**: Richiesta troppo lunga o problemi di rete

**Soluzione:**
- Riprova dopo pochi secondi
- Verifica connessione internet
- Controlla status API: https://status.anthropic.com/

### Messaggio generato in inglese

**Causa**: Prompt non sufficientemente esplicito

**Soluzione:**
- Il sistema forza già "Rispondi in italiano" nel prompt
- Se persiste, modifica `app.py` linea ~220 e aggiungi:
  ```python
  user_prompt += "\n\nIMPORTANTE: Rispondi SOLO in italiano."
  ```

### App lenta/non risponde

**Causa**: Chiamate API sincrone bloccanti

**Soluzione:**
- Attendi 5-15 secondi per generazione AI
- Non cliccare ripetutamente i pulsanti
- Verifica rate limit del tuo piano Anthropic

---

## 🚀 Deployment (Opzionale)

### Deploy su Streamlit Cloud (Gratis)

1. Pusha il progetto su GitHub (senza `.env`!)
2. Vai su https://streamlit.io/cloud
3. Connetti il repository
4. Aggiungi `ANTHROPIC_API_KEY` nei Secrets dell'app
5. Deploy automatico

### Deploy su VPS/Server

```bash
# Installa dipendenze
pip install -r requirements.txt

# Configura .env con API key

# Avvia con nohup
nohup streamlit run app.py --server.port 8501 &

# O usa systemd per avvio automatico
```

### Docker (Opzionale)

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
```

---

## 📈 Roadmap Future

### v2.0 (In Pianificazione)
- [ ] Supporto multi-provider AI (Gemini, OpenAI)
- [ ] Database persistente (PostgreSQL/SQLite)
- [ ] Storico comunicazioni
- [ ] Invio automatico email/SMS/WhatsApp
- [ ] Integrazione con gestionali (Fatture in Cloud, etc.)
- [ ] Dashboard analytics avanzata
- [ ] Notifiche in-app
- [ ] Export report PDF

### v3.0 (Futuro)
- [ ] Multi-tenancy
- [ ] Role-based access control
- [ ] API REST pubblica
- [ ] Mobile app
- [ ] Integrazione WhatsApp Business API
- [ ] Machine learning predittivo (probabilità pagamento)

---

## 🤝 Contribuire

Questo è un progetto interno, ma suggerimenti e feedback sono benvenuti!

**Come contribuire:**
1. Apri issue per bug o feature request
2. Fork il progetto
3. Crea branch per la feature (`git checkout -b feature/AmazingFeature`)
4. Commit modifiche (`git commit -m 'Add AmazingFeature'`)
5. Push branch (`git push origin feature/AmazingFeature`)
6. Apri Pull Request

---

## 📝 License

Progetto interno - Tutti i diritti riservati

---

## 📧 Supporto

Per domande o supporto:
- **Documentazione Anthropic**: https://docs.anthropic.com/
- **Documentazione Streamlit**: https://docs.streamlit.io/
- **Status API Anthropic**: https://status.anthropic.com/

---

## 📚 Documentazione Aggiuntiva

- [`README_STREAMLIT.md`](./README_STREAMLIT.md) - Guida tecnica Streamlit
- [`.agents/`](./.agents/) - Configurazione agenti Claude Code
- [`invoices.csv`](./invoices.csv) - Esempio dati fatture

---

## ⚡ Tips & Tricks

### Performance
- Usa batch processing per molte fatture (futura feature)
- Cache risultati analisi per evitare chiamate duplicate
- Limita upload CSV a max 1000 righe

### Personalizzazione Messaggi
- I messaggi generati sono bozze - personalizza prima dell'invio
- Aggiungi dettagli specifici del tuo business
- Mantieni tono coerente con la tua comunicazione aziendale

### Organizzazione
- Usa naming convention chiaro per i file CSV (es: `fatture_2025_09.csv`)
- Salva messaggi generati con nome descrittivo
- Mantieni backup CSV originali

### Efficienza
- Genera messaggi in batch per stessa priorità
- Filtra fatture per canale e invia in blocco
- Usa template per risposte ricorrenti

---

**PayMind v1.0** - Powered by Claude AI 🤖

*Ultimo aggiornamento: Settembre 2025*