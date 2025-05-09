import React from 'react';
import AuditAnalyticsDashboard from './AuditTable/AuditAnalyticsDashboard';
import { Audit } from './AuditTable/types';

interface AnalyticsDashboardProps {
  selectedAudit: Audit;
  calculateValue: (ari: string) => number;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ selectedAudit, calculateValue }) => {
  if (!selectedAudit) return null;
  return <AuditAnalyticsDashboard selectedAudit={selectedAudit} calculateValue={calculateValue} />;
};

export default AnalyticsDashboard; 