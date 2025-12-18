import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Retrieve all workflow runs
export async function GET() {
  try {
    const runs = await prisma.workflowRun.findMany({
      orderBy: { startedAt: 'desc' },
      include: {
        logs: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    return NextResponse.json({ runs });
  } catch (error) {
    console.error('Failed to fetch workflow runs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow runs' },
      { status: 500 }
    );
  }
}

// POST - Create a new workflow run
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      status,
      totalInvoices,
      overdueInvoices,
      totalCredits,
      overdueAmount,
      messagesGenerated,
      aiProvider,
      aiModel,
      analysisReport,
      generatedMessages,
      responseAnalysis,
      invoicesSnapshot,
      logs,
    } = body;

    const run = await prisma.workflowRun.create({
      data: {
        name: name || `Run ${new Date().toLocaleDateString('it-IT')} ${new Date().toLocaleTimeString('it-IT')}`,
        status,
        totalInvoices: totalInvoices || 0,
        overdueInvoices: overdueInvoices || 0,
        totalCredits: totalCredits || 0,
        overdueAmount: overdueAmount || 0,
        messagesGenerated: messagesGenerated || 0,
        aiProvider,
        aiModel,
        analysisReport,
        generatedMessages: generatedMessages ? JSON.stringify(generatedMessages) : null,
        responseAnalysis: responseAnalysis ? JSON.stringify(responseAnalysis) : null,
        invoicesSnapshot: invoicesSnapshot ? JSON.stringify(invoicesSnapshot) : null,
        completedAt: status === 'completed' ? new Date() : null,
        logs: logs ? {
          create: logs.map((log: { agent: string; message: string; type: string }) => ({
            agent: log.agent,
            message: log.message,
            type: log.type,
          })),
        } : undefined,
      },
      include: {
        logs: true,
      },
    });

    return NextResponse.json({ run });
  } catch (error) {
    console.error('Failed to create workflow run:', error);
    return NextResponse.json(
      { error: 'Failed to create workflow run' },
      { status: 500 }
    );
  }
}

// DELETE - Delete all workflow runs
export async function DELETE() {
  try {
    // First delete all logs
    await prisma.workflowLog.deleteMany({});
    // Then delete all runs
    await prisma.workflowRun.deleteMany({});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete workflow runs:', error);
    return NextResponse.json(
      { error: 'Failed to delete workflow runs' },
      { status: 500 }
    );
  }
}
