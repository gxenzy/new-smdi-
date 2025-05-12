// AuditTable types

export interface RiskIndex {
  PO: number;
  SO: string;
  ARI: string;
  value: number;
}

export interface AuditRow {
  id: string;
  category: string;
  conditions: string[];
  referenceStandards: string[];
  completed: boolean;
  riskIndex: RiskIndex;
  comments?: string;
  tags?: string[];
  status?: 'open' | 'in_review' | 'closed';
  color?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any; // Index signature for dynamic property access
}

export interface AuditTableProps {
  rows?: AuditRow[];
  onRowChange?: (row: AuditRow) => void;
  onAddRow?: (row: AuditRow) => void;
  onDeleteRow?: (row: AuditRow) => void;
  // ...other props for filtering, exporting, etc.
  onDuplicateRow?: (row: AuditRow) => void;
  onArchiveRow?: (row: AuditRow) => void;
  onQuickComment?: (row: AuditRow, comment: string) => void;
}

// Types and constants for Energy Audit Table

export interface ComplianceData {
  [floor: string]: {
    [category: string]: {
      completed?: boolean;
      complied?: number;
      nonCompliant?: number;
    };
  };
}

export interface AuditRowMeta {
  comments?: string;
  archived?: boolean;
  createdAt?: string;      // ISO date string
  updatedAt?: string;      // ISO date string
  createdBy?: string;      // user id or name
  updatedBy?: string;      // user id or name
  tags?: string[];         // e.g., ['priority', 'flagged']
  status?: 'open' | 'in_review' | 'closed';
  color?: string;          // e.g., '#ff0000'
  attachments?: string[];  // URLs or file IDs
}

export interface Audit {
  id: number;
  name: string;
  complianceData: ComplianceData;
  ariData: { [floor: string]: { [category: string]: string } };
  probabilityData: { [floor: string]: { [category: string]: number } };
  riskSeverityData: { [floor: string]: { [category: string]: string } };
  lastSaved: string | null;
  date?: string;
  inspector?: string;
  location?: string;
  comments?: string;
  rowMetaData?: { [rowId: string]: AuditRowMeta };
}

export const categories: Record<string, string[]> = {
  'Ground Floor': ['Registrar', 'Guidance', 'EDP', 'Accounting'],
  'Mezzanine Floor': ['GSR 1', 'GSR 2', 'Research Hub', 'Research & CARES Office', 'M4', 'M3', 'M2', 'M1', 'Safety Office', 'Cisco Lab. 2', 'Cisco Lab. 3', 'Building Maintenance', 'Mezzanine Hallway'],
  '2nd Floor': ['Room 207', 'Room 208', 'Repair Room', 'Cisco Lab. 1', 'Room 211', 'Room 212', 'HRD Office', 'Female CR', '2nd Floor Hallway'],
  '3rd Floor': ['Room 305', 'Room 306', 'Room 307', 'Room 308', 'Room 309', 'Cisco Lab. 4', 'Room 312', 'Nursing Facility', 'Nursing Skills Lab. 2', 'Nursing Skills Lab. Extension Room', 'Female CR', '3rd Floor Hallway'],
  '4th Floor': ['Room 403', 'Room 404', 'Room 405', 'Room 406', 'Room 407', 'Room 408', 'Room 409', 'Cisco Lab. 5', 'Faculty Room', 'Library Extension', 'Female CR', '4th Floor Hallway'],
  '5th Floor': ['Room 502', 'Room 503', 'Room 504', 'Room 505', 'Room 506', 'Room 507', 'Room 508', 'Room 509', 'Storage Room', 'Electrical Room', 'Male CR', '5th Floor Hallway'],
};

export const riskIndexMapping: Record<string, number> = {
  '5A': 4, '5B': 4, '5C': 4, '4A': 4, '4B': 4, '3A': 4,
  '5D': 3, '5E': 3, '4C': 3, '3B': 3, '3C': 3, '2A': 3, '2B': 3,
  '4D': 2, '4E': 2, '3D': 2, '2C': 2, '1A': 2, '1B': 2,
  '3E': 1, '2D': 1, '2E': 1, '1C': 1, '1D': 1, '1E': 1,
};

export const defaultAuditData = {
  complianceData: {},
  ariData: {},
  probabilityData: {},
  riskSeverityData: {},
  lastSaved: null,
}; 