import React, { useEffect, useRef } from 'react';
import { useTheme, Box, Typography, Paper } from '@mui/material';
import Chart from 'chart.js/auto';
import { Line } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { UnifiedCircuitData } from './utils/CircuitSynchronization';
import { VoltageDropCalculationResult } from './utils/voltageDropRecalculator';

// Register the annotation plugin
Chart.register(annotationPlugin);

export interface VoltageProfileData {
  distance: number;
  voltage: number;
  isCompliant: boolean;
}

export interface VoltageProfileChartProps {
  circuitData: UnifiedCircuitData;
  voltageDropResult: VoltageDropCalculationResult;
  showReferenceLine?: boolean;
  interactive?: boolean;
  height?: number;
  onPointHover?: (distance: number, voltage: number) => void;
}

/**
 * Generate voltage profile data points based on circuit data and voltage drop results
 */
export function generateVoltageProfileData(
  circuitData: UnifiedCircuitData,
  voltageDropResult: VoltageDropCalculationResult,
  numberOfPoints: number = 20
): VoltageProfileData[] {
  const supplyVoltage = circuitData.voltage || 230;
  const conductorLength = circuitData.conductorLength || 10;
  const voltageDrop = voltageDropResult.voltageDrop;
  const maxAllowedDrop = voltageDropResult.maxAllowedDrop;
  
  // Calculate maximum voltage drop as a percentage
  const maxVoltageDrop = (maxAllowedDrop / 100) * supplyVoltage;
  
  // Generate data points along the conductor length
  const data: VoltageProfileData[] = [];
  
  for (let i = 0; i <= numberOfPoints; i++) {
    const distanceRatio = i / numberOfPoints;
    const distance = distanceRatio * conductorLength;
    
    // Calculate voltage at this point (assuming linear voltage drop)
    const voltageAtPoint = supplyVoltage - (voltageDrop * distanceRatio);
    
    // Check if voltage is compliant at this point
    const minimumAllowedVoltage = supplyVoltage - maxVoltageDrop;
    const isCompliant = voltageAtPoint >= minimumAllowedVoltage;
    
    data.push({
      distance,
      voltage: voltageAtPoint,
      isCompliant
    });
  }
  
  return data;
}

/**
 * Component for visualizing voltage profile along a circuit
 */
