'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useTranslation, formatMessage, Language } from '@/lib/i18n';
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
import WorkflowHistory from '@/components/WorkflowHistory';
import { Download, Save } from 'lucide-react';
import { Invoice } from '@/types';

export default function Dashboard() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [historyRefresh, setHistoryRefresh] = useState(0);

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

  // Helper for translated log messages
  const logMsg = useCallback((key: Parameters<typeof formatMessage>[1], params?: Record<string, string | number>) => {
    return formatMessage(language, key, params);
  }, [language]);

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

    addLog({ agent: t('system'), message: logMsg('logLoadingInvoices', { count: parsedInvoices.length }), type: 'info' });

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

      addLog({ agent: t('system'), message: logMsg('logInvoicesLoaded', { count: result.count }), type: 'success' });
      updateWorkflowStep(1, 'completed');
    } catch (error) {
      addLog({ agent: t('system'), message: logMsg('logError', { error: String(error) }), type: 'error' });
    }
  }, [setInvoices, addLog, updateWorkflowStep, t, logMsg]);

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

    addLog({ agent: t('system'), message: logMsg('logWorkflowStart'), type: 'info' });
    addLog({ agent: t('system'), message: logMsg('logProviderInfo', { provider: aiSettings.provider, model: aiSettings.model }), type: 'info' });

    try {
      // Step 2: Payment Monitor Agent
      updateWorkflowStep(2, 'running');
      setAgentStatus('payment-monitor', 'running');
      addLog({ agent: 'payment-monitor', message: logMsg('logAnalysisStart'), type: 'info' });

      const monitorStartTime = Date.now();
      const monitorResponse = await fetch('/api/agents/payment-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: aiSettings.provider,
          model: aiSettings.model,
          apiKey: aiSettings.apiKey,
          language,
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

      addLog({ agent: 'payment-monitor', message: logMsg('logAnalysisComplete', { tokens: monitorResult.tokensUsed || 'N/A' }), type: 'success' });
      addLog({ agent: 'payment-monitor', message: logMsg('logOverdueFound', { count: monitorResult.stats.overdueInvoices }), type: 'warning' });

      setAgentStatus('payment-monitor', 'completed', monitorDuration);
      updateWorkflowStep(2, 'completed');
      setShowAnalysisReport(true);

      // Step 3: Reminder Generator Agent
      updateWorkflowStep(3, 'running');
      setAgentStatus('reminder-generator', 'running');
      addLog({ agent: 'reminder-generator', message: logMsg('logGeneratingMessages'), type: 'info' });

      const reminderStartTime = Date.now();
      const reminderResponse = await fetch('/api/agents/reminder-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: aiSettings.provider,
          model: aiSettings.model,
          apiKey: aiSettings.apiKey,
          language,
        }),
      });

      if (!reminderResponse.ok) {
        const error = await reminderResponse.json();
        throw new Error(error.error || 'Reminder generator failed');
      }

      const reminderResult = await reminderResponse.json();
      const reminderDuration = Date.now() - reminderStartTime;

      setGeneratedMessages(reminderResult.messages);

      addLog({ agent: 'reminder-generator', message: logMsg('logMessagesGenerated', { count: reminderResult.count }), type: 'success' });
      reminderResult.messages.forEach((msg: { channel: string; customerName: string }) => {
        addLog({ agent: 'reminder-generator', message: logMsg('logMessageFor', { channel: msg.channel.toUpperCase(), customer: msg.customerName }), type: 'info' });
      });

      setAgentStatus('reminder-generator', 'completed', reminderDuration);
      updateWorkflowStep(3, 'completed');
      setShowGeneratedMessages(true);

      // Step 4: Simulated wait for responses
      updateWorkflowStep(4, 'running');
      addLog({ agent: t('system'), message: logMsg('logWaitingResponses'), type: 'info' });

      await new Promise(resolve => setTimeout(resolve, 1500));

      updateWorkflowStep(4, 'completed');
      addLog({ agent: t('system'), message: logMsg('logResponseReceived'), type: 'info' });

      // Step 5: Response Handler Agent
      updateWorkflowStep(5, 'running');
      setAgentStatus('response-handler', 'running');
      addLog({ agent: 'response-handler', message: logMsg('logAnalyzingResponse'), type: 'info' });

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
          language,
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

      addLog({ agent: 'response-handler', message: logMsg('logIntentDetected', { intent: handlerResult.analysis.intent, confidence: handlerResult.analysis.intentConfidence }), type: 'info' });
      addLog({ agent: 'response-handler', message: logMsg('logSentimentDetected', { sentiment: handlerResult.analysis.sentiment }), type: 'info' });
      addLog({ agent: 'response-handler', message: logMsg('logRiskDetected', { risk: handlerResult.analysis.riskLevel }), type: 'warning' });

      setAgentStatus('response-handler', 'completed', handlerDuration);
      updateWorkflowStep(5, 'completed');
      setShowResponseAnalysis(true);

      addLog({ agent: t('system'), message: logMsg('logWorkflowComplete'), type: 'success' });
    } catch (error) {
      addLog({ agent: t('system'), message: logMsg('logError', { error: error instanceof Error ? error.message : 'Unknown error' }), type: 'error' });

      // Reset agent states on error
      setAgentStatus('payment-monitor', 'error');
      setAgentStatus('reminder-generator', 'error');
      setAgentStatus('response-handler', 'error');
    } finally {
      setWorkflowRunning(false);
    }
  }, [invoices, aiSettings, language, setWorkflowRunning, clearLogs, updateWorkflowStep, setAgentStatus, addLog, setAnalysisResult, setAnalysisReportContent, setShowAnalysisReport, setGeneratedMessages, setShowGeneratedMessages, setResponseAnalysis, setShowResponseAnalysis, t, logMsg]);

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
    addLog({ agent: t('system'), message: logMsg('logProviderChanged', { provider: settings.provider }), type: 'info' });
  }, [setAISettings, addLog, t, logMsg]);

  // Export current results to JSON
  const handleExportResults = useCallback(() => {
    const exportData = {
      exportDate: new Date().toISOString(),
      aiProvider: aiSettings.provider,
      aiModel: aiSettings.model,
      stats: analysisResult,
      analysisReport: analysisReportContent,
      generatedMessages,
      responseAnalysis,
      invoices,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paymind-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addLog({ agent: t('system'), message: logMsg('logExportSuccess'), type: 'success' });
  }, [analysisResult, analysisReportContent, generatedMessages, responseAnalysis, invoices, aiSettings, addLog, t, logMsg]);

  // Save current workflow run to history
  const handleSaveToHistory = useCallback(async () => {
    if (!analysisResult) {
      addLog({ agent: t('system'), message: logMsg('logNoResults'), type: 'warning' });
      return;
    }

    try {
      const response = await fetch('/api/workflow-runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          totalInvoices: analysisResult.totalInvoices,
          overdueInvoices: analysisResult.overdueInvoices,
          totalCredits: analysisResult.totalCredits,
          overdueAmount: analysisResult.overdueAmount,
          messagesGenerated: generatedMessages.length,
          aiProvider: aiSettings.provider,
          aiModel: aiSettings.model,
          analysisReport: analysisReportContent,
          generatedMessages,
          responseAnalysis,
          invoicesSnapshot: invoices,
          logs: logs.map(log => ({ agent: log.agent, message: log.message, type: log.type })),
        }),
      });

      if (response.ok) {
        addLog({ agent: t('system'), message: logMsg('logSaveSuccess'), type: 'success' });
        setHistoryRefresh(prev => prev + 1);
      } else {
        throw new Error('Failed to save workflow');
      }
    } catch (error) {
      addLog({ agent: t('system'), message: logMsg('logSaveError', { error: String(error) }), type: 'error' });
    }
  }, [analysisResult, analysisReportContent, generatedMessages, responseAnalysis, invoices, aiSettings, logs, addLog, t, logMsg]);

  // Load a workflow run from history
  const handleLoadRun = useCallback((run: {
    analysisReport: string | null;
    generatedMessages: string | null;
    responseAnalysis: string | null;
    invoicesSnapshot: string | null;
    totalInvoices: number;
    overdueInvoices: number;
    totalCredits: number;
    overdueAmount: number;
  }) => {
    // Restore analysis result
    setAnalysisResult({
      totalInvoices: run.totalInvoices,
      overdueInvoices: run.overdueInvoices,
      totalCredits: run.totalCredits,
      overdueAmount: run.overdueAmount,
    });

    // Restore analysis report content
    if (run.analysisReport) {
      setAnalysisReportContent(run.analysisReport);
      setShowAnalysisReport(true);
    }

    // Restore generated messages
    if (run.generatedMessages) {
      const messages = typeof run.generatedMessages === 'string'
        ? JSON.parse(run.generatedMessages)
        : run.generatedMessages;
      setGeneratedMessages(messages);
      setShowGeneratedMessages(true);
    }

    // Restore response analysis
    if (run.responseAnalysis) {
      const analysis = typeof run.responseAnalysis === 'string'
        ? JSON.parse(run.responseAnalysis)
        : run.responseAnalysis;
      setResponseAnalysis(analysis);
      setShowResponseAnalysis(true);
    }

    // Restore invoices
    if (run.invoicesSnapshot) {
      const invs = typeof run.invoicesSnapshot === 'string'
        ? JSON.parse(run.invoicesSnapshot)
        : run.invoicesSnapshot;
      setInvoices(invs);
    }

    addLog({ agent: t('system'), message: logMsg('logLoadedFromHistory'), type: 'info' });
  }, [setAnalysisResult, setAnalysisReportContent, setShowAnalysisReport, setGeneratedMessages, setShowGeneratedMessages, setResponseAnalysis, setShowResponseAnalysis, setInvoices, addLog, t, logMsg]);

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
          {/* Left Column - Workflow, Logs & History */}
          <div className="space-y-6">
            <WorkflowTimeline steps={workflowSteps} currentStep={currentStep} language={language} />
            <LogsPanel logs={logs} onClear={clearLogs} language={language} />
            <WorkflowHistory
              language={language}
              onLoadRun={handleLoadRun}
              refreshTrigger={historyRefresh}
            />
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('agentOutputs')}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportResults}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {t('exportCurrentResults')}
                </button>
                <button
                  onClick={handleSaveToHistory}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {t('saveToHistory')}
                </button>
              </div>
            </div>
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
