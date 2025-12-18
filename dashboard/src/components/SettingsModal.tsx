'use client';

import { useState, useEffect } from 'react';
import { X, Check, Loader2, Eye, EyeOff, Key } from 'lucide-react';
import { useTranslation, Language } from '@/lib/i18n';

interface Provider {
  id: string;
  name: string;
  icon: string;
  configured: boolean;
  models: { id: string; name: string }[];
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: AISettings) => void;
  currentSettings: AISettings;
  language: Language;
}

export interface AISettings {
  provider: string;
  model: string;
  apiKey?: string;
}

export default function SettingsModal({ isOpen, onClose, onSave, currentSettings, language }: SettingsModalProps) {
  const { t } = useTranslation(language);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState(currentSettings.provider);
  const [selectedModel, setSelectedModel] = useState(currentSettings.model);
  const [apiKey, setApiKey] = useState(currentSettings.apiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; error?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchProviders();
    }
  }, [isOpen]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      const data = await res.json();
      setProviders(data.providers);
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateApiKey = async () => {
    if (!apiKey) return;

    setValidating(true);
    setValidationResult(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: selectedProvider, apiKey }),
      });
      const result = await res.json();
      setValidationResult(result);
    } catch (error) {
      setValidationResult({ valid: false, error: 'Validation failed' });
    } finally {
      setValidating(false);
    }
  };

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    setValidationResult(null);
    setApiKey('');

    // Set default model for provider
    const provider = providers.find(p => p.id === providerId);
    if (provider && provider.models.length > 0) {
      setSelectedModel(provider.models[0].id);
    }
  };

  const handleSave = () => {
    onSave({
      provider: selectedProvider,
      model: selectedModel,
      apiKey: apiKey || undefined,
    });
    onClose();
  };

  const currentProvider = providers.find(p => p.id === selectedProvider);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-xl p-4 sm:p-6 w-full sm:max-w-lg sm:mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{t('aiSettings')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Provider Selection */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('aiProvider')}
              </label>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => handleProviderChange(provider.id)}
                    className={`
                      flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-lg border-2 transition-all text-left
                      ${selectedProvider === provider.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }
                    `}
                  >
                    <span className="text-xl sm:text-2xl">{provider.icon}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                        {provider.name}
                      </p>
                      {provider.configured && (
                        <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400">{t('configured')}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Model Selection */}
            {currentProvider && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('model')}
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {currentProvider.models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* API Key Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Key className="w-4 h-4 inline mr-1" />
                {t('apiKey')} {currentProvider?.configured && `(${t('optionalIfConfigured')})`}
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setValidationResult(null);
                  }}
                  placeholder={currentProvider?.configured ? t('useServerKey') : t('enterApiKey')}
                  className="w-full px-3 py-2 pr-20 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {apiKey && (
                    <button
                      type="button"
                      onClick={validateApiKey}
                      disabled={validating}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-500"
                    >
                      {validating ? <Loader2 className="w-3 h-3 animate-spin" /> : t('verify')}
                    </button>
                  )}
                </div>
              </div>
              {validationResult && (
                <p className={`text-sm mt-1 ${validationResult.valid ? 'text-green-600' : 'text-red-600'}`}>
                  {validationResult.valid ? (
                    <span className="flex items-center gap-1">
                      <Check className="w-4 h-4" /> {t('apiKeyValid')}
                    </span>
                  ) : (
                    validationResult.error
                  )}
                </p>
              )}
            </div>

            {/* Info */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong>{t('note')}</strong> {t('envNote')} <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">.env</code>:
              </p>
              <ul className="mt-2 space-y-1 text-xs font-mono">
                <li>ANTHROPIC_API_KEY=...</li>
                <li>OPENAI_API_KEY=...</li>
                <li>OPENROUTER_API_KEY=...</li>
                <li>GEMINI_API_KEY=...</li>
              </ul>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}
