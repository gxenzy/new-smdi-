import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Checkbox,
  IconButton,
  Switch,
  FormControlLabel,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Description as DocumentIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  DragIndicator as DragIcon,
  BarChart as ChartIcon,
  Image as ImageIcon,
  Subject as TextIcon,
  TableChart as TableIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import ChartReportIntegration from '../../../../utils/reportGenerator/ChartReportIntegration';
import { InteractiveChart } from '../../../../utils/reportGenerator';

// Define interfaces for report components
interface ReportComponent {
  id: string;
  type: 'header' | 'text' | 'chart' | 'table' | 'image' | 'findings';
  title: string;
  content: any;
  settings: any;
}

interface Report {
  id: string;
  title: string;
  author: string;
  date: string;
  clientName: string;
  facilityName: string;
  components: ReportComponent[];
  coverImage?: string;
  includeExecutiveSummary: boolean;
  includeAppendices: boolean;
}

// Sample data
const mockReportTemplates = [
  { id: '1', name: 'Standard Energy Audit Report', description: 'Complete audit report with executive summary, findings, and recommendations' },
  { id: '2', name: 'Executive Summary Only', description: 'Condensed report focusing on key findings and ROI' },
  { id: '3', name: 'Technical Report', description: 'Detailed technical report with comprehensive data analysis' },
  { id: '4', name: 'ASHRAE Level 2 Audit', description: 'Report format following ASHRAE Level 2 energy audit guidelines' }
];

const mockCharts = [
  { id: 'c1', title: 'Energy Consumption by System', type: 'pie' },
  { id: 'c2', title: 'Monthly Energy Usage Trends', type: 'line' },
  { id: 'c3', title: 'Potential Savings by Measure', type: 'bar' },
  { id: 'c4', title: 'ROI Analysis', type: 'bar' }
];

const mockFindings = [
  { id: 'f1', title: 'Inefficient Lighting Systems', category: 'lighting', impact: 'high' },
  { id: 'f2', title: 'HVAC Operating Schedule Optimization', category: 'hvac', impact: 'medium' },
  { id: 'f3', title: 'Building Envelope Air Leakage', category: 'envelope', impact: 'high' },
  { id: 'f4', title: 'Outdated HVAC Controls', category: 'hvac', impact: 'medium' }
];

