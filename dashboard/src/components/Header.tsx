'use client';

import { Upload, Play, RotateCcw } from 'lucide-react';

interface HeaderProps {
  onUpload: () => void;
  onRunWorkflow: () => void;
  onReset: () => void;
  isRunning: boolean;
  hasInvoices: boolean;
}

export default function Header({ onUpload, onRunWorkflow, onReset, isRunning, hasInvoices }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-3xl">💰</span>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">PayMind</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">AI Payment Reminder System</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onUpload}
              disabled={isRunning}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Upload className="w-4 h-4" />
              Carica CSV
            </button>

            <button
              onClick={onRunWorkflow}
              disabled={isRunning || !hasInvoices}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRunning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  In esecuzione...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Avvia Workflow
                </>
              )}
            </button>

            <button
              onClick={onReset}
              disabled={isRunning}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
