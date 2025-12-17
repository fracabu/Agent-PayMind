export type AgentStatus = 'idle' | 'running' | 'completed' | 'error';

export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: AgentStatus;
  progress?: number;
  lastRun?: string;
  duration?: number;
}

export interface Invoice {
  invoice_id: string;
  customer_name: string;
  amount_total: number;
  amount_paid: number;
  due_date: string;
  status: 'open' | 'paid' | 'disputed';
  preferred_channel: 'email' | 'sms' | 'whatsapp';
  customer_email: string;
  customer_phone: string;
  days_overdue?: number;
  priority?: 'ALTA' | 'MEDIA' | 'BASSA';
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  agent: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface WorkflowStep {
  id: number;
  name: string;
  agent: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  startTime?: Date;
  endTime?: Date;
}

export interface AnalysisResult {
  totalInvoices: number;
  overdueInvoices: number;
  totalCredits: number;
  overdueAmount: number;
  byPriority: {
    alta: number;
    media: number;
    bassa: number;
  };
}
