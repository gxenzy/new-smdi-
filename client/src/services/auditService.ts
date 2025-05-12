import axios from 'axios';

// Types
export interface EnergyAudit {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  location: string;
  findings: Finding[];
  recommendations: Recommendation[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Finding {
  id: string;
  auditId: string;
  category: string;
  description: string;
  severity: 'critical' | 'major' | 'minor' | 'info';
  location: string;
  status: 'open' | 'in_progress' | 'resolved' | 'wont_fix';
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Recommendation {
  id: string;
  auditId: string;
  description: string;
  estimatedCost?: number;
  estimatedSavings?: number;
  paybackPeriod?: number;
  priority: 'high' | 'medium' | 'low';
  implementationStatus: 'pending' | 'in_progress' | 'completed' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface AuditFormData {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate?: string;
}

export interface FindingFormData {
  category: string;
  description: string;
  severity: 'critical' | 'major' | 'minor' | 'info';
  location: string;
  images?: File[];
}

export interface RecommendationFormData {
  description: string;
  estimatedCost?: number;
  estimatedSavings?: number;
  priority: 'high' | 'medium' | 'low';
}

// API endpoints
const API_URL = '/api';
const AUDITS_ENDPOINT = `${API_URL}/energy-audits`;

// Fetch all audits with optional filters
export const fetchAudits = async (filters?: {
  status?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  createdBy?: string;
  page?: number;
  limit?: number;
}): Promise<{ audits: EnergyAudit[]; total: number; page: number; limit: number }> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await axios.get(`${AUDITS_ENDPOINT}?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching audits:', error);
    throw error;
  }
};

// Fetch recent audits
export const fetchRecentAudits = async (limit: number = 5): Promise<EnergyAudit[]> => {
  try {
    const response = await axios.get(`${AUDITS_ENDPOINT}/recent?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent audits:', error);
    throw error;
  }
};

// Fetch a single audit by ID
export const fetchAuditById = async (id: string): Promise<EnergyAudit> => {
  try {
    const response = await axios.get(`${AUDITS_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching audit with ID ${id}:`, error);
    throw error;
  }
};

// Create a new audit
export const createAudit = async (auditData: AuditFormData): Promise<EnergyAudit> => {
  try {
    const response = await axios.post(AUDITS_ENDPOINT, auditData);
    return response.data;
  } catch (error) {
    console.error('Error creating audit:', error);
    throw error;
  }
};

// Update an existing audit
export const updateAudit = async (id: string, auditData: Partial<AuditFormData>): Promise<EnergyAudit> => {
  try {
    const response = await axios.put(`${AUDITS_ENDPOINT}/${id}`, auditData);
    return response.data;
  } catch (error) {
    console.error(`Error updating audit with ID ${id}:`, error);
    throw error;
  }
};

// Delete an audit
export const deleteAudit = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${AUDITS_ENDPOINT}/${id}`);
  } catch (error) {
    console.error(`Error deleting audit with ID ${id}:`, error);
    throw error;
  }
};

// Change audit status
export const updateAuditStatus = async (id: string, status: EnergyAudit['status']): Promise<EnergyAudit> => {
  try {
    const response = await axios.patch(`${AUDITS_ENDPOINT}/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating status for audit with ID ${id}:`, error);
    throw error;
  }
};

// Add a finding to an audit
export const addFinding = async (auditId: string, findingData: FindingFormData): Promise<Finding> => {
  try {
    const formData = new FormData();
    
    // Append text fields
    Object.entries(findingData).forEach(([key, value]) => {
      if (key !== 'images' && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
    
    // Append images if any
    if (findingData.images && findingData.images.length > 0) {
      findingData.images.forEach((image, index) => {
        formData.append(`images`, image);
      });
    }
    
    const response = await axios.post(`${AUDITS_ENDPOINT}/${auditId}/findings`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error adding finding to audit with ID ${auditId}:`, error);
    throw error;
  }
};

// Update a finding
export const updateFinding = async (auditId: string, findingId: string, findingData: Partial<FindingFormData>): Promise<Finding> => {
  try {
    const formData = new FormData();
    
    // Append text fields
    Object.entries(findingData).forEach(([key, value]) => {
      if (key !== 'images' && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
    
    // Append images if any
    if (findingData.images && findingData.images.length > 0) {
      findingData.images.forEach((image, index) => {
        formData.append(`images`, image);
      });
    }
    
    const response = await axios.put(`${AUDITS_ENDPOINT}/${auditId}/findings/${findingId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error updating finding with ID ${findingId}:`, error);
    throw error;
  }
};

// Delete a finding
export const deleteFinding = async (auditId: string, findingId: string): Promise<void> => {
  try {
    await axios.delete(`${AUDITS_ENDPOINT}/${auditId}/findings/${findingId}`);
  } catch (error) {
    console.error(`Error deleting finding with ID ${findingId}:`, error);
    throw error;
  }
};

// Add a recommendation to an audit
export const addRecommendation = async (auditId: string, recommendationData: RecommendationFormData): Promise<Recommendation> => {
  try {
    const response = await axios.post(`${AUDITS_ENDPOINT}/${auditId}/recommendations`, recommendationData);
    return response.data;
  } catch (error) {
    console.error(`Error adding recommendation to audit with ID ${auditId}:`, error);
    throw error;
  }
};

// Update a recommendation
export const updateRecommendation = async (auditId: string, recommendationId: string, recommendationData: Partial<RecommendationFormData>): Promise<Recommendation> => {
  try {
    const response = await axios.put(`${AUDITS_ENDPOINT}/${auditId}/recommendations/${recommendationId}`, recommendationData);
    return response.data;
  } catch (error) {
    console.error(`Error updating recommendation with ID ${recommendationId}:`, error);
    throw error;
  }
};

// Delete a recommendation
export const deleteRecommendation = async (auditId: string, recommendationId: string): Promise<void> => {
  try {
    await axios.delete(`${AUDITS_ENDPOINT}/${auditId}/recommendations/${recommendationId}`);
  } catch (error) {
    console.error(`Error deleting recommendation with ID ${recommendationId}:`, error);
    throw error;
  }
};

// Generate audit report
export const generateAuditReport = async (auditId: string, format: 'pdf' | 'excel' | 'docx' = 'pdf'): Promise<Blob> => {
  try {
    const response = await axios.get(`${AUDITS_ENDPOINT}/${auditId}/report?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error(`Error generating report for audit with ID ${auditId}:`, error);
    throw error;
  }
};

// Get audit statistics
export const getAuditStatistics = async (): Promise<{
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  findingsBySeverity: Record<string, number>;
  auditsByLocation: Record<string, number>;
  auditsByMonth: Record<string, number>;
}> => {
  try {
    const response = await axios.get(`${AUDITS_ENDPOINT}/statistics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching audit statistics:', error);
    throw error;
  }
};

// Export all audits
export const exportAudits = async (format: 'csv' | 'excel' = 'excel'): Promise<Blob> => {
  try {
    const response = await axios.get(`${AUDITS_ENDPOINT}/export?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error(`Error exporting audits:`, error);
    throw error;
  }
}; 