'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useTranslation, Language } from '@/lib/i18n';

interface ChartsProps {
  analysisResult: {
    totalInvoices: number;
    overdueInvoices: number;
    totalCredits: number;
    overdueAmount: number;
    byPriority?: {
      alta: number;
      media: number;
      bassa: number;
    };
  } | null;
  invoices: Array<{
    status: 'open' | 'paid' | 'disputed';
    amount_total: number;
  }>;
  language: Language;
}

const PRIORITY_COLORS = {
  alta: '#ef4444',
  media: '#f97316',
  bassa: '#6b7280',
};

const STATUS_COLORS = {
  open: '#eab308',
  paid: '#22c55e',
  disputed: '#ef4444',
};

export default function DashboardCharts({ analysisResult, invoices, language }: ChartsProps) {
  const { t } = useTranslation(language);

  // Priority data for bar chart
  const priorityData = analysisResult?.byPriority ? [
    {
      name: language === 'it' ? 'Alta' : 'High',
      value: analysisResult.byPriority.alta,
      fill: PRIORITY_COLORS.alta
    },
    {
      name: language === 'it' ? 'Media' : 'Medium',
      value: analysisResult.byPriority.media,
      fill: PRIORITY_COLORS.media
    },
    {
      name: language === 'it' ? 'Bassa' : 'Low',
      value: analysisResult.byPriority.bassa,
      fill: PRIORITY_COLORS.bassa
    },
  ] : [];

  // Status data for pie chart
  const statusCounts = invoices.reduce((acc, inv) => {
    acc[inv.status] = (acc[inv.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = [
    {
      name: t('statusOpen'),
      value: statusCounts.open || 0,
      color: STATUS_COLORS.open
    },
    {
      name: t('statusPaid'),
      value: statusCounts.paid || 0,
      color: STATUS_COLORS.paid
    },
    {
      name: t('statusDisputed'),
      value: statusCounts.disputed || 0,
      color: STATUS_COLORS.disputed
    },
  ].filter(d => d.value > 0);

  // Amount by status for bar chart
  const amountByStatus = invoices.reduce((acc, inv) => {
    acc[inv.status] = (acc[inv.status] || 0) + inv.amount_total;
    return acc;
  }, {} as Record<string, number>);

  const amountData = [
    {
      name: t('statusOpen'),
      amount: amountByStatus.open || 0,
      fill: STATUS_COLORS.open
    },
    {
      name: t('statusPaid'),
      amount: amountByStatus.paid || 0,
      fill: STATUS_COLORS.paid
    },
    {
      name: t('statusDisputed'),
      amount: amountByStatus.disputed || 0,
      fill: STATUS_COLORS.disputed
    },
  ].filter(d => d.amount > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === 'it' ? 'it-IT' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (invoices.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Priority Distribution Bar Chart */}
      {priorityData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {language === 'it' ? 'Distribuzione Priorità' : 'Priority Distribution'}
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#9ca3af', fontSize: 12 }} width={60} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Status Pie Chart */}
      {statusData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {language === 'it' ? 'Stato Fatture' : 'Invoice Status'}
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px' }}
                  formatter={(value) => <span className="text-gray-600 dark:text-gray-400">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Amount by Status Bar Chart */}
      {amountData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {language === 'it' ? 'Importi per Stato' : 'Amount by Status'}
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={amountData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value as number), language === 'it' ? 'Importo' : 'Amount']}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {amountData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
