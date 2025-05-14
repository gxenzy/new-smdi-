import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Popover,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Divider,
  Stack,
  Button,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Refresh as ResetIcon,
  Check as ApplyIcon,
  Close as CancelIcon,
  Save as SaveIcon,
  Bookmark as BookmarkIcon
} from '@mui/icons-material';
import { ChartData } from 'chart.js';

/**
 * Filter preset - a saved configuration of filter settings
 */
interface FilterPreset {
  id: string;
  name: string;
  datasetFilters: Record<string, boolean>;
  dateRange?: [Date, Date];
  valueRange?: [number, number];
  customFilters?: Record<string, any>;
}

/**
 * Props for ChartFilterControls component
 */
export interface ChartFilterControlsProps {
  /** The chart data that will be filtered */
  chartData: ChartData;
  
  /** Position of the filter icon */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  
  /** Show controls for filtering datasets */
  enableDatasetFilters?: boolean;
  
  /** Show controls for filtering date range */
  enableDateRange?: boolean;
  
  /** Show controls for filtering value range */
  enableValueRange?: boolean;
  
  /** Min and max values for value range slider */
  valueRangeBounds?: [number, number];
  
  /** Labels for the value range slider */
  valueRangeLabels?: { min: string; max: string; unit: string };
  
  /** Min and max dates for date range */
  dateRangeBounds?: [Date, Date];
  
  /** Custom filter components to include */
  customFilterComponents?: React.ReactNode;
  
  /** Saved filter presets the user can apply */
  filterPresets?: FilterPreset[];
  
  /** Whether the filter panel is initially open */
  initiallyOpen?: boolean;
  
  /** Callback when filters are applied */
  onFiltersApplied: (filteredData: ChartData) => void;
  
  /** Callback when filters are saved as a preset */
  onSavePreset?: (preset: Omit<FilterPreset, 'id'>) => void;
}

/**
 * Current state of all filters
 */
interface FilterState {
  datasetFilters: Record<string, boolean>;
  dateRange?: [Date, Date];
  valueRange?: [number, number];
  customFilters?: Record<string, any>;
}

/**
 * ChartFilterControls - A reusable component that adds filtering capabilities to charts
 */
