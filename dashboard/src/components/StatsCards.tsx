'use client';

import { AnalysisResult } from '@/types';
import { FileText, AlertTriangle, Euro, TrendingUp } from 'lucide-react';
import { useTranslation, Language } from '@/lib/i18n';

interface StatsCardsProps {
  result: AnalysisResult | null;
  language: Language;
}

export default function StatsCards({ result, language }: StatsCardsProps) {
  const { t } = useTranslation(language);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'it' ? 'it-IT' : 'en-US', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const stats = [
    {
      label: t('totalInvoices'),
      value: result?.totalInvoices ?? '-',
      icon: <FileText className="w-6 h-6" />,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: t('overdueInvoices'),
      value: result?.overdueInvoices ?? '-',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      label: t('totalCredits'),
      value: result ? formatCurrency(result.totalCredits) : '-',
      icon: <Euro className="w-6 h-6" />,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: t('overdueAmount'),
      value: result ? formatCurrency(result.overdueAmount) : '-',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`p-1.5 sm:p-2 rounded-lg ${stat.bg} shrink-0`}>
              <span className={stat.color}>{stat.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">{stat.label}</p>
              <p className="text-base sm:text-xl font-bold text-gray-900 dark:text-white truncate">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
