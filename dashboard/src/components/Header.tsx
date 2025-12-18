'use client';

import { Upload, Play, RotateCcw, Settings, Database, Sun, Moon, Globe } from 'lucide-react';
import { useTranslation, Language } from '@/lib/i18n';

interface HeaderProps {
  onUpload: () => void;
  onRunWorkflow: () => void;
  onReset: () => void;
  onSettings: () => void;
  isRunning: boolean;
  hasInvoices: boolean;
  aiProvider: string;
  invoiceCount: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  language: Language;
  onToggleLanguage: () => void;
}

const providerIcons: Record<string, string> = {
  anthropic: '🟠',
  openai: '🟢',
  openrouter: '🔵',
  gemini: '🔴',
};

export default function Header({
  onUpload,
  onRunWorkflow,
  onReset,
  onSettings,
  isRunning,
  hasInvoices,
  aiProvider,
  invoiceCount,
  theme,
  onToggleTheme,
  language,
  onToggleLanguage,
}: HeaderProps) {
  const { t } = useTranslation(language);

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-3xl">💰</span>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('appName')}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('appDescription')}</p>
            </div>
          </div>

          {/* Center - Status */}
          <div className="hidden md:flex items-center gap-4">
            {invoiceCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                <Database className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {invoiceCount} {t('invoices')}
                </span>
              </div>
            )}
            <button
              onClick={onSettings}
              className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <span>{providerIcons[aiProvider] || '🤖'}</span>
              <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                {aiProvider}
              </span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={onToggleLanguage}
              className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={t('language')}
            >
              <Globe className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300 uppercase">{language}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={t('theme')}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-gray-600" />
              ) : (
                <Sun className="w-4 h-4 text-yellow-400" />
              )}
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile toggles */}
            <button
              onClick={onToggleLanguage}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title={t('language')}
            >
              <Globe className="w-5 h-5" />
            </button>

            <button
              onClick={onToggleTheme}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title={t('theme')}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-400" />}
            </button>

            <button
              onClick={onSettings}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              onClick={onUpload}
              disabled={isRunning}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">{t('uploadCsv')}</span>
            </button>

            <button
              onClick={onRunWorkflow}
              disabled={isRunning || !hasInvoices}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRunning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">{t('running')}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('runWorkflow')}</span>
                </>
              )}
            </button>

            <button
              onClick={onReset}
              disabled={isRunning}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={t('reset')}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
