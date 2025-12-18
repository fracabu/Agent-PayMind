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

    // Page sections
    aiAgents: 'Agenti AI',
    invoicesTitle: 'Fatture',
    agentOutputs: 'Output Agenti (AI Reale)',
    fullAiReport: 'Report Completo AI',

    // Workflow
    workflowPipeline: 'Workflow Pipeline',
    system: 'Sistema',

    // Workflow steps
    loadCsv: 'Carica CSV',
    analyzeInvoices: 'Analisi Fatture',
    generateReminders: 'Genera Solleciti',
    waitResponses: 'Attesa Risposte',
    analyzeResponses: 'Analisi Risposte',

    // Agents
    paymentMonitor: 'Payment Monitor',
    paymentMonitorDesc: 'Analizza fatture CSV, identifica scadute e calcola priorità',
    reminderGenerator: 'Reminder Generator',
    reminderGeneratorDesc: 'Genera messaggi personalizzati per Email, SMS, WhatsApp',
    responseHandler: 'Response Handler',
    responseHandlerDesc: 'Analizza risposte clienti e suggerisce azioni',

    // Agent status
    statusIdle: 'In attesa',
    statusRunning: 'In esecuzione',
    statusCompleted: 'Completato',
    statusError: 'Errore',
    completedIn: 'Completato in',

    // Stats
    totalInvoices: 'Fatture Totali',
    overdueInvoices: 'Fatture Scadute',
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
    aiSettings: 'Impostazioni AI',
    aiProvider: 'Provider AI',
    model: 'Modello',
    apiKey: 'API Key',
    save: 'Salva',
    cancel: 'Annulla',
    theme: 'Tema',
    light: 'Chiaro',
    dark: 'Scuro',
    language: 'Lingua',
    configured: 'Configurato',
    optionalIfConfigured: 'opzionale se già configurata nel server',
    useServerKey: 'Usa quella del server o inserisci una nuova',
    enterApiKey: 'Inserisci la tua API key',
    verify: 'Verifica',
    apiKeyValid: 'API key valida',
    note: 'Nota:',
    envNote: 'Puoi configurare le API key anche nel file',

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
    liveLogs: 'Live Logs',
    systemLogs: 'Log Sistema',
    clearLogs: 'Pulisci',
    logsWillAppear: 'I log appariranno qui durante l\'esecuzione',

    // File upload
    uploadCsvFile: 'Carica File CSV',
    dropCsv: 'Trascina qui il file CSV o',
    browse: 'sfoglia',
    orClick: 'oppure clicca per selezionare',
    csvFormat: 'Formato: invoice_id, customer_name, amount_total, ...',
    upload: 'Carica',

    // Table
    invoiceId: 'ID Fattura',
    id: 'ID',
    customer: 'Cliente',
    amount: 'Importo',
    dueDate: 'Scadenza',
    status: 'Stato',
    priority: 'Priorità',
    channel: 'Canale',
    daysOverdue: 'Giorni Ritardo',
    noInvoices: 'Nessuna fattura caricata. Carica un file CSV per iniziare.',
    of: 'di',
    days: 'giorni',

    // Invoice status
    statusOpen: 'Aperta',
    statusPaid: 'Pagata',
    statusDisputed: 'Contestata',

    // Analysis Report
    invoiceAnalysisReport: 'Report Analisi Fatture',
    invoicesAnalyzed: 'Fatture Analizzate',
    avgDelay: 'Ritardo Medio',
    disputed: 'Contestate',
    prioritySegmentation: 'Segmentazione per Priorità',
    invoicesCount: 'fatture',
    financialSummary: 'Riepilogo Finanziario',
    overduePercent: '% Scaduto',
    topClientsCredit: 'Top Clienti per Credito',
    gg: 'gg',

    // Generated Messages
    messagesGenerated: 'Messaggi Generati',
    messagesCount: 'messaggi',
    subject: 'Oggetto:',
    delayDays: 'gg ritardo',

    // Response Analysis
    customerResponseAnalysis: 'Analisi Risposta Cliente',
    riskLabel: 'Rischio',
    riskLow: 'BASSO',
    riskMedium: 'MEDIO',
    riskHigh: 'ALTO',
    originalMessageLabel: 'Messaggio Originale:',
    identifiedIntent: 'Intent Identificato',
    extractedInfoLabel: 'Informazioni Estratte:',
    suggestedActionsLabel: 'Azioni Suggerite:',
    draftResponseLabel: 'Bozza Risposta Suggerita:',
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

    // Page sections
    aiAgents: 'AI Agents',
    invoicesTitle: 'Invoices',
    agentOutputs: 'Agent Outputs (Real AI)',
    fullAiReport: 'Full AI Report',

    // Workflow
    workflowPipeline: 'Workflow Pipeline',
    system: 'System',

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

    // Agent status
    statusIdle: 'Idle',
    statusRunning: 'Running',
    statusCompleted: 'Completed',
    statusError: 'Error',
    completedIn: 'Completed in',

    // Stats
    totalInvoices: 'Total Invoices',
    overdueInvoices: 'Overdue Invoices',
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
    aiSettings: 'AI Settings',
    aiProvider: 'AI Provider',
    model: 'Model',
    apiKey: 'API Key',
    save: 'Save',
    cancel: 'Cancel',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    language: 'Language',
    configured: 'Configured',
    optionalIfConfigured: 'optional if already configured on server',
    useServerKey: 'Use server key or enter a new one',
    enterApiKey: 'Enter your API key',
    verify: 'Verify',
    apiKeyValid: 'API key valid',
    note: 'Note:',
    envNote: 'You can also configure API keys in the',

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
    liveLogs: 'Live Logs',
    systemLogs: 'System Logs',
    clearLogs: 'Clear',
    logsWillAppear: 'Logs will appear here during execution',

    // File upload
    uploadCsvFile: 'Upload CSV File',
    dropCsv: 'Drop CSV file here or',
    browse: 'browse',
    orClick: 'or click to select',
    csvFormat: 'Format: invoice_id, customer_name, amount_total, ...',
    upload: 'Upload',

    // Table
    invoiceId: 'Invoice ID',
    id: 'ID',
    customer: 'Customer',
    amount: 'Amount',
    dueDate: 'Due Date',
    status: 'Status',
    priority: 'Priority',
    channel: 'Channel',
    daysOverdue: 'Days Overdue',
    noInvoices: 'No invoices loaded. Upload a CSV file to start.',
    of: 'of',
    days: 'days',

    // Invoice status
    statusOpen: 'Open',
    statusPaid: 'Paid',
    statusDisputed: 'Disputed',

    // Analysis Report
    invoiceAnalysisReport: 'Invoice Analysis Report',
    invoicesAnalyzed: 'Invoices Analyzed',
    avgDelay: 'Average Delay',
    disputed: 'Disputed',
    prioritySegmentation: 'Priority Segmentation',
    invoicesCount: 'invoices',
    financialSummary: 'Financial Summary',
    overduePercent: '% Overdue',
    topClientsCredit: 'Top Clients by Credit',
    gg: 'days',

    // Generated Messages
    messagesGenerated: 'Generated Messages',
    messagesCount: 'messages',
    subject: 'Subject:',
    delayDays: 'days overdue',

    // Response Analysis
    customerResponseAnalysis: 'Customer Response Analysis',
    riskLabel: 'Risk',
    riskLow: 'LOW',
    riskMedium: 'MEDIUM',
    riskHigh: 'HIGH',
    originalMessageLabel: 'Original Message:',
    identifiedIntent: 'Identified Intent',
    extractedInfoLabel: 'Extracted Information:',
    suggestedActionsLabel: 'Suggested Actions:',
    draftResponseLabel: 'Suggested Draft Response:',
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