const VoltageProfileChart: React.FC<VoltageProfileChartProps> = ({
  circuitData,
  voltageDropResult,
  showReferenceLine = true,
  interactive = true,
  height = 300,
  onPointHover
}) => {
  const theme = useTheme();
  const chartRef = useRef<Chart | null>(null);
  
  // Generate voltage profile data
  const profileData = generateVoltageProfileData(circuitData, voltageDropResult);
  
  // Get colors from theme
  const compliantColor = theme.palette.success.main;
  const nonCompliantColor = theme.palette.error.main;
  const referenceLineColor = theme.palette.warning.main;
  const gridColor = theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const fontColor = theme.palette.text.primary;
  
  // Create dataset with color segmentation for compliant/non-compliant sections
  const distances = profileData.map(point => point.distance);
  const voltages = profileData.map(point => point.voltage);
  const complianceStatus = profileData.map(point => point.isCompliant);
  
  // Find where compliance changes from true to false
  let segmentChange = -1;
  for (let i = 0; i < complianceStatus.length - 1; i++) {
    if (complianceStatus[i] !== complianceStatus[i + 1]) {
      segmentChange = i;
      break;
    }
  }
  
  // Calculate minimum allowed voltage
  const supplyVoltage = circuitData.voltage || 230;
  const maxAllowedDrop = voltageDropResult.maxAllowedDrop;
  const minAllowedVoltage = supplyVoltage * (1 - maxAllowedDrop / 100);
  
  // Chart data
  const data = {
    labels: distances,
    datasets: [
      {
        label: 'Voltage Along Circuit',
        data: voltages,
        borderColor: segmentChange === -1 
          ? (complianceStatus[0] ? compliantColor : nonCompliantColor)
          : [compliantColor, nonCompliantColor],
        borderWidth: 2,
        tension: 0.3,
        fill: false,
        segment: {
          borderColor: (ctx: any) => {
            const index = ctx.p0.parsed.x;
            return complianceStatus[index] ? compliantColor : nonCompliantColor;
          }
        },
        pointRadius: interactive ? 4 : 0,
        pointHoverRadius: interactive ? 6 : 0,
        pointBackgroundColor: (ctx: any) => {
          const index = ctx.dataIndex;
          return complianceStatus[index] ? compliantColor : nonCompliantColor;
        }
      }
    ]
  };
  
  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest' as const,
      intersect: false,
      axis: 'x' as const
    },
    plugins: {
      tooltip: {
        enabled: interactive,
        callbacks: {
          label: (context: any) => {
            const voltage = context.parsed.y.toFixed(2);
            const distance = context.parsed.x.toFixed(2);
            const isCompliant = complianceStatus[context.dataIndex];
            return [
              `Voltage: ${voltage}V`,
              `Distance: ${distance}m`,
              `Status: ${isCompliant ? 'Compliant' : 'Non-compliant'}`
            ];
          }
        }
      },
      legend: {
        display: false
      },
      annotation: showReferenceLine ? {
        annotations: {
          minVoltageAllowed: {
            type: 'line' as const,
            yMin: minAllowedVoltage,
            yMax: minAllowedVoltage,
            borderColor: referenceLineColor,
            borderWidth: 2,
            borderDash: [6, 4],
            label: {
              display: true,
              content: `Min. Allowed (${minAllowedVoltage.toFixed(1)}V)`,
              position: 'start',
              backgroundColor: referenceLineColor,
              color: '#fff',
              font: {
                size: 10
              }
            }
          },
          supplyVoltage: {
            type: 'line' as const,
            yMin: supplyVoltage,
            yMax: supplyVoltage,
            borderColor: theme.palette.info.main,
            borderWidth: 2,
            borderDash: [2, 2],
            label: {
              display: true,
              content: `Supply (${supplyVoltage.toFixed(1)}V)`,
              position: 'start',
              backgroundColor: theme.palette.info.main,
              color: '#fff',
              font: {
                size: 10
              }
            }
          }
        }
      } : {}
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Distance (m)',
          color: fontColor
        },
        grid: {
          color: gridColor
        },
        ticks: {
          color: fontColor
        }
      },
      y: {
        title: {
          display: true,
          text: 'Voltage (V)',
          color: fontColor
        },
        grid: {
          color: gridColor
        },
        ticks: {
          color: fontColor
        }
      }
    }
  };
  
  // Handle hover events
  const handleHover = (event: any, elements: any[]) => {
    if (interactive && onPointHover && elements.length > 0) {
      const dataIndex = elements[0].index;
      const distance = distances[dataIndex];
      const voltage = voltages[dataIndex];
      onPointHover(distance, voltage);
    }
  };
  
  return (
    <Paper elevation={1} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Voltage Profile Along Circuit
      </Typography>
      
      <Box sx={{ height }}>
        <Line 
          data={data} 
          options={options as any}
          onClick={(event) => {
            const chart = chartRef.current;
            if (!chart) return;
            
            const elements = chart.getElementsAtEventForMode(
              event.nativeEvent,
              'nearest',
              { intersect: false },
              false
            );
            
            if (elements.length > 0 && interactive && onPointHover) {
              const dataIndex = elements[0].index;
              const distance = distances[dataIndex];
              const voltage = voltages[dataIndex];
              onPointHover(distance, voltage);
            }
          }}
          ref={(ref: any) => {
            if (ref) {
              chartRef.current = ref.chartInstance;
            }
          }}
        />
      </Box>
      
      {voltageDropResult.compliance === 'non-compliant' && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
          Warning: Voltage drop exceeds the maximum allowed ({voltageDropResult.maxAllowedDrop}%) at some points in the circuit.
        </Typography>
      )}
    </Paper>
  );
};

export default VoltageProfileChart; 