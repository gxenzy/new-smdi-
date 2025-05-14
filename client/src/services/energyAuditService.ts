import api from './api';

export interface EnergyAuditData {
  id?: string;
  title: string;
  description: string;
  status: string;
  buildingId: string;
  startDate: string;
  endDate?: string;
  findings: string[];
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FindingData {
  id?: string;
  auditId: string;
  title: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'deferred';
  assignedTo?: string;
  potentialSavings?: number;
  implementationCost?: number;
  roi?: number;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FieldDataPoint {
  id?: string;
  auditId: string;
  areaId: string;
  type: string;
  name: string;
  value: string;
  unit: string;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
    building: string;
    floor: string;
    room: string;
  };
  photoUrls?: string[];
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditArea {
  id?: string;
  auditId: string;
  name: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'complete';
  dataPoints: number;
  completion: number;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditMetrics {
  totalAudits: number;
  completedAudits: number;
  totalFindings: number;
  criticalFindings: number;
  potentialSavings: number;
  implementedSavings: number;
  energyConsumption: {
    current: number;
    previous: number;
    trend: number;
  };
}

/**
 * Energy Audit Service
 * 
 * Provides methods to interact with the Energy Audit API endpoints
 */
const energyAuditService = {
  // Audits
  getAudits: async () => {
    try {
      try {
        const response = await api.get('/energy-audit');
        return response.data;
      } catch (apiError) {
        console.warn('API fetch failed, using mock audit data:', apiError);
        return [
          {
            id: '1',
            title: 'Annual Energy Audit - Main Building',
            description: 'Comprehensive energy audit of the main office building',
            status: 'in_progress',
            buildingId: 'bldg-001',
            startDate: '2023-01-15T00:00:00Z',
            endDate: '2023-02-15T00:00:00Z',
            findings: ['finding-1', 'finding-2', 'finding-3'],
            createdBy: 'user-001',
            createdAt: '2023-01-10T09:00:00Z',
            updatedAt: '2023-01-15T14:30:00Z'
          },
          {
            id: '2',
            title: 'Lighting System Audit',
            description: 'Focused audit on lighting efficiency and recommendations',
            status: 'completed',
            buildingId: 'bldg-001',
            startDate: '2022-11-01T00:00:00Z',
            endDate: '2022-11-15T00:00:00Z',
            findings: ['finding-4', 'finding-5'],
            createdBy: 'user-002',
            createdAt: '2022-10-25T11:20:00Z',
            updatedAt: '2022-11-16T16:45:00Z'
          }
        ];
      }
    } catch (error) {
      console.error('Error in getAudits:', error);
      throw error;
    }
  },

  getAuditById: async (id: string) => {
    const response = await api.get(`/energy-audit/${id}`);
    return response.data;
  },

  createAudit: async (auditData: EnergyAuditData) => {
    const response = await api.post('/energy-audit', auditData);
    return response.data;
  },

  updateAudit: async (id: string, auditData: Partial<EnergyAuditData>) => {
    const response = await api.put(`/energy-audit/${id}`, auditData);
    return response.data;
  },

  deleteAudit: async (id: string) => {
    const response = await api.delete(`/energy-audit/${id}`);
    return response.data;
  },

  // Findings
  getFindings: async (auditId?: string) => {
    try {
      try {
        const endpoint = auditId 
          ? `/energy-audit/${auditId}/findings`
          : '/energy-audit/findings';
        
        const response = await api.get(endpoint);
        return response.data;
      } catch (apiError) {
        console.warn('API fetch failed, using mock findings data:', apiError);
        const mockFindings = [
          {
            id: 'finding-1',
            auditId: '1',
            title: 'Inefficient Lighting in Common Areas',
            description: 'Common areas are using outdated fluorescent lighting fixtures',
            category: 'lighting',
            severity: 'medium',
            status: 'open',
            assignedTo: 'user-003',
            potentialSavings: 1500,
            implementationCost: 3000,
            roi: 2.0,
            createdBy: 'user-001',
            createdAt: '2023-01-16T10:20:00Z',
            updatedAt: '2023-01-16T10:20:00Z'
          },
          {
            id: 'finding-2',
            auditId: '1',
            title: 'HVAC System Maintenance Required',
            description: 'HVAC system needs servicing to improve efficiency',
            category: 'hvac',
            severity: 'high',
            status: 'in_progress',
            assignedTo: 'user-004',
            potentialSavings: 4000,
            implementationCost: 2000,
            roi: 2.0,
            createdBy: 'user-001',
            createdAt: '2023-01-17T14:30:00Z',
            updatedAt: '2023-01-20T09:15:00Z'
          }
        ];
        return auditId
          ? mockFindings.filter(finding => finding.auditId === auditId)
          : mockFindings;
      }
    } catch (error) {
      console.error('Error in getFindings:', error);
      throw error;
    }
  },

  getFindingById: async (id: string) => {
    const response = await api.get(`/energy-audit/findings/${id}`);
    return response.data;
  },

  createFinding: async (findingData: FindingData) => {
    const response = await api.post(`/energy-audit/${findingData.auditId}/findings`, findingData);
    return response.data;
  },

  updateFinding: async (id: string, findingData: Partial<FindingData>) => {
    const response = await api.put(`/energy-audit/findings/${id}`, findingData);
    return response.data;
  },

  deleteFinding: async (id: string) => {
    const response = await api.delete(`/energy-audit/findings/${id}`);
    return response.data;
  },

  // Field Data Collection
  getFieldDataPoints: async (auditId: string, areaId?: string) => {
    const endpoint = areaId
      ? `/energy-audit/${auditId}/areas/${areaId}/data-points`
      : `/energy-audit/${auditId}/data-points`;
    
    const response = await api.get(endpoint);
    return response.data;
  },

  getFieldDataPointById: async (id: string) => {
    const response = await api.get(`/energy-audit/data-points/${id}`);
    return response.data;
  },

  createFieldDataPoint: async (dataPoint: FieldDataPoint) => {
    const response = await api.post(`/energy-audit/${dataPoint.auditId}/data-points`, dataPoint);
    return response.data;
  },

  updateFieldDataPoint: async (id: string, dataPoint: Partial<FieldDataPoint>) => {
    const response = await api.put(`/energy-audit/data-points/${id}`, dataPoint);
    return response.data;
  },

  deleteFieldDataPoint: async (id: string) => {
    const response = await api.delete(`/energy-audit/data-points/${id}`);
    return response.data;
  },

  // Audit Areas
  getAuditAreas: async (auditId: string) => {
    const response = await api.get(`/energy-audit/${auditId}/areas`);
    return response.data;
  },

  getAuditAreaById: async (id: string) => {
    const response = await api.get(`/energy-audit/areas/${id}`);
    return response.data;
  },

  createAuditArea: async (areaData: AuditArea) => {
    const response = await api.post(`/energy-audit/${areaData.auditId}/areas`, areaData);
    return response.data;
  },

  updateAuditArea: async (id: string, areaData: Partial<AuditArea>) => {
    const response = await api.put(`/energy-audit/areas/${id}`, areaData);
    return response.data;
  },

  deleteAuditArea: async (id: string) => {
    const response = await api.delete(`/energy-audit/areas/${id}`);
    return response.data;
  },

  // Metrics and Analytics
  getAuditMetrics: async () => {
    try {
      try {
        const response = await api.get('/energy-audit/metrics');
        return response.data;
      } catch (apiError) {
        console.warn('API fetch failed, using mock metrics data:', apiError);
        return {
          totalAudits: 3,
          completedAudits: 1,
          totalFindings: 5,
          criticalFindings: 0,
          potentialSavings: 12200,
          implementedSavings: 4700,
          energyConsumption: {
            current: 45000,
            previous: 52000,
            trend: -13.46
          }
        };
      }
    } catch (error) {
      console.error('Error in getAuditMetrics:', error);
      throw error;
    }
  },

  // Data synchronization for offline mode
  syncOfflineData: async (offlineData: {
    dataPoints?: FieldDataPoint[],
    areas?: AuditArea[],
    findings?: FindingData[]
  }) => {
    const response = await api.post('/energy-audit/sync', offlineData);
    return response.data;
  },

  // Templates
  getTemplates: async (type?: string) => {
    const endpoint = type
      ? `/energy-audit/templates?type=${type}`
      : '/energy-audit/templates';
    
    const response = await api.get(endpoint);
    return response.data;
  },

  getTemplateById: async (id: string) => {
    const response = await api.get(`/energy-audit/templates/${id}`);
    return response.data;
  },

  // Integration related operations
  getIntegrationData: async (auditId: string, sourceId: string) => {
    const response = await api.get(`/energy-audit/${auditId}/integrations/${sourceId}`);
    return response.data;
  },

  connectIntegration: async (auditId: string, integrationConfig: any) => {
    const response = await api.post(`/energy-audit/${auditId}/integrations`, integrationConfig);
    return response.data;
  }
};

export default energyAuditService; 