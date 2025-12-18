'use client';

import { useState, useEffect } from 'react';
import { History, Trash2, Eye, Download, ChevronDown, ChevronUp, Calendar, Clock, FileText } from 'lucide-react';
import { useTranslation, Language } from '@/lib/i18n';

interface WorkflowRun {
  id: string;
  name: string | null;
  status: string;
  totalInvoices: number;
  overdueInvoices: number;
  totalCredits: number;
  overdueAmount: number;
  messagesGenerated: number;
  aiProvider: string | null;
  aiModel: string | null;
  analysisReport: string | null;
  generatedMessages: string | null;
  responseAnalysis: string | null;
  invoicesSnapshot: string | null;
  startedAt: string;
  completedAt: string | null;
}

interface WorkflowHistoryProps {
  language: Language;
  onLoadRun: (run: WorkflowRun) => void;
  refreshTrigger?: number;
}

export default function WorkflowHistory({ language, onLoadRun, refreshTrigger }: WorkflowHistoryProps) {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation(language);

  const fetchRuns = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/workflow-runs');
      if (response.ok) {
        const data = await response.json();
        setRuns(data.runs || []);
      }
    } catch (error) {
      console.error('Failed to fetch workflow runs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      fetchRuns();
    }
  }, [isExpanded, refreshTrigger]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(t('confirmDeleteRun'))) return;

    try {
      const response = await fetch(`/api/workflow-runs/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setRuns(runs.filter((run) => run.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete run:', error);
    }
  };

  const handleExport = (run: WorkflowRun, e: React.MouseEvent) => {
    e.stopPropagation();

    const exportData = {
      name: run.name,
      date: run.startedAt,
      status: run.status,
      aiProvider: run.aiProvider,
      aiModel: run.aiModel,
      stats: {
        totalInvoices: run.totalInvoices,
        overdueInvoices: run.overdueInvoices,
        totalCredits: run.totalCredits,
        overdueAmount: run.overdueAmount,
        messagesGenerated: run.messagesGenerated,
      },
      analysisReport: run.analysisReport,
      generatedMessages: run.generatedMessages ? JSON.parse(run.generatedMessages) : null,
      responseAnalysis: run.responseAnalysis ? JSON.parse(run.responseAnalysis) : null,
      invoices: run.invoicesSnapshot ? JSON.parse(run.invoicesSnapshot) : null,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paymind-run-${new Date(run.startedAt).toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString(language === 'it' ? 'it-IT' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <History className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('workflowHistory')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {runs.length} {t('savedRuns')}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              {t('loading')}...
            </div>
          ) : runs.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              {t('noSavedRuns')}
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {runs.map((run) => (
                <div
                  key={run.id}
                  className="p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          run.status === 'completed' ? 'bg-green-500' :
                          run.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                        <span className="font-medium text-gray-900 dark:text-white truncate">
                          {run.name || `Run ${formatDate(run.startedAt)}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(run.startedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(run.startedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {run.totalInvoices} {t('invoices')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => onLoadRun(run)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title={t('loadRun')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleExport(run, e)}
                        className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                        title={t('exportRun')}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(run.id, e)}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title={t('deleteRun')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
