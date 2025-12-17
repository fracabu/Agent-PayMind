'use client';

import { useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import Header from '@/components/Header';
import AgentCard from '@/components/AgentCard';
import WorkflowTimeline from '@/components/WorkflowTimeline';
import InvoicesTable from '@/components/InvoicesTable';
import LogsPanel from '@/components/LogsPanel';
import StatsCards from '@/components/StatsCards';
import FileUpload from '@/components/FileUpload';
import AnalysisReport from '@/components/AnalysisReport';
import GeneratedMessages, { GeneratedMessage } from '@/components/GeneratedMessages';
import ResponseAnalysis, { ResponseAnalysisData } from '@/components/ResponseAnalysis';
import { Invoice } from '@/types';

// Helper to generate realistic messages
const generateEmailMessage = (inv: Invoice, daysOverdue: number): string => {
  const amount = (inv.amount_total - inv.amount_paid).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });

  if (daysOverdue > 90) {
    return `Gentile ${inv.customer_name},

con la presente siamo a sollecitarVi URGENTEMENTE il pagamento della fattura ${inv.invoice_id} dell'importo di ${amount}, scaduta da ${daysOverdue} giorni.

Nonostante i precedenti solleciti, non abbiamo ancora ricevuto il pagamento dovuto. Vi invitiamo a regolarizzare la Vostra posizione entro e non oltre 5 giorni lavorativi dalla ricezione della presente.

In caso di mancato riscontro, saremo costretti ad avviare le procedure di recupero credito previste.

Se il pagamento è già stato effettuato, Vi preghiamo di inviarci copia della contabile.

Cordiali saluti,
Ufficio Amministrazione`;
  }

  return `Gentile ${inv.customer_name},

desideriamo ricordarVi che la fattura ${inv.invoice_id} dell'importo di ${amount} risulta scaduta da ${daysOverdue} giorni.

Vi preghiamo di provvedere al pagamento entro 7 giorni lavorativi tramite bonifico bancario alle seguenti coordinate:
IBAN: IT00X0000000000000000000000

Se avete già provveduto al pagamento, Vi preghiamo di ignorare questa comunicazione e di inviarci la contabile per aggiornare i nostri sistemi.

Per qualsiasi chiarimento, non esitate a contattarci.

Cordiali saluti,
Ufficio Amministrazione`;
};

const generateSmsMessage = (inv: Invoice, daysOverdue: number): string => {
  const amount = (inv.amount_total - inv.amount_paid).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
  return `SOLLECITO: Fattura ${inv.invoice_id} di ${amount} scaduta da ${daysOverdue}gg. Contattaci al più presto per regolarizzare. Grazie.`;
};

const generateWhatsAppMessage = (inv: Invoice, daysOverdue: number): string => {
  const amount = (inv.amount_total - inv.amount_paid).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
  return `Buongiorno ${inv.customer_name.split(' ')[0]} 👋

Ti scriviamo per ricordarti che la fattura ${inv.invoice_id} di ${amount} risulta scaduta da ${daysOverdue} giorni.

Puoi effettuare il pagamento tramite bonifico o contattarci per concordare una soluzione.

Se hai già pagato, inviaci la ricevuta e provvederemo ad aggiornare la tua posizione ✅

Grazie per la collaborazione!`;
};

