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
    const response = await api.get('/energy-audit');
    return response.data;
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
    const endpoint = auditId 
      ? `/energy-audit/${auditId}/findings`
      : '/energy-audit/findings';
    
    const response = await api.get(endpoint);
    return response.data;
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
    const response = await api.get('/energy-audit/metrics');
    return response.data;
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