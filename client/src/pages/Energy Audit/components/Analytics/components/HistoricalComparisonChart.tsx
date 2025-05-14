import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '@mui/material';
import type { HistoricalData } from '../../../../../types/energy-audit';

interface Props {
  data: HistoricalData[];
  height?: number;
}

const HistoricalComparisonChart: React.FC<Props> = ({ data, height = 400 }) => {
  const theme = useTheme();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          stroke={theme.palette.text.primary}
        />
        <YAxis
          yAxisId="left"
          stroke={theme.palette.primary.main}
          label={{ value: 'Power Usage (kWh)', angle: -90, position: 'insideLeft' }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke={theme.palette.secondary.main}
          label={{ value: 'Efficiency (%)', angle: 90, position: 'insideRight' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          }}
        />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="powerUsage"
          name="Power Usage"
          stroke={theme.palette.primary.main}
          activeDot={{ r: 8 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="lightingEfficiency"
          name="Lighting Efficiency"
          stroke={theme.palette.secondary.main}
          activeDot={{ r: 8 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="hvacEfficiency"
          name="HVAC Efficiency"
          stroke={theme.palette.error.main}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default HistoricalComparisonChart; 