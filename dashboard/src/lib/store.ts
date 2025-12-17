import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Agent, Invoice, LogEntry, WorkflowStep, AnalysisResult } from '@/types';
import { GeneratedMessage } from '@/components/GeneratedMessages';
import { ResponseAnalysisData } from '@/components/ResponseAnalysis';

interface AppState {
  // Agents
  agents: Agent[];
  setAgentStatus: (agentId: string, status: Agent['status'], duration?: number) => void;

  // Invoices
  invoices: Invoice[];
  setInvoices: (invoices: Invoice[]) => void;

  // Logs
  logs: LogEntry[];
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;

  // Workflow
  workflowSteps: WorkflowStep[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
  updateWorkflowStep: (stepId: number, status: WorkflowStep['status']) => void;
  resetWorkflow: () => void;

  // Analysis
  analysisResult: AnalysisResult | null;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  showAnalysisReport: boolean;
  setShowAnalysisReport: (show: boolean) => void;

  // Generated messages
  generatedMessages: GeneratedMessage[];
  setGeneratedMessages: (messages: GeneratedMessage[]) => void;
  addGeneratedMessage: (msg: GeneratedMessage) => void;
  showGeneratedMessages: boolean;
  setShowGeneratedMessages: (show: boolean) => void;

  // Response analysis
  responseAnalysis: ResponseAnalysisData | null;
  setResponseAnalysis: (analysis: ResponseAnalysisData | null) => void;
  showResponseAnalysis: boolean;
  setShowResponseAnalysis: (show: boolean) => void;

  // Workflow running state
  isWorkflowRunning: boolean;
  setWorkflowRunning: (running: boolean) => void;

  // Reset all
  resetAll: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
  // Initial agents
  agents: [
    {
      id: 'payment-monitor',
      name: 'Payment Monitor',
      description: 'Analizza fatture CSV, identifica scadute e calcola priorità',
      icon: '📊',
      status: 'idle',
    },
    {
      id: 'reminder-generator',
      name: 'Reminder Generator',
      description: 'Genera messaggi personalizzati per Email, SMS, WhatsApp',
      icon: '📧',
      status: 'idle',
    },
    {
      id: 'response-handler',
      name: 'Response Handler',
      description: 'Analizza risposte clienti e suggerisce azioni',
      icon: '💬',
      status: 'idle',
    },
  ],

  setAgentStatus: (agentId, status, duration) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === agentId
          ? { ...agent, status, duration, lastRun: status === 'completed' ? new Date().toISOString() : agent.lastRun }
          : agent
      ),
    })),

  // Invoices
  invoices: [],
  setInvoices: (invoices) => set({ invoices }),

  // Logs
  logs: [],
  addLog: (log) =>
    set((state) => ({
      logs: [
        { ...log, id: crypto.randomUUID(), timestamp: new Date() },
        ...state.logs,
      ].slice(0, 100),
    })),
  clearLogs: () => set({ logs: [] }),

  // Workflow
  workflowSteps: [
    { id: 1, name: 'Carica CSV', agent: 'system', status: 'pending' },
    { id: 2, name: 'Analisi Fatture', agent: 'payment-monitor', status: 'pending' },
    { id: 3, name: 'Genera Solleciti', agent: 'reminder-generator', status: 'pending' },
    { id: 4, name: 'Attesa Risposte', agent: 'system', status: 'pending' },
    { id: 5, name: 'Analisi Risposte', agent: 'response-handler', status: 'pending' },
  ],
  currentStep: 0,
  setCurrentStep: (step) => set({ currentStep: step }),
  updateWorkflowStep: (stepId, status) =>
    set((state) => ({
      workflowSteps: state.workflowSteps.map((step) =>
        step.id === stepId
          ? { ...step, status, startTime: status === 'running' ? new Date() : step.startTime, endTime: status === 'completed' ? new Date() : step.endTime }
          : step
      ),
    })),
  resetWorkflow: () =>
    set((state) => ({
      workflowSteps: state.workflowSteps.map((step) => ({ ...step, status: 'pending', startTime: undefined, endTime: undefined })),
      currentStep: 0,
    })),

  // Analysis
  analysisResult: null,
  setAnalysisResult: (result) => set({ analysisResult: result }),
  showAnalysisReport: false,
  setShowAnalysisReport: (show) => set({ showAnalysisReport: show }),

  // Generated messages
  generatedMessages: [],
  setGeneratedMessages: (messages) => set({ generatedMessages: messages }),
  addGeneratedMessage: (msg) =>
    set((state) => ({
      generatedMessages: [...state.generatedMessages, msg],
    })),
  showGeneratedMessages: false,
  setShowGeneratedMessages: (show) => set({ showGeneratedMessages: show }),

  // Response analysis
  responseAnalysis: null,
  setResponseAnalysis: (analysis) => set({ responseAnalysis: analysis }),
  showResponseAnalysis: false,
  setShowResponseAnalysis: (show) => set({ showResponseAnalysis: show }),

  // Workflow running
  isWorkflowRunning: false,
  setWorkflowRunning: (running) => set({ isWorkflowRunning: running }),

  // Reset all
  resetAll: () => set({
    invoices: [],
    logs: [],
    analysisResult: null,
    showAnalysisReport: false,
    generatedMessages: [],
    showGeneratedMessages: false,
    responseAnalysis: null,
    showResponseAnalysis: false,
    isWorkflowRunning: false,
    workflowSteps: [
      { id: 1, name: 'Carica CSV', agent: 'system', status: 'pending' },
      { id: 2, name: 'Analisi Fatture', agent: 'payment-monitor', status: 'pending' },
      { id: 3, name: 'Genera Solleciti', agent: 'reminder-generator', status: 'pending' },
      { id: 4, name: 'Attesa Risposte', agent: 'system', status: 'pending' },
      { id: 5, name: 'Analisi Risposte', agent: 'response-handler', status: 'pending' },
    ],
    currentStep: 0,
    agents: [
      {
        id: 'payment-monitor',
        name: 'Payment Monitor',
        description: 'Analizza fatture CSV, identifica scadute e calcola priorità',
        icon: '📊',
        status: 'idle',
      },
      {
        id: 'reminder-generator',
        name: 'Reminder Generator',
        description: 'Genera messaggi personalizzati per Email, SMS, WhatsApp',
        icon: '📧',
        status: 'idle',
      },
      {
        id: 'response-handler',
        name: 'Response Handler',
        description: 'Analizza risposte clienti e suggerisce azioni',
        icon: '💬',
        status: 'idle',
      },
    ],
  }),
    }),
    {
      name: 'paymind-storage',
      partialize: (state) => ({
        invoices: state.invoices,
        analysisResult: state.analysisResult,
        generatedMessages: state.generatedMessages,
        responseAnalysis: state.responseAnalysis,
        showAnalysisReport: state.showAnalysisReport,
        showGeneratedMessages: state.showGeneratedMessages,
        showResponseAnalysis: state.showResponseAnalysis,
      }),
    }
  )
);