export default function Dashboard() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const {
    agents,
    setAgentStatus,
    invoices,
    setInvoices,
    logs,
    addLog,
    clearLogs,
    workflowSteps,
    currentStep,
    updateWorkflowStep,
    analysisResult,
    setAnalysisResult,
    showAnalysisReport,
    setShowAnalysisReport,
    generatedMessages,
    setGeneratedMessages,
    showGeneratedMessages,
    setShowGeneratedMessages,
    responseAnalysis,
    setResponseAnalysis,
    showResponseAnalysis,
    setShowResponseAnalysis,
    isWorkflowRunning,
    setWorkflowRunning,
    resetAll,
  } = useAppStore();

  const parseCSV = (text: string): Invoice[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',');

    return lines.slice(1).map((line) => {
      const values = line.split(',');
      const invoice: Record<string, string | number> = {};

      headers.forEach((header, index) => {
        const key = header.trim();
        const value = values[index]?.trim() || '';

        if (key === 'amount_total' || key === 'amount_paid') {
          invoice[key] = parseFloat(value) || 0;
        } else {
          invoice[key] = value;
        }
      });

      const dueDate = new Date(invoice.due_date as string);
      const today = new Date();
      const diffTime = today.getTime() - dueDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const amountDue = (invoice.amount_total as number) - (invoice.amount_paid as number);
      let priority: 'ALTA' | 'MEDIA' | 'BASSA' = 'BASSA';

      if (invoice.status === 'disputed' || diffDays > 90 || amountDue > 1000) {
        priority = 'ALTA';
      } else if (diffDays > 60) {
        priority = 'MEDIA';
      }

      return {
        ...invoice,
        days_overdue: diffDays > 0 ? diffDays : 0,
        priority: invoice.status !== 'paid' ? priority : undefined,
      } as Invoice;
    });
  };

  const handleFileSelect = useCallback(async (file: File) => {
    const text = await file.text();
    const parsedInvoices = parseCSV(text);
    setInvoices(parsedInvoices);
    addLog({ agent: 'Sistema', message: `Caricato file ${file.name} con ${parsedInvoices.length} fatture`, type: 'success' });
    updateWorkflowStep(1, 'completed');
  }, [setInvoices, addLog, updateWorkflowStep]);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const runWorkflow = useCallback(async () => {
    if (invoices.length === 0) return;

    setWorkflowRunning(true);
    setShowAnalysisReport(false);
    setShowGeneratedMessages(false);
    setShowResponseAnalysis(false);
    setGeneratedMessages([]);
    setResponseAnalysis(null);
    clearLogs();

    // Reset workflow steps
    updateWorkflowStep(1, 'completed');
    updateWorkflowStep(2, 'pending');
    updateWorkflowStep(3, 'pending');
    updateWorkflowStep(4, 'pending');
    updateWorkflowStep(5, 'pending');

    addLog({ agent: 'Sistema', message: 'File CSV caricato', type: 'success' });
    await sleep(500);

    // Step 2: Payment Monitor Agent
    updateWorkflowStep(2, 'running');
    setAgentStatus('payment-monitor', 'running');
    addLog({ agent: 'payment-monitor', message: 'Avvio analisi fatture...', type: 'info' });

    await sleep(1000);
    addLog({ agent: 'payment-monitor', message: `Analizzando ${invoices.length} fatture...`, type: 'info' });

    await sleep(1500);

    const overdueInvoices = invoices.filter((inv) => inv.status === 'open' && (inv.days_overdue || 0) > 0);
    const disputedInvoices = invoices.filter((inv) => inv.status === 'disputed');
    const totalCredits = invoices.reduce((sum, inv) => sum + (inv.amount_total - inv.amount_paid), 0);
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + (inv.amount_total - inv.amount_paid), 0);

    const result = {
      totalInvoices: invoices.length,
      overdueInvoices: overdueInvoices.length,
      totalCredits,
      overdueAmount,
      byPriority: {
        alta: invoices.filter((inv) => inv.priority === 'ALTA').length,
        media: invoices.filter((inv) => inv.priority === 'MEDIA').length,
        bassa: invoices.filter((inv) => inv.priority === 'BASSA').length,
      },
    };

    setAnalysisResult(result);

    addLog({ agent: 'payment-monitor', message: `Trovate ${overdueInvoices.length} fatture scadute`, type: 'warning' });
    addLog({ agent: 'payment-monitor', message: `Contestate: ${disputedInvoices.length}`, type: 'warning' });
    addLog({ agent: 'payment-monitor', message: `Crediti scaduti: €${overdueAmount.toFixed(2)}`, type: 'info' });
    addLog({ agent: 'payment-monitor', message: 'Report analisi completato', type: 'success' });

    setAgentStatus('payment-monitor', 'completed', 2500);
    updateWorkflowStep(2, 'completed');
    setShowAnalysisReport(true);

    await sleep(800);

    // Step 3: Reminder Generator Agent
    updateWorkflowStep(3, 'running');
    setAgentStatus('reminder-generator', 'running');
    addLog({ agent: 'reminder-generator', message: 'Generazione messaggi sollecito...', type: 'info' });

    const messages: GeneratedMessage[] = [];
    const invoicesToProcess = [...overdueInvoices, ...disputedInvoices].slice(0, 5);

    for (const inv of invoicesToProcess) {
      await sleep(600);

      const daysOverdue = inv.days_overdue || 0;
      const amount = inv.amount_total - inv.amount_paid;
      let content = '';
      let subject = '';

      if (inv.preferred_channel === 'email') {
        subject = `SOLLECITO PAGAMENTO - Fattura ${inv.invoice_id} - ${daysOverdue > 90 ? 'URGENTE' : 'Promemoria'}`;
        content = generateEmailMessage(inv, daysOverdue);
      } else if (inv.preferred_channel === 'sms') {
        content = generateSmsMessage(inv, daysOverdue);
      } else {
        content = generateWhatsAppMessage(inv, daysOverdue);
      }

      const msg: GeneratedMessage = {
        id: crypto.randomUUID(),
        invoiceId: inv.invoice_id,
        customerName: inv.customer_name,
        channel: inv.preferred_channel,
        subject: inv.preferred_channel === 'email' ? subject : undefined,
        content,
        priority: inv.priority || 'BASSA',
        amount,
        daysOverdue,
      };

      messages.push(msg);
      setGeneratedMessages([...messages]);

      addLog({
        agent: 'reminder-generator',
        message: `Generato ${inv.preferred_channel.toUpperCase()} per ${inv.customer_name}`,
        type: 'success',
      });
    }

    addLog({ agent: 'reminder-generator', message: `${messages.length} messaggi pronti per l'invio`, type: 'success' });

    setAgentStatus('reminder-generator', 'completed', messages.length * 600);
    updateWorkflowStep(3, 'completed');
    setShowGeneratedMessages(true);

    await sleep(800);

    // Step 4: Waiting for responses (simulated)
    updateWorkflowStep(4, 'running');
    addLog({ agent: 'Sistema', message: 'Simulazione invio messaggi...', type: 'info' });

    await sleep(1000);
    addLog({ agent: 'Sistema', message: 'Messaggi inviati. In attesa di risposte...', type: 'info' });

    await sleep(1500);

    updateWorkflowStep(4, 'completed');
    addLog({ agent: 'Sistema', message: 'Ricevuta risposta da ACME SpA', type: 'info' });

    await sleep(500);

    // Step 5: Response Handler Agent
    updateWorkflowStep(5, 'running');
    setAgentStatus('response-handler', 'running');
    addLog({ agent: 'response-handler', message: 'Analisi risposta cliente...', type: 'info' });

    await sleep(800);
    addLog({ agent: 'response-handler', message: 'Elaborazione NLP in corso...', type: 'info' });

    await sleep(1000);

    const responseData: ResponseAnalysisData = {
      invoiceId: 'FAT-2025-001',
      customerName: 'ACME SpA',
      originalMessage: 'Buongiorno, abbiamo ricevuto il vostro sollecito. Purtroppo in questo momento abbiamo difficoltà di liquidità. Sarebbe possibile rateizzare l\'importo in 3 rate mensili? Confermiamo la nostra volontà di saldare il debito.',
      intent: 'request_delay',
      intentConfidence: 95,
      sentiment: 'neutral',
      extractedInfo: [
        { label: 'Problema dichiarato', value: 'Difficoltà di liquidità' },
        { label: 'Proposta cliente', value: 'Rateizzazione in 3 rate mensili' },
        { label: 'Impegno', value: 'Conferma volontà di pagamento' },
      ],
      suggestedActions: [
        'Verificare storico pagamenti ACME SpA',
        'Valutare accettabilità piano rateizzazione',
        'Richiedere date precise per le 3 rate',
        'Preparare accordo scritto di rateizzazione',
      ],
      draftResponse: `Gentile ACME SpA,

ringraziamo per il riscontro e per la trasparenza nella comunicazione.

Siamo disponibili a valutare la Vostra richiesta di rateizzazione. Per procedere necessitiamo di:

1. Date proposte per le 3 rate
2. Conferma importi (€816,67 x 3)
3. Modalità di pagamento preferita

Una volta ricevute queste informazioni, sottoporremo la proposta alla Direzione per approvazione formale.

Cordiali saluti,
Ufficio Amministrazione`,
      riskLevel: 'medium',
    };

    setResponseAnalysis(responseData);

    addLog({ agent: 'response-handler', message: 'Intent: REQUEST_DELAY (95%)', type: 'info' });
    addLog({ agent: 'response-handler', message: 'Sentiment: Neutro-Positivo', type: 'info' });
    addLog({ agent: 'response-handler', message: 'Rischio credito: MEDIO', type: 'warning' });
    addLog({ agent: 'response-handler', message: 'Bozza risposta generata', type: 'success' });

    setAgentStatus('response-handler', 'completed', 1800);
    updateWorkflowStep(5, 'completed');
    setShowResponseAnalysis(true);

    addLog({ agent: 'Sistema', message: 'Workflow completato con successo!', type: 'success' });
    setWorkflowRunning(false);
  }, [invoices, setWorkflowRunning, clearLogs, updateWorkflowStep, setAgentStatus, addLog, setAnalysisResult, setShowAnalysisReport, setGeneratedMessages, setShowGeneratedMessages, setResponseAnalysis, setShowResponseAnalysis]);

  const handleReset = useCallback(() => {
    resetAll();
    setSelectedInvoice(null);
  }, [resetAll]);

  return (
    <div className="min-h-screen">
      <Header
        onUpload={() => setIsUploadOpen(true)}
        onRunWorkflow={runWorkflow}
        onReset={handleReset}
        isRunning={isWorkflowRunning}
        hasInvoices={invoices.length > 0}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="mb-8">
          <StatsCards result={analysisResult} />
        </div>

        {/* Agents Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Agenti AI</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isActive={agent.status === 'running'}
              />
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Workflow & Logs */}
          <div className="space-y-6">
            <WorkflowTimeline steps={workflowSteps} currentStep={currentStep} />
            <LogsPanel logs={logs} onClear={clearLogs} />
          </div>

          {/* Right Column - Invoices Table */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Fatture</h2>
            <InvoicesTable
              invoices={invoices}
              onSelectInvoice={setSelectedInvoice}
              selectedInvoiceId={selectedInvoice?.invoice_id}
            />
          </div>
        </div>

        {/* Agent Outputs Section */}
        {(showAnalysisReport || showGeneratedMessages || showResponseAnalysis) && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Output Agenti</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AnalysisReport
                result={analysisResult}
                invoices={invoices}
                isVisible={showAnalysisReport}
              />
              <GeneratedMessages
                messages={generatedMessages}
                isVisible={showGeneratedMessages}
              />
              <ResponseAnalysis
                analysis={responseAnalysis}
                isVisible={showResponseAnalysis}
              />
            </div>
          </div>
        )}
      </main>

      <FileUpload
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onFileSelect={handleFileSelect}
      />
    </div>
  );
}
