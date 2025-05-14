# Chart Keyboard Navigation Implementation Plan

This document outlines the plan for implementing advanced keyboard navigation features for chart components in the Energy Audit Platform.

## Overview

Keyboard navigation is essential for accessibility, allowing users who cannot use a mouse to interact with chart components. The implementation will focus on creating a consistent, intuitive keyboard navigation system across all chart types while following WCAG 2.1 guidelines.

## Objectives

1. Enable complete chart navigation and interaction using only the keyboard
2. Create a consistent navigation model across different chart types
3. Implement clear visual feedback for keyboard focus
4. Add keyboard shortcuts for common chart actions
5. Ensure compatibility with screen readers
6. Document keyboard navigation for developers and end users

## Implementation Components

### 1. Keyboard Navigation Manager

Create a reusable hook or component to handle keyboard navigation:

```tsx
// src/hooks/useChartKeyboardNavigation.ts

import { useEffect, useState, useRef, useCallback } from 'react';
import { ChartConfiguration, ChartType } from 'chart.js';

interface KeyboardNavigationOptions {
  chartRef: React.RefObject<HTMLCanvasElement>;
  chartConfig: ChartConfiguration;
  onDataPointFocus?: (datasetIndex: number, dataIndex: number) => void;
  onDataPointSelect?: (datasetIndex: number, dataIndex: number) => void;
  enableArrowKeys?: boolean;
  enableTabNavigation?: boolean;
  announceChanges?: boolean;
}

export const useChartKeyboardNavigation = ({
  chartRef,
  chartConfig,
  onDataPointFocus,
  onDataPointSelect,
  enableArrowKeys = true,
  enableTabNavigation = true,
  announceChanges = true
}: KeyboardNavigationOptions) => {
  // Track current focus position
  const [focusedDataset, setFocusedDataset] = useState<number>(0);
  const [focusedDataPoint, setFocusedDataPoint] = useState<number>(0);
  
  // Create a ref for the announcement text
  const announcementRef = useRef<string>('');
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const datasets = chartConfig.data.datasets;
    const dataLength = datasets[focusedDataset]?.data?.length || 0;
    
    switch (event.key) {
      case 'ArrowRight':
        // Move to next data point
        if (focusedDataPoint < dataLength - 1) {
          setFocusedDataPoint(prev => prev + 1);
          event.preventDefault();
        }
        break;
        
      case 'ArrowLeft':
        // Move to previous data point
        if (focusedDataPoint > 0) {
          setFocusedDataPoint(prev => prev - 1);
          event.preventDefault();
        }
        break;
        
      case 'ArrowUp':
        // Move to previous dataset
        if (focusedDataset > 0) {
          setFocusedDataset(prev => prev - 1);
          event.preventDefault();
        }
        break;
        
      case 'ArrowDown':
        // Move to next dataset
        if (focusedDataset < datasets.length - 1) {
          setFocusedDataset(prev => prev + 1);
          event.preventDefault();
        }
        break;
        
      case 'Enter':
      case ' ':
        // Activate current data point
        if (onDataPointSelect) {
          onDataPointSelect(focusedDataset, focusedDataPoint);
          event.preventDefault();
        }
        break;
        
      case 'Home':
        // Move to first data point
        setFocusedDataPoint(0);
        event.preventDefault();
        break;
        
      case 'End':
        // Move to last data point
        setFocusedDataPoint(dataLength - 1);
        event.preventDefault();
        break;
    }
  }, [chartConfig, focusedDataset, focusedDataPoint, onDataPointSelect]);
  
  // Set up event listeners
  useEffect(() => {
    if (enableArrowKeys && chartRef.current) {
      // Add event listener to chart element
      chartRef.current.addEventListener('keydown', handleKeyDown);
      
      // Make the chart focusable
      chartRef.current.setAttribute('tabindex', '0');
      
      return () => {
        if (chartRef.current) {
          chartRef.current.removeEventListener('keydown', handleKeyDown);
        }
      };
    }
  }, [enableArrowKeys, chartRef, handleKeyDown]);
  
  // Update announcement for screen readers
  useEffect(() => {
    if (announceChanges) {
      const datasets = chartConfig.data.datasets;
      const labels = chartConfig.data.labels;
      
      if (
        datasets && 
        datasets[focusedDataset] && 
        datasets[focusedDataset].data && 
        datasets[focusedDataset].data[focusedDataPoint] !== undefined
      ) {
        const datasetLabel = datasets[focusedDataset].label || `Dataset ${focusedDataset + 1}`;
        const dataLabel = Array.isArray(labels) ? labels[focusedDataPoint] : `Point ${focusedDataPoint + 1}`;
        const dataValue = datasets[focusedDataset].data[focusedDataPoint];
        
        announcementRef.current = `${datasetLabel}, ${dataLabel}: ${dataValue}`;
        
        // Call the focus callback if provided
        if (onDataPointFocus) {
          onDataPointFocus(focusedDataset, focusedDataPoint);
        }
      }
    }
  }, [focusedDataset, focusedDataPoint, chartConfig, announceChanges, onDataPointFocus]);
  
  // Return the current state and announcement text
  return {
    focusedDataset,
    focusedDataPoint,
    setFocusedDataset,
    setFocusedDataPoint,
    announcementText: announcementRef.current
  };
};
```

