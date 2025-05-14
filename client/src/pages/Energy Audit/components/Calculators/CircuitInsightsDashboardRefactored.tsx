import React, { useState, useEffect } from 'react';
import {
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Paper, 
  Divider,
  Chip,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Whatshot as WhatshotIcon,
  WaterDrop as WaterDropIcon
} from '@mui/icons-material';

// Import the chart components instead of using Chart.js directly
import { ThemedBarChart, ThemedPieChart } from './utils/ChartComponents';
import { getChartThemeColors } from './utils/chartUtils';

// Use the same types from the original component
import { LoadSchedule } from './ScheduleOfLoads/types';

// Circuit Insights Types (simplified)
export type CircuitComplianceStatus = 'compliant' | 'nonCompliant' | 'critical';

export interface CircuitInfo {
  id: string;
  name: string;
  panelId: string;
  panelName: string;
  voltageDrop: number;
  current?: number;
  conductorSize?: string;
  optimalSize?: string;
}

export interface CircuitAnalysisSummary {
  totalCircuits: number;
  compliantCircuits: number;
  nonCompliantCircuits: number;
  highestVoltageDrop: {
    value: number;
    circuitId: string;
    circuitName: string;
    panelId: string;
  };
  averageVoltageDrop: number;
  criticalCircuits: CircuitInfo[];
}

interface CircuitInsightsDashboardRefactoredProps {
  loadSchedules: LoadSchedule[];
  onSelectCircuit?: (circuitId: string, panelId: string) => void;
  isLoading?: boolean;
}

/**
 * Refactored Circuit Insights Dashboard using the new chart components
 * This demonstrates how to use the themed chart components instead of directly using Chart.js
 */
