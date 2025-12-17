'use client';

import { AnalysisResult } from '@/types';
import { FileText, AlertTriangle, Euro, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  result: AnalysisResult | null;
}

export default function StatsCards({ result }: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const stats = [
    {
      label: 'Totale Fatture',
      value: result?.totalInvoices ?? '-',
      icon: <FileText className="w-6 h-6" />,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Fatture Scadute',
      value: result?.overdueInvoices ?? '-',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      label: 'Crediti Totali',
      value: result ? formatCurrency(result.totalCredits) : '-',
      icon: <Euro className="w-6 h-6" />,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Importo Scaduto',
      value: result ? formatCurrency(result.overdueAmount) : '-',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              <span className={stat.color}>{stat.icon}</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
