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
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/20">
        <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-green-500" />
          {t('messagesGenerated')}
          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">
            reminder-generator-agent
          </span>
          <span className="ml-auto text-sm font-normal bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
            {messages.length} {t('messagesCount')}
          </span>
        </h2>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto">
        {messages.map((msg) => {
          const channel = channelConfig[msg.channel];
          const isExpanded = expandedId === msg.id;

          return (
            <div key={msg.id} className="p-3">
              {/* Header */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : msg.id)}
              >
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${channel.bg}`}>
                    {channel.icon}
                    {channel.label}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {msg.customerName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {msg.invoiceId} • {formatCurrency(msg.amount)} • {msg.daysOverdue} {t('delayDays')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                    msg.priority === 'ALTA' ? 'bg-red-500 text-white' :
                    msg.priority === 'MEDIA' ? 'bg-orange-500 text-white' :
                    'bg-gray-400 text-white'
                  }`}>
                    {translatePriority(msg.priority)}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Content */}
              {isExpanded && (
                <div className="mt-3 space-y-2">
                  {msg.subject && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('subject')}</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{msg.subject}</p>
                    </div>
                  )}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-3 relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(msg.id, msg.content);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded bg-white dark:bg-gray-700 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap pr-10">
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