### 2. Chart Type-Specific Navigation Logic

Implement specific keyboard navigation logic for different chart types:

```tsx
// src/utils/accessibility/chartKeyboardNavigation.ts

import { ChartType } from 'chart.js';

// Configure keyboard navigation based on chart type
export const getChartKeyboardConfig = (chartType: ChartType) => {
  switch (chartType) {
    case 'pie':
    case 'doughnut':
      return {
        arrowNavigation: {
          // For circular charts, ArrowRight/Left navigates between segments
          ArrowRight: 'nextSegment',
          ArrowLeft: 'prevSegment',
          // ArrowUp/Down can move between concentric rings in doughnut charts
          ArrowUp: 'outerRing',
          ArrowDown: 'innerRing'
        },
        shortcuts: {
          'h': 'highlightSegment',
          'l': 'showLegend',
          'p': 'showPercentage'
        }
      };
      
    case 'bar':
    case 'line':
      return {
        arrowNavigation: {
          // For cartesian charts, ArrowRight/Left navigates X axis
          ArrowRight: 'nextPoint',
          ArrowLeft: 'prevPoint',
          // ArrowUp/Down navigates between data series
          ArrowUp: 'prevDataset',
          ArrowDown: 'nextDataset'
        },
        shortcuts: {
          'g': 'showGrid',
          'z': 'toggleZoom',
          'd': 'showDataLabels'
        }
      };
      
    case 'radar':
      return {
        arrowNavigation: {
          // For radar charts, rotation navigation
          ArrowRight: 'clockwise',
          ArrowLeft: 'counterClockwise',
          // ArrowUp/Down navigates between rings
          ArrowUp: 'outerRing',
          ArrowDown: 'innerRing'
        },
        shortcuts: {
          'a': 'showAllAxes',
          'v': 'showValues'
        }
      };
      
    case 'scatter':
      return {
        arrowNavigation: {
          // For scatter charts, move in four directions
          ArrowRight: 'pointEast',
          ArrowLeft: 'pointWest',
          ArrowUp: 'pointNorth',
          ArrowDown: 'pointSouth'
        },
        shortcuts: {
          'q': 'quadrantFilter',
          'f': 'findNearest'
        }
      };
      
    default:
      return {
        arrowNavigation: {
          ArrowRight: 'next',
          ArrowLeft: 'prev',
          ArrowUp: 'up',
          ArrowDown: 'down'
        },
        shortcuts: {
          'h': 'help'
        }
      };
  }
};
```

### 3. Visual Focus Indicators

Implement visual indicators to show keyboard focus on chart elements:

```tsx
// src/utils/accessibility/chartFocusIndicators.ts

import { Chart, ChartType } from 'chart.js';

export const highlightFocusedElement = (
  chart: Chart,
  datasetIndex: number,
  dataIndex: number,
  chartType: ChartType
) => {
  // Clear any existing highlights
  chart.data.datasets.forEach((dataset, index) => {
    if (dataset.backgroundColor && Array.isArray(dataset.backgroundColor)) {
      // Reset all colors to original
      // This would need to store original colors somewhere
    }
    
    // Reset borders
    if (dataset.borderWidth && Array.isArray(dataset.borderWidth)) {
      // Reset all border widths
    }
  });
  
  // Apply highlight to focused element
  if (chart.data.datasets[datasetIndex]) {
    const dataset = chart.data.datasets[datasetIndex];
    
    // Highlight strategies depend on chart type
    switch (chartType) {
      case 'bar':
        // Highlight specific bar
        if (Array.isArray(dataset.borderWidth)) {
          dataset.borderWidth[dataIndex] = 3; // Increase border width
        } else {
          const borderWidths = new Array(dataset.data.length).fill(1);
          borderWidths[dataIndex] = 3;
          dataset.borderWidth = borderWidths;
        }
        break;
        
      case 'line':
        // Highlight specific point
        if (dataset.pointBorderWidth) {
          if (Array.isArray(dataset.pointBorderWidth)) {
            dataset.pointBorderWidth[dataIndex] = 3;
          } else {
            const pointBorderWidths = new Array(dataset.data.length).fill(1);
            pointBorderWidths[dataIndex] = 3;
            dataset.pointBorderWidth = pointBorderWidths;
          }
        }
        
        if (dataset.pointRadius) {
          if (Array.isArray(dataset.pointRadius)) {
            dataset.pointRadius[dataIndex] *= 1.5; // Increase point size
          } else {
            const pointRadii = new Array(dataset.data.length).fill(dataset.pointRadius);
            pointRadii[dataIndex] *= 1.5;
            dataset.pointRadius = pointRadii;
          }
        }
        break;
        
      case 'pie':
      case 'doughnut':
        // Highlight specific segment
        if (Array.isArray(dataset.offset)) {
          dataset.offset[dataIndex] = 10; // Offset the segment
        } else {
          const offsets = new Array(dataset.data.length).fill(0);
          offsets[dataIndex] = 10;
          dataset.offset = offsets;
        }
        break;
    }
  }
  
  // Update the chart
  chart.update();
};
```

