import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  useTheme,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  Divider
} from '@mui/material';
import Chart from 'chart.js/auto';
import { 
  VoltageDropInputs, 
  VoltageDropResult, 
  calculateVoltageDropPercentage,
  COPPER_AMPACITY,
  ALUMINUM_AMPACITY
} from './utils/voltageDropUtils';
import { CONDUCTOR_SIZES, VOLTAGE_DROP_LIMITS } from './utils/voltageRegulationUtils';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

// Import chart annotation plugin
import annotationPlugin from 'chartjs-plugin-annotation';
Chart.register(annotationPlugin);

/**
 * Props for ConductorComparisonView component
 */
interface ConductorComparisonViewProps {
  inputs: VoltageDropInputs;
  results: VoltageDropResult | null;
  isCalculated: boolean;
  onExportComparison?: (dataUrl: string) => void;
  ref?: React.Ref<any>;
}

/**
 * Type for comparison result item
 */
interface ComparisonResult {
  conductorSize: string;
  voltageDrop: number;
  voltageDropPercent: number;
  materialCost: number;
  ampacity: number;
  resistiveLoss: number;
  reactiveLoss: number;
  totalLoss: number;
  isCompliant: boolean;
  isSelected: boolean;
}

// Constants for resistivity and reactance calculations
const RESISTIVITY = {
  copper: 10.371, // ohm-cmil/ft at 75°C
  aluminum: 17.020 // ohm-cmil/ft at 75°C
};

const REACTANCE = {
  PVC: {
    'single-phase': 0.050,  // X/1000ft for single-phase in PVC
    'three-phase': 0.043    // X/1000ft for three-phase in PVC
  },
  steel: {
    'single-phase': 0.062,  // X/1000ft for single-phase in steel
    'three-phase': 0.054    // X/1000ft for three-phase in steel
  },
  aluminum: {
    'single-phase': 0.052,  // X/1000ft for single-phase in aluminum
    'three-phase': 0.045    // X/1000ft for three-phase in aluminum
  }
};

/**
 * Component for detailed comparison of different conductor sizes
 */
