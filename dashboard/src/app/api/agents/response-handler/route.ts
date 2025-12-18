import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { callAI, AIProvider } from '@/lib/ai-providers';
import { RESPONSE_HANDLER_PROMPT } from '@/lib/agents';

export async function POST(request: NextRequest) {
  try {
    const { invoiceId, customerMessage, provider = 'anthropic', model, apiKey } = await request.json();

    if (!customerMessage) {
      return NextResponse.json({ error: 'Customer message is required' }, { status: 400 });
    }

    // Fetch invoice if provided
    let invoice = null;
    if (invoiceId) {
      invoice = await prisma.invoice.findUnique({
        where: { invoiceId },
      });
    }

    const invoiceContext = invoice
      ? `
Contesto fattura:
- ID: ${invoice.invoiceId}
- Cliente: ${invoice.customerName}
- Importo dovuto: €${(invoice.amountTotal - invoice.amountPaid).toFixed(2)}
- Scadenza: ${invoice.dueDate.toISOString().split('T')[0]}
- Giorni ritardo: ${invoice.daysOverdue || 0}
- Stato: ${invoice.status}`
      : '';

    const userMessage = `Analizza la seguente risposta del cliente:

"${customerMessage}"
${invoiceContext}

Fornisci l'analisi nel seguente formato JSON:
{
  "intent": "tipo_intent",
  "intentConfidence": 95,
  "sentiment": "positive|neutral|negative",
  "extractedInfo": [
    {"label": "etichetta", "value": "valore"}
  ],
  "suggestedActions": [
    "azione 1",
    "azione 2"
  ],
  "draftResponse": "bozza risposta in italiano",
  "riskLevel": "low|medium|high"
}`;

    const response = await callAI(
      { provider: provider as AIProvider, model, apiKey },
      RESPONSE_HANDLER_PROMPT,
      userMessage
    );

    // Try to parse JSON from response
    let analysisData;
    try {
      // Extract JSON from response (it might be wrapped in markdown code blocks)
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      // If parsing fails, create a structured response from the text
      analysisData = {
        intent: 'unknown',
        intentConfidence: 50,
        sentiment: 'neutral',
        extractedInfo: [],
        suggestedActions: ['Review response manually'],
        draftResponse: response.content,
        riskLevel: 'medium',
      };
    }

    // Save to database if invoice exists
    if (invoice) {
      await prisma.responseAnalysis.create({
        data: {
          invoiceId: invoice.invoiceId,
          customerMessage,
          intent: analysisData.intent || 'unknown',
          intentConfidence: analysisData.intentConfidence || 50,
          sentiment: analysisData.sentiment || 'neutral',
          extractedInfo: JSON.stringify(analysisData.extractedInfo || []),
          suggestedActions: JSON.stringify(analysisData.suggestedActions || []),
          draftResponse: analysisData.draftResponse || '',
          riskLevel: analysisData.riskLevel || 'medium',
        },
      });
    }

    return NextResponse.json({
      success: true,
      analysis: {
        invoiceId: invoiceId || null,
        customerName: invoice?.customerName || 'Unknown',
        originalMessage: customerMessage,
        ...analysisData,
      },
      provider: response.provider,
      model: response.model,
      tokensUsed: response.tokensUsed,
    });
  } catch (error) {
    console.error('Response handler error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
