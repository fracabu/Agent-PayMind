'use client';

import { MessageCircle, TrendingUp, AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';
import { useTranslation, Language } from '@/lib/i18n';

export interface ResponseAnalysisData {
  invoiceId: string;
  customerName: string;
  originalMessage: string;
  intent: string;
  intentConfidence: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  extractedInfo: { label: string; value: string }[];
  suggestedActions: string[];
  draftResponse: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface ResponseAnalysisProps {
  analysis: ResponseAnalysisData | null;
  isVisible: boolean;
  language: Language;
}

export default function ResponseAnalysis({ analysis, isVisible, language }: ResponseAnalysisProps) {
  const { t } = useTranslation(language);

  // Map AI labels (Italian and English) to translation keys
  const extractedInfoTranslations: Record<string, string> = {
    // Italian labels
    'numero_rate': t('extractedNumeroRate'),
    'frequenza_rate': t('extractedFrequenzaRate'),
    'motivo': t('extractedMotivo'),
    'data_pagamento': t('extractedDataPagamento'),
    'importo': t('extractedImporto'),
    'metodo_pagamento': t('extractedMetodoPagamento'),
    'riferimento': t('extractedRiferimento'),
    'note': t('extractedNote'),
    // English labels
    'installment_count': t('extractedNumeroRate'),
    'installment_frequency': t('extractedFrequenzaRate'),
    'reason': t('extractedMotivo'),
    'payment_date': t('extractedDataPagamento'),
    'amount': t('extractedImporto'),
    'payment_method': t('extractedMetodoPagamento'),
    'reference': t('extractedRiferimento'),
    'notes': t('extractedNote'),
  };

  const translateLabel = (label: string): string => {
    const normalized = label.toLowerCase().replace(/\s+/g, '_');
    return extractedInfoTranslations[normalized] || label;
  };

  const intentLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    payment_confirmed: { label: t('paymentConfirmed'), icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-500' },
    request_delay: { label: t('requestDelay'), icon: <Clock className="w-4 h-4" />, color: 'text-orange-500' },
    dispute: { label: t('dispute'), icon: <AlertCircle className="w-4 h-4" />, color: 'text-red-500' },
    request_info: { label: t('requestInfo'), icon: <FileText className="w-4 h-4" />, color: 'text-blue-500' },
    payment_promise: { label: t('paymentPromise'), icon: <TrendingUp className="w-4 h-4" />, color: 'text-purple-500' },
  };

  const sentimentConfig = {
    positive: { label: t('positive'), color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    neutral: { label: t('neutral'), color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
    negative: { label: t('negative'), color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  };

  const riskConfig = {
    low: { label: t('riskLow'), color: 'bg-green-500' },
    medium: { label: t('riskMedium'), color: 'bg-orange-500' },
    high: { label: t('riskHigh'), color: 'bg-red-500' },
  };

  if (!isVisible || !analysis) return null;

  const intent = intentLabels[analysis.intent] || { label: analysis.intent, icon: <MessageCircle className="w-4 h-4" />, color: 'text-gray-500' };
  const sentiment = sentimentConfig[analysis.sentiment] || sentimentConfig.neutral;
  const risk = riskConfig[analysis.riskLevel] || riskConfig.medium;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700 bg-purple-50 dark:bg-purple-900/20">
        <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
          <span className="truncate">{t('customerResponseAnalysis')}</span>
        </h2>
      </div>

      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
        {/* Customer & Invoice Info */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">{analysis.customerName}</p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{analysis.invoiceId}</p>
          </div>
          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-bold text-white shrink-0 ${risk.color}`}>
            {risk.label}
          </span>
        </div>

        {/* Original Message */}
        <div>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1">{t('originalMessageLabel')}</p>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 sm:p-3 border-l-4 border-gray-300 dark:border-gray-600">
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 italic">&quot;{analysis.originalMessage}&quot;</p>
          </div>
        </div>

        {/* Intent & Sentiment */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 sm:p-3">
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2">{t('identifiedIntent')}</p>
            <div className={`flex items-center gap-1.5 sm:gap-2 ${intent.color}`}>
              <span className="scale-75 sm:scale-100">{intent.icon}</span>
              <span className="text-xs sm:text-sm font-semibold truncate">{intent.label}</span>
            </div>
            <div className="mt-1.5 sm:mt-2 h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${analysis.intentConfidence}%` }}
              />
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{analysis.intentConfidence}%</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 sm:p-3">
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2">{t('sentiment')}</p>
            <span className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${sentiment.color}`}>
              {sentiment.label}
            </span>
          </div>
        </div>

        {/* Extracted Info */}
        {analysis.extractedInfo.length > 0 && (
          <div>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2">{t('extractedInfoLabel')}</p>
            <div className="space-y-1">
              {analysis.extractedInfo.map((info, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 rounded p-1.5 sm:p-2 gap-2">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{translateLabel(info.label)}</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white shrink-0">{info.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Actions */}
        <div>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2">{t('suggestedActionsLabel')}</p>
          <div className="space-y-1.5 sm:space-y-2">
            {analysis.suggestedActions.map((action, idx) => (
              <div key={idx} className="flex items-start gap-1.5 sm:gap-2 bg-blue-50 dark:bg-blue-900/20 rounded p-1.5 sm:p-2">
                <span className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-500 text-white text-[10px] sm:text-xs flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <span className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Draft Response */}
        <div>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2">{t('draftResponseLabel')}</p>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 sm:p-3 border border-green-200 dark:border-green-800">
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{analysis.draftResponse}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