const CircuitInsightsDashboardRefactored: React.FC<CircuitInsightsDashboardRefactoredProps> = ({
  loadSchedules,
  onSelectCircuit,
  isLoading = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Use the same state structure as the original component
  const [circuitAnalysisSummary, setCircuitAnalysisSummary] = useState<CircuitAnalysisSummary>({
    totalCircuits: 0,
    compliantCircuits: 0,
    nonCompliantCircuits: 0,
    highestVoltageDrop: {
      value: 0,
      circuitId: '',
      circuitName: '',
      panelId: ''
    },
    averageVoltageDrop: 0,
    criticalCircuits: []
  });
  
  // Load data effect
  useEffect(() => {
    if (loadSchedules.length === 0) return;
    
    // Aggregate data from all load schedules
    let totalCircuits = 0;
    let compliantCircuits = 0;
    let nonCompliantCircuits = 0;
    let totalVoltageDrop = 0;
    let maxVoltageDrop = 0;
    let maxVoltageDropCircuit = {
      value: 0,
      circuitId: '',
      circuitName: '',
      panelId: ''
    };
    
    const criticalCircuits: CircuitInfo[] = [];
    
    // Process each load schedule
    for (const panel of loadSchedules) {
      if (!panel.loads) continue;
      
      for (const circuit of panel.loads) {
        if (circuit.voltageDropPercent !== undefined) {
          totalCircuits++;
          totalVoltageDrop += circuit.voltageDropPercent;
          
          // Track compliant vs non-compliant
          if (circuit.isPECCompliant) {
            compliantCircuits++;
          } else {
            nonCompliantCircuits++;
            
            // Add to critical circuits if voltage drop is high
            if (circuit.voltageDropPercent > 4) {
              criticalCircuits.push({
                id: circuit.id,
                name: circuit.description,
                panelId: panel.id,
                panelName: panel.panelName,
                voltageDrop: circuit.voltageDropPercent,
                current: circuit.current || 0,
                conductorSize: circuit.conductorSize || '',
                optimalSize: circuit.optimalConductorSize || ''
              });
            }
          }
          
          // Track highest voltage drop
          if (circuit.voltageDropPercent > maxVoltageDrop) {
            maxVoltageDrop = circuit.voltageDropPercent;
            maxVoltageDropCircuit = {
              value: circuit.voltageDropPercent,
              circuitId: circuit.id,
              circuitName: circuit.description,
              panelId: panel.id
            };
          }
        }
      }
    }
    
    // Calculate average voltage drop
    const averageVoltageDrop = totalCircuits > 0 ? totalVoltageDrop / totalCircuits : 0;
    
    // Sort critical circuits by voltage drop
    criticalCircuits.sort((a, b) => b.voltageDrop - a.voltageDrop);
    
    // Update the summary state
    setCircuitAnalysisSummary({
      totalCircuits,
      compliantCircuits,
      nonCompliantCircuits,
      highestVoltageDrop: maxVoltageDropCircuit,
      averageVoltageDrop,
      criticalCircuits
    });
    
  }, [loadSchedules]);
  
  // Helper function to get top circuits by voltage drop
  const getTopCircuitsByVoltageDrop = (count: number) => {
    const allCircuits: {
      id: string;
      name: string;
      panelId: string;
      panelName: string;
      voltageDrop: number;
    }[] = [];
    
    // Collect all circuits with voltage drop information
    for (const panel of loadSchedules) {
      if (!panel.loads) continue;
      
      for (const circuit of panel.loads) {
        if (circuit.voltageDropPercent !== undefined) {
          allCircuits.push({
            id: circuit.id,
            name: circuit.description,
            panelId: panel.id,
            panelName: panel.panelName,
            voltageDrop: circuit.voltageDropPercent
          });
        }
      }
    }
    
    // Sort by voltage drop descending and take the top N
    return allCircuits
      .sort((a, b) => b.voltageDrop - a.voltageDrop)
      .slice(0, count);
  };
  
  // Get colors for the charts
  const themeColors = getChartThemeColors(theme);
  
  // Prepare data for voltage drop chart
  const topCircuits = getTopCircuitsByVoltageDrop(10);
  const voltageDropChartData = {
    labels: topCircuits.map(c => c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name),
    datasets: [
      {
        label: 'Voltage Drop (%)',
        data: topCircuits.map(c => c.voltageDrop),
        backgroundColor: topCircuits.map(c => c.voltageDrop > 3 ? themeColors.error : themeColors.primary),
        borderColor: topCircuits.map(c => c.voltageDrop > 3 ? themeColors.error : themeColors.primary)
      }
    ]
  };
  
  // Prepare data for compliance chart
  const complianceChartLabels = ['Compliant', 'Non-Compliant'];
  const complianceChartData = [
    circuitAnalysisSummary.compliantCircuits, 
    circuitAnalysisSummary.nonCompliantCircuits
  ];
  
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Circuit Insights Dashboard (Refactored)
      </Typography>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <Typography>Loading...</Typography>
        </Box>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BarChartIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                      Total Circuits
                    </Typography>
                  </Box>
                  <Typography variant="h4">
                    {circuitAnalysisSummary.totalCircuits}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WaterDropIcon color="error" sx={{ mr: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                      Avg. Voltage Drop
                    </Typography>
                  </Box>
                  <Typography variant="h4">
                    {circuitAnalysisSummary.averageVoltageDrop.toFixed(2)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WhatshotIcon color="warning" sx={{ mr: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                      Max Voltage Drop
                    </Typography>
                  </Box>
                  <Typography variant="h4">
                    {circuitAnalysisSummary.highestVoltageDrop.value.toFixed(2)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {circuitAnalysisSummary.highestVoltageDrop.circuitName}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PieChartIcon color="error" sx={{ mr: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                      Non-Compliant
                    </Typography>
                  </Box>
                  <Typography variant="h4">
                    {circuitAnalysisSummary.nonCompliantCircuits}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {circuitAnalysisSummary.totalCircuits > 0 ? 
                      `${Math.round((circuitAnalysisSummary.nonCompliantCircuits / circuitAnalysisSummary.totalCircuits) * 100)}%` : 
                      '0%'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Charts Section */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Top Circuits by Voltage Drop
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 300 }}>
                    <ThemedBarChart
                      id="voltage-drop-chart-refactored"
                      labels={voltageDropChartData.labels}
                      datasets={voltageDropChartData.datasets}
                      options={{
                        xAxisTitle: 'Circuit',
                        yAxisTitle: 'Voltage Drop (%)',
                        beginAtZero: true
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    PEC Compliance Status
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 300 }}>
                    <ThemedPieChart
                      id="compliance-chart-refactored"
                      labels={complianceChartLabels}
                      data={complianceChartData}
                      options={{
                        isDoughnut: true,
                        cutout: 60,
                        legendPosition: 'bottom',
                        backgroundColor: [themeColors.success, themeColors.error]
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Paper>
  );
};

export default CircuitInsightsDashboardRefactored; 