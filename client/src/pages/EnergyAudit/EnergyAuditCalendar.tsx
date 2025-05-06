import React, { useMemo } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useScheduleContext } from './EnergyAuditScheduleContext';

const localizer = momentLocalizer(moment);

const statusColors: Record<string, string> = {
  Scheduled: '#1976d2',
  Completed: '#43a047',
  Missed: '#e53935',
};

const EnergyAuditCalendar: React.FC = () => {
  const { audits } = useScheduleContext();

  const events = useMemo(() => audits.map(audit => ({
    id: audit.id,
    title: `${audit.name} (${audit.team})`,
    start: new Date(audit.date),
    end: new Date(audit.date),
    allDay: false,
    resource: audit,
  })), [audits]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Audit Calendar</Typography>
      <Paper sx={{ p: 2 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          eventPropGetter={event => {
            const status = event.resource.status;
            return {
              style: {
                backgroundColor: statusColors[status] || '#1976d2',
                color: 'white',
                borderRadius: 4,
                border: 'none',
              },
            };
          }}
          tooltipAccessor={event => `${event.title}\nStatus: ${event.resource.status}\nLocation: ${event.resource.location}`}
        />
      </Paper>
    </Box>
  );
};

export default EnergyAuditCalendar; 