import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { callAI, AIProvider } from '@/lib/ai-providers';
import { getReminderGeneratorPrompt, Language } from '@/lib/agents';

export async function POST(request: NextRequest) {
  try {
    const { invoiceIds, provider = 'anthropic', model, apiKey, language = 'it' } = await request.json();
    const lang = language as Language;

    // Fetch specified invoices or all overdue/disputed
    let invoices;
    if (invoiceIds && invoiceIds.length > 0) {
      invoices = await prisma.invoice.findMany({
        where: { invoiceId: { in: invoiceIds } },
      });
    } else {
      invoices = await prisma.invoice.findMany({
        where: {
          OR: [
            { status: 'open', daysOverdue: { gt: 0 } },
            { status: 'disputed' },
          ],
        },
        orderBy: { daysOverdue: 'desc' },
        take: 10, // Limit to 10 invoices per batch
      });
    }

    if (invoices.length === 0) {
      return NextResponse.json({ error: 'No invoices to process' }, { status: 400 });
    }

    const generatedMessages = [];

    for (const inv of invoices) {
      const amountDue = inv.amountTotal - inv.amountPaid;

      const userMessage = lang === 'en'
        ? `Generate a payment reminder message for:

Invoice: ${inv.invoiceId}
Customer: ${inv.customerName}
Amount due: €${amountDue.toFixed(2)}
Total invoice amount: €${inv.amountTotal.toFixed(2)}
Amount already paid: €${inv.amountPaid.toFixed(2)}
Due date: ${inv.dueDate.toISOString().split('T')[0]}
Days overdue: ${inv.daysOverdue || 0}
Priority: ${inv.priority === 'ALTA' ? 'HIGH' : inv.priority === 'MEDIA' ? 'MEDIUM' : 'LOW'}
Channel: ${inv.preferredChannel.toUpperCase()}
Customer email: ${inv.customerEmail}
Customer phone: ${inv.customerPhone}
Status: ${inv.status === 'disputed' ? 'DISPUTED' : 'OVERDUE'}

${inv.preferredChannel === 'email' ? 'Generate email subject + complete message body.' : ''}
${inv.preferredChannel === 'sms' ? 'Generate short SMS (max 160 characters).' : ''}
${inv.preferredChannel === 'whatsapp' ? 'Generate WhatsApp message with friendly tone.' : ''}`
        : `Genera un messaggio di sollecito pagamento per:

Fattura: ${inv.invoiceId}
Cliente: ${inv.customerName}
Importo dovuto: €${amountDue.toFixed(2)}
Importo totale fattura: €${inv.amountTotal.toFixed(2)}
Importo già pagato: €${inv.amountPaid.toFixed(2)}
Data scadenza: ${inv.dueDate.toISOString().split('T')[0]}
Giorni di ritardo: ${inv.daysOverdue || 0}
Priorità: ${inv.priority || 'BASSA'}
Canale: ${inv.preferredChannel.toUpperCase()}
Email cliente: ${inv.customerEmail}
Telefono cliente: ${inv.customerPhone}
Stato: ${inv.status === 'disputed' ? 'CONTESTATA' : 'SCADUTA'}

${inv.preferredChannel === 'email' ? 'Genera oggetto email + corpo messaggio completo.' : ''}
${inv.preferredChannel === 'sms' ? 'Genera SMS breve (max 160 caratteri).' : ''}
${inv.preferredChannel === 'whatsapp' ? 'Genera messaggio WhatsApp con tono amichevole.' : ''}`;

      const response = await callAI(
        { provider: provider as AIProvider, model, apiKey },
        getReminderGeneratorPrompt(lang),
        userMessage
      );

      // Extract subject if email (look for "Oggetto:" or "Subject:" pattern)
      let subject: string | undefined;
      let content = response.content;

      if (inv.preferredChannel === 'email') {
        const subjectMatch = response.content.match(/(?:[Oo]ggetto|[Ss]ubject):\s*(.+?)(?:\n|$)/);
        if (subjectMatch) {
          subject = subjectMatch[1].trim();
          content = response.content.replace(/(?:[Oo]ggetto|[Ss]ubject):\s*.+?\n/, '').trim();
        }
      }

      // Save to database
      const message = await prisma.message.create({
        data: {
          invoiceId: inv.invoiceId,
          channel: inv.preferredChannel,
          subject,
          content,
          priority: inv.priority || 'BASSA',
          status: 'draft',
        },
      });

      generatedMessages.push({
        id: message.id,
        invoiceId: inv.invoiceId,
        customerName: inv.customerName,
        channel: inv.preferredChannel,
        subject,
        content,
        priority: inv.priority || 'BASSA',
        amount: amountDue,
        daysOverdue: inv.daysOverdue || 0,
      });
    }

    return NextResponse.json({
      success: true,
      messages: generatedMessages,
      count: generatedMessages.length,
      provider: provider,
      model: model || 'default',
    });
  } catch (error) {
    console.error('Reminder generator error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
