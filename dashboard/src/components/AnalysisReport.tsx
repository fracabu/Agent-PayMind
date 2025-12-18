'use client';

import { Invoice, AnalysisResult } from '@/types';
import { FileText, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { useTranslation, Language } from '@/lib/i18n';

interface AnalysisReportProps {
  result: AnalysisResult | null;
  invoices: Invoice[];
  isVisible: boolean;
  language: Language;
}

export default function AnalysisReport({ result, invoices, isVisible, language }: AnalysisReportProps) {
  const { t } = useTranslation(language);

  if (!isVisible || !result) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'it' ? 'it-IT' : 'en-US', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const overdueInvoices = invoices.filter(inv => inv.status === 'open' && (inv.days_overdue || 0) > 0);
  const disputedInvoices = invoices.filter(inv => inv.status === 'disputed');
  const avgDaysOverdue = overdueInvoices.length > 0
    ? Math.round(overdueInvoices.reduce((sum, inv) => sum + (inv.days_overdue || 0), 0) / overdueInvoices.length)
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
        <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          {t('invoiceAnalysisReport')}
          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">
            payment-monitor-agent
          </span>
        </h2>
      </div>

      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('invoicesAnalyzed')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.totalInvoices}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
            <p className="text-xs text-red-600 dark:text-red-400">{t('overdueInvoices')}</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{result.overdueInvoices}</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
            <p className="text-xs text-orange-600 dark:text-orange-400">{t('avgDelay')}</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{avgDaysOverdue} {t('gg')}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
            <p className="text-xs text-purple-600 dark:text-purple-400">{t('disputed')}</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{disputedInvoices.length}</p>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {t('prioritySegmentation')}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-red-500"></span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('priorityHigh')}</span>
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">{result.byPriority.alta} {t('invoicesCount')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-orange-500"></span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('priorityMedium')}</span>
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">{result.byPriority.media} {t('invoicesCount')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-gray-400"></span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('priorityLow')}</span>
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">{result.byPriority.bassa} {t('invoicesCount')}</span>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            {t('financialSummary')}
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('totalCredits')}</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(result.totalCredits)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('overdueAmount')}</span>
              <span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(result.overdueAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('overduePercent')}</span>
              <span className="font-semibold text-orange-600 dark:text-orange-400">
                {result.totalCredits > 0 ? ((result.overdueAmount / result.totalCredits) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Top Debtors */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            {t('topClientsCredit')}
          </h3>
          <div className="space-y-2">
            {overdueInvoices
              .sort((a, b) => (b.amount_total - b.amount_paid) - (a.amount_total - a.amount_paid))
              .slice(0, 3)
              .map((inv, idx) => (
                <div key={inv.invoice_id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 rounded p-2">
                  <span className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">{idx + 1}</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{inv.customer_name}</span>
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
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
