'use client';

import { useState } from 'react';
import { Invoice, AnalysisResult } from '@/types';
import { DocumentTextIcon, ExclamationTriangleIcon, ArrowTrendingUpIcon, UsersIcon, ClipboardDocumentIcon, ArrowDownTrayIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useTranslation, Language } from '@/lib/i18n';

interface AnalysisReportProps {
  result: AnalysisResult | null;
  invoices: Invoice[];
  isVisible: boolean;
  language: Language;
}

export default function AnalysisReport({ result, invoices, isVisible, language }: AnalysisReportProps) {
  const { t } = useTranslation(language);
  const [copied, setCopied] = useState(false);

  if (!isVisible || !result) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'it' ? 'it-IT' : 'en-US', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const overdueInvoices = invoices.filter(inv => inv.status === 'open' && (inv.days_overdue || 0) > 0);
  const disputedInvoices = invoices.filter(inv => inv.status === 'disputed');
  const avgDaysOverdue = overdueInvoices.length > 0
    ? Math.round(overdueInvoices.reduce((sum, inv) => sum + (inv.days_overdue || 0), 0) / overdueInvoices.length)
    : 0;

  const getReportData = () => ({
    exportDate: new Date().toISOString(),
    summary: {
      totalInvoices: result.totalInvoices,
      overdueInvoices: result.overdueInvoices,
      avgDaysOverdue,
      disputedCount: disputedInvoices.length,
    },
    priority: result.byPriority,
    financial: {
      totalCredits: result.totalCredits,
      overdueAmount: result.overdueAmount,
      overduePercent: result.totalCredits > 0 ? ((result.overdueAmount / result.totalCredits) * 100).toFixed(1) : 0,
    },
    topDebtors: overdueInvoices
      .sort((a, b) => (b.amount_total - b.amount_paid) - (a.amount_total - a.amount_paid))
      .slice(0, 5)
      .map(inv => ({
        customer: inv.customer_name,
        invoiceId: inv.invoice_id,
        amount: inv.amount_total - inv.amount_paid,
      })),
  });

  const handleCopy = async () => {
    const data = getReportData();
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const data = getReportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20 flex items-center justify-between gap-2">
        <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-1.5 sm:gap-2 min-w-0">
          <DocumentTextIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0" />
          <span className="truncate">{t('invoiceAnalysisReport')}</span>
        </h2>
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <button
            onClick={handleCopy}
            className="p-1 sm:p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/30 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title={language === 'it' ? 'Copia JSON' : 'Copy JSON'}
          >
            {copied ? <CheckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
          <button
            onClick={handleDownload}
            className="p-1 sm:p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/30 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title={language === 'it' ? 'Scarica JSON' : 'Download JSON'}
          >
            <ArrowDownTrayIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 sm:p-3">
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{t('invoicesAnalyzed')}</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{result.totalInvoices}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 sm:p-3">
            <p className="text-[10px] sm:text-xs text-red-600 dark:text-red-400">{t('overdueInvoices')}</p>
            <p className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">{result.overdueInvoices}</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2 sm:p-3">
            <p className="text-[10px] sm:text-xs text-orange-600 dark:text-orange-400">{t('avgDelay')}</p>
            <p className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400">{avgDaysOverdue} {t('gg')}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 sm:p-3">
            <p className="text-[10px] sm:text-xs text-purple-600 dark:text-purple-400">{t('disputed')}</p>
            <p className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{disputedInvoices.length}</p>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5 sm:gap-2">
            <ExclamationTriangleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {t('prioritySegmentation')}
          </h3>
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-red-500"></span>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('priorityHigh')}</span>
              </span>
              <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{result.byPriority.alta}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-orange-500"></span>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('priorityMedium')}</span>
              </span>
              <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{result.byPriority.media}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-gray-400"></span>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('priorityLow')}</span>
              </span>
              <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{result.byPriority.bassa}</span>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5 sm:gap-2">
            <ArrowTrendingUpIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {t('financialSummary')}
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 sm:p-3 space-y-1.5 sm:space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('totalCredits')}</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(result.totalCredits)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('overdueAmount')}</span>
              <span className="text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400">{formatCurrency(result.overdueAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('overduePercent')}</span>
              <span className="text-xs sm:text-sm font-semibold text-orange-600 dark:text-orange-400">
                {result.totalCredits > 0 ? ((result.overdueAmount / result.totalCredits) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Top Debtors */}
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5 sm:gap-2">
            <UsersIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {t('topClientsCredit')}
          </h3>
          <div className="space-y-1.5 sm:space-y-2">
            {overdueInvoices
              .sort((a, b) => (b.amount_total - b.amount_paid) - (a.amount_total - a.amount_paid))
              .slice(0, 3)
              .map((inv, idx) => (
                <div key={inv.invoice_id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 rounded p-1.5 sm:p-2 gap-2">
                  <span className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <span className="text-[10px] sm:text-xs font-bold text-gray-400 shrink-0">{idx + 1}</span>
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate">{inv.customer_name}</span>
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white shrink-0">
                    {formatCurrency(inv.amount_total - inv.amount_paid)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
