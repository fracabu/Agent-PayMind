import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Retrieve a single workflow run by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const run = await prisma.workflowRun.findUnique({
      where: { id },
      include: {
        logs: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!run) {
      return NextResponse.json(
        { error: 'Workflow run not found' },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const parsedRun = {
      ...run,
      generatedMessages: run.generatedMessages ? JSON.parse(run.generatedMessages) : null,
      responseAnalysis: run.responseAnalysis ? JSON.parse(run.responseAnalysis) : null,
      invoicesSnapshot: run.invoicesSnapshot ? JSON.parse(run.invoicesSnapshot) : null,
    };

    return NextResponse.json({ run: parsedRun });
  } catch (error) {
    console.error('Failed to fetch workflow run:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow run' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a single workflow run
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // First delete associated logs
    await prisma.workflowLog.deleteMany({
      where: { workflowId: id },
    });

    // Then delete the run
    await prisma.workflowRun.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete workflow run:', error);
    return NextResponse.json(
      { error: 'Failed to delete workflow run' },
      { status: 500 }
    );
  }
}
