import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export interface ActivityLogEvent {
  id: string;
  timestamp: number;
  type: string;
  message: string;
  userId: string;
  userName: string;
  details?: any;
}

interface ActivityLogProps {
  events?: ActivityLogEvent[];
  maxHeight?: string | number;
  showTitle?: boolean;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ events = [], maxHeight = 400, showTitle = true }) => {
  return (
    <Paper sx={{ p: 2 }}>
      {showTitle && (
        <Typography variant="h6" gutterBottom>
          Activity Log
        </Typography>
      )}
      <Box sx={{ maxHeight, overflowY: 'auto' }}>
        {events.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No activity recorded yet.
          </Typography>
        ) : (
          events.map(event => (
            <Box key={event.id} sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {event.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(event.timestamp).toLocaleString()} by {event.userName}
              </Typography>
            </Box>
          ))
        )}
      </Box>
    </Paper>
  );
};

export default ActivityLog; 