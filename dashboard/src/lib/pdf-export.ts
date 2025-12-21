import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice } from '@/types';
import { Language } from './i18n';
import { GeneratedMessage } from '@/components/GeneratedMessages';
import { ResponseAnalysisData } from '@/components/ResponseAnalysis';

interface AnalysisResult {
  totalInvoices: number;
  overdueInvoices: number;
  totalCredits: number;
  overdueAmount: number;
  byPriority: {
    alta: number;
    media: number;
    bassa: number;
  };
}

interface PDFExportOptions {
  language: Language;
  analysisResult: AnalysisResult | null;
  invoices: Invoice[];
  generatedMessages: GeneratedMessage[];
  responseAnalysis: ResponseAnalysisData | null;
  analysisReportContent: string | null;
  aiSettings: { provider: string; model: string };
}

// Translation helper
const t = (lang: Language, it: string, en: string) => lang === 'it' ? it : en;

// Format currency
const formatCurrency = (amount: number, lang: Language) => {
  return new Intl.NumberFormat(lang === 'it' ? 'it-IT' : 'en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

// Translate priority
const translatePriority = (priority: string | undefined, lang: Language): string => {
  if (!priority) return 'N/A';
  const upperPriority = priority.toUpperCase();
  if (lang === 'en') {
    if (upperPriority === 'ALTA') return 'HIGH';
    if (upperPriority === 'MEDIA') return 'MEDIUM';
    if (upperPriority === 'BASSA') return 'LOW';
  }
  return upperPriority;
};

// Color palette
const colors = {
  primary: [79, 70, 229] as [number, number, number],      // Indigo 600
  secondary: [71, 85, 105] as [number, number, number],    // Slate 500
  light: [241, 245, 249] as [number, number, number],      // Slate 100
  border: [203, 213, 225] as [number, number, number],     // Slate 300
  text: [51, 65, 85] as [number, number, number],          // Slate 700
  muted: [148, 163, 184] as [number, number, number],      // Slate 400
  red: [239, 68, 68] as [number, number, number],          // Red 500
  orange: [249, 115, 22] as [number, number, number],      // Orange 500
  green: [34, 197, 94] as [number, number, number],        // Green 500
};

export function generateComprehensivePDF(options: PDFExportOptions): void {
  const { language, analysisResult, invoices, generatedMessages, responseAnalysis, analysisReportContent, aiSettings } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Helper: Add section title
  const addSectionTitle = (text: string, color: [number, number, number] = colors.primary) => {
    checkPageBreak(25);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(text, 14, yPos);
    yPos += 3;
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(0.5);
    doc.line(14, yPos, 80, yPos);
    yPos += 10;
  };

  // Helper: Check page break
  const checkPageBreak = (needed: number = 40) => {
    if (yPos > pageHeight - needed) {
      doc.addPage();
      yPos = 25;
    }
  };

  // Helper: Draw simple bar chart
  const drawBarChart = (data: { label: string; value: number; color: [number, number, number] }[], maxValue: number, width: number = 80) => {
    const barHeight = 12;
    const gap = 6;

    data.forEach((item, index) => {
      checkPageBreak(barHeight + gap + 15);
      const barWidth = maxValue > 0 ? (item.value / maxValue) * width : 0;

      // Bar background
      doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
      doc.roundedRect(14, yPos, width, barHeight, 2, 2, 'F');

      // Bar fill
      if (barWidth > 0) {
        doc.setFillColor(item.color[0], item.color[1], item.color[2]);
        doc.roundedRect(14, yPos, Math.max(barWidth, 4), barHeight, 2, 2, 'F');
      }

      // Label and value
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      doc.text(item.label, 14 + width + 5, yPos + 8);

      doc.setFont('helvetica', 'normal');
      doc.text(String(item.value), 14 + width + 45, yPos + 8);

      yPos += barHeight + gap;
    });
  };

  // ===== COVER PAGE =====
  // Header background
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, 60, 'F');

  // Logo and title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('PayMind', 14, 28);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(t(language, 'Report Completo Analisi Crediti', 'Complete Credit Analysis Report'), 14, 42);

  // Date and AI info
  doc.setFontSize(10);
  doc.text(new Date().toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }), pageWidth - 14, 28, { align: 'right' });
  doc.text(`${aiSettings.provider} / ${aiSettings.model}`, pageWidth - 14, 42, { align: 'right' });

  yPos = 80;
  doc.setTextColor(0, 0, 0);

  // ===== EXECUTIVE SUMMARY =====
  if (analysisResult) {
    addSectionTitle(t(language, 'RIEPILOGO ESECUTIVO', 'EXECUTIVE SUMMARY'));

    const overdueInvoicesList = invoices.filter(inv => inv.status === 'open' && (inv.days_overdue || 0) > 0);
    const avgDays = overdueInvoicesList.length > 0
      ? Math.round(overdueInvoicesList.reduce((sum, inv) => sum + (inv.days_overdue || 0), 0) / overdueInvoicesList.length)
      : 0;
    const overduePercent = analysisResult.totalCredits > 0
      ? ((analysisResult.overdueAmount / analysisResult.totalCredits) * 100).toFixed(1)
      : '0';

    // KPI Cards
    const kpis = [
      {
        label: t(language, 'Fatture Totali', 'Total Invoices'),
        value: String(analysisResult.totalInvoices),
        sub: t(language, 'analizzate', 'analyzed')
      },
      {
        label: t(language, 'Fatture Scadute', 'Overdue Invoices'),
        value: String(analysisResult.overdueInvoices),
        sub: `${overduePercent}% ${t(language, 'del totale', 'of total')}`
      },
      {
        label: t(language, 'Crediti Totali', 'Total Credits'),
        value: formatCurrency(analysisResult.totalCredits, language),
        sub: ''
      },
      {
        label: t(language, 'Importo Scaduto', 'Overdue Amount'),
        value: formatCurrency(analysisResult.overdueAmount, language),
        sub: t(language, `ritardo medio ${avgDays}gg`, `avg delay ${avgDays} days`)
      },
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: kpis.map(kpi => [kpi.label, kpi.value, kpi.sub]),
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 6 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50, textColor: colors.secondary },
        1: { fontStyle: 'bold', cellWidth: 50, textColor: colors.primary, fontSize: 12 },
        2: { textColor: colors.muted, fontSize: 8 },
      },
      margin: { left: 14, right: 14 },
    });
    yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

    // ===== PRIORITY DISTRIBUTION CHART =====
    checkPageBreak(80);
    addSectionTitle(t(language, 'DISTRIBUZIONE PER PRIORITÀ', 'PRIORITY DISTRIBUTION'));

    const maxPriority = Math.max(analysisResult.byPriority.alta, analysisResult.byPriority.media, analysisResult.byPriority.bassa, 1);
    drawBarChart([
      { label: t(language, 'Alta', 'High'), value: analysisResult.byPriority.alta, color: colors.red },
      { label: t(language, 'Media', 'Medium'), value: analysisResult.byPriority.media, color: colors.orange },
      { label: t(language, 'Bassa', 'Low'), value: analysisResult.byPriority.bassa, color: colors.green },
    ], maxPriority);

    yPos += 10;
  }

  // ===== TOP CLIENTS BY CREDIT =====
  if (invoices.length > 0) {
    checkPageBreak(100);
    addSectionTitle(t(language, 'TOP 10 CLIENTI PER CREDITO', 'TOP 10 CLIENTS BY CREDIT'));

    const clientCredits = invoices.reduce((acc, inv) => {
      const credit = inv.amount_total - inv.amount_paid;
      if (credit > 0) {
        acc[inv.customer_name] = (acc[inv.customer_name] || 0) + credit;
      }
      return acc;
    }, {} as Record<string, number>);

    const topClients = Object.entries(clientCredits)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    if (topClients.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [[
          '#',
          t(language, 'Cliente', 'Client'),
          t(language, 'Credito', 'Credit')
        ]],
        body: topClients.map(([name, amount], idx) => [
          String(idx + 1),
          name,
          formatCurrency(amount, language)
        ]),
        theme: 'striped',
        headStyles: {
          fillColor: colors.primary,
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 9,
        },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: colors.light },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          2: { halign: 'right', fontStyle: 'bold' },
        },
        margin: { left: 14, right: 14 },
      });
      yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
    }
  }

  // ===== COMPLETE INVOICE LIST =====
  if (invoices.length > 0) {
    doc.addPage();
    yPos = 25;
    addSectionTitle(t(language, 'DETTAGLIO COMPLETO FATTURE', 'COMPLETE INVOICE DETAILS'));

    const overdueInvoices = invoices
      .filter(inv => inv.status === 'open' && (inv.days_overdue || 0) > 0)
      .sort((a, b) => (b.days_overdue || 0) - (a.days_overdue || 0));

    if (overdueInvoices.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [[
          'ID',
          t(language, 'Cliente', 'Customer'),
          t(language, 'Email', 'Email'),
          t(language, 'Importo', 'Amount'),
          t(language, 'Scadenza', 'Due Date'),
          t(language, 'Giorni', 'Days'),
          t(language, 'Priorità', 'Priority'),
          t(language, 'Canale', 'Channel')
        ]],
        body: overdueInvoices.map(inv => [
          inv.invoice_id,
          inv.customer_name,
          inv.customer_email || '-',
          formatCurrency(inv.amount_total - inv.amount_paid, language),
          new Date(inv.due_date).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US'),
          String(inv.days_overdue || 0),
          translatePriority(inv.priority, language),
          (inv.preferred_channel || '-').toUpperCase()
        ]),
        theme: 'striped',
        headStyles: {
          fillColor: colors.primary,
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 8,
        },
        bodyStyles: { fontSize: 7 },
        alternateRowStyles: { fillColor: colors.light },
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: 30 },
          2: { cellWidth: 35 },
          3: { halign: 'right', cellWidth: 22 },
          4: { cellWidth: 20 },
          5: { halign: 'center', cellWidth: 12 },
          6: { halign: 'center', cellWidth: 18 },
          7: { halign: 'center', cellWidth: 18 }
        },
        margin: { left: 10, right: 10 },
      });
      yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
    }
  }

  // ===== GENERATED MESSAGES (with full content) =====
  if (generatedMessages.length > 0) {
    doc.addPage();
    yPos = 25;
    addSectionTitle(t(language, 'MESSAGGI GENERATI', 'GENERATED MESSAGES'));

    generatedMessages.forEach((msg, idx) => {
      checkPageBreak(80);

      // Message header
      doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
      doc.roundedRect(14, yPos, pageWidth - 28, 20, 2, 2, 'F');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.text(`${idx + 1}. ${msg.customerName}`, 18, yPos + 8);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
      doc.text(`${msg.channel.toUpperCase()} | ${msg.invoiceId} | ${translatePriority(msg.priority, language)}`, 18, yPos + 15);

      yPos += 25;

      // Subject (if email)
      if (msg.subject) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.text(`${t(language, 'Oggetto:', 'Subject:')} ${msg.subject}`, 14, yPos);
        yPos += 7;
      }

      // Message content
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);

      const contentLines = doc.splitTextToSize(msg.content, pageWidth - 32);
      contentLines.forEach((line: string) => {
        checkPageBreak(8);
        doc.text(line, 14, yPos);
        yPos += 5;
      });

      yPos += 10;
    });
  }

  // ===== RESPONSE ANALYSIS (complete) =====
  if (responseAnalysis) {
    doc.addPage();
    yPos = 25;
    addSectionTitle(t(language, 'ANALISI RISPOSTA CLIENTE', 'CUSTOMER RESPONSE ANALYSIS'));

    // Original message
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.text(t(language, 'Messaggio Originale:', 'Original Message:'), 14, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'italic');
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    const msgLines = doc.splitTextToSize(`"${responseAnalysis.originalMessage}"`, pageWidth - 32);
    msgLines.forEach((line: string) => {
      checkPageBreak(8);
      doc.text(line, 14, yPos);
      yPos += 5;
    });
    yPos += 10;

    // Analysis results
    const riskColors: Record<string, [number, number, number]> = {
      low: colors.green,
      medium: colors.orange,
      high: colors.red,
    };

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: [
        [t(language, 'Intent Identificato', 'Identified Intent'), `${responseAnalysis.intent} (${responseAnalysis.intentConfidence}%)`],
        ['Sentiment', responseAnalysis.sentiment.charAt(0).toUpperCase() + responseAnalysis.sentiment.slice(1)],
        [t(language, 'Livello Rischio', 'Risk Level'), responseAnalysis.riskLevel.toUpperCase()],
      ],
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50, textColor: colors.secondary },
        1: { textColor: colors.text },
      },
      margin: { left: 14, right: 14 },
      didDrawCell: (data) => {
        if (data.column.index === 1 && data.row.index === 2) {
          const riskLevel = responseAnalysis.riskLevel as keyof typeof riskColors;
          doc.setTextColor(riskColors[riskLevel][0], riskColors[riskLevel][1], riskColors[riskLevel][2]);
        }
      },
    });
    yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    // Extracted info
    if (responseAnalysis.extractedInfo && responseAnalysis.extractedInfo.length > 0) {
      checkPageBreak(40);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      doc.text(t(language, 'Informazioni Estratte:', 'Extracted Information:'), 14, yPos);
      yPos += 6;

      responseAnalysis.extractedInfo.forEach((info) => {
        checkPageBreak(8);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.text(`• ${info.label}: ${info.value}`, 18, yPos);
        yPos += 5;
      });
      yPos += 8;
    }

    // Suggested actions
    if (responseAnalysis.suggestedActions && responseAnalysis.suggestedActions.length > 0) {
      checkPageBreak(40);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      doc.text(t(language, 'Azioni Suggerite:', 'Suggested Actions:'), 14, yPos);
      yPos += 6;

      responseAnalysis.suggestedActions.forEach((action, idx) => {
        checkPageBreak(8);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.text(`${idx + 1}. ${action}`, 18, yPos);
        yPos += 5;
      });
      yPos += 8;
    }

    // Draft response
    if (responseAnalysis.draftResponse) {
      checkPageBreak(60);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      doc.text(t(language, 'Bozza Risposta Suggerita:', 'Suggested Draft Response:'), 14, yPos);
      yPos += 8;

      doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
      doc.roundedRect(14, yPos, pageWidth - 28, 5, 2, 2, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      const draftLines = doc.splitTextToSize(responseAnalysis.draftResponse, pageWidth - 36);

      let boxHeight = draftLines.length * 5 + 10;
      doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
      doc.roundedRect(14, yPos, pageWidth - 28, boxHeight, 2, 2, 'F');

      yPos += 6;
      draftLines.forEach((line: string) => {
        checkPageBreak(8);
        doc.text(line, 18, yPos);
        yPos += 5;
      });
    }
  }

  // ===== AI ANALYSIS REPORT (full text) =====
  if (analysisReportContent) {
    doc.addPage();
    yPos = 25;
    addSectionTitle(t(language, 'REPORT COMPLETO AI', 'FULL AI REPORT'));

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);

    const reportLines = doc.splitTextToSize(analysisReportContent, pageWidth - 28);
    reportLines.forEach((line: string) => {
      checkPageBreak(6);
      doc.text(line, 14, yPos);
      yPos += 4.5;
    });
  }

  // ===== FOOTER on all pages =====
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.2);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);
    doc.setFontSize(7);
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text('PayMind - AI Payment Reminder System', 14, pageHeight - 6);
    doc.text(`${t(language, 'Pagina', 'Page')} ${i} ${t(language, 'di', 'of')} ${pageCount}`, pageWidth - 14, pageHeight - 6, { align: 'right' });
  }

  // Save PDF
  doc.save(`paymind-complete-report-${new Date().toISOString().split('T')[0]}.pdf`);
}
