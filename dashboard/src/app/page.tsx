'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
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
import { Download, Save, Copy, Check, FileText } from 'lucide-react';
import { Invoice } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Dashboard() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [reportCopied, setReportCopied] = useState(false);

  // AbortController for stopping workflow
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // Copy full AI report to clipboard
  const handleCopyReport = useCallback(async () => {
    if (analysisReportContent) {
      await navigator.clipboard.writeText(analysisReportContent);
      setReportCopied(true);
      setTimeout(() => setReportCopied(false), 2000);
    }
  }, [analysisReportContent]);

  // Generate professional PDF report
  const handleExportPDF = useCallback(() => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Helper functions
    const addSectionTitle = (text: string) => {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text(text, 14, yPos);
      yPos += 2;
      // Underline
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(0.5);
      doc.line(14, yPos, 80, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 8;
    };

    const checkPageBreak = (needed: number = 40) => {
      if (yPos > pageHeight - needed) {
        doc.addPage();
        yPos = 20;
      }
    };

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat(language === 'it' ? 'it-IT' : 'en-US', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount);
    };

    // === HEADER ===
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Logo circle
    doc.setFillColor(255, 255, 255);
    doc.circle(25, 20, 8, 'F');
    doc.setFillColor(245, 158, 11);
    doc.circle(25, 20, 5, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('PayMind', 40, 22);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(language === 'it' ? 'Report Analisi Fatture' : 'Invoice Analysis Report', 40, 32);
    doc.setTextColor(0, 0, 0);
    yPos = 50;

    // Date and AI info
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(14, yPos, pageWidth - 28, 12, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(`${language === 'it' ? 'Generato il' : 'Generated on'}: ${new Date().toLocaleString(language === 'it' ? 'it-IT' : 'en-US')}`, 18, yPos + 8);
    doc.text(`AI: ${aiSettings.provider} / ${aiSettings.model}`, pageWidth - 18, yPos + 8, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    yPos += 22;

    if (analysisResult) {
      // === EXECUTIVE SUMMARY CARDS ===
      addSectionTitle(language === 'it' ? 'RIEPILOGO ESECUTIVO' : 'EXECUTIVE SUMMARY');

      const overdueInvoicesList = invoices.filter(inv => inv.status === 'open' && (inv.days_overdue || 0) > 0);
      const avgDays = overdueInvoicesList.length > 0
        ? Math.round(overdueInvoicesList.reduce((sum, inv) => sum + (inv.days_overdue || 0), 0) / overdueInvoicesList.length)
        : 0;

      // 4 stat cards
      const cardWidth = (pageWidth - 28 - 12) / 4;
      const cardHeight = 25;
      const cards = [
        { label: language === 'it' ? 'Fatture Totali' : 'Total Invoices', value: String(analysisResult.totalInvoices), color: [59, 130, 246] },
        { label: language === 'it' ? 'Scadute' : 'Overdue', value: String(analysisResult.overdueInvoices), color: [239, 68, 68] },
        { label: language === 'it' ? 'Ritardo Medio' : 'Avg Delay', value: `${avgDays} ${language === 'it' ? 'gg' : 'd'}`, color: [245, 158, 11] },
        { label: language === 'it' ? 'Crediti Totali' : 'Total Credits', value: formatCurrency(analysisResult.totalCredits), color: [34, 197, 94] },
      ];

      cards.forEach((card, idx) => {
        const x = 14 + idx * (cardWidth + 4);
        doc.setFillColor(card.color[0], card.color[1], card.color[2]);
        doc.roundedRect(x, yPos, cardWidth, cardHeight, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(card.label, x + cardWidth / 2, yPos + 8, { align: 'center' });
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(card.value, x + cardWidth / 2, yPos + 18, { align: 'center' });
      });
      doc.setTextColor(0, 0, 0);
      yPos += cardHeight + 15;

      // === PRIORITY BAR CHART ===
      checkPageBreak(70);
      addSectionTitle(language === 'it' ? 'SEGMENTAZIONE PRIORITA' : 'PRIORITY SEGMENTATION');

      const priorities = [
        { label: language === 'it' ? 'ALTA' : 'HIGH', value: analysisResult.byPriority.alta, color: [239, 68, 68] },
        { label: language === 'it' ? 'MEDIA' : 'MEDIUM', value: analysisResult.byPriority.media, color: [245, 158, 11] },
        { label: language === 'it' ? 'BASSA' : 'LOW', value: analysisResult.byPriority.bassa, color: [156, 163, 175] },
      ];
      const maxVal = Math.max(...priorities.map(p => p.value), 1);
      const barMaxWidth = 100;
      const barHeight = 12;

      priorities.forEach((p, idx) => {
        const barY = yPos + idx * (barHeight + 8);
        const barWidth = (p.value / maxVal) * barMaxWidth;
        const percent = analysisResult.totalInvoices > 0 ? ((p.value / analysisResult.totalInvoices) * 100).toFixed(0) : 0;

        // Label
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(55, 65, 81);
        doc.text(p.label, 14, barY + 8);

        // Background bar
        doc.setFillColor(229, 231, 235);
        doc.roundedRect(50, barY, barMaxWidth, barHeight, 2, 2, 'F');

        // Value bar
        if (barWidth > 0) {
          doc.setFillColor(p.color[0], p.color[1], p.color[2]);
          doc.roundedRect(50, barY, barWidth, barHeight, 2, 2, 'F');
        }

        // Value text
        doc.setTextColor(55, 65, 81);
        doc.setFont('helvetica', 'normal');
        doc.text(`${p.value} (${percent}%)`, 155, barY + 8);
      });
      doc.setTextColor(0, 0, 0);
      yPos += priorities.length * (barHeight + 8) + 15;

      // === FINANCIAL SUMMARY ===
      checkPageBreak(50);
      addSectionTitle(language === 'it' ? 'RIEPILOGO FINANZIARIO' : 'FINANCIAL SUMMARY');

      const overduePercent = analysisResult.totalCredits > 0
        ? ((analysisResult.overdueAmount / analysisResult.totalCredits) * 100).toFixed(1)
        : '0';

      // Pie chart representation (simple)
      const pieX = 35;
      const pieY = yPos + 20;
      const pieR = 18;

      // Full circle (total)
      doc.setFillColor(34, 197, 94);
      doc.circle(pieX, pieY, pieR, 'F');

      // Overdue segment
      if (parseFloat(overduePercent) > 0) {
        const angle = (parseFloat(overduePercent) / 100) * 2 * Math.PI;
        doc.setFillColor(239, 68, 68);
        // Draw pie slice
        doc.circle(pieX, pieY, pieR, 'F');
        doc.setFillColor(34, 197, 94);
        // Approximate with a mask
        if (parseFloat(overduePercent) < 100) {
          const startAngle = -Math.PI / 2;
          const endAngle = startAngle + (1 - parseFloat(overduePercent) / 100) * 2 * Math.PI;
          // Simple visualization - just show proportional coloring
          doc.setFillColor(239, 68, 68);
          doc.circle(pieX, pieY, pieR, 'F');
          doc.setFillColor(34, 197, 94);
          doc.circle(pieX, pieY, pieR * (1 - parseFloat(overduePercent) / 100), 'F');
        }
      }

      // Legend
      const legendX = 70;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      doc.setFillColor(34, 197, 94);
      doc.rect(legendX, yPos + 5, 8, 8, 'F');
      doc.setTextColor(55, 65, 81);
      doc.text(`${language === 'it' ? 'Crediti Totali' : 'Total Credits'}: ${formatCurrency(analysisResult.totalCredits)}`, legendX + 12, yPos + 12);

      doc.setFillColor(239, 68, 68);
      doc.rect(legendX, yPos + 18, 8, 8, 'F');
      doc.text(`${language === 'it' ? 'Importo Scaduto' : 'Overdue'}: ${formatCurrency(analysisResult.overdueAmount)} (${overduePercent}%)`, legendX + 12, yPos + 25);

      yPos += 50;
    }

    // === INVOICES TABLE ===
    if (invoices.length > 0) {
      checkPageBreak(60);
      addSectionTitle(language === 'it' ? 'DETTAGLIO FATTURE SCADUTE' : 'OVERDUE INVOICES DETAIL');

      const overdueInvoices = invoices
        .filter(inv => inv.status === 'open' && (inv.days_overdue || 0) > 0)
        .sort((a, b) => (b.days_overdue || 0) - (a.days_overdue || 0));

      if (overdueInvoices.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [[
            'ID',
            language === 'it' ? 'Cliente' : 'Customer',
            language === 'it' ? 'Importo Dovuto' : 'Amount Due',
            language === 'it' ? 'Giorni Ritardo' : 'Days Overdue',
            language === 'it' ? 'Priorita' : 'Priority'
          ]],
          body: overdueInvoices.map(inv => [
            inv.invoice_id,
            inv.customer_name,
            formatCurrency(inv.amount_total - inv.amount_paid),
            String(inv.days_overdue || 0),
            (inv.priority || 'N/A').toUpperCase()
          ]),
          theme: 'grid',
          headStyles: {
            fillColor: [239, 68, 68],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
          },
          bodyStyles: {
            fontSize: 9,
          },
          alternateRowStyles: {
            fillColor: [254, 242, 242]
          },
          columnStyles: {
            0: { cellWidth: 30 },
            2: { halign: 'right' },
            3: { halign: 'center' },
            4: { halign: 'center' }
          },
          margin: { left: 14, right: 14 },
        });
        yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
      }
    }

    // === GENERATED MESSAGES ===
    if (generatedMessages.length > 0) {
      checkPageBreak(60);
      addSectionTitle(language === 'it' ? 'MESSAGGI SOLLECITO GENERATI' : 'GENERATED REMINDER MESSAGES');

      autoTable(doc, {
        startY: yPos,
        head: [[
          language === 'it' ? 'Canale' : 'Channel',
          language === 'it' ? 'Cliente' : 'Customer',
          'ID Fattura',
          language === 'it' ? 'Priorita' : 'Priority'
        ]],
        body: generatedMessages.map(msg => [
          msg.channel.toUpperCase(),
          msg.customer_name,
          msg.invoice_id,
          (msg.priority || 'N/A').toUpperCase()
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [139, 92, 246],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 9,
        },
        alternateRowStyles: {
          fillColor: [245, 243, 255]
        },
        columnStyles: {
          0: { cellWidth: 25, halign: 'center' },
          3: { halign: 'center' }
        },
        margin: { left: 14, right: 14 },
      });
      yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
    }

    // === RESPONSE ANALYSIS ===
    if (responseAnalysis) {
      checkPageBreak(80);
      addSectionTitle(language === 'it' ? 'ANALISI RISPOSTA CLIENTE' : 'CUSTOMER RESPONSE ANALYSIS');

      // Info box
      doc.setFillColor(240, 249, 255);
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(0.5);
      doc.roundedRect(14, yPos, pageWidth - 28, 55, 3, 3, 'FD');

      let infoY = yPos + 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);

      doc.text(`Intent:`, 20, infoY);
      doc.setFont('helvetica', 'normal');
      doc.text(`${responseAnalysis.intent || 'N/A'} (${responseAnalysis.confidence || 0}% confidence)`, 50, infoY);

      infoY += 10;
      doc.setFont('helvetica', 'bold');
      doc.text(`Sentiment:`, 20, infoY);
      doc.setFont('helvetica', 'normal');
      const sentiment = responseAnalysis.sentiment || 'neutral';
      const sentimentColor = sentiment === 'positive' ? [34, 197, 94] :
                             sentiment === 'negative' ? [239, 68, 68] : [107, 114, 128];
      doc.setTextColor(sentimentColor[0], sentimentColor[1], sentimentColor[2]);
      doc.text(sentiment, 50, infoY);
      doc.setTextColor(31, 41, 55);

      infoY += 10;
      doc.setFont('helvetica', 'bold');
      doc.text(`${language === 'it' ? 'Rischio' : 'Risk'}:`, 20, infoY);
      doc.setFont('helvetica', 'normal');
      const riskLevel = responseAnalysis.risk_level || 'medium';
      const riskColor = riskLevel === 'high' ? [239, 68, 68] :
                        riskLevel === 'medium' ? [245, 158, 11] : [34, 197, 94];
      doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
      doc.text(riskLevel.toUpperCase(), 50, infoY);
      doc.setTextColor(0, 0, 0);

      yPos += 65;

      // Suggested actions
      if (responseAnalysis.suggested_actions?.length > 0) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(31, 41, 55);
        doc.text(language === 'it' ? 'Azioni Suggerite:' : 'Suggested Actions:', 14, yPos);
        yPos += 8;

        responseAnalysis.suggested_actions.forEach((action: string, idx: number) => {
          checkPageBreak(15);
          doc.setFillColor(59, 130, 246);
          doc.circle(20, yPos - 2, 2, 'F');
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(55, 65, 81);
          doc.text(action, 26, yPos);
          yPos += 8;
        });
      }
    }

    // === FOOTER on all pages ===
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      // Footer line
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);
      // Footer text
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text('PayMind - AI Payment Reminder System', 14, pageHeight - 8);
      doc.text(`${language === 'it' ? 'Pagina' : 'Page'} ${i} / ${pageCount}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
    }

    // Save PDF
    doc.save(`paymind-report-${new Date().toISOString().split('T')[0]}.pdf`);
    addLog({ agent: 'system', message: language === 'it' ? 'Report PDF esportato con successo' : 'PDF report exported successfully', type: 'success' });
  }, [analysisResult, invoices, generatedMessages, responseAnalysis, aiSettings, language, addLog]);

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

  // Stop the running workflow
  const stopWorkflow = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const runWorkflow = useCallback(async () => {
    if (invoices.length === 0) return;

    // Create new AbortController for this workflow run
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

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
        signal,
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
        signal,
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
      const customerMessage = t('simulatedCustomerMessage');

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
        signal,
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
      // Check if the workflow was aborted by the user
      if (error instanceof Error && error.name === 'AbortError') {
        addLog({ agent: t('system'), message: logMsg('workflowStopped'), type: 'warning' });

        // Reset agent states to idle on abort
        setAgentStatus('payment-monitor', 'idle');
        setAgentStatus('reminder-generator', 'idle');
        setAgentStatus('response-handler', 'idle');
      } else {
        addLog({ agent: t('system'), message: logMsg('logError', { error: error instanceof Error ? error.message : 'Unknown error' }), type: 'error' });

        // Reset agent states on error
        setAgentStatus('payment-monitor', 'error');
        setAgentStatus('reminder-generator', 'error');
        setAgentStatus('response-handler', 'error');
      }
    } finally {
      setWorkflowRunning(false);
      abortControllerRef.current = null;
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
        onStopWorkflow={stopWorkflow}
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

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats */}
        <div className="mb-6 sm:mb-8">
          <StatsCards result={analysisResult} language={language} />
        </div>

        {/* Agents Grid */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">{t('aiAgents')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Left Column - Workflow, Logs & History */}
          <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
            <WorkflowTimeline steps={workflowSteps} currentStep={currentStep} language={language} />
            <LogsPanel logs={logs} onClear={clearLogs} language={language} />
            <WorkflowHistory
              language={language}
              onLoadRun={handleLoadRun}
              refreshTrigger={historyRefresh}
            />
          </div>

          {/* Right Column - Invoices Table (shown first on mobile) */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">{t('invoicesTitle')}</h2>
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
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('agentOutputs')}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportResults}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 sm:py-1.5 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('exportCurrentResults')}</span>
                  <span className="sm:hidden">{language === 'it' ? 'Esporta' : 'Export'}</span>
                </button>
                <button
                  onClick={handleSaveToHistory}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 sm:py-1.5 text-sm font-medium text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('saveToHistory')}</span>
                  <span className="sm:hidden">{language === 'it' ? 'Salva' : 'Save'}</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    {t('fullAiReport')}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyReport}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      title={language === 'it' ? 'Copia report' : 'Copy report'}
                    >
                      {reportCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      <span className="hidden xs:inline">{reportCopied ? (language === 'it' ? 'Copiato!' : 'Copied!') : (language === 'it' ? 'Copia' : 'Copy')}</span>
                    </button>
                    <button
                      onClick={handleExportPDF}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      title={language === 'it' ? 'Esporta PDF professionale' : 'Export professional PDF'}
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden xs:inline">{language === 'it' ? 'Esporta PDF' : 'Export PDF'}</span>
                    </button>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="prose dark:prose-invert max-w-none text-sm">
                    <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 rounded-lg overflow-auto max-h-64 sm:max-h-96 text-xs sm:text-sm">
                      {analysisReportContent}
                    </pre>
                  </div>
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
