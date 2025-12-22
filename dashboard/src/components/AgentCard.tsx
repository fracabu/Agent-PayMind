'use client';

import { Agent } from '@/types';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useTranslation, Language, TranslationKey } from '@/lib/i18n';

// Map agent IDs to heroicons
const agentIcons: Record<string, React.ReactNode> = {
  'payment-monitor': <ChartBarIcon className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />,
  'reminder-generator': <EnvelopeIcon className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />,
  'response-handler': <ChatBubbleLeftRightIcon className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500" />,
};

interface AgentCardProps {
  agent: Agent;
  isActive?: boolean;
  onClick?: () => void;
  language: Language;
}

// Map agent IDs to translation keys
const agentTranslationKeys: Record<string, { name: string; desc: string }> = {
  'payment-monitor': { name: 'paymentMonitor', desc: 'paymentMonitorDesc' },
  'reminder-generator': { name: 'reminderGenerator', desc: 'reminderGeneratorDesc' },
  'response-handler': { name: 'responseHandler', desc: 'responseHandlerDesc' },
};

export default function AgentCard({ agent, isActive, onClick, language }: AgentCardProps) {
  const { t } = useTranslation(language);

  // Get translated name and description based on agent ID
  const translationKeys = agentTranslationKeys[agent.id];
  const agentName = translationKeys ? t(translationKeys.name as TranslationKey) : agent.name;
  const agentDescription = translationKeys ? t(translationKeys.desc as TranslationKey) : agent.description;

  const statusConfig = {
    idle: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      border: 'border-gray-200 dark:border-gray-700',
      badge: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
      icon: <ClockIcon className="w-4 h-4" />,
      label: t('statusIdle'),
    },
    running: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-300 dark:border-blue-700',
      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      icon: <ArrowPathIcon className="w-4 h-4 animate-spin" />,
      label: t('statusRunning'),
    },
    completed: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-300 dark:border-green-700',
      badge: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      label: t('statusCompleted'),
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-300 dark:border-red-700',
      badge: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      icon: <XCircleIcon className="w-4 h-4" />,
      label: t('statusError'),
    },
  };

  const config = statusConfig[agent.status];

  return (
    <div
      onClick={onClick}
      className={`
        relative p-3 sm:p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer
        ${config.bg} ${config.border}
        ${isActive ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' : ''}
        hover:shadow-lg hover:scale-[1.02]
      `}
    >
      {/* Status Badge */}
      <div className={`absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${config.badge}`}>
        {config.icon}
        <span className="hidden xs:inline">{config.label}</span>
      </div>

      {/* Icon */}
      <div className="mb-2 sm:mb-3">
        {agentIcons[agent.id] || <span className="text-2xl sm:text-4xl">{agent.icon}</span>}
      </div>

      {/* Name */}
      <h3 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white mb-0.5 sm:mb-1 pr-16 sm:pr-20">
        {agentName}
      </h3>

      {/* Description */}
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 line-clamp-2">
        {agentDescription}
      </p>

      {/* Progress Bar (when running) */}
      {agent.status === 'running' && agent.progress !== undefined && (
        <div className="mt-2 sm:mt-3">
          <div className="h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${agent.progress}%` }}
            />
          </div>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{agent.progress}%</p>
        </div>
      )}

      {/* Duration (when completed) */}
      {agent.status === 'completed' && agent.duration && (
        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
          {t('completedIn')} {(agent.duration / 1000).toFixed(1)}s
        </p>
      )}
    </div>
  );
}
