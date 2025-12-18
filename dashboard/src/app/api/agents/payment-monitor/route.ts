import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { callAI, AIProvider } from '@/lib/ai-providers';
import { PAYMENT_MONITOR_PROMPT } from '@/lib/agents';

export async function POST(request: NextRequest) {
  try {
    const { provider = 'anthropic', model, apiKey } = await request.json();

    // Fetch all invoices from database
    const invoices = await prisma.invoice.findMany({
      orderBy: { dueDate: 'asc' },
    });

    if (invoices.length === 0) {
      return NextResponse.json({ error: 'No invoices found' }, { status: 400 });
    }

    // Prepare invoice data for analysis
    const invoiceData = invoices.map((inv) => ({
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
    const userMessage = `Analizza le seguenti fatture. Data odierna: ${today}

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

    // Call AI provider
    const response = await callAI(
      { provider: provider as AIProvider, model, apiKey },
      PAYMENT_MONITOR_PROMPT,
      userMessage
    );

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
