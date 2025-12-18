import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { callAI, AIProvider } from '@/lib/ai-providers';
import { getPaymentMonitorPrompt, Language } from '@/lib/agents';

export async function POST(request: NextRequest) {
  try {
    const { provider = 'anthropic', model, apiKey, language = 'it' } = await request.json();
    const lang = language as Language;

    // Fetch all invoices from database
    const invoices = await prisma.invoice.findMany({
      orderBy: { dueDate: 'asc' },
    });

    if (invoices.length === 0) {
      return NextResponse.json({ error: 'No invoices found' }, { status: 400 });
    }

    // Prepare invoice data for analysis (use English labels if language is English)
    const invoiceData = invoices.map((inv) => lang === 'en' ? ({
      id: inv.invoiceId,
      customer: inv.customerName,
      total_amount: inv.amountTotal,
      paid_amount: inv.amountPaid,
      amount_due: inv.amountTotal - inv.amountPaid,
      due_date: inv.dueDate.toISOString().split('T')[0],
      status: inv.status,
      days_overdue: inv.daysOverdue,
      priority: inv.priority,
      channel: inv.preferredChannel,
      email: inv.customerEmail,
      phone: inv.customerPhone,
    }) : ({
      id: inv.invoiceId,
      cliente: inv.customerName,
      importo_totale: inv.amountTotal,
      importo_pagato: inv.amountPaid,
      importo_dovuto: inv.amountTotal - inv.amountPaid,
      scadenza: inv.dueDate.toISOString().split('T')[0],
      stato: inv.status,
      giorni_ritardo: inv.daysOverdue,
      priorita: inv.priority,
      canale: inv.preferredChannel,
      email: inv.customerEmail,
      telefono: inv.customerPhone,
    }));

    const today = new Date().toISOString().split('T')[0];
    const userMessage = lang === 'en'
      ? `Analyze the following invoices. Today's date: ${today}

Invoice data (JSON):
${JSON.stringify(invoiceData, null, 2)}

Generate a complete report with:
1. General summary
2. Overdue invoices (table with days overdue)
3. Disputed invoices
4. Priority segmentation (HIGH/MEDIUM/LOW)
5. Financial statistics
6. Top customers by outstanding credit
7. Urgent recommendations`
      : `Analizza le seguenti fatture. Data odierna: ${today}

Dati fatture (JSON):
${JSON.stringify(invoiceData, null, 2)}

Genera un report completo con:
1. Riepilogo generale
2. Fatture scadute (tabella con giorni di ritardo)
3. Fatture contestate
4. Segmentazione per priorità (ALTA/MEDIA/BASSA)
5. Statistiche finanziarie
6. Top clienti per credito residuo
7. Raccomandazioni urgenti`;

    // Call AI provider with language-aware prompt
    const response = await callAI(
      { provider: provider as AIProvider, model, apiKey },
      getPaymentMonitorPrompt(lang),
      userMessage
    );

    // Check if AI returned empty content
    if (!response.content || response.content.trim().length === 0) {
      console.error('AI returned empty analysis content');
      return NextResponse.json(
        { error: lang === 'en' ? 'AI returned empty response. Try a different model or provider.' : 'L\'AI ha restituito una risposta vuota. Prova un modello o provider diverso.' },
        { status: 500 }
      );
    }

    // Calculate summary stats
    const overdueInvoices = invoices.filter((inv) => inv.status === 'open' && (inv.daysOverdue || 0) > 0);
    const disputedInvoices = invoices.filter((inv) => inv.status === 'disputed');
    const totalCredits = invoices.reduce((sum, inv) => sum + (inv.amountTotal - inv.amountPaid), 0);
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + (inv.amountTotal - inv.amountPaid), 0);

    const analysisResult = {
      totalInvoices: invoices.length,
      overdueInvoices: overdueInvoices.length,
      disputedInvoices: disputedInvoices.length,
      totalCredits,
      overdueAmount,
      byPriority: {
        alta: invoices.filter((inv) => inv.priority === 'ALTA').length,
        media: invoices.filter((inv) => inv.priority === 'MEDIA').length,
        bassa: invoices.filter((inv) => inv.priority === 'BASSA').length,
      },
      avgDaysOverdue: overdueInvoices.length > 0
        ? Math.round(overdueInvoices.reduce((sum, inv) => sum + (inv.daysOverdue || 0), 0) / overdueInvoices.length)
        : 0,
    };

    return NextResponse.json({
      success: true,
      analysis: response.content,
      stats: analysisResult,
      provider: response.provider,
      model: response.model,
      tokensUsed: response.tokensUsed,
    });
  } catch (error) {
    console.error('Payment monitor error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
