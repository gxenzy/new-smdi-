import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { HistoricalData } from '../types';

interface HistoricalComparisonChartProps {
  data: HistoricalData[];
}

export const HistoricalComparisonChart: React.FC<HistoricalComparisonChartProps> = ({ data }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Historical Comparison
      </Typography>
      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Line type="monotone" dataKey="powerUsage" stroke="#8884d8" name="Power Usage (W)" />
            <Line type="monotone" dataKey="lightingEfficiency" stroke="#82ca9d" name="Lighting Efficiency (%)" />
            <Line type="monotone" dataKey="hvacEfficiency" stroke="#ffc658" name="HVAC Efficiency (%)" />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </CardContent>
  </Card>
); 