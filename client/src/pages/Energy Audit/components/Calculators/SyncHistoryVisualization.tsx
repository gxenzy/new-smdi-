import React, { useEffect, useRef } from 'react';
import { Box, Paper, Typography, CircularProgress, useTheme } from '@mui/material';
import { SyncEvent } from '../../../../contexts/CircuitSynchronizationContext';
import Chart from 'chart.js/auto';

interface SyncHistoryVisualizationProps {
  events: SyncEvent[];
  loading: boolean;
}

const SyncHistoryVisualization: React.FC<SyncHistoryVisualizationProps> = ({ events, loading }) => {
  const theme = useTheme();
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Create or update chart when events change
  useEffect(() => {
    if (loading || !chartRef.current || events.length === 0) return;

    // Clean up previous chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Prepare data for chart
    // Group events by type
    const eventTypes = Array.from(new Set(events.map(event => event.type)));
    const eventBySource = Array.from(new Set(events.map(event => event.source)));
    
    // Get time range
    const timeRange = events.reduce(
      (range, event) => {
        return {
          min: Math.min(range.min, event.timestamp),
          max: Math.max(range.max, event.timestamp)
        };
      },
      { min: Infinity, max: -Infinity }
    );
    
    // Group events by day
    const oneDay = 24 * 60 * 60 * 1000;
    const daysInRange = Math.ceil((timeRange.max - timeRange.min) / oneDay) + 1;
    const dates = Array.from({ length: daysInRange }, (_, i) => 
      new Date(timeRange.min + i * oneDay).toLocaleDateString()
    );
    
    // Count events by type and day
    const datasets = eventTypes.map(type => {
      const color = getColorForEventType(type);
      const counts = dates.map(date => 
        events.filter(event => 
          event.type === type && 
          new Date(event.timestamp).toLocaleDateString() === date
        ).length
      );
      
      return {
        label: type,
        data: counts,
        backgroundColor: color,
        borderColor: color,
        tension: 0.2
      };
    });
    
    // Create chart
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dates,
          datasets
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Synchronization Events Over Time',
              color: theme.palette.text.primary,
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            legend: {
              position: 'top',
              labels: {
                color: theme.palette.text.primary
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Date',
                color: theme.palette.text.primary
              },
              ticks: {
                color: theme.palette.text.secondary
              },
              grid: {
                color: theme.palette.divider
              }
            },
            y: {
              title: {
                display: true,
                text: 'Event Count',
                color: theme.palette.text.primary
              },
              beginAtZero: true,
              ticks: {
                precision: 0,
                color: theme.palette.text.secondary
              },
              grid: {
                color: theme.palette.divider
              }
            }
          }
        }
      });
    }
    
    // Clean up chart on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [events, loading, theme]);

  // Get color for event type
  const getColorForEventType = (type: string): string => {
    switch (type) {
      case 'sync-requested':
        return theme.palette.info.main;
      case 'sync-completed':
        return theme.palette.success.main;
      case 'circuit-updated':
      case 'circuit-created':
        return theme.palette.primary.main;
      case 'load-schedule-updated':
      case 'load-item-updated':
        return theme.palette.secondary.main;
      default:
        return theme.palette.warning.main;
    }
  };

  // If there are no events or still loading, show a placeholder
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, width: '100%' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }
  
  if (events.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, width: '100%' }}>
        <Typography variant="body1" color="text.secondary">
          No events to display. Sync history will appear here.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <canvas ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </Box>
  );
};

export default SyncHistoryVisualization; 