const ConductorComparisonView = React.forwardRef<HTMLDivElement, ConductorComparisonViewProps>(
  ({ inputs, results, isCalculated, onExportComparison }, ref) => {
    const theme = useTheme();
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<Chart | null>(null);
    
    // State for comparison results
    const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([inputs.conductorSize]);
    const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
    
    // Estimated costs per unit length (these would be better sourced from a database)
    const estimateCostPerUnit = (size: string, material: string): number => {
      // Very simplified cost estimation
      const sizeNumber = parseInt(size.split(' ')[0]);
      const baseCost = material === 'copper' ? 1.0 : 0.6; // copper is more expensive than aluminum
      return baseCost * (1 + (14 - sizeNumber) * 0.2); // larger gauge = lower number = higher cost
    };
    
    // Calculate comparison results
    useEffect(() => {
      // Get sizes to compare (current size and several sizes around it)
      const allSizes = Object.keys(CONDUCTOR_SIZES);
      const currentSizeIndex = allSizes.indexOf(inputs.conductorSize);
      
      // Get a reasonable range of sizes
      const startIndex = Math.max(0, currentSizeIndex - 4);
      const endIndex = Math.min(allSizes.length - 1, currentSizeIndex + 4);
      const sizesToCompare = allSizes.slice(startIndex, endIndex + 1);
      
      // Calculate results for each size
      const results = sizesToCompare.map(size => {
        // Create a modified input with this conductor size
        const modifiedInputs: VoltageDropInputs = {
          ...inputs,
          conductorSize: size
        };
        
        // Calculate voltage drop percentage
        const voltageDropPercent = calculateVoltageDropPercentage(modifiedInputs);
        
        // Get circuit type limit
        let dropLimit = VOLTAGE_DROP_LIMITS.total;
        switch (inputs.circuitConfiguration.circuitType) {
          case 'branch':
            dropLimit = VOLTAGE_DROP_LIMITS.branch;
            break;
          case 'feeder':
          case 'service':
            dropLimit = VOLTAGE_DROP_LIMITS.feeder;
            break;
          case 'motor':
            dropLimit = 3.0; // Default for motor circuits
            break;
        }
        
        // Calculate actual voltage drop
        const voltageDrop = (inputs.systemVoltage * voltageDropPercent) / 100;
        
        // Get ampacity based on material
        const ampacityTable = inputs.conductorMaterial === 'copper' ? COPPER_AMPACITY : ALUMINUM_AMPACITY;
        const ampacity = ampacityTable[size] || 0;
        
        // Get circular mils from CONDUCTOR_SIZES
        const circularMils = CONDUCTOR_SIZES[size];
        
        // Calculate resistance and reactance for power loss
        const current = inputs.loadCurrent;
        const length = inputs.conductorLength;
        const temperature = inputs.temperature;
        const phaseConfig = inputs.phaseConfiguration;
        const conduitMaterial = inputs.conduitMaterial;
        
        // Calculate resistance
        const resistivity = RESISTIVITY[inputs.conductorMaterial];
        const tempCoefficient = inputs.conductorMaterial === 'copper' ? 0.00393 : 0.00403;
        const tempAdjustment = 1 + tempCoefficient * (temperature - 75);
        const resistance = (resistivity * tempAdjustment * length) / circularMils;
        
        // Calculate reactance
        const reactance = REACTANCE[conduitMaterial][phaseConfig] * (length / 1000);
        
        // Calculate power losses
        let resistiveLoss: number;
        let reactiveLoss: number;
        
        if (phaseConfig === 'single-phase') {
          resistiveLoss = 2 * current * current * resistance;
          reactiveLoss = 2 * current * current * reactance;
        } else {
          resistiveLoss = 3 * current * current * resistance;
          reactiveLoss = 3 * current * current * reactance;
        }
        
        const totalLoss = resistiveLoss + reactiveLoss;
        
        return {
          conductorSize: size,
          voltageDrop,
          voltageDropPercent,
          materialCost: estimateCostPerUnit(size, inputs.conductorMaterial) * length,
          ampacity,
          resistiveLoss,
          reactiveLoss,
          totalLoss,
          isCompliant: voltageDropPercent <= dropLimit,
          isSelected: selectedSizes.includes(size)
        };
      });
      
      setComparisonResults(results);
    }, [inputs, selectedSizes]);
    
    // Handle toggling a conductor size selection
    const handleToggleSize = (size: string) => {
      setSelectedSizes(prev => {
        if (prev.includes(size)) {
          // Don't allow deselecting if it's the only selected size
          if (prev.length === 1) return prev;
          return prev.filter(s => s !== size);
        } else {
          return [...prev, size];
        }
      });
    };
    
    // Create or update the chart
    useEffect(() => {
      if (!chartRef.current || comparisonResults.length === 0) return;
      
      // Clean up previous chart
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      
      // Filter to selected sizes only
      const selectedResults = comparisonResults.filter(r => selectedSizes.includes(r.conductorSize));
      
      // Prepare datasets for comparison chart
      const labels = selectedResults.map(r => r.conductorSize);
      const dropData = selectedResults.map(r => r.voltageDropPercent);
      const lossData = selectedResults.map(r => r.totalLoss);
      const costData = selectedResults.map(r => r.materialCost);
      
      // Colors for chart
      const dropColor = 'rgba(54, 162, 235, 0.8)';
      const lossColor = 'rgba(255, 99, 132, 0.8)';
      const costColor = 'rgba(75, 192, 192, 0.8)';
      
      // Get the circuit limit
      let dropLimit = VOLTAGE_DROP_LIMITS.total;
      switch (inputs.circuitConfiguration.circuitType) {
        case 'branch':
          dropLimit = VOLTAGE_DROP_LIMITS.branch;
          break;
        case 'feeder':
        case 'service':
          dropLimit = VOLTAGE_DROP_LIMITS.feeder;
          break;
        case 'motor':
          dropLimit = 3.0; // Default for motor circuits
          break;
      }
      
      // Create the chart
      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;
      
      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Voltage Drop (%)',
              data: dropData,
              backgroundColor: dropColor,
              borderColor: dropColor.replace('0.8', '1'),
              borderWidth: 1,
              yAxisID: 'y'
            },
            {
              label: 'Power Loss (W)',
              data: lossData,
              backgroundColor: lossColor,
              borderColor: lossColor.replace('0.8', '1'),
              borderWidth: 1,
              yAxisID: 'y1'
            },
            {
              label: 'Material Cost ($)',
              data: costData,
              backgroundColor: costColor,
              borderColor: costColor.replace('0.8', '1'),
              borderWidth: 1,
              yAxisID: 'y2'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Conductor Size Comparison',
              font: {
                size: 16
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false
            },
            annotation: {
              annotations: {
                limitLine: {
                  type: 'line',
                  yMin: dropLimit,
                  yMax: dropLimit,
                  borderColor: 'rgba(255, 0, 0, 0.8)',
                  borderWidth: 2,
                  borderDash: [5, 5],
                  label: {
                    content: `Limit (${dropLimit}%)`,
                    backgroundColor: 'rgba(255, 0, 0, 0.8)'
                  }
                }
              }
            }
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'Voltage Drop (%)'
              },
              grid: {
                display: true
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Power Loss (W)'
              },
              grid: {
                display: false
              }
            },
            y2: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Material Cost ($)'
              },
              grid: {
                display: false
              }
            }
          }
        }
      });
      
      chartInstanceRef.current = chart;
      
      // Cleanup function
      return () => {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }
      };
    }, [inputs, comparisonResults, selectedSizes]);
    
    // Handle exporting the comparison as an image
    const handleExportComparison = () => {
      if (chartRef.current && onExportComparison) {
        onExportComparison(chartRef.current.toDataURL('image/png'));
      }
    };
    
    // Styling
    const getRowStyle = (result: ComparisonResult) => {
      if (result.conductorSize === inputs.conductorSize) {
        return { backgroundColor: theme.palette.action.selected };
      }
      if (!result.isCompliant) {
        return { backgroundColor: theme.palette.error.light };
      }
      return {};
    };
    
    const getComplianceChip = (isCompliant: boolean) => {
      return isCompliant ? (
        <Chip 
          label="Compliant" 
          size="small" 
          color="success" 
          sx={{ minWidth: 80 }} 
        />
      ) : (
        <Chip 
          label="Non-compliant" 
          size="small" 
          color="error" 
          sx={{ minWidth: 80 }} 
        />
      );
    };
    
    return (
      <div ref={ref}>
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Conductor Size Comparison
              </Typography>
              <Box>
                <Tooltip title="Export Comparison">
                  <IconButton onClick={handleExportComparison}>
                    <FileDownloadIcon />
                  </IconButton>
                </Tooltip>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showAdvancedMetrics}
                      onChange={(e) => setShowAdvancedMetrics(e.target.checked)}
                    />
                  }
                  label="Advanced Metrics"
                />
              </Box>
            </Box>
            
            <Box sx={{ height: 350, mb: 3 }}>
              <canvas ref={chartRef}></canvas>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Compare</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell align="right">Voltage Drop</TableCell>
                    <TableCell align="right">Drop %</TableCell>
                    <TableCell align="right">Ampacity</TableCell>
                    {showAdvancedMetrics && (
                      <>
                        <TableCell align="right">R Loss (W)</TableCell>
                        <TableCell align="right">X Loss (W)</TableCell>
                        <TableCell align="right">Total Loss (W)</TableCell>
                        <TableCell align="right">Est. Cost ($)</TableCell>
                      </>
                    )}
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {comparisonResults.map((result) => (
                    <TableRow 
                      key={result.conductorSize}
                      sx={getRowStyle(result)}
                    >
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => handleToggleSize(result.conductorSize)}
                          color={result.isSelected ? "primary" : "default"}
                        >
                          <CompareArrowsIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={result.conductorSize === inputs.conductorSize ? 'bold' : 'normal'}>
                          {result.conductorSize}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{result.voltageDrop.toFixed(2)} V</TableCell>
                      <TableCell align="right">{result.voltageDropPercent.toFixed(2)}%</TableCell>
                      <TableCell align="right">{result.ampacity} A</TableCell>
                      {showAdvancedMetrics && (
                        <>
                          <TableCell align="right">{result.resistiveLoss.toFixed(2)}</TableCell>
                          <TableCell align="right">{result.reactiveLoss.toFixed(2)}</TableCell>
                          <TableCell align="right">{result.totalLoss.toFixed(2)}</TableCell>
                          <TableCell align="right">${result.materialCost.toFixed(2)}</TableCell>
                        </>
                      )}
                      <TableCell align="center">
                        {getComplianceChip(result.isCompliant)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                This comparison shows how different conductor sizes affect voltage drop, power loss, and material cost.
                Select multiple sizes using the compare button to view them on the chart.
                {inputs.conductorSize && (
                  <> Your current selection ({inputs.conductorSize}) is highlighted.</>
                )}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </div>
    );
  }
);

export default ConductorComparisonView; 