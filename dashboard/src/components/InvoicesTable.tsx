'use client';

import { useState } from 'react';
import { Invoice } from '@/types';
import { Mail, MessageSquare, Phone, AlertTriangle, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useTranslation, Language } from '@/lib/i18n';

interface InvoicesTableProps {
  invoices: Invoice[];
  onSelectInvoice?: (invoice: Invoice) => void;
  selectedInvoiceId?: string;
  language: Language;
}

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

const channelIcons = {
  email: <Mail className="w-4 h-4" />,
  whatsapp: <MessageSquare className="w-4 h-4" />,
  sms: <Phone className="w-4 h-4" />,
};

const priorityStyles = {
  ALTA: 'bg-red-500 text-white',
  MEDIA: 'bg-orange-500 text-white',
  BASSA: 'bg-gray-400 text-white',
  HIGH: 'bg-red-500 text-white',
  MEDIUM: 'bg-orange-500 text-white',
  LOW: 'bg-gray-400 text-white',
};

export default function InvoicesTable({ invoices, onSelectInvoice, selectedInvoiceId, language }: InvoicesTableProps) {
  const { t } = useTranslation(language);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Pagination calculations
  const totalItems = invoices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedInvoices = invoices.slice(startIndex, endIndex);

  // Reset to page 1 when items per page changes
  const handleItemsPerPageChange = (newValue: number) => {
    setItemsPerPage(newValue);
    setCurrentPage(1);
  };

  // Translate priority based on language
  const translatePriority = (priority: string | undefined): string => {
    if (!priority) return '';
    const upperPriority = priority.toUpperCase();
    if (language === 'en') {
      if (upperPriority === 'ALTA') return 'HIGH';
      if (upperPriority === 'MEDIA') return 'MEDIUM';
      if (upperPriority === 'BASSA') return 'LOW';
    }
    return upperPriority;
  };

  const getPriorityStyle = (priority: string | undefined): string => {
    if (!priority) return 'bg-gray-300 text-white';
    const upperPriority = priority.toUpperCase();
    return priorityStyles[upperPriority as keyof typeof priorityStyles] || 'bg-gray-300 text-white';
  };

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

  // Pagination Controls Component
  const PaginationControls = () => {
    if (totalItems <= 5) return null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
        {/* Items per page selector */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>{language === 'it' ? 'Righe:' : 'Rows:'}</span>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ITEMS_PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Page info and navigation */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {startIndex + 1}-{endIndex} {t('of')} {totalItems}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title={language === 'it' ? 'Prima pagina' : 'First page'}
            >
              <ChevronsLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title={language === 'it' ? 'Precedente' : 'Previous'}
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Page numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Mobile page indicator */}
            <span className="sm:hidden px-2 text-sm text-gray-600 dark:text-gray-400">
              {currentPage}/{totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title={language === 'it' ? 'Successiva' : 'Next'}
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title={language === 'it' ? 'Ultima pagina' : 'Last page'}
            >
              <ChevronsRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    );
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
      <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
        {paginatedInvoices.map((invoice) => {
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
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${getPriorityStyle(invoice.priority)}`}>
                    {translatePriority(invoice.priority)}
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
      <div className="hidden md:block overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10">
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
            {paginatedInvoices.map((invoice) => {
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
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getPriorityStyle(invoice.priority)}`}>
                        {translatePriority(invoice.priority)}
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

      {/* Pagination Controls */}
      <PaginationControls />
    </div>
  );
}
