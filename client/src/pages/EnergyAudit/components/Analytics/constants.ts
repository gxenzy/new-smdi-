import { RoleBasedAccess } from '../../../../types/energy-audit';
import { UserRole } from '../../../../types';

type LowercaseUserRole = Lowercase<keyof typeof UserRole>;

/**
 * Role-based permission configuration for the energy audit system.
 * Maps user roles to their specific permissions.
 */
const ROLE_PERMISSIONS_MAP = {
  admin: {
    role: 'admin' as LowercaseUserRole,
    permissions: {
      canEdit: true,
      canDelete: true,
      canSign: true,
      canExport: true,
      canManageBenchmarks: true,
    },
  },
  user: {
    role: 'user' as LowercaseUserRole,
    permissions: {
      canEdit: false,
      canDelete: false,
      canSign: false,
      canExport: true,
      canManageBenchmarks: false,
    },
  },
  auditor: {
    role: 'auditor' as LowercaseUserRole,
    permissions: {
      canEdit: true,
      canDelete: false,
      canSign: true,
      canExport: true,
      canManageBenchmarks: false,
    },
  },
  reviewer: {
    role: 'reviewer' as LowercaseUserRole,
    permissions: {
      canEdit: false,
      canDelete: false,
      canSign: true,
      canExport: true,
      canManageBenchmarks: false,
    },
  },
  viewer: {
    role: 'viewer' as LowercaseUserRole,
    permissions: {
      canEdit: false,
      canDelete: false,
      canSign: false,
      canExport: false,
      canManageBenchmarks: false,
    },
  },
  manager: {
    role: 'manager' as LowercaseUserRole,
    permissions: {
      canEdit: true,
      canDelete: true,
      canSign: true,
      canExport: true,
      canManageBenchmarks: true,
    },
  },
  staff: {
    role: 'staff' as LowercaseUserRole,
    permissions: {
      canEdit: false,
      canDelete: false,
      canSign: false,
      canExport: true,
      canManageBenchmarks: false,
    },
  },
  moderator: {
    role: 'moderator' as LowercaseUserRole,
    permissions: {
      canEdit: true,
      canDelete: true,
      canSign: false,
      canExport: true,
      canManageBenchmarks: false,
    },
  },
} as const;

export const ROLE_PERMISSIONS: Record<LowercaseUserRole, RoleBasedAccess> = ROLE_PERMISSIONS_MAP;

export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const BENCHMARK_PROFILES = [
  { label: 'Office (Default)', value: 'office', lighting: 85, hvac: 90, power: 10500 },
  { label: 'School', value: 'school', lighting: 80, hvac: 88, power: 9500 },
  { label: 'Hospital', value: 'hospital', lighting: 90, hvac: 92, power: 12000 },
  { label: 'Retail', value: 'retail', lighting: 88, hvac: 89, power: 11000 },
];

export const ORG_NAME = 'Your Organization Name';
export const ORG_LOGO = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="16" fill="%230088FE"/><text x="40" y="48" font-size="32" fill="white" text-anchor="middle" font-family="Arial">LOGO</text></svg>';
export const PROJECT_NAME = 'Energy Audit Analytics Report';

// Chart colors
export const CHART_COLORS = [
  '#1976d2', // primary
  '#dc004e', // secondary
  '#4caf50', // success
  '#ff9800', // warning
  '#f44336', // error
  '#2196f3'  // info
];

// Benchmark profiles
export const PROFILES = [
  { value: 'RESIDENTIAL', label: 'Residential Building', lighting: 80, hvac: 85, power: 8500 },
  { value: 'COMMERCIAL', label: 'Commercial Building', lighting: 85, hvac: 90, power: 12000 },
  { value: 'INDUSTRIAL', label: 'Industrial Facility', lighting: 90, hvac: 92, power: 15000 },
  { value: 'EDUCATIONAL', label: 'Educational Institution', lighting: 82, hvac: 88, power: 10000 },
  { value: 'HEALTHCARE', label: 'Healthcare Facility', lighting: 88, hvac: 95, power: 13000 }
];

// Organization defaults
export const DEFAULT_ORG_NAME = 'Energy Audit Solutions';
export const DEFAULT_ORG_LOGO = '/assets/images/logo.png';
export const DEFAULT_PROJECT_NAME = 'Energy Efficiency Assessment'; 