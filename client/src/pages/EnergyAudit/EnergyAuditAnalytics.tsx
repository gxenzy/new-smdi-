import React, { useMemo } from 'react';
import { useEnergyAudit } from './EnergyAuditContext';
import AnalyticsDashboard from '../../components/EnergyAudit/AnalyticsDashboard';

const EnergyAuditAnalytics: React.FC = () => {
  const { audit } = useEnergyAudit();
  const allFindings = useMemo(() => [...audit.lighting, ...audit.hvac, ...audit.envelope], [audit]);
  const allActivityLog = useMemo(() =>
    allFindings.flatMap(f => f.activityLog || []),
    [allFindings]
  );
  return <AnalyticsDashboard findings={allFindings} activityLog={allActivityLog} />;
};

export default EnergyAuditAnalytics; 