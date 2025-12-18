'use client';

import { Invoice } from '@/types';
import { Mail, MessageSquare, Phone, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation, Language } from '@/lib/i18n';

interface InvoicesTableProps {
  invoices: Invoice[];
  onSelectInvoice?: (invoice: Invoice) => void;
  selectedInvoiceId?: string;
  language: Language;
}

const channelIcons = {
  email: <Mail className="w-4 h-4" />,
  whatsapp: <MessageSquare className="w-4 h-4" />,
  sms: <Phone className="w-4 h-4" />,
};

const priorityConfig = {
  ALTA: 'bg-red-500 text-white',
  MEDIA: 'bg-orange-500 text-white',
  BASSA: 'bg-gray-400 text-white',
};

export default function InvoicesTable({ invoices, onSelectInvoice, selectedInvoiceId, language }: InvoicesTableProps) {
  const { t } = useTranslation(language);

  const statusConfig = {
    open: {
      icon: <AlertTriangle className="w-4 h-4" />,
      bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      label: t('statusOpen'),
    },
    paid: {
      icon: <CheckCircle className="w-4 h-4" />,
      bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      label: t('statusPaid'),
    },
    disputed: {
      icon: <AlertCircle className="w-4 h-4" />,
      bg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      label: t('statusDisputed'),
    },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'it' ? 'it-IT' : 'en-US', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US');
  };

  if (invoices.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          {t('noInvoices')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
        {invoices.map((invoice) => {
          const status = statusConfig[invoice.status];
          const amountDue = invoice.amount_total - invoice.amount_paid;

          return (
            <div
              key={invoice.invoice_id}
              onClick={() => onSelectInvoice?.(invoice)}
              className={`p-4 cursor-pointer transition-colors ${
                selectedInvoiceId === invoice.invoice_id
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{invoice.customer_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{invoice.invoice_id}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(amountDue)}</p>
                  {invoice.days_overdue && invoice.days_overdue > 0 && (
                    <p className="text-xs text-red-500">-{invoice.days_overdue} {t('days')}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg}`}>
                  {status.icon}
                  {status.label}
                </span>
                {invoice.priority && (
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${priorityConfig[invoice.priority]}`}>
                    {invoice.priority}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
                  {channelIcons[invoice.preferred_channel]}
                  {invoice.preferred_channel}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('id')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('customer')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('amount')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('dueDate')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('status')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('priority')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('channel')}
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
                          {t('of')} {formatCurrency(invoice.amount_total)}
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
                          -{invoice.days_overdue} {t('days')}
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
