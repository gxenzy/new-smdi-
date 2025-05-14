import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box
} from '@mui/material';
import { ChartConfiguration } from 'chart.js';

/**
 * Props for the ChartDataTable component
 */
interface ChartDataTableProps {
  /**
   * Chart configuration containing the data
   */
  configuration: ChartConfiguration;
  
  /**
   * Chart title
   */
  title?: string;
  
  /**
   * Whether to visually hide the table (for screen readers only)
   */
  visuallyHidden?: boolean;
  
  /**
   * Whether the table is in high contrast mode
   */
  highContrast?: boolean;
}

/**
 * Component that renders chart data as an accessible table
 * This provides a text alternative for screen reader users
 */
const ChartDataTable: React.FC<ChartDataTableProps> = ({
  configuration,
  title,
  visuallyHidden = false,
  highContrast = false
}) => {
  if (!configuration || !configuration.data) {
    return null;
  }
  
  const { datasets } = configuration.data;
  const labels = configuration.data.labels || [];
  
  // Chart type specific rendering
  const isPieOrDoughnut = ['pie', 'doughnut'].includes(configuration.type as string);
  
  const tableStyles = {
    ...(visuallyHidden ? {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: '1px',
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      width: '1px',
      whiteSpace: 'nowrap'
    } as const : {}),
    ...(highContrast ? {
      '& .MuiTableCell-root': {
        color: '#FFFFFF',
        borderColor: '#FFFFFF'
      },
      '& .MuiTableCell-head': {
        backgroundColor: '#000000',
        fontWeight: 'bold'
      },
      '& .MuiTableRow-root': {
        '&:nth-of-type(odd)': {
          backgroundColor: '#333333'
        },
        '&:nth-of-type(even)': {
          backgroundColor: '#000000'
        }
      }
    } : {})
  };
  
  // For pie/doughnut charts, we render a simpler table with just labels and values
  if (isPieOrDoughnut && datasets && datasets.length > 0) {
    return (
      <Box sx={visuallyHidden ? tableStyles : {}}>
        <TableContainer 
          component={Paper}
          sx={!visuallyHidden ? tableStyles : undefined}
        >
          <Table aria-label={`Data table for ${title || 'chart'}`}>
            <caption>{title || configuration.options?.plugins?.title?.text || 'Chart Data'}</caption>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell align="right">Value</TableCell>
                <TableCell align="right">Percentage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {datasets[0].data.map((value: any, index: number) => {
                const dataValue = typeof value === 'object' ? (value as any).value || value : value;
                // Calculate percentage for pie/doughnut
                const total = datasets[0].data.reduce((sum: number, val: any) => {
                  const numVal = typeof val === 'object' ? (val as any).value || val : val;
                  return sum + (typeof numVal === 'number' ? numVal : 0);
                }, 0);
                const percentage = total > 0 ? ((typeof dataValue === 'number' ? dataValue : 0) / total) * 100 : 0;
                
                return (
                  <TableRow key={index}>
                    <TableCell component="th" scope="row">
                      {labels[index]?.toString() || `Item ${index + 1}`}
                    </TableCell>
                    <TableCell align="right">
                      {typeof dataValue === 'number' ? dataValue.toLocaleString() : dataValue}
                    </TableCell>
                    <TableCell align="right">
                      {percentage.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }
  
  // For other chart types, render a table with datasets as columns
  return (
    <Box sx={visuallyHidden ? tableStyles : {}}>
      <TableContainer 
        component={Paper}
        sx={!visuallyHidden ? tableStyles : undefined}
      >
        <Table aria-label={`Data table for ${title || 'chart'}`}>
          <caption>{title || configuration.options?.plugins?.title?.text || 'Chart Data'}</caption>
          <TableHead>
            <TableRow>
              <TableCell>Label</TableCell>
              {datasets.map((dataset, index) => (
                <TableCell key={index} align="right">
                  {dataset.label || `Dataset ${index + 1}`}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {labels.map((label, labelIndex) => (
              <TableRow key={labelIndex}>
                <TableCell component="th" scope="row">
                  {label?.toString() || `Label ${labelIndex + 1}`}
                </TableCell>
                {datasets.map((dataset, datasetIndex) => {
                  // Handle different data formats
                  let value: any = Array.isArray(dataset.data) ? dataset.data[labelIndex] : null;
                  const displayValue = typeof value === 'object' 
                    ? (value as any).y || value 
                    : value;
                    
                  return (
                    <TableCell key={datasetIndex} align="right">
                      {typeof displayValue === 'number' 
                        ? displayValue.toLocaleString() 
                        : displayValue}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ChartDataTable; 