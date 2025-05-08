import React, { useMemo } from 'react';
import { Box, Paper, Typography, LinearProgress, Grid, Chip } from '@mui/material';
import { Audit, categories } from './types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as TooltipChart, ResponsiveContainer } from 'recharts';

interface AuditAnalyticsDashboardProps {
  selectedAudit: Audit;
  calculateValue: (ari: string) => number;
}

const riskLabels = [
  { value: 4, label: 'Critical (4)' },
  { value: 3, label: 'High (3)' },
  { value: 2, label: 'Moderate (2)' },
  { value: 1, label: 'Low (1)' },
];
const riskColors = ['#d32f2f', '#fbc02d', '#1976d2', '#388e3c'];

const AuditAnalyticsDashboard: React.FC<AuditAnalyticsDashboardProps> = ({ selectedAudit, calculateValue }) => {
  // Flatten all items
  const allItems = useMemo(() => {
    const items: { completed: boolean; risk: number }[] = [];
    Object.keys(categories).forEach(floor => {
      categories[floor].forEach(category => {
        const completed = selectedAudit.complianceData?.[floor]?.[category]?.completed || false;
        const ari = selectedAudit.ariData?.[floor]?.[category] || '';
        const risk = calculateValue(ari);
        items.push({ completed, risk });
      });
    });
    return items;
  }, [selectedAudit, calculateValue]);

  const total = allItems.length;
  const completedCount = allItems.filter(i => i.completed).length;
  const complianceRate = total ? (completedCount / total) * 100 : 0;

  const riskCounts = riskLabels.map(r =>
    allItems.filter(i => i.risk === r.value).length
  );

  // Chart data
  const completionData = [
    { name: 'Completed', value: completedCount },
    { name: 'Not Completed', value: total - completedCount },
  ];
  const riskData = riskLabels.map((r, idx) => ({ name: r.label, value: riskCounts[idx] }));

  return (
    <Paper elevation={2} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Audit Analytics
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2">Compliance Rate</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress variant="determinate" value={complianceRate} sx={{ flex: 1, height: 10, borderRadius: 5 }} />
            <Typography variant="body2" fontWeight="bold">{complianceRate.toFixed(1)}%</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">{completedCount} of {total} items completed</Typography>
          <Box sx={{ width: '100%', height: 120, mt: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={completionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={40} label>
                  <Cell key="completed" fill="#388e3c" />
                  <Cell key="not-completed" fill="#bdbdbd" />
                </Pie>
                <TooltipChart />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2">Risk Index Distribution</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
            {riskLabels.map((r, idx) => (
              <Chip key={r.value} label={`${r.label}: ${riskCounts[idx]}`} color={r.value === 4 ? 'error' : r.value === 3 ? 'warning' : r.value === 2 ? 'info' : 'success'} variant="outlined" />
            ))}
          </Box>
          <Box sx={{ width: '100%', height: 120, mt: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData}>
                <XAxis dataKey="name" fontSize={10} />
                <YAxis allowDecimals={false} fontSize={10} />
                <TooltipChart />
                <Bar dataKey="value">
                  {riskData.map((entry, idx) => (
                    <Cell key={entry.name} fill={riskColors[idx]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2">Completion Status</Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Chip label={`Completed: ${completedCount}`} color="success" />
            <Chip label={`Not Completed: ${total - completedCount}`} color="default" />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AuditAnalyticsDashboard; 