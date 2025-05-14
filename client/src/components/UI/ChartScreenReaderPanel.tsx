import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tabs, Tab, Paper, Divider } from '@mui/material';
import { 
  Close as CloseIcon, 
  Keyboard as KeyboardIcon,
  TableChart as TableIcon,
  Description as DescriptionIcon,
  DataObject as DataObjectIcon 
} from '@mui/icons-material';
import { ChartConfiguration } from 'chart.js';
import { 
  generateChartScreenReaderText, 
  createAccessibleDataTable,
  generateChartAnnouncement,
  generateAccessibleDataTableHTML,
  ChartScreenReaderDescription,
  createChartDescription
} from '../../utils/accessibility/chartScreenReaderUtils';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * Panel for a single tab in the screen reader dialog
 */
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`chart-sr-tabpanel-${index}`}
      aria-labelledby={`chart-sr-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2, px: 1 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

/**
 * Props for the ChartScreenReaderPanel component
 */
interface ChartScreenReaderPanelProps {
  chartConfiguration: ChartConfiguration;
  chartRef?: React.RefObject<HTMLCanvasElement>;
  showDataTable?: boolean;
  showDescription?: boolean;
  showKeyboardShortcuts?: boolean;
}

/**
 * Component that provides enhanced screen reader support for charts
 */
const ChartScreenReaderPanel: React.FC<ChartScreenReaderPanelProps> = ({
  chartConfiguration,
  chartRef,
  showDataTable = true,
  showDescription = true,
  showKeyboardShortcuts = true
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [chartDescription, setChartDescription] = useState<ChartScreenReaderDescription | null>(null);
  const dataTableRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);

  // Generate chart description when configuration changes
  useEffect(() => {
    if (chartConfiguration) {
      try {
        const description = createChartDescription(chartConfiguration);
        setChartDescription(description);
      } catch (error) {
        console.error('Error generating chart description:', error);
      }
    }
  }, [chartConfiguration]);

  // Handle keyboard navigation
  useEffect(() => {
    if (chartRef?.current) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.altKey && event.key === 'd') {
          setDialogOpen(true);
          event.preventDefault();
        }
      };

      chartRef.current.addEventListener('keydown', handleKeyDown);
      
      return () => {
        chartRef.current?.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [chartRef]);

  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Open the dialog
  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  // Close the dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Generate the hidden HTML content for screen readers
  const generateHiddenContent = () => {
    if (!chartConfiguration) return null;

    return (
      <div className="sr-only" aria-hidden="true">
        <div id="chart-announcement" aria-live="polite">
          {generateChartAnnouncement(chartConfiguration)}
        </div>
        <div dangerouslySetInnerHTML={{ __html: generateAccessibleDataTableHTML(chartConfiguration) }} />
      </div>
    );
  };

  // Render the data table view
  const renderDataTable = () => {
    if (!chartConfiguration) return null;

    const tableText = createAccessibleDataTable(chartConfiguration);
    const tableRows = tableText.split('\n');

    return (
      <Box ref={dataTableRef} sx={{ pb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Data Table
        </Typography>
        <Paper sx={{ p: 2, overflowX: 'auto' }}>
          <pre style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            {tableText}
          </pre>
        </Paper>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This table provides the raw data used in the chart, arranged in a screen reader-friendly format.
        </Typography>
      </Box>
    );
  };

  // Render the chart description view
  const renderDescription = () => {
    if (!chartDescription) return null;

    const fullDescription = generateChartScreenReaderText(chartConfiguration);

    return (
      <Box ref={descriptionRef} sx={{ pb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Chart Description
        </Typography>
        <Paper sx={{ p: 2 }}>
          <Typography variant="body1" gutterBottom>
            <strong>{chartDescription.title}</strong>
          </Typography>
          <Typography variant="body1" paragraph>
            {chartDescription.summary}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          {chartDescription.datasetDescriptions.map((dataset, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography variant="subtitle1">
                {dataset.label}
              </Typography>
              <Typography variant="body2" sx={{ ml: 2 }}>
                • Range: {dataset.min} to {dataset.max}
              </Typography>
              <Typography variant="body2" sx={{ ml: 2 }}>
                • Average: {dataset.average.toFixed(1)}
              </Typography>
              {dataset.trend && (
                <Typography variant="body2" sx={{ ml: 2 }}>
                  • Trend: {dataset.trend.description}
                </Typography>
              )}
              {dataset.keyPoints.length > 0 && (
                <Typography variant="body2" sx={{ ml: 2 }}>
                  • Key points: {dataset.keyPoints.map(p => p.description).join('; ')}
                </Typography>
              )}
            </Box>
          ))}
          
          {chartDescription.comparisonStatements.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Comparisons
              </Typography>
              <ul>
                {chartDescription.comparisonStatements.map((statement, index) => (
                  <li key={index}>
                    <Typography variant="body2">{statement}</Typography>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Paper>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This description provides a detailed analysis of the chart data, including trends, key points, and comparisons.
        </Typography>
      </Box>
    );
  };

  // Render keyboard shortcuts help
  const renderKeyboardShortcuts = () => {
    return (
      <Box sx={{ pb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Keyboard Navigation
        </Typography>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Chart Navigation Shortcuts
          </Typography>
          <Box component="dl" sx={{ ml: 2 }}>
            <Typography component="dt" variant="body2" fontWeight="bold">Alt + D</Typography>
            <Typography component="dd" variant="body2" sx={{ ml: 2, mb: 1 }}>Open this accessibility dialog</Typography>
            
            <Typography component="dt" variant="body2" fontWeight="bold">Tab</Typography>
            <Typography component="dd" variant="body2" sx={{ ml: 2, mb: 1 }}>Move to next interactive element</Typography>
            
            <Typography component="dt" variant="body2" fontWeight="bold">Shift + Tab</Typography>
            <Typography component="dd" variant="body2" sx={{ ml: 2, mb: 1 }}>Move to previous interactive element</Typography>
            
            <Typography component="dt" variant="body2" fontWeight="bold">Enter or Space</Typography>
            <Typography component="dd" variant="body2" sx={{ ml: 2, mb: 1 }}>Activate button or control</Typography>
            
            <Typography component="dt" variant="body2" fontWeight="bold">Arrow Keys</Typography>
            <Typography component="dd" variant="body2" sx={{ ml: 2, mb: 1 }}>Navigate between data points when chart is focused</Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Screen Reader Tips
          </Typography>
          <ul>
            <li>
              <Typography variant="body2">
                Press Alt+D to access detailed chart information and data tables
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Use table navigation commands in your screen reader to explore the data table
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                All charts include hidden data tables that are readable by screen readers
              </Typography>
            </li>
          </ul>
        </Paper>
      </Box>
    );
  };

  return (
    <>
      {/* Hidden content for screen readers */}
      {generateHiddenContent()}
      
      {/* Accessibility button */}
      <Button
        variant="outlined"
        size="small"
        startIcon={<DescriptionIcon />}
        onClick={handleOpenDialog}
        aria-label="Open chart accessibility options"
        sx={{ mt: 1 }}
      >
        Chart Accessibility
      </Button>
      
      {/* Dialog with accessible information */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="chart-accessibility-dialog-title"
        fullWidth
        maxWidth="md"
      >
        <DialogTitle id="chart-accessibility-dialog-title">
          Chart Accessibility
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="chart accessibility tabs"
          variant="fullWidth"
        >
          {showDescription && (
            <Tab 
              icon={<DescriptionIcon />} 
              label="Description" 
              id="chart-sr-tab-0"
              aria-controls="chart-sr-tabpanel-0"
            />
          )}
          {showDataTable && (
            <Tab 
              icon={<TableIcon />} 
              label="Data Table" 
              id="chart-sr-tab-1"
              aria-controls="chart-sr-tabpanel-1"
            />
          )}
          {showKeyboardShortcuts && (
            <Tab 
              icon={<KeyboardIcon />} 
              label="Keyboard Shortcuts" 
              id="chart-sr-tab-2"
              aria-controls="chart-sr-tabpanel-2"
            />
          )}
        </Tabs>
        
        <DialogContent dividers>
          {showDescription && (
            <TabPanel value={tabValue} index={0}>
              {renderDescription()}
            </TabPanel>
          )}
          
          {showDataTable && (
            <TabPanel value={tabValue} index={showDescription ? 1 : 0}>
              {renderDataTable()}
            </TabPanel>
          )}
          
          {showKeyboardShortcuts && (
            <TabPanel value={tabValue} index={(showDescription ? 1 : 0) + (showDataTable ? 1 : 0)}>
              {renderKeyboardShortcuts()}
            </TabPanel>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChartScreenReaderPanel; 