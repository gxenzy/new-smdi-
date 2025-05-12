import type { Comment, Severity, Status, ApprovalStatus } from 'types';

export interface TestResult {
  date: string;
  powerUsage: number;
  lightingEfficiency: number;
  hvacEfficiency: number;
  compliance: {
    power: boolean;
    lighting: boolean;
    hvac: boolean;
  };
}

export interface HistoricalData extends TestResult {
  year: number;
  month: number;
  comments?: string;
  recommendations?: string;
}

export interface CustomBenchmark {
  id: string;
  name: string;
  lighting: number;
  hvac: number;
  power: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DigitalSignature {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  timestamp: string;
  signatureData: string;
  comments?: string;
}

export interface RoleBasedAccess {
  role: 'admin' | 'auditor' | 'reviewer' | 'viewer';
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canSign: boolean;
    canExport: boolean;
    canManageBenchmarks: boolean;
  };
}

export interface ThemeSettings {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
}

export type { Comment, Severity, Status, ApprovalStatus }; 