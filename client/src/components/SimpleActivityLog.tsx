import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';

// Define the event interface
export interface LogEvent {
  id: string;
  timestamp: number;
  type: string;
  message: string;
  userId: string;
  userName: string;
}

interface SimpleActivityLogProps {
  height?: string;
  maxEvents?: number;
  compact?: boolean;
  showFilters?: boolean;
  autoRefresh?: boolean;
}

const SimpleActivityLog: React.FC<SimpleActivityLogProps> = ({
  height = '400px',
  maxEvents = 20,
  compact = false,
  showFilters = false,
  autoRefresh = false
}) => {
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load mock data
  useEffect(() => {
    setTimeout(() => {
      const mockEvents = Array(maxEvents).fill(0).map((_, i) => ({
        id: `event-${i}`,
        timestamp: Date.now() - i * 60000,
        type: ['create', 'update', 'view', 'delete'][Math.floor(Math.random() * 4)],
        message: `Sample activity event ${i}`,
        userId: 'user-1',
        userName: 'Demo User'
      }));
      
      setEvents(mockEvents);
      setLoading(false);
    }, 1000);
  }, [maxEvents]);
  
  // Render the component
  return (
    <Paper sx={{ height, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">Activity Log</Typography>
      </Box>
      
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress size={24} />
          </Box>
        ) : events.length > 0 ? (
          <List>
            {events.map(event => (
              <React.Fragment key={event.id}>
                <ListItem>
                  <ListItemText
                    primary={event.message}
                    secondary={`${new Date(event.timestamp).toLocaleString()} by ${event.userName}`}
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No activity to display
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default SimpleActivityLog; 