import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { callAI, AIProvider } from '@/lib/ai-providers';
import { getResponseHandlerPrompt, Language } from '@/lib/agents';

export async function POST(request: NextRequest) {
  try {
    const { invoiceId, customerMessage, provider = 'anthropic', model, apiKey, language = 'it' } = await request.json();
    const lang = language as Language;

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
      ? lang === 'en'
        ? `
Invoice context:
- ID: ${invoice.invoiceId}
- Customer: ${invoice.customerName}
- Amount due: €${(invoice.amountTotal - invoice.amountPaid).toFixed(2)}
- Due date: ${invoice.dueDate.toISOString().split('T')[0]}
- Days overdue: ${invoice.daysOverdue || 0}
- Status: ${invoice.status}`
        : `
Contesto fattura:
- ID: ${invoice.invoiceId}
- Cliente: ${invoice.customerName}
- Importo dovuto: €${(invoice.amountTotal - invoice.amountPaid).toFixed(2)}
- Scadenza: ${invoice.dueDate.toISOString().split('T')[0]}
- Giorni ritardo: ${invoice.daysOverdue || 0}
- Stato: ${invoice.status}`
      : '';

    const userMessage = lang === 'en'
      ? `Analyze the following customer response:

"${customerMessage}"
${invoiceContext}

Provide the analysis in the following JSON format:
{
  "intent": "intent_type",
  "intentConfidence": 95,
  "sentiment": "positive|neutral|negative",
  "extractedInfo": [
    {"label": "label_in_english", "value": "value"}
  ],
  "suggestedActions": [
    "action 1 in English",
    "action 2 in English"
  ],
  "draftResponse": "draft response in English",
  "riskLevel": "low|medium|high"
}`
      : `Analizza la seguente risposta del cliente:

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
      getResponseHandlerPrompt(lang),
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
