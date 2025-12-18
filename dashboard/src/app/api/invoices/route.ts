import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all invoices
export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { dueDate: 'asc' },
    });
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

// POST - Upload CSV and create invoices
export async function POST(request: NextRequest) {
  try {
    const { invoices } = await request.json();

    if (!Array.isArray(invoices)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // Calculate days overdue and priority for each invoice
    const today = new Date();
    const processedInvoices = invoices.map((inv) => {
      const dueDate = new Date(inv.due_date);
      const diffTime = today.getTime() - dueDate.getTime();
      const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const amountDue = inv.amount_total - inv.amount_paid;
      let priority = 'BASSA';

      if (inv.status === 'disputed' || daysOverdue > 90 || amountDue > 1000) {
        priority = 'ALTA';
      } else if (daysOverdue > 60) {
        priority = 'MEDIA';
      }

      return {
        invoiceId: inv.invoice_id,
        customerName: inv.customer_name,
        amountTotal: parseFloat(inv.amount_total),
        amountPaid: parseFloat(inv.amount_paid),
        dueDate: new Date(inv.due_date),
        status: inv.status,
        preferredChannel: inv.preferred_channel,
        customerEmail: inv.customer_email,
        customerPhone: inv.customer_phone,
        daysOverdue: daysOverdue > 0 ? daysOverdue : 0,
        priority: inv.status !== 'paid' ? priority : null,
      };
    });

    // Upsert invoices (update if exists, create if not)
    const results = await Promise.all(
      processedInvoices.map((inv) =>
        prisma.invoice.upsert({
          where: { invoiceId: inv.invoiceId },
          update: inv,
          create: inv,
        })
      )
    );

    return NextResponse.json({
      message: `Successfully processed ${results.length} invoices`,
      count: results.length,
      invoices: results,
    });
  } catch (error) {
    console.error('Error processing invoices:', error);
    return NextResponse.json({ error: 'Failed to process invoices' }, { status: 500 });
  }
}

// DELETE all invoices
export async function DELETE() {
  try {
    await prisma.message.deleteMany();
    await prisma.responseAnalysis.deleteMany();
    await prisma.invoice.deleteMany();
    return NextResponse.json({ message: 'All invoices deleted' });
  } catch (error) {
    console.error('Error deleting invoices:', error);
    return NextResponse.json({ error: 'Failed to delete invoices' }, { status: 500 });
  }
}
