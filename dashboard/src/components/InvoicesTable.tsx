'use client';

import { Invoice } from '@/types';
import { Mail, MessageSquare, Phone, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface InvoicesTableProps {
  invoices: Invoice[];
  onSelectInvoice?: (invoice: Invoice) => void;
  selectedInvoiceId?: string;
}

const channelIcons = {
  email: <Mail className="w-4 h-4" />,
  whatsapp: <MessageSquare className="w-4 h-4" />,
  sms: <Phone className="w-4 h-4" />,
};

const statusConfig = {
  open: {
    icon: <AlertTriangle className="w-4 h-4" />,
    bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    label: 'Aperta',
  },
  paid: {
    icon: <CheckCircle className="w-4 h-4" />,
    bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    label: 'Pagata',
  },
  disputed: {
    icon: <AlertCircle className="w-4 h-4" />,
    bg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    label: 'Contestata',
  },
};

const priorityConfig = {
  ALTA: 'bg-red-500 text-white',
  MEDIA: 'bg-orange-500 text-white',
  BASSA: 'bg-gray-400 text-white',
};

export default function InvoicesTable({ invoices, onSelectInvoice, selectedInvoiceId }: InvoicesTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('it-IT');
  };

  if (invoices.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Nessuna fattura caricata. Carica un file CSV per iniziare.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Importo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Scadenza
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Stato
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Priorità
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Canale
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {invoices.map((invoice) => {
              const status = statusConfig[invoice.status];
              const amountDue = invoice.amount_total - invoice.amount_paid;

              return (
                <tr
                  key={invoice.invoice_id}
                  onClick={() => onSelectInvoice?.(invoice)}
                  className={`
                    cursor-pointer transition-colors
                    ${selectedInvoiceId === invoice.invoice_id ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}
                  `}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-gray-900 dark:text-white">
                      {invoice.invoice_id}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {invoice.customer_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {invoice.customer_email}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(amountDue)}
                      </p>
                      {invoice.amount_paid > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          di {formatCurrency(invoice.amount_total)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-gray-900 dark:text-white">
                        {formatDate(invoice.due_date)}
                      </p>
                      {invoice.days_overdue && invoice.days_overdue > 0 && (
                        <p className="text-xs text-red-500">
                          -{invoice.days_overdue} giorni
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bg}`}>
                      {status.icon}
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {invoice.priority && (
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${priorityConfig[invoice.priority]}`}>
                        {invoice.priority}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      {channelIcons[invoice.preferred_channel]}
                      <span className="text-xs capitalize">{invoice.preferred_channel}</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
