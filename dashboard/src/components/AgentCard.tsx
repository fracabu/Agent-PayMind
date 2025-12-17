'use client';

import { Agent } from '@/types';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  isActive?: boolean;
  onClick?: () => void;
}

const statusConfig = {
  idle: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-700',
    badge: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    icon: <Clock className="w-4 h-4" />,
    label: 'In attesa',
  },
  running: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-300 dark:border-blue-700',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    icon: <Loader2 className="w-4 h-4 animate-spin" />,
    label: 'In esecuzione',
  },
  completed: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-300 dark:border-green-700',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: 'Completato',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-300 dark:border-red-700',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    icon: <XCircle className="w-4 h-4" />,
    label: 'Errore',
  },
};

export default function AgentCard({ agent, isActive, onClick }: AgentCardProps) {
  const config = statusConfig[agent.status];

  return (
    <div
      onClick={onClick}
      className={`
        relative p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer
        ${config.bg} ${config.border}
        ${isActive ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' : ''}
        hover:shadow-lg hover:scale-[1.02]
      `}
    >
      {/* Status Badge */}
      <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.badge}`}>
        {config.icon}
        {config.label}
      </div>

      {/* Icon */}
      <div className="text-4xl mb-3">{agent.icon}</div>

      {/* Name */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
        {agent.name}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        {agent.description}
      </p>

      {/* Progress Bar (when running) */}
      {agent.status === 'running' && agent.progress !== undefined && (
        <div className="mt-3">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${agent.progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{agent.progress}%</p>
        </div>
      )}

      {/* Duration (when completed) */}
      {agent.status === 'completed' && agent.duration && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Completato in {(agent.duration / 1000).toFixed(1)}s
        </p>
      )}
    </div>
  );
}
