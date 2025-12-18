'use client';

import { WorkflowStep } from '@/types';
import { Check, Loader2, Circle, AlertCircle } from 'lucide-react';
import { useTranslation, Language, TranslationKey } from '@/lib/i18n';

interface WorkflowTimelineProps {
  steps: WorkflowStep[];
  currentStep: number;
  language: Language;
}

const stepIcons = {
  pending: <Circle className="w-5 h-5 text-gray-400" />,
  running: <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />,
  completed: <Check className="w-5 h-5 text-white" />,
  error: <AlertCircle className="w-5 h-5 text-white" />,
};

// Map step IDs to translation keys
const stepTranslationKeys: Record<number, TranslationKey> = {
  1: 'loadCsv',
  2: 'analyzeInvoices',
  3: 'generateReminders',
  4: 'waitResponses',
  5: 'analyzeResponses',
};

export default function WorkflowTimeline({ steps, currentStep, language }: WorkflowTimelineProps) {
  const { t } = useTranslation(language);

  const formatDuration = (start?: Date, end?: Date) => {
    if (!start || !end) return null;
    const ms = end.getTime() - start.getTime();
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
        {t('workflowPipeline')}
      </h2>

      <div className="relative">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start mb-4 sm:mb-6 last:mb-0">
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`absolute left-[14px] sm:left-[18px] w-0.5 h-8 sm:h-12 mt-7 sm:mt-9 transition-colors duration-500 ${
                  step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            )}

            {/* Step Indicator */}
            <div
              className={`
                relative z-10 flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 transition-all duration-300 shrink-0
                ${step.status === 'completed' ? 'bg-green-500 border-green-500' : ''}
                ${step.status === 'running' ? 'bg-blue-100 border-blue-500 dark:bg-blue-900' : ''}
                ${step.status === 'error' ? 'bg-red-500 border-red-500' : ''}
                ${step.status === 'pending' ? 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600' : ''}
              `}
            >
              <span className="scale-75 sm:scale-100">{stepIcons[step.status]}</span>
            </div>

            {/* Step Content */}
            <div className="ml-3 sm:ml-4 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3
                  className={`text-xs sm:text-base font-semibold transition-colors truncate ${
                    step.status === 'running' ? 'text-blue-600 dark:text-blue-400' :
                    step.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                    step.status === 'error' ? 'text-red-600 dark:text-red-400' :
                    'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {stepTranslationKeys[step.id] ? t(stepTranslationKeys[step.id]) : step.name}
                </h3>
                {step.status === 'completed' && step.startTime && step.endTime && (
                  <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 shrink-0">
                    {formatDuration(step.startTime, step.endTime)}
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                {step.agent === 'system' ? t('system') : step.agent}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
