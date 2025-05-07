import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
} from '@mui/material';
import { saveAs } from 'file-saver';
import { useSocket } from '../../../contexts/SocketContext';

export interface ActivityLogEntry {
  id: string;
  action: string;
  user: string;
  details?: string;
  timestamp: string;
}

interface ActivityLogProps {
  activityLog: ActivityLogEntry[];
}

const ActivityLog: React.FC<ActivityLogProps> = ({ activityLog }) => {
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [liveLog, setLiveLog] = useState<ActivityLogEntry[]>(activityLog);
  const socket = useSocket();

  useEffect(() => {
    setLiveLog(activityLog);
  }, [activityLog]);

  useEffect(() => {
    socket.on('activityLog', (activity) => {
      setLiveLog(prev => [{
        id: activity._id || activity.id || String(Date.now()),
        action: activity.action,
        user: activity.userId || activity.user,
        details: activity.details,
        timestamp: activity.timestamp || new Date().toISOString(),
      }, ...prev]);
    });
    return () => {
      socket.off('activityLog');
    };
  }, [socket]);

  const users = Array.from(new Set(liveLog.map(log => log.user)));
  const actions = Array.from(new Set(liveLog.map(log => log.action)));

  const filteredLog = liveLog.filter(log => {
    const matchesUser = userFilter ? log.user === userFilter : true;
    const matchesAction = actionFilter ? log.action === actionFilter : true;
    const matchesDate = dateFilter ? log.timestamp.slice(0, 10) === dateFilter : true;
    return matchesUser && matchesAction && matchesDate;
  });

  const handleExportCSV = () => {
    const header = 'Action,User,Details,Timestamp\n';
    const rows = filteredLog.map(log =>
      [log.action, log.user, log.details || '', log.timestamp].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    );
    const csv = header + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'activity_log.csv');
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Activity Log
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>User</InputLabel>
          <Select
            value={userFilter}
            label="User"
            onChange={e => setUserFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {users.map(user => (
              <MenuItem key={String(user)} value={String(user)}>{user}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Action</InputLabel>
          <Select
            value={actionFilter}
            label="Action"
            onChange={e => setActionFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {actions.map(action => (
              <MenuItem key={String(action)} value={String(action)}>{action}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Date"
          type="date"
          size="small"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="outlined" size="small" onClick={handleExportCSV} sx={{ alignSelf: 'center' }}>
          Export CSV
        </Button>
      </Box>
      {filteredLog && filteredLog.length > 0 ? (
        <List dense>
          {filteredLog.map((log, index) => (
            <React.Fragment key={log.id}>
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="body2">
                      <strong>{log.action}</strong> by {log.user}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="textSecondary">
                      {log.details && `${log.details} - `}
                      {new Date(log.timestamp).toLocaleString()}
                    </Typography>
                  }
                />
              </ListItem>
              {index < filteredLog.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="textSecondary">
          No activity yet.
        </Typography>
      )}
    </Box>
  );
};

export default ActivityLog; 