### 4. Keyboard Shortcut Overlay

Create a component to display available keyboard shortcuts:

```tsx
// src/components/UI/KeyboardShortcutHelp.tsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import { ChartType } from 'chart.js';
import { getChartKeyboardConfig } from '../../utils/accessibility/chartKeyboardNavigation';

interface KeyboardShortcutHelpProps {
  chartType: ChartType;
  open: boolean;
  onClose: () => void;
}

const KeyboardShortcutHelp: React.FC<KeyboardShortcutHelpProps> = ({
  chartType,
  open,
  onClose
}) => {
  const [shortcuts, setShortcuts] = useState<Record<string, string>>({});
  const [navigation, setNavigation] = useState<Record<string, string>>({});
  
  // Load shortcuts based on chart type
  useEffect(() => {
    const config = getChartKeyboardConfig(chartType);
    setShortcuts(config.shortcuts);
    setNavigation(config.arrowNavigation);
  }, [chartType]);
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="keyboard-help-title"
      maxWidth="md"
    >
      <DialogTitle id="keyboard-help-title">
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <KeyboardIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="span">
              Keyboard Shortcuts for {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Charts
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={onClose}
            edge="end"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom>
            Navigation Keys
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(navigation).map(([key, action]) => (
              <Grid item key={key}>
                <Chip
                  label={`${key}: ${action}`}
                  variant="outlined"
                  sx={{ 
                    '& .MuiChip-label': { 
                      display: 'flex',
                      alignItems: 'center'
                    }
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
        
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Shortcut Keys
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(shortcuts).map(([key, action]) => (
              <Grid item key={key}>
                <Chip
                  label={`${key}: ${action}`}
                  variant="outlined"
                  sx={{ 
                    '& .MuiChip-label': { 
                      display: 'flex', 
                      alignItems: 'center'
                    }
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
        
        <Box mt={3}>
          <Typography variant="subtitle1" gutterBottom>
            General Shortcuts
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Chip label="TAB: Move to chart" variant="outlined" />
            </Grid>
            <Grid item>
              <Chip label="ENTER/SPACE: Select data point" variant="outlined" />
            </Grid>
            <Grid item>
              <Chip label="ESC: Close popups" variant="outlined" />
            </Grid>
            <Grid item>
              <Chip label="?: Show/hide this help" variant="outlined" />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutHelp;
```

### 5. Enhanced AccessibleChartRenderer

Update the AccessibleChartRenderer component to include keyboard navigation:

