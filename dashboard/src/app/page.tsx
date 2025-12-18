'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import Header from '@/components/Header';
import AgentCard from '@/components/AgentCard';
import WorkflowTimeline from '@/components/WorkflowTimeline';
import InvoicesTable from '@/components/InvoicesTable';
import LogsPanel from '@/components/LogsPanel';
import StatsCards from '@/components/StatsCards';
import FileUpload from '@/components/FileUpload';
import AnalysisReport from '@/components/AnalysisReport';
import GeneratedMessages from '@/components/GeneratedMessages';
import ResponseAnalysis from '@/components/ResponseAnalysis';
import SettingsModal, { AISettings } from '@/components/SettingsModal';
import { Invoice } from '@/types';

export default function Dashboard() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
    aiSettings,
    setAISettings,
    analysisReportContent,
    setAnalysisReportContent,
    resetAll,
    theme,
    toggleTheme,
    language,
    setLanguage,
  } = useAppStore();

  // Apply theme to document
  useEffect(() => {
    console.log('Theme changed to:', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleLanguage = useCallback(() => {
    setLanguage(language === 'it' ? 'en' : 'it');
  }, [language, setLanguage]);

  const { t } = useTranslation(language);

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

      return invoice as unknown as Invoice;
    });
  };

  const handleFileSelect = useCallback(async (file: File) => {
    const text = await file.text();
    const parsedInvoices = parseCSV(text);

    addLog({ agent: 'Sistema', message: `Caricamento ${parsedInvoices.length} fatture...`, type: 'info' });

    try {
      // Upload to database via API
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoices: parsedInvoices }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload invoices');
      }

      const result = await response.json();

      // Update local state with processed invoices from server
      setInvoices(result.invoices.map((inv: Record<string, unknown>) => ({
        invoice_id: inv.invoiceId,
        customer_name: inv.customerName,
        amount_total: inv.amountTotal,
        amount_paid: inv.amountPaid,
        due_date: inv.dueDate,
        status: inv.status,
        preferred_channel: inv.preferredChannel,
        customer_email: inv.customerEmail,
        customer_phone: inv.customerPhone,
        days_overdue: inv.daysOverdue,
        priority: inv.priority,
      })));

      addLog({ agent: 'Sistema', message: `Caricate ${result.count} fatture nel database`, type: 'success' });
      updateWorkflowStep(1, 'completed');
    } catch (error) {
      addLog({ agent: 'Sistema', message: `Errore: ${error}`, type: 'error' });
    }
  }, [setInvoices, addLog, updateWorkflowStep]);

  const runWorkflow = useCallback(async () => {
    if (invoices.length === 0) return;

    setWorkflowRunning(true);
    setShowAnalysisReport(false);
    setShowGeneratedMessages(false);
    setShowResponseAnalysis(false);
    setGeneratedMessages([]);
    setResponseAnalysis(null);
    setAnalysisReportContent(null);
    clearLogs();

    // Reset workflow steps
    updateWorkflowStep(1, 'completed');
    updateWorkflowStep(2, 'pending');
    updateWorkflowStep(3, 'pending');
    updateWorkflowStep(4, 'pending');
    updateWorkflowStep(5, 'pending');

    addLog({ agent: 'Sistema', message: 'Avvio workflow con AI reale...', type: 'info' });
    addLog({ agent: 'Sistema', message: `Provider: ${aiSettings.provider} | Model: ${aiSettings.model}`, type: 'info' });

    try {
      // Step 2: Payment Monitor Agent
      updateWorkflowStep(2, 'running');
      setAgentStatus('payment-monitor', 'running');
      addLog({ agent: 'payment-monitor', message: 'Avvio analisi fatture con AI...', type: 'info' });

      const monitorStartTime = Date.now();
      const monitorResponse = await fetch('/api/agents/payment-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: aiSettings.provider,
          model: aiSettings.model,
          apiKey: aiSettings.apiKey,
        }),
      });

      if (!monitorResponse.ok) {
        const error = await monitorResponse.json();
        throw new Error(error.error || 'Payment monitor failed');
      }

      const monitorResult = await monitorResponse.json();
      const monitorDuration = Date.now() - monitorStartTime;

      setAnalysisResult(monitorResult.stats);
      setAnalysisReportContent(monitorResult.analysis);

      addLog({ agent: 'payment-monitor', message: `Analisi completata (${monitorResult.tokensUsed || 'N/A'} tokens)`, type: 'success' });
      addLog({ agent: 'payment-monitor', message: `Trovate ${monitorResult.stats.overdueInvoices} fatture scadute`, type: 'warning' });

      setAgentStatus('payment-monitor', 'completed', monitorDuration);
      updateWorkflowStep(2, 'completed');
      setShowAnalysisReport(true);

      // Step 3: Reminder Generator Agent
      updateWorkflowStep(3, 'running');
      setAgentStatus('reminder-generator', 'running');
      addLog({ agent: 'reminder-generator', message: 'Generazione messaggi con AI...', type: 'info' });

      const reminderStartTime = Date.now();
      const reminderResponse = await fetch('/api/agents/reminder-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: aiSettings.provider,
          model: aiSettings.model,
          apiKey: aiSettings.apiKey,
        }),
      });

      if (!reminderResponse.ok) {
        const error = await reminderResponse.json();
        throw new Error(error.error || 'Reminder generator failed');
      }

      const reminderResult = await reminderResponse.json();
      const reminderDuration = Date.now() - reminderStartTime;

      setGeneratedMessages(reminderResult.messages);

      addLog({ agent: 'reminder-generator', message: `Generati ${reminderResult.count} messaggi`, type: 'success' });
      reminderResult.messages.forEach((msg: { channel: string; customerName: string }) => {
        addLog({ agent: 'reminder-generator', message: `${msg.channel.toUpperCase()} per ${msg.customerName}`, type: 'info' });
      });

      setAgentStatus('reminder-generator', 'completed', reminderDuration);
      updateWorkflowStep(3, 'completed');
      setShowGeneratedMessages(true);

      // Step 4: Simulated wait for responses
      updateWorkflowStep(4, 'running');
      addLog({ agent: 'Sistema', message: 'Simulazione attesa risposte...', type: 'info' });

      await new Promise(resolve => setTimeout(resolve, 1500));

      updateWorkflowStep(4, 'completed');
      addLog({ agent: 'Sistema', message: 'Risposta simulata ricevuta', type: 'info' });

      // Step 5: Response Handler Agent
      updateWorkflowStep(5, 'running');
      setAgentStatus('response-handler', 'running');
      addLog({ agent: 'response-handler', message: 'Analisi risposta con AI...', type: 'info' });

      const handlerStartTime = Date.now();

      // Simulated customer response
      const customerMessage = "Buongiorno, abbiamo ricevuto il vostro sollecito. Purtroppo in questo momento abbiamo difficoltà di liquidità. Sarebbe possibile rateizzare l'importo in 3 rate mensili? Confermiamo la nostra volontà di saldare il debito.";

      const handlerResponse = await fetch('/api/agents/response-handler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoices[0]?.invoice_id,
          customerMessage,
          provider: aiSettings.provider,
          model: aiSettings.model,
          apiKey: aiSettings.apiKey,
        }),
      });

      if (!handlerResponse.ok) {
        const error = await handlerResponse.json();
        throw new Error(error.error || 'Response handler failed');
      }

      const handlerResult = await handlerResponse.json();
      const handlerDuration = Date.now() - handlerStartTime;

      setResponseAnalysis({
        invoiceId: handlerResult.analysis.invoiceId || invoices[0]?.invoice_id || 'N/A',
        customerName: handlerResult.analysis.customerName || invoices[0]?.customer_name || 'Cliente',
        originalMessage: customerMessage,
        intent: handlerResult.analysis.intent,
        intentConfidence: handlerResult.analysis.intentConfidence,
        sentiment: handlerResult.analysis.sentiment,
        extractedInfo: handlerResult.analysis.extractedInfo || [],
        suggestedActions: handlerResult.analysis.suggestedActions || [],
        draftResponse: handlerResult.analysis.draftResponse,
        riskLevel: handlerResult.analysis.riskLevel,
      });

      addLog({ agent: 'response-handler', message: `Intent: ${handlerResult.analysis.intent} (${handlerResult.analysis.intentConfidence}%)`, type: 'info' });
      addLog({ agent: 'response-handler', message: `Sentiment: ${handlerResult.analysis.sentiment}`, type: 'info' });
      addLog({ agent: 'response-handler', message: `Rischio: ${handlerResult.analysis.riskLevel}`, type: 'warning' });

      setAgentStatus('response-handler', 'completed', handlerDuration);
      updateWorkflowStep(5, 'completed');
      setShowResponseAnalysis(true);

      addLog({ agent: 'Sistema', message: 'Workflow completato con successo!', type: 'success' });
    } catch (error) {
      addLog({ agent: 'Sistema', message: `Errore: ${error instanceof Error ? error.message : 'Unknown error'}`, type: 'error' });

      // Reset agent states on error
      setAgentStatus('payment-monitor', 'error');
      setAgentStatus('reminder-generator', 'error');
      setAgentStatus('response-handler', 'error');
    } finally {
      setWorkflowRunning(false);
    }
  }, [invoices, aiSettings, setWorkflowRunning, clearLogs, updateWorkflowStep, setAgentStatus, addLog, setAnalysisResult, setAnalysisReportContent, setShowAnalysisReport, setGeneratedMessages, setShowGeneratedMessages, setResponseAnalysis, setShowResponseAnalysis]);

  const handleReset = useCallback(async () => {
    try {
      await fetch('/api/invoices', { method: 'DELETE' });
    } catch (error) {
      console.error('Failed to delete invoices:', error);
    }
    resetAll();
    setSelectedInvoice(null);
  }, [resetAll]);

  const handleSaveSettings = useCallback((settings: AISettings) => {
    setAISettings(settings);
    addLog({ agent: 'Sistema', message: `Provider cambiato: ${settings.provider}`, type: 'info' });
  }, [setAISettings, addLog]);

  return (
    <div className="min-h-screen">
      <Header
        onUpload={() => setIsUploadOpen(true)}
        onRunWorkflow={runWorkflow}
        onReset={handleReset}
        onSettings={() => setIsSettingsOpen(true)}
        isRunning={isWorkflowRunning}
        hasInvoices={invoices.length > 0}
        aiProvider={aiSettings.provider}
        invoiceCount={invoices.length}
        theme={theme}
        onToggleTheme={toggleTheme}
        language={language}
        onToggleLanguage={handleToggleLanguage}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="mb-8">
          <StatsCards result={analysisResult} language={language} />
        </div>

        {/* Agents Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('aiAgents')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isActive={agent.status === 'running'}
                language={language}
              />
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Workflow & Logs */}
          <div className="space-y-6">
            <WorkflowTimeline steps={workflowSteps} currentStep={currentStep} language={language} />
            <LogsPanel logs={logs} onClear={clearLogs} language={language} />
          </div>

          {/* Right Column - Invoices Table */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('invoicesTitle')}</h2>
            <InvoicesTable
              invoices={invoices}
              onSelectInvoice={setSelectedInvoice}
              selectedInvoiceId={selectedInvoice?.invoice_id}
              language={language}
            />
          </div>
        </div>

        {/* Agent Outputs Section */}
        {(showAnalysisReport || showGeneratedMessages || showResponseAnalysis) && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('agentOutputs')}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AnalysisReport
                result={analysisResult}
                invoices={invoices}
                isVisible={showAnalysisReport}
                language={language}
              />
              <GeneratedMessages
                messages={generatedMessages}
                isVisible={showGeneratedMessages}
                language={language}
              />
              <ResponseAnalysis
                analysis={responseAnalysis}
                isVisible={showResponseAnalysis}
                language={language}
              />
            </div>

            {/* Full AI Analysis Report */}
            {analysisReportContent && (
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {t('fullAiReport')}
                </h3>
                <div className="prose dark:prose-invert max-w-none text-sm">
                  <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto max-h-96">
                    {analysisReportContent}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <FileUpload
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onFileSelect={handleFileSelect}
        language={language}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        currentSettings={aiSettings}
        language={language}
      />
    </div>
  );
}
