import React from 'react';
const ActivityLog = () => <div>Activity Log Coming Soon!</div>;
export default ActivityLog;

export type ActivityLogEvent = {
  id: string;
  type: string;
  resourceType: string;
  resourceId: string;
  resourceName: string;
  userId: string;
  userName: string;
  timestamp: string;
  details: string;
  status: string;
}; 