const ReportBuilder: React.FC = () => {
  // State
  const [reportTitle, setReportTitle] = useState('Energy Audit Report');
  const [clientName, setClientName] = useState('ABC Corporation');
  const [facilityName, setFacilityName] = useState('Main Campus');
  const [selectedTemplate, setSelectedTemplate] = useState('1');
  const [includeExecutiveSummary, setIncludeExecutiveSummary] = useState(true);
  const [includeAppendices, setIncludeAppendices] = useState(true);
  const [reportComponents, setReportComponents] = useState<ReportComponent[]>([
    {
      id: '1',
      type: 'header',
      title: 'Executive Summary',
      content: 'This energy audit identifies opportunities to reduce energy consumption...',
      settings: { level: 1 }
    },
    {
      id: '2',
      type: 'text',
      title: 'Introduction',
      content: 'The audit was conducted to identify energy-saving opportunities...',
      settings: { fontSize: 'normal' }
    },
    {
      id: '3',
      type: 'chart',
      title: 'Energy Usage by System',
      content: 'c1', // Reference to chart id
      settings: { width: 'full', showLegend: true }
    },
    {
      id: '4',
      type: 'findings',
      title: 'Key Findings',
      content: ['f1', 'f2', 'f3'], // Reference to finding ids
      settings: { showImpact: true, showSavings: true }
    }
  ]);
  const [availableCharts, setAvailableCharts] = useState(mockCharts);
  const [availableFindings, setAvailableFindings] = useState(mockFindings);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentlyEditing, setCurrentlyEditing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'components' | 'charts' | 'structure'>('components');

  // Handlers
  const handleAddComponent = (type: ReportComponent['type']) => {
    const newComponent: ReportComponent = {
      id: `new-${Date.now()}`,
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      content: type === 'chart' ? '' : type === 'findings' ? [] : '',
      settings: {}
    };
    
    switch (type) {
      case 'header':
        newComponent.settings = { level: 1 };
        break;
      case 'text':
        newComponent.settings = { fontSize: 'normal' };
        break;
      case 'chart':
        newComponent.settings = { width: 'full', showLegend: true };
        break;
      case 'table':
        newComponent.settings = { includeHeaders: true };
        break;
      case 'image':
        newComponent.settings = { alignment: 'center' };
        break;
      case 'findings':
        newComponent.settings = { showImpact: true, showSavings: true };
        break;
    }
    
    setReportComponents([...reportComponents, newComponent]);
    setCurrentlyEditing(newComponent.id);
  };

  const handleRemoveComponent = (id: string) => {
    setReportComponents(reportComponents.filter(comp => comp.id !== id));
    if (currentlyEditing === id) {
      setCurrentlyEditing(null);
    }
  };

  const handleMoveComponent = (id: string, direction: 'up' | 'down') => {
    const index = reportComponents.findIndex(comp => comp.id === id);
    if (index < 0) return;
    
    const newComponents = [...reportComponents];
    
    if (direction === 'up' && index > 0) {
      [newComponents[index - 1], newComponents[index]] = [newComponents[index], newComponents[index - 1]];
    } else if (direction === 'down' && index < newComponents.length - 1) {
      [newComponents[index], newComponents[index + 1]] = [newComponents[index + 1], newComponents[index]];
    }
    
    setReportComponents(newComponents);
  };

  const handleEditComponent = (id: string, updates: Partial<ReportComponent>) => {
    setReportComponents(reportComponents.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    ));
  };

  const handleLoadTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    // In a real app, this would load predefined components based on the template
    if (templateId === '2') {
      // Executive Summary Only template
      setReportComponents([
        {
          id: '1',
          type: 'header',
          title: 'Executive Summary',
          content: 'This energy audit summary highlights key findings...',
          settings: { level: 1 }
        },
        {
          id: '2',
          type: 'chart',
          title: 'Potential Energy Savings',
          content: 'c3',
          settings: { width: 'full', showLegend: true }
        },
        {
          id: '3',
          type: 'findings',
          title: 'Key Recommendations',
          content: ['f1', 'f3'],
          settings: { showImpact: true, showSavings: true }
        }
      ]);
    }
  };

  const handleGenerateReport = () => {
    // In a real app, this would generate a PDF or other document format
    console.log('Generating report with title:', reportTitle);
    alert('Report has been generated and is ready for download.');
  };

  // New handler for chart integration
  const handleAddChartToReport = (chartConfig: any) => {
    const newComponent: ReportComponent = {
      id: `chart-${Date.now()}`,
      type: 'chart',
      title: chartConfig.title,
      content: chartConfig.id,
      settings: {
        width: chartConfig.settings.width,
        height: chartConfig.settings.height,
        showLegend: chartConfig.settings.showLegend,
        chartConfig: chartConfig.chartConfig // Store the full chart configuration
      }
    };
    
    setReportComponents([...reportComponents, newComponent]);
  };

  // Render component based on type
  const renderComponentPreview = (component: ReportComponent) => {
    switch (component.type) {
      case 'header':
        return (
          <Typography 
            variant={component.settings.level === 1 ? 'h4' : component.settings.level === 2 ? 'h5' : 'h6'}
            sx={{ mb: 2, fontWeight: 'bold' }}
          >
            {component.title}
          </Typography>
        );
      
      case 'text':
        return (
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>{component.title}</Typography>
            <Typography variant="body1">{component.content}</Typography>
          </Box>
        );
      
      case 'chart':
        // Check if we have a full chart config in settings
        if (component.settings.chartConfig) {
          return (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>{component.title}</Typography>
              <Paper sx={{ p: 2, boxShadow: 1 }}>
                <InteractiveChart
                  title=""
                  configuration={component.settings.chartConfig}
                  height={240}
                  showExportOptions={false}
                />
              </Paper>
            </Box>
          );
        }
        // Fall back to previous implementation for backward compatibility
        const chart = availableCharts.find(c => c.id === component.content);
        return (
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>{component.title}</Typography>
            {chart ? (
              <Paper sx={{ p: 2, bgcolor: 'action.hover', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ChartIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                <Typography variant="body2" sx={{ my: 1 }}>{chart.title}</Typography>
                <Chip label={chart.type} size="small" color="primary" sx={{ mt: 1 }} />
              </Paper>
            ) : (
              <Paper sx={{ p: 2, bgcolor: 'action.hover', textAlign: 'center' }}>
                <ChartIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">No chart selected</Typography>
              </Paper>
            )}
          </Box>
        );
      
      case 'findings':
        return (
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>{component.title}</Typography>
            <List>
              {Array.isArray(component.content) && component.content.map(findingId => {
                const finding = availableFindings.find(f => f.id === findingId);
                return finding ? (
                  <ListItem key={finding.id} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>•</ListItemIcon>
                    <ListItemText 
                      primary={finding.title}
                      secondary={component.settings.showImpact ? `Impact: ${finding.impact}` : undefined}
                    />
                  </ListItem>
                ) : null;
              })}
            </List>
          </Box>
        );
      
      case 'image':
        return (
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>{component.title}</Typography>
            <Box sx={{ textAlign: 'center' }}>
              <Paper sx={{ p: 2, display: 'inline-block', bgcolor: 'action.hover' }}>
                <ImageIcon sx={{ fontSize: 80, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">Image Placeholder</Typography>
              </Paper>
            </Box>
          </Box>
        );
      
      case 'table':
        return (
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>{component.title}</Typography>
            <Paper sx={{ p: 2, bgcolor: 'action.hover', textAlign: 'center' }}>
              <TableIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">Table Placeholder</Typography>
            </Paper>
          </Box>
        );
      
      default:
        return <Typography>Unknown component type</Typography>;
    }
  };

  // Component editor based on type
  const renderComponentEditor = (component: ReportComponent) => {
    const baseFields = (
      <>
        <TextField
          fullWidth
          label="Title"
          value={component.title}
          onChange={(e) => handleEditComponent(component.id, { title: e.target.value })}
          margin="normal"
        />
      </>
    );
    
    switch (component.type) {
      case 'header':
        return (
          <>
            {baseFields}
            <FormControl fullWidth margin="normal">
              <InputLabel>Header Level</InputLabel>
              <Select
                value={component.settings.level || 1}
                label="Header Level"
                onChange={(e) => handleEditComponent(component.id, { 
                  settings: { ...component.settings, level: e.target.value } 
                })}
              >
                <MenuItem value={1}>H1 - Main Header</MenuItem>
                <MenuItem value={2}>H2 - Section Header</MenuItem>
                <MenuItem value={3}>H3 - Subsection Header</MenuItem>
              </Select>
            </FormControl>
          </>
        );
      
      case 'text':
        return (
          <>
            {baseFields}
            <TextField
              fullWidth
              label="Content"
              value={component.content}
              onChange={(e) => handleEditComponent(component.id, { content: e.target.value })}
              margin="normal"
              multiline
              rows={4}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Font Size</InputLabel>
              <Select
                value={component.settings.fontSize || 'normal'}
                label="Font Size"
                onChange={(e) => handleEditComponent(component.id, { 
                  settings: { ...component.settings, fontSize: e.target.value } 
                })}
              >
                <MenuItem value="small">Small</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="large">Large</MenuItem>
              </Select>
            </FormControl>
          </>
        );
      
      case 'chart':
        return (
          <>
            {baseFields}
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Chart</InputLabel>
              <Select
                value={component.content || ''}
                label="Select Chart"
                onChange={(e) => handleEditComponent(component.id, { content: e.target.value })}
              >
                {availableCharts.map(chart => (
                  <MenuItem key={chart.id} value={chart.id}>
                    {chart.title} ({chart.type} chart)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={component.settings.showLegend || false}
                  onChange={(e) => handleEditComponent(component.id, { 
                    settings: { ...component.settings, showLegend: e.target.checked } 
                  })}
                />
              }
              label="Show Legend"
            />
          </>
        );
      
      case 'findings':
        return (
          <>
            {baseFields}
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Select Findings to Include</Typography>
            <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
              <List dense>
                {availableFindings.map(finding => {
                  const isSelected = Array.isArray(component.content) && component.content.includes(finding.id);
                  return (
                    <ListItemButton
                      key={finding.id}
                      dense
                      onClick={() => {
                        const currentContent = Array.isArray(component.content) ? [...component.content] : [];
                        if (isSelected) {
                          handleEditComponent(component.id, { 
                            content: currentContent.filter(id => id !== finding.id) 
                          });
                        } else {
                          handleEditComponent(component.id, { 
                            content: [...currentContent, finding.id] 
                          });
                        }
                      }}
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={isSelected}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={finding.title} 
                        secondary={`Category: ${finding.category}, Impact: ${finding.impact}`} 
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            </Paper>
            <FormControlLabel
              control={
                <Switch
                  checked={component.settings.showImpact || false}
                  onChange={(e) => handleEditComponent(component.id, { 
                    settings: { ...component.settings, showImpact: e.target.checked } 
                  })}
                />
              }
              label="Show Impact Level"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={component.settings.showSavings || false}
                  onChange={(e) => handleEditComponent(component.id, { 
                    settings: { ...component.settings, showSavings: e.target.checked } 
                  })}
                />
              }
              label="Show Estimated Savings"
            />
          </>
        );
      
      default:
        return baseFields;
    }
  };

  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Energy Audit Report Generator</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={previewMode ? 'contained' : 'outlined'}
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? 'Edit Mode' : 'Preview Mode'}
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleGenerateReport}
          >
            Generate Report
          </Button>
        </Box>
      </Box>

      {/* Report Settings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Report Settings</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Report Title"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Client Name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Facility Name"
              value={facilityName}
              onChange={(e) => setFacilityName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Report Template</InputLabel>
              <Select
                value={selectedTemplate}
                label="Report Template"
                onChange={(e) => handleLoadTemplate(e.target.value)}
              >
                {mockReportTemplates.map(template => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={includeExecutiveSummary}
                    onChange={(e) => setIncludeExecutiveSummary(e.target.checked)}
                  />
                }
                label="Include Executive Summary"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={includeAppendices}
                    onChange={(e) => setIncludeAppendices(e.target.checked)}
                  />
                }
                label="Include Appendices"
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Report Builder Tabs */}
      <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Button 
          variant={activeTab === 'components' ? 'contained' : 'text'} 
          onClick={() => setActiveTab('components')}
          sx={{ mr: 1 }}
        >
          Report Components
        </Button>
        <Button 
          variant={activeTab === 'charts' ? 'contained' : 'text'} 
          onClick={() => setActiveTab('charts')}
          sx={{ mr: 1 }}
        >
          Add Charts
        </Button>
        <Button 
          variant={activeTab === 'structure' ? 'contained' : 'text'} 
          onClick={() => setActiveTab('structure')}
        >
          Report Structure
        </Button>
      </Box>

      {/* Components Tab */}
      {activeTab === 'components' && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Available Components</Typography>
          <Grid container spacing={1} sx={{ mb: 3 }}>
            <Grid item>
              <Button 
                variant="outlined" 
                onClick={() => handleAddComponent('header')}
                startIcon={<Typography variant="subtitle2">H</Typography>}
              >
                Header
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="outlined" 
                onClick={() => handleAddComponent('text')}
                startIcon={<TextIcon />}
              >
                Text
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="outlined" 
                onClick={() => handleAddComponent('chart')}
                startIcon={<ChartIcon />}
              >
                Chart
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="outlined" 
                onClick={() => handleAddComponent('table')}
                startIcon={<TableIcon />}
              >
                Table
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="outlined" 
                onClick={() => handleAddComponent('image')}
                startIcon={<ImageIcon />}
              >
                Image
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="outlined" 
                onClick={() => handleAddComponent('findings')}
                startIcon={<FileIcon />}
              >
                Findings
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Charts Tab */}
      {activeTab === 'charts' && (
        <Box sx={{ mb: 3 }}>
          <ChartReportIntegration 
            onAddChartToReport={handleAddChartToReport}
            availableCalculatorCharts={[]}
            allowCustomCharts={true}
          />
        </Box>
      )}

      {/* Structure Tab - contains existing component list and editor */}
      {activeTab === 'structure' && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Report Structure</Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Drag and drop components to reorder them in the report.
          </Alert>
          
          {reportComponents.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
              <Typography variant="body1" color="text.secondary">
                No components added yet. Add components to build your report.
              </Typography>
            </Paper>
          ) : null}
        </Box>
      )}

      {/* Main Report Builder Grid */}
      <Grid container spacing={3}>
        {/* Component List - Only show in Structure tab or if no tab is active */}
        {(activeTab === 'structure' || !activeTab) && (
          <Grid item xs={12} md={previewMode ? 12 : currentlyEditing ? 6 : 9}>
            <Paper 
              sx={{ 
                p: 3, 
                minHeight: 600, 
                maxHeight: 900, 
                overflow: 'auto',
                position: 'relative'
              }}
            >
              {!previewMode ? (
                <Typography variant="h6" gutterBottom>Report Builder</Typography>
              ) : (
                <Box sx={{ mb: 4, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {reportTitle}
                  </Typography>
                  <Typography variant="subtitle1" align="center">
                    Prepared for: {clientName}
                  </Typography>
                  <Typography variant="subtitle1" align="center">
                    Facility: {facilityName}
                  </Typography>
                  <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 1 }}>
                    Generated on: {new Date().toLocaleDateString()}
                  </Typography>
                </Box>
              )}

              {reportComponents.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                  <Typography color="text.secondary">
                    Add components to build your report
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ my: 2 }}>
                  {reportComponents.map((component, index) => (
                    <Box 
                      key={component.id}
                      sx={{ 
                        mb: 3, 
                        p: 2, 
                        border: previewMode ? 'none' : '1px dashed',
                        borderColor: 'divider',
                        borderRadius: 1,
                        position: 'relative'
                      }}
                    >
                      {!previewMode && (
                        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => setCurrentlyEditing(component.id)}
                            sx={{ mr: 0.5 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleRemoveComponent(component.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                      {!previewMode && (
                        <Box sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <IconButton 
                              size="small" 
                              disabled={index === 0}
                              onClick={() => handleMoveComponent(component.id, 'up')}
                            >
                              <DragIcon fontSize="small" style={{ transform: 'rotate(-90deg)' }} />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              disabled={index === reportComponents.length - 1}
                              onClick={() => handleMoveComponent(component.id, 'down')}
                            >
                              <DragIcon fontSize="small" style={{ transform: 'rotate(90deg)' }} />
                            </IconButton>
                          </Box>
                        </Box>
                      )}
                      <Box sx={{ ml: previewMode ? 0 : 4 }}>
                        {renderComponentPreview(component)}
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        )}

        {/* Component Editor - Only show when editing and not in preview mode */}
        {currentlyEditing && !previewMode && (activeTab === 'structure' || !activeTab) && (
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Edit {reportComponents.find(c => c.id === currentlyEditing)?.type}
              </Typography>
              {renderComponentEditor(reportComponents.find(c => c.id === currentlyEditing)!)}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => setCurrentlyEditing(null)}
                >
                  Done
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Report Preview - Always show in preview mode */}
        {previewMode && (
          <Grid item xs={12}>
            <Paper 
              sx={{ 
                p: 3, 
                minHeight: 600, 
                maxHeight: 900, 
                overflow: 'auto',
                position: 'relative'
              }}
            >
              <Box sx={{ mb: 4, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {reportTitle}
                </Typography>
                <Typography variant="subtitle1" align="center">
                  Prepared for: {clientName}
                </Typography>
                <Typography variant="subtitle1" align="center">
                  Facility: {facilityName}
                </Typography>
                <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 1 }}>
                  Generated on: {new Date().toLocaleDateString()}
                </Typography>
              </Box>

              {reportComponents.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                  <Typography color="text.secondary">
                    Add components to build your report
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ my: 2 }}>
                  {reportComponents.map((component, index) => (
                    <Box 
                      key={component.id}
                      sx={{ 
                        mb: 3, 
                        p: 2, 
                        border: 'none',
                        borderRadius: 1,
                        position: 'relative'
                      }}
                    >
                      {!previewMode && (
                        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => setCurrentlyEditing(component.id)}
                            sx={{ mr: 0.5 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleRemoveComponent(component.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                      {!previewMode && (
                        <Box sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <IconButton 
                              size="small" 
                              disabled={index === 0}
                              onClick={() => handleMoveComponent(component.id, 'up')}
                            >
                              <DragIcon fontSize="small" style={{ transform: 'rotate(-90deg)' }} />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              disabled={index === reportComponents.length - 1}
                              onClick={() => handleMoveComponent(component.id, 'down')}
                            >
                              <DragIcon fontSize="small" style={{ transform: 'rotate(90deg)' }} />
                            </IconButton>
                          </Box>
                        </Box>
                      )}
                      <Box sx={{ ml: previewMode ? 0 : 4 }}>
                        {renderComponentPreview(component)}
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button startIcon={<PrintIcon />} variant="outlined">
          Print Preview
        </Button>
        <Button startIcon={<ShareIcon />} variant="outlined">
          Share Report
        </Button>
        <Button 
          startIcon={<DownloadIcon />} 
          variant="contained"
          onClick={handleGenerateReport}
        >
          Generate PDF Report
        </Button>
      </Box>
    </Box>
  );
};

export default ReportBuilder; 