```tsx
// Additions to AccessibleChartRenderer.tsx

// Import keyboard navigation hook
import { useChartKeyboardNavigation } from '../../hooks/useChartKeyboardNavigation';
import { highlightFocusedElement } from '../../utils/accessibility/chartFocusIndicators';
import KeyboardShortcutHelp from '../UI/KeyboardShortcutHelp';

// Add to component props
interface AccessibleChartRendererProps {
  // ...existing props
  enableKeyboardNavigation?: boolean;
}

// Inside component
const AccessibleChartRenderer: React.FC<AccessibleChartRendererProps> = ({
  // ...existing props
  enableKeyboardNavigation = true
}) => {
  // Add refs and state
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [helpDialogOpen, setHelpDialogOpen] = useState<boolean>(false);
  const [announcement, setAnnouncement] = useState<string>('');
  
  // Initialize keyboard navigation
  const {
    focusedDataset,
    focusedDataPoint,
    announcementText
  } = useChartKeyboardNavigation({
    chartRef,
    chartConfig: configuration,
    onDataPointFocus: (datasetIndex, dataIndex) => {
      // Update focus visuals if chart instance is available
      if (chartInstanceRef.current) {
        highlightFocusedElement(
          chartInstanceRef.current,
          datasetIndex,
          dataIndex,
          configuration.type
        );
      }
    },
    onDataPointSelect: (datasetIndex, dataIndex) => {
      // Handle data point selection (e.g., show details)
      const dataset = configuration.data.datasets[datasetIndex];
      const label = dataset.label || `Dataset ${datasetIndex + 1}`;
      const dataLabel = Array.isArray(configuration.data.labels) 
        ? configuration.data.labels[dataIndex] 
        : `Point ${dataIndex + 1}`;
      const value = dataset.data[dataIndex];
      
      setAnnouncement(`Selected ${label} at ${dataLabel}: ${value}`);
    },
    enableArrowKeys: enableKeyboardNavigation
  });
  
  // Add keyboard shortcut for help dialog
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '?' || (event.key === '/' && event.shiftKey)) {
        setHelpDialogOpen(prev => !prev);
        event.preventDefault();
      }
    };
    
    if (enableKeyboardNavigation && chartRef.current) {
      chartRef.current.addEventListener('keydown', handleKeyDown);
      
      return () => {
        if (chartRef.current) {
          chartRef.current.removeEventListener('keydown', handleKeyDown);
        }
      };
    }
  }, [enableKeyboardNavigation]);
  
  // Update announcement for screen readers
  useEffect(() => {
    if (announcementText) {
      setAnnouncement(announcementText);
    }
  }, [announcementText]);
  
  // Include in render
  return (
    <>
      <div className="accessible-chart-container" style={{ height, position: 'relative' }}>
        <canvas
          ref={chartRef}
          role="img"
          aria-label={`${configuration.options?.plugins?.title?.text || 'Chart'}`}
          tabIndex={0} // Make focusable
          // Other attributes
        />
        
        {/* Announcement for screen readers */}
        <div 
          aria-live="polite" 
          className="visually-hidden"
        >
          {announcement}
        </div>
      </div>
      
      {/* Keyboard shortcut help dialog */}
      <KeyboardShortcutHelp
        chartType={configuration.type}
        open={helpDialogOpen}
        onClose={() => setHelpDialogOpen(false)}
      />
    </>
  );
};
```

### 6. Focus Management System

Create a focus management system for complex chart interactions:

```tsx
// src/utils/accessibility/focusManagement.ts

import { FocusEvent } from 'react';

interface FocusPosition {
  element: string;
  index: number;
  subIndex?: number;
}

class ChartFocusManager {
  private lastFocus: FocusPosition | null = null;
  private elements: Record<string, HTMLElement[]> = {};
  
  // Register focusable elements
  public registerElements(name: string, elements: HTMLElement[]) {
    this.elements[name] = elements;
  }
  
  // Save current focus position
  public saveFocus(element: string, index: number, subIndex?: number) {
    this.lastFocus = { element, index, subIndex };
  }
  
  // Restore focus to last position
  public restoreFocus() {
    if (this.lastFocus && this.elements[this.lastFocus.element]) {
      const elements = this.elements[this.lastFocus.element];
      if (elements[this.lastFocus.index]) {
        elements[this.lastFocus.index].focus();
        return true;
      }
    }
    return false;
  }
  
  // Move focus to a specific element
  public moveFocus(element: string, index: number, subIndex?: number) {
    if (this.elements[element] && this.elements[element][index]) {
      this.elements[element][index].focus();
      this.saveFocus(element, index, subIndex);
      return true;
    }
    return false;
  }
  
  // Handle focus leaving a component
  public handleFocusOut(event: FocusEvent, containerRef: React.RefObject<HTMLElement>) {
    if (
      containerRef.current && 
      !containerRef.current.contains(event.relatedTarget as Node)
    ) {
      // Focus is leaving the component
      // Save current position for future restoration
      return true;
    }
    return false;
  }
  
  // Clear saved focus
  public clearFocus() {
    this.lastFocus = null;
  }
}

// Export a singleton instance
export const chartFocusManager = new ChartFocusManager();
```

## Testing Plan

1. **Unit Tests**:
   - Test keyboard navigation hook with different chart configurations
   - Test focus indicators for different chart types
   - Test keyboard shortcut processing

2. **Integration Tests**:
   - Test keyboard navigation within chart components
   - Test focus management across component boundaries
   - Test screen reader announcements

3. **Browser/Screen Reader Compatibility**:
   - Test in Chrome, Firefox, Safari, and Edge
   - Test with NVDA, JAWS, and VoiceOver
   - Test with different keyboard layouts

## Implementation Timeline

1. Week 1: Implement keyboard navigation hook and chart-specific navigation logic
2. Week 2: Implement visual focus indicators and keyboard shortcut help
3. Week 3: Update AccessibleChartRenderer and integrate focus management
4. Week 4: Testing and refinement

## Success Criteria

1. Users can navigate all chart types using only keyboard controls
2. Focus indicators are clearly visible and follow accessibility guidelines
3. Screen readers announce focused elements and changes accurately
4. Keyboard shortcuts are consistently implemented across chart types
5. Documentation is complete and user-friendly 