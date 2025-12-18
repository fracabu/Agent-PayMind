export type Language = 'it' | 'en';

export const translations = {
  it: {
    // Header
    appName: 'PayMind',
    appDescription: 'Sistema AI per Solleciti di Pagamento',
    uploadCsv: 'Carica CSV',
    runWorkflow: 'Avvia Workflow',
    running: 'In esecuzione...',
    invoices: 'fatture',
    reset: 'Reset',
    settings: 'Impostazioni',

    // Workflow steps
    loadCsv: 'Carica CSV',
    analyzeInvoices: 'Analisi Fatture',
    generateReminders: 'Genera Solleciti',
    waitResponses: 'Attesa Risposte',
    analyzeResponses: 'Analisi Risposte',

    // Agents
    paymentMonitor: 'Payment Monitor',
    paymentMonitorDesc: 'Analizza fatture CSV, identifica scadute e calcola priorita',
    reminderGenerator: 'Reminder Generator',
    reminderGeneratorDesc: 'Genera messaggi personalizzati per Email, SMS, WhatsApp',
    responseHandler: 'Response Handler',
    responseHandlerDesc: 'Analizza risposte clienti e suggerisce azioni',

    // Stats
    totalInvoices: 'Fatture Totali',
    overdueInvoices: 'Scadute',
    totalCredits: 'Crediti Totali',
    overdueAmount: 'Importo Scaduto',

    // Analysis
    analysisReport: 'Report Analisi',
    generatedMessages: 'Messaggi Generati',
    responseAnalysis: 'Analisi Risposta Cliente',

    // Priority
    priorityHigh: 'ALTA',
    priorityMedium: 'MEDIA',
    priorityLow: 'BASSA',
    risk: 'Rischio',

    // Settings
    aiProvider: 'Provider AI',
    model: 'Modello',
    apiKey: 'API Key',
    save: 'Salva',
    cancel: 'Annulla',
    theme: 'Tema',
    light: 'Chiaro',
    dark: 'Scuro',
    language: 'Lingua',

    // Messages
    originalMessage: 'Messaggio Originale',
    suggestedActions: 'Azioni Suggerite',
    draftResponse: 'Bozza Risposta Suggerita',
    extractedInfo: 'Informazioni Estratte',
    intent: 'Intent Identificato',
    sentiment: 'Sentiment',
    confidence: 'confidence',

    // Sentiment
    positive: 'Positivo',
    neutral: 'Neutro',
    negative: 'Negativo',

    // Intent
    paymentConfirmed: 'Pagamento Confermato',
    requestDelay: 'Richiesta Dilazione',
    dispute: 'Contestazione',
    requestInfo: 'Richiesta Info',
    paymentPromise: 'Promessa Pagamento',

    // Logs
    systemLogs: 'Log Sistema',
    clearLogs: 'Pulisci',

    // File upload
    dropCsv: 'Trascina il file CSV qui',
    orClick: 'oppure clicca per selezionare',
    csvFormat: 'Formato: invoice_id, customer_name, amount_total, ...',

    // Table
    invoiceId: 'ID Fattura',
    customer: 'Cliente',
    amount: 'Importo',
    dueDate: 'Scadenza',
    status: 'Stato',
    priority: 'Priorita',
    channel: 'Canale',
    daysOverdue: 'Giorni Ritardo',
  },
  en: {
    // Header
    appName: 'PayMind',
    appDescription: 'AI Payment Reminder System',
    uploadCsv: 'Upload CSV',
    runWorkflow: 'Run Workflow',
    running: 'Running...',
    invoices: 'invoices',
    reset: 'Reset',
    settings: 'Settings',

    // Workflow steps
    loadCsv: 'Load CSV',
    analyzeInvoices: 'Analyze Invoices',
    generateReminders: 'Generate Reminders',
    waitResponses: 'Wait Responses',
    analyzeResponses: 'Analyze Responses',

    // Agents
    paymentMonitor: 'Payment Monitor',
    paymentMonitorDesc: 'Analyzes CSV invoices, identifies overdue and calculates priority',
    reminderGenerator: 'Reminder Generator',
    reminderGeneratorDesc: 'Generates personalized messages for Email, SMS, WhatsApp',
    responseHandler: 'Response Handler',
    responseHandlerDesc: 'Analyzes customer responses and suggests actions',

    // Stats
    totalInvoices: 'Total Invoices',
    overdueInvoices: 'Overdue',
    totalCredits: 'Total Credits',
    overdueAmount: 'Overdue Amount',

    // Analysis
    analysisReport: 'Analysis Report',
    generatedMessages: 'Generated Messages',
    responseAnalysis: 'Customer Response Analysis',

    // Priority
    priorityHigh: 'HIGH',
    priorityMedium: 'MEDIUM',
    priorityLow: 'LOW',
    risk: 'Risk',

    // Settings
    aiProvider: 'AI Provider',
    model: 'Model',
    apiKey: 'API Key',
    save: 'Save',
    cancel: 'Cancel',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    language: 'Language',

    // Messages
    originalMessage: 'Original Message',
    suggestedActions: 'Suggested Actions',
    draftResponse: 'Suggested Draft Response',
    extractedInfo: 'Extracted Information',
    intent: 'Identified Intent',
    sentiment: 'Sentiment',
    confidence: 'confidence',

    // Sentiment
    positive: 'Positive',
    neutral: 'Neutral',
    negative: 'Negative',

    // Intent
    paymentConfirmed: 'Payment Confirmed',
    requestDelay: 'Delay Request',
    dispute: 'Dispute',
    requestInfo: 'Info Request',
    paymentPromise: 'Payment Promise',

    // Logs
    systemLogs: 'System Logs',
    clearLogs: 'Clear',

    // File upload
    dropCsv: 'Drop CSV file here',
    orClick: 'or click to select',
    csvFormat: 'Format: invoice_id, customer_name, amount_total, ...',

    // Table
    invoiceId: 'Invoice ID',
    customer: 'Customer',
    amount: 'Amount',
    dueDate: 'Due Date',
    status: 'Status',
    priority: 'Priority',
    channel: 'Channel',
    daysOverdue: 'Days Overdue',
  },
} as const;

export type TranslationKey = keyof typeof translations.it;

export function useTranslation(language: Language) {
  const lang = language || 'it';
  const dict = translations[lang] || translations.it;
  return {
    t: (key: TranslationKey): string => dict[key] || key,
    language: lang,
  };
}