const ChartFilterControls: React.FC<ChartFilterControlsProps> = ({
  chartData,
  position = 'top-right',
  enableDatasetFilters = true,
  enableDateRange = false,
  enableValueRange = false,
  valueRangeBounds = [0, 100],
  valueRangeLabels = { min: 'Min', max: 'Max', unit: '' },
  dateRangeBounds,
  customFilterComponents,
  filterPresets = [],
  initiallyOpen = false,
  onFiltersApplied,
  onSavePreset
}) => {
  const theme = useTheme();
  
  // Anchor element for the popover
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  
  // Track which datasets are visible
  const [datasetVisibility, setDatasetVisibility] = useState<Record<string, boolean>>({});
  
  // Track value range selection
  const [valueRange, setValueRange] = useState<[number, number]>(valueRangeBounds);
  
  // Track if filters have been changed and not applied
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState<boolean>(false);
  
  // Track if the filter icon should be highlighted
  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  
  // Initialize dataset visibility
  useEffect(() => {
    if (!chartData || !chartData.datasets) return;
    
    const initialVisibility: Record<string, boolean> = {};
    chartData.datasets.forEach((dataset, index) => {
      initialVisibility[dataset.label || `Dataset ${index + 1}`] = true;
    });
    
    setDatasetVisibility(initialVisibility);
    setValueRange(valueRangeBounds);
  }, [chartData, valueRangeBounds]);
  
  // Handle opening the filter popover
  const handleOpenFilters = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle closing the filter popover
  const handleCloseFilters = () => {
    setAnchorEl(null);
  };
  
  // Handle toggling a dataset's visibility
  const handleDatasetToggle = (datasetLabel: string) => {
    setDatasetVisibility(prev => {
      const newVisibility = { ...prev, [datasetLabel]: !prev[datasetLabel] };
      setHasUnappliedChanges(true);
      return newVisibility;
    });
  };
  
  // Handle changing the value range
  const handleValueRangeChange = (event: Event, newValue: number | number[]) => {
    setValueRange(newValue as [number, number]);
    setHasUnappliedChanges(true);
  };
  
  // Handle applying the filters
  const handleApplyFilters = () => {
    // Create a filtered copy of the chart data
    const filteredData = filterChartData();
    
    // Pass the filtered data back to the parent component
    onFiltersApplied(filteredData);
    
    // Update UI state
    setHasUnappliedChanges(false);
    setIsFiltered(isAnyFilterApplied());
    
    // Close the popover
    handleCloseFilters();
  };
  
  // Handle resetting all filters
  const handleResetFilters = () => {
    // Reset dataset visibility to show all datasets
    const resetVisibility: Record<string, boolean> = {};
    chartData.datasets.forEach((dataset, index) => {
      resetVisibility[dataset.label || `Dataset ${index + 1}`] = true;
    });
    
    // Reset to initial state
    setDatasetVisibility(resetVisibility);
    setValueRange(valueRangeBounds);
    setHasUnappliedChanges(true);
  };
  
  // Handle applying a preset
  const handleApplyPreset = (preset: FilterPreset) => {
    // Apply dataset filters
    setDatasetVisibility(preset.datasetFilters);
    
    // Apply value range if present
    if (preset.valueRange) {
      setValueRange(preset.valueRange);
    }
    
    // Mark that changes need to be applied
    setHasUnappliedChanges(true);
  };
  
  // Handle saving the current filters as a preset
  const handleSavePreset = () => {
    if (!onSavePreset) return;
    
    // Create a preset from the current filter state
    const preset = {
      name: `Preset ${filterPresets.length + 1}`,
      datasetFilters: { ...datasetVisibility },
      valueRange: enableValueRange ? valueRange : undefined
    };
    
    // Call the onSavePreset callback
    onSavePreset(preset);
  };
  
  // Filter the chart data based on the current filters
  const filterChartData = (): ChartData => {
    // Create a deep copy of the chart data
    const filteredData: ChartData = JSON.parse(JSON.stringify(chartData));
    
    // Filter datasets based on visibility
    filteredData.datasets = filteredData.datasets.filter((dataset, index) => {
      const label = dataset.label || `Dataset ${index + 1}`;
      return datasetVisibility[label] !== false; // Keep if not explicitly hidden
    });
    
    // Apply value range filtering if enabled
    if (enableValueRange) {
      // This implementation would depend on the specific chart structure
      // For example, filtering bar chart values to be within the value range
      filteredData.datasets.forEach(dataset => {
        if (Array.isArray(dataset.data)) {
          // Filter or modify data points based on value range
          // This is a simplified example - actual implementation depends on chart type
          dataset.data = dataset.data.map(value => {
            // If numeric value is outside range, set to null or modify as needed
            if (typeof value === 'number' && (value < valueRange[0] || value > valueRange[1])) {
              return null; // Or could set to min/max value instead
            }
            return value;
          });
        }
      });
    }
    
    return filteredData;
  };
  
  // Check if any filters are currently applied
  const isAnyFilterApplied = (): boolean => {
    // Check if any datasets are hidden
    const anyDatasetsHidden = Object.values(datasetVisibility).some(visible => !visible);
    
    // Check if value range is different from bounds
    const valueRangeChanged = 
      enableValueRange && 
      (valueRange[0] !== valueRangeBounds[0] || valueRange[1] !== valueRangeBounds[1]);
    
    return anyDatasetsHidden || valueRangeChanged;
  };
  
  // Get styles based on position setting
  const getPositionStyles = () => {
    const commonStyles = {
      position: 'absolute',
      zIndex: 10,
    };
    
    switch (position) {
      case 'top-right':
        return {
          ...commonStyles,
          top: 8,
          right: 8,
        };
      case 'top-left':
        return {
          ...commonStyles,
          top: 8,
          left: 8,
        };
      case 'bottom-right':
        return {
          ...commonStyles,
          bottom: 8,
          right: 8,
        };
      case 'bottom-left':
        return {
          ...commonStyles,
          bottom: 8,
          left: 8,
        };
      default:
        return {
          ...commonStyles,
          top: 8,
          right: 8,
        };
    }
  };
  
  const open = Boolean(anchorEl);
  const id = open ? 'chart-filter-popover' : undefined;
  
  return (
    <>
      {/* Filter button */}
      <Box sx={getPositionStyles()}>
        <Tooltip title="Filter data">
          <IconButton
            aria-describedby={id}
            onClick={handleOpenFilters}
            size="small"
            sx={{
              bgcolor: isFiltered 
                ? alpha(theme.palette.primary.main, 0.2) 
                : theme.palette.background.paper,
              border: `1px solid ${
                isFiltered 
                  ? theme.palette.primary.main 
                  : theme.palette.divider
              }`,
              '&:hover': {
                bgcolor: isFiltered 
                  ? alpha(theme.palette.primary.main, 0.3) 
                  : alpha(theme.palette.background.paper, 0.8),
              },
            }}
          >
            <FilterIcon 
              color={isFiltered ? "primary" : "action"} 
              fontSize="small" 
            />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Filter popover */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseFilters}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              width: 320,
              p: 2,
              overflow: 'visible',
            }
          }
        }}
      >
        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon fontSize="small" />
          Chart Filters
        </Typography>
        
        {/* Dataset visibility section */}
        {enableDatasetFilters && chartData.datasets && chartData.datasets.length > 0 && (
          <Box sx={{ mt:
            2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Visible Datasets
            </Typography>
            <FormGroup>
              {chartData.datasets.map((dataset, index) => {
                const label = dataset.label || `Dataset ${index + 1}`;
                const color = typeof dataset.backgroundColor === 'string' 
                  ? dataset.backgroundColor 
                  : Array.isArray(dataset.backgroundColor) && typeof dataset.backgroundColor[0] === 'string'
                    ? dataset.backgroundColor[0]
                    : theme.palette.primary.main;
                
                return (
                  <FormControlLabel
                    key={label}
                    control={
                      <Checkbox 
                        checked={datasetVisibility[label] !== false}
                        onChange={() => handleDatasetToggle(label)}
                        sx={{
                          color,
                          '&.Mui-checked': {
                            color,
                          },
                        }}
                      />
                    }
                    label={label}
                  />
                );
              })}
            </FormGroup>
          </Box>
        )}
        
        {/* Value range slider */}
        {enableValueRange && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {valueRangeLabels.min} - {valueRangeLabels.max} {valueRangeLabels.unit}
            </Typography>
            <Box sx={{ px: 1 }}>
              <Slider
                value={valueRange}
                onChange={handleValueRangeChange}
                valueLabelDisplay="auto"
                min={valueRangeBounds[0]}
                max={valueRangeBounds[1]}
                marks={[
                  { value: valueRangeBounds[0], label: `${valueRangeBounds[0]}${valueRangeLabels.unit}` },
                  { value: valueRangeBounds[1], label: `${valueRangeBounds[1]}${valueRangeLabels.unit}` },
                ]}
              />
            </Box>
          </Box>
        )}
        
        {/* Custom filter components */}
        {customFilterComponents && (
          <Box sx={{ mt: 2 }}>
            {customFilterComponents}
          </Box>
        )}
        
        {/* Presets section */}
        {filterPresets.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Saved Presets
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {filterPresets.map((preset) => (
                <Button
                  key={preset.id}
                  size="small"
                  variant="outlined"
                  startIcon={<BookmarkIcon />}
                  onClick={() => handleApplyPreset(preset)}
                >
                  {preset.name}
                </Button>
              ))}
            </Stack>
          </Box>
        )}
        
        {/* Action buttons */}
        <Stack direction="row" spacing={1} sx={{ mt: 3, justifyContent: 'flex-end' }}>
          {/* Save preset button (if supported) */}
          {onSavePreset && (
            <Tooltip title="Save as preset">
              <Button 
                startIcon={<SaveIcon />} 
                size="small" 
                onClick={handleSavePreset}
                variant="outlined"
              >
                Save
              </Button>
            </Tooltip>
          )}
          
          {/* Reset button */}
          <Tooltip title="Reset filters">
            <Button 
              startIcon={<ResetIcon />} 
              size="small" 
              onClick={handleResetFilters}
              variant="outlined"
              color="secondary"
            >
              Reset
            </Button>
          </Tooltip>
          
          {/* Apply button */}
          <Button 
            startIcon={<ApplyIcon />} 
            size="small" 
            onClick={handleApplyFilters}
            variant="contained"
            color="primary"
            disabled={!hasUnappliedChanges}
          >
            Apply
          </Button>
        </Stack>
      </Popover>
    </>
  );
};

export default ChartFilterControls; 