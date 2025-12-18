'use client';

import { useState } from 'react';
import { Mail, MessageSquare, Phone, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation, Language } from '@/lib/i18n';

export interface GeneratedMessage {
  id: string;
  invoiceId: string;
  customerName: string;
  channel: 'email' | 'sms' | 'whatsapp';
  subject?: string;
  content: string;
  priority: 'ALTA' | 'MEDIA' | 'BASSA';
  amount: number;
  daysOverdue: number;
}

interface GeneratedMessagesProps {
  messages: GeneratedMessage[];
  isVisible: boolean;
  language: Language;
}

const channelConfig = {
  email: {
    icon: <Mail className="w-4 h-4" />,
    label: 'Email',
    bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  sms: {
    icon: <Phone className="w-4 h-4" />,
    label: 'SMS',
    bg: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  whatsapp: {
    icon: <MessageSquare className="w-4 h-4" />,
    label: 'WhatsApp',
    bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
};

export default function GeneratedMessages({ messages, isVisible, language }: GeneratedMessagesProps) {
  const { t } = useTranslation(language);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isVisible || messages.length === 0) return null;

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'it' ? 'it-IT' : 'en-US', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  // Translate priority based on language
  const translatePriority = (priority: string): string => {
    if (language === 'en') {
      if (priority === 'ALTA') return 'HIGH';
      if (priority === 'MEDIA') return 'MEDIUM';
      if (priority === 'BASSA') return 'LOW';
    }
    return priority;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/20">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
            <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            <span className="truncate">{t('messagesGenerated')}</span>
          </h2>
          <span className="text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full shrink-0">
            {messages.length}
          </span>
        </div>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-72 sm:max-h-96 overflow-y-auto">
        {messages.map((msg) => {
          const channel = channelConfig[msg.channel];
          const isExpanded = expandedId === msg.id;

          return (
            <div key={msg.id} className="p-2 sm:p-3">
              {/* Header */}
              <div
                className="flex items-center justify-between cursor-pointer gap-2"
                onClick={() => setExpandedId(isExpanded ? null : msg.id)}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium shrink-0 ${channel.bg}`}>
                    {channel.icon}
                    <span className="hidden xs:inline">{channel.label}</span>
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                      {msg.customerName}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                      {msg.invoiceId} • {formatCurrency(msg.amount)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded font-bold ${
                    msg.priority === 'ALTA' ? 'bg-red-500 text-white' :
                    msg.priority === 'MEDIA' ? 'bg-orange-500 text-white' :
                    'bg-gray-400 text-white'
                  }`}>
                    {translatePriority(msg.priority)}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Content */}
              {isExpanded && (
                <div className="mt-2 sm:mt-3 space-y-2">
                  {msg.subject && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-2">
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1">{t('subject')}</p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{msg.subject}</p>
                    </div>
                  )}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-2 sm:p-3 relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(msg.id, msg.content);
                      }}
                      className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1 sm:p-1.5 rounded bg-white dark:bg-gray-700 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                      )}
                    </button>
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap pr-8 sm:pr-10">
                      {msg.content}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
