import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
export type Status = 'Open' | 'In Progress' | 'Resolved';
export type ApprovalStatus =
  | 'Draft'
  | 'Pending Review'
  | 'Manager Approval'
  | 'Final Approval'
  | 'Approved'
  | 'Rejected';

export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  attachments?: { name: string; url: string; type: string }[];
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details?: string;
}

export interface Finding {
  id: string;
  description: string;
  recommendation: string;
  photo?: string;
  attachments?: { name: string; url: string; type: string }[];
  createdAt: string;
  section: 'lighting' | 'hvac' | 'envelope';
  severity: Severity;
  estimatedCost: number;
  status: Status;
  assignee?: string;
  comments: Comment[];
  approvalStatus: ApprovalStatus;
  activityLog?: ActivityLogEntry[];
}

export interface AuditData {
  lighting: Finding[];
  hvac: Finding[];
  envelope: Finding[];
  summary: string;
}

export const defaultWorkflowStages = [
  'Draft',
  'Pending Review',
  'Manager Approval',
  'Final Approval',
  'Approved',
  'Rejected',
] as const;
export type WorkflowStage = typeof defaultWorkflowStages[number];

interface EnergyAuditContextType {
  audit: AuditData;
  setAudit: React.Dispatch<React.SetStateAction<AuditData>>;
  workflowStages: string[];
  setWorkflowStages: React.Dispatch<React.SetStateAction<string[]>>;
  reminderDays?: number;
  escalationDays?: number;
  setReminderDays?: React.Dispatch<React.SetStateAction<number>>;
  setEscalationDays?: React.Dispatch<React.SetStateAction<number>>;
}

const defaultAudit: AuditData = {
  lighting: [],
  hvac: [],
  envelope: [],
  summary: '',
};

const EnergyAuditContext = createContext<EnergyAuditContextType | undefined>(undefined);

export const useEnergyAudit = () => {
  const ctx = useContext(EnergyAuditContext);
  if (!ctx) throw new Error('useEnergyAudit must be used within EnergyAuditProvider');
  return ctx;
};

export const EnergyAuditProvider = ({ children }: { children: ReactNode }) => {
  const [audit, setAudit] = useState<AuditData>(defaultAudit);
  const [workflowStages, setWorkflowStages] = useState<string[]>([...defaultWorkflowStages]);
  const [reminderDays, setReminderDays] = useState<number>(2);
  const [escalationDays, setEscalationDays] = useState<number>(5);
  return (
    <EnergyAuditContext.Provider value={{ audit, setAudit, workflowStages, setWorkflowStages, reminderDays, escalationDays, setReminderDays, setEscalationDays }}>
      {children}
    </EnergyAuditContext.Provider>
  );
}; 