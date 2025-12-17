'use client';

import { LogEntry } from '@/types';
import { Info, CheckCircle, AlertTriangle, XCircle, Trash2 } from 'lucide-react';

interface LogsPanelProps {
  logs: LogEntry[];
  onClear?: () => void;
}

const typeConfig = {
  info: {
    icon: <Info className="w-4 h-4" />,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  success: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
  },
  error: {
    icon: <XCircle className="w-4 h-4" />,
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
  },
};

export default function LogsPanel({ logs, onClear }: LogsPanelProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live Logs
        </h2>
        {logs.length > 0 && (
          <button
            onClick={onClear}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="h-64 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p className="text-sm">I log appariranno qui durante l&apos;esecuzione</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {logs.map((log) => {
              const config = typeConfig[log.type];
              return (
                <div
                  key={log.id}
                  className={`px-4 py-2 ${config.bg} transition-all animate-in fade-in slide-in-from-top-2 duration-300`}
                >
                  <div className="flex items-start gap-3">
                    <span className={config.color}>{config.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {formatTime(log.timestamp)}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                          {log.agent}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                        {log.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
