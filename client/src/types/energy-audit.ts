import { UserRole } from './index';

export interface TestResult {
  id: string;
  date: string;
  testType: 'power' | 'lighting' | 'hvac';
  results: {
    powerUsage?: number;
    lightingEfficiency?: number;
    hvacEfficiency?: number;
  };
  standard: string;
  notes?: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
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
  createdAt?: string;
  updatedAt?: string;
}

export interface DigitalSignature {
  id: string;
  userName: string;
  userRole: string;
  signatureData: string;
  comments?: string;
  timestamp: string;
}

/**
 * Interface defining role-based access control permissions
 * for the energy audit system.
 */
export interface RoleBasedAccess {
  role: string;
  permissions: {
    /** Permission to edit audit reports and findings */
    canEdit: boolean;
    /** Permission to delete audit reports and findings */
    canDelete: boolean;
    /** Permission to digitally sign audit reports */
    canSign: boolean;
    /** Permission to export audit reports and data */
    canExport: boolean;
    /** Permission to manage and customize benchmarks */
    canManageBenchmarks: boolean;
  };
}

export interface ThemeSettings {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
}

export interface Finding {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  category: 'power' | 'lighting' | 'hvac' | 'general';
  recommendations?: string[];
  attachments?: string[];
}

export interface ActivityLogEntry {
  id: string;
  type: 'test' | 'finding' | 'comment' | 'approval' | 'export';
  description: string;
  userId: string;
  userName: string;
  timestamp: string;
  metadata?: {
    [key: string]: any;
  };
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (...args: any[]) => any;
    lastAutoTable?: { finalY: number };
  }
} 