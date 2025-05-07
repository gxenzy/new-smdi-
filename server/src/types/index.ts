import { ResultSetHeader, RowDataPacket } from 'mysql2';

export type QueryResult<T = RowDataPacket> = [T[], ResultSetHeader];

export enum UserRole {
  ADMIN = 'admin',
  AUDITOR = 'auditor',
  USER = 'user'
}

export interface User extends RowDataPacket {
  id: number;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  permissions: string[];
  first_name?: string;
  last_name?: string;
  department?: string;
  position?: string;
  phone_number?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Finding extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  severity: 'Low' | 'Medium' | 'High';
  auditId: number;
  createdBy: number;
  assignedTo?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Comment extends RowDataPacket {
  id: number;
  finding_id: number;
  user_id: number;
  content: string;
  created_at: Date;
  updated_at: Date;
  user_email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface Attachment extends RowDataPacket {
  id: number;
  finding_id: number;
  filename: string;
  original_filename: string;
  mime_type: string;
  size: number;
  uploaded_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface Notification extends RowDataPacket {
  id: number;
  user_id: number;
  finding_id: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at: Date;
  updated_at: Date;
  finding_title?: string;
  finding_severity?: string;
  finding_status?: string;
}

export interface EnergyAudit {
  id: number;
  userId: number;
  title: string;
  content: any;
  powerUsage?: number;
  lightingEfficiency?: number;
  hvacEfficiency?: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

export interface Signature {
  id: number;
  auditId: number;
  userId: number;
  signatureData: string;
  comments?: string;
  createdAt: Date;
}

export interface AuditLog {
  id: number;
  userId: number;
  action: string;
  details: any;
  createdAt: Date;
}

export interface UserActivity {
  id: number;
  userId: number;
  activityType: string;
  details: any;
  createdAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications_enabled: boolean;
  email_notifications: boolean;
  language: string;
}

// Add Express Request type declaration
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        role: UserRole;
      };
    }
  }
} 