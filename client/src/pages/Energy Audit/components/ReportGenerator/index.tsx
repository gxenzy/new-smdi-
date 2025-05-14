import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Chip,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import {
  Description as DocumentIcon,
  Preview as PreviewIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  FormatListBulleted as ListIcon,
  BarChart as ChartIcon,
  Image as ImageIcon,
  Title as TitleIcon,
  TextFields as TextIcon,
  TableChart as TableIcon,
  Menu as MenuIcon
} from '@mui/icons-material';

// Define interfaces for report template
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: ReportSection[];
}

interface ReportSection {
  id: string;
  type: 'header' | 'text' | 'chart' | 'image' | 'table' | 'findings';
  title: string;
  content?: string;
  properties?: any;
}

// Sample report templates
const sampleTemplates: ReportTemplate[] = [
  {
    id: '1',
    name: 'Energy Audit Summary Report',
    description: 'A complete report with findings, recommendations, and financial analysis',
    sections: [
      {
        id: 's1',
        type: 'header',
        title: 'Energy Audit Report',
        properties: { level: 1 }
      },
      {
        id: 's2',
        type: 'text',
        title: 'Executive Summary',
        content: 'This energy audit was conducted to assess the energy consumption patterns and identify energy-saving opportunities at the UCLM campus.'
      },
      {
        id: 's3',
        type: 'header',
        title: 'Audit Findings',
        properties: { level: 2 }
      },
      {
        id: 's4',
        type: 'findings',
        title: 'Key Findings',
        properties: { showImpact: true }
      },
      {
        id: 's5',
        type: 'chart',
        title: 'Energy Consumption by Category',
        properties: { chartType: 'pie' }
      },
      {
        id: 's6',
        type: 'header',
        title: 'Recommendations',
        properties: { level: 2 }
      },
      {
        id: 's7',
        type: 'table',
        title: 'Energy Conservation Measures',
        properties: { columns: ['Measure', 'Savings (kWh)', 'Cost (PHP)', 'Payback (Years)'] }
      },
      {
        id: 's8',
        type: 'header',
        title: 'Financial Analysis',
        properties: { level: 2 }
      },
      {
        id: 's9',
        type: 'chart',
        title: 'Return on Investment',
        properties: { chartType: 'bar' }
      }
    ]
  },
  {
    id: '2',
    name: 'Executive Summary Report',
    description: 'A brief overview report for executives and stakeholders',
    sections: [
      {
        id: 's1',
        type: 'header',
        title: 'Executive Summary',
        properties: { level: 1 }
      },
      {
        id: 's2',
        type: 'text',
        title: 'Overview',
        content: 'This report summarizes key findings and recommendations from the energy audit.'
      },
      {
        id: 's3',
        type: 'chart',
        title: 'Energy Savings Potential',
        properties: { chartType: 'pie' }
      },
      {
        id: 's4',
        type: 'table',
        title: 'ROI Summary',
        properties: { columns: ['Intervention', 'ROI (%)', 'Payback (Years)'] }
      }
    ]
  }
];

// Sample findings for report
const sampleFindings = [
  {
    id: 'f1',
    title: 'Inefficient lighting systems in classrooms',
    description: 'Current fluorescent tubes are outdated and consume excessive energy',
    category: 'lighting',
    severity: 'high',
    impact: 'Replacing with LED lighting could reduce lighting energy consumption by 50%'
  },
  {
    id: 'f2',
    title: 'HVAC systems operating at extended hours',
    description: 'Air conditioning units running outside of occupied hours',
    category: 'hvac',
    severity: 'medium',
    impact: 'Implementing scheduling controls could save 15-20% of HVAC energy'
  },
  {
    id: 'f3',
    title: 'Poor insulation in building envelope',
    description: 'Heat gain through windows and walls increasing cooling load',
    category: 'envelope',
    severity: 'medium',
    impact: 'Adding window films and insulation could reduce cooling needs by 10-15%'
  }
];

// Sample charts for report
const sampleCharts = [
  { id: 'c1', title: 'Energy Consumption by Category', type: 'pie' },
  { id: 'c2', title: 'Monthly Energy Usage Trends', type: 'line' },
  { id: 'c3', title: 'Energy Saving Opportunities', type: 'bar' },
  { id: 'c4', title: 'ROI Analysis', type: 'bar' }
];

const ReportGenerator: React.FC = () => {
  const [templates, setTemplates] = useState<ReportTemplate[]>(sampleTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(templates[0]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [reportTitle, setReportTitle] = useState<string>('Energy Audit Report');
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Function to handle template selection
  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
    }
  };
  
  // Function to handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Function to toggle preview mode
  const handlePreviewToggle = () => {
    setPreviewMode(!previewMode);
  };

  // Function to render a preview of a section
  const renderSectionPreview = (section: ReportSection) => {
    switch(section.type) {
      case 'header':
        const variant = section.properties?.level === 1 ? 'h4' : 
                       section.properties?.level === 2 ? 'h5' : 'h6';
        return (
          <Typography variant={variant} gutterBottom sx={{ fontWeight: 'bold' }}>
            {section.title}
          </Typography>
        );
        
      case 'text':
        return (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {section.title}
            </Typography>
            <Typography variant="body1">
              {section.content}
            </Typography>
          </Box>
        );
        
      case 'chart':
        return (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {section.title}
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'action.hover', textAlign: 'center', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box>
                <ChartIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {section.properties?.chartType} Chart Placeholder
                </Typography>
              </Box>
            </Paper>
          </Box>
        );
        
      case 'image':
        return (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {section.title}
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'action.hover', textAlign: 'center', height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box>
                <ImageIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Image Placeholder
                </Typography>
              </Box>
            </Paper>
          </Box>
        );
        
      case 'table':
        return (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {section.title}
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'action.hover', textAlign: 'center', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box>
                <TableIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Table Placeholder
                </Typography>
              </Box>
            </Paper>
          </Box>
        );
        
      case 'findings':
        return (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {section.title}
            </Typography>
            <List>
              {sampleFindings.map(finding => (
                <ListItem key={finding.id} sx={{ py: 1, px: 0 }}>
                  <ListItemIcon>•</ListItemIcon>
                  <ListItemText 
                    primary={finding.title}
                    secondary={section.properties?.showImpact ? finding.impact : finding.description} 
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        );
        
      default:
        return null;
    }
  };
  
  // Handle adding a new section
  const handleAddSection = (type: ReportSection['type']) => {
    if (!selectedTemplate) return;
    
    const newSection: ReportSection = {
      id: `new-${Date.now()}`,
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      properties: type === 'header' ? { level: 2 } : {}
    };
    
    if (type === 'text') {
      newSection.content = 'Enter your text here...';
    }
    
    const updatedTemplate = {
      ...selectedTemplate,
      sections: [...selectedTemplate.sections, newSection]
    };
    
    setSelectedTemplate(updatedTemplate);
    
    // Update template in templates list
    const updatedTemplates = templates.map(t => 
      t.id === selectedTemplate.id ? updatedTemplate : t
    );
    
    setTemplates(updatedTemplates);
  };
  
  // Handle deleting a section
  const handleDeleteSection = (sectionId: string) => {
    if (!selectedTemplate) return;
    
    const updatedSections = selectedTemplate.sections.filter(s => s.id !== sectionId);
    const updatedTemplate = {
      ...selectedTemplate,
      sections: updatedSections
    };
    
    setSelectedTemplate(updatedTemplate);
    
    // Update template in templates list
    const updatedTemplates = templates.map(t => 
      t.id === selectedTemplate.id ? updatedTemplate : t
    );
    
    setTemplates(updatedTemplates);
  };
  
  // Handle generating report (download placeholder)
  const handleGenerateReport = () => {
    alert('Report generation functionality would be implemented here.');
  };
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        <DocumentIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Energy Audit Report Generator
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab icon={<DocumentIcon />} label="Templates" />
          <Tab icon={<EditIcon />} label="Editor" />
          <Tab icon={<PreviewIcon />} label="Preview" />
        </Tabs>
      </Box>
      
      {/* Templates Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {templates.map(template => (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: selectedTemplate?.id === template.id ? 2 : 0,
                  borderColor: 'primary.main',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 }
                }}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <DocumentIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      {template.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {template.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {template.sections.length} sections
                    </Typography>
                    <Button size="small" color="primary">
                      Use This Template
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          
          <Grid item xs={12} sm={6} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2px dashed',
                borderColor: 'divider',
                '&:hover': { borderColor: 'primary.main' }
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <AddIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography variant="h6" component="div" gutterBottom>
                  Create Custom Template
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start from scratch and build your own template
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Editor Tab */}
      {activeTab === 1 && selectedTemplate && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Report Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Report Title"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Report Date"
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Paper>
          
          <Grid container spacing={3}>
            {/* Sections Editor */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Section Editor</Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<PreviewIcon />} 
                    onClick={handlePreviewToggle}
                  >
                    {previewMode ? 'Edit Mode' : 'Preview Mode'}
                  </Button>
                </Box>
                
                <Box sx={{ mb: 4 }}>
                  {selectedTemplate.sections.map((section, index) => (
                    <Box 
                      key={section.id} 
                      sx={{ 
                        p: 2, 
                        mb: 2, 
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        position: 'relative'
                      }}
                    >
                      {!previewMode && (
                        <>
                          <Box 
                            sx={{ 
                              position: 'absolute',
                              top: 10,
                              right: 10,
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <IconButton size="small" sx={{ mr: 1 }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteSection(section.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <Chip 
                            label={section.type}
                            size="small" 
                            sx={{ mb: 1 }}
                          />
                        </>
                      )}
                      
                      {renderSectionPreview(section)}
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
            
            {/* Tools Panel */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Add Sections</Typography>
                <List>
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      startIcon={<TitleIcon />}
                      onClick={() => handleAddSection('header')}
                    >
                      Header
                    </Button>
                  </ListItem>
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      startIcon={<TextIcon />}
                      onClick={() => handleAddSection('text')}
                    >
                      Text Block
                    </Button>
                  </ListItem>
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      startIcon={<ChartIcon />}
                      onClick={() => handleAddSection('chart')}
                    >
                      Chart
                    </Button>
                  </ListItem>
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      startIcon={<ImageIcon />}
                      onClick={() => handleAddSection('image')}
                    >
                      Image
                    </Button>
                  </ListItem>
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      startIcon={<TableIcon />}
                      onClick={() => handleAddSection('table')}
                    >
                      Table
                    </Button>
                  </ListItem>
                  <ListItem disablePadding>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      startIcon={<ListIcon />}
                      onClick={() => handleAddSection('findings')}
                    >
                      Findings
                    </Button>
                  </ListItem>
                </List>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" gutterBottom>Actions</Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="primary"
                      startIcon={<SaveIcon />}
                      sx={{ mb: 1 }}
                    >
                      Save Template
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="secondary"
                      startIcon={<DownloadIcon />}
                      onClick={handleGenerateReport}
                    >
                      Generate Report
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {/* Preview Tab */}
      {activeTab === 2 && selectedTemplate && (
        <Box>
          <Paper sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" gutterBottom>{reportTitle}</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Generated on {new Date(reportDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Typography>
              <Divider sx={{ my: 2 }} />
            </Box>
            
            {selectedTemplate.sections.map(section => (
              <Box key={section.id} sx={{ mb: 3 }}>
                {renderSectionPreview(section)}
              </Box>
            ))}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              <Button 
                variant="outlined" 
                startIcon={<PrintIcon />}
                sx={{ mr: 1 }}
              >
                Print
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<DownloadIcon />}
                sx={{ mr: 1 }}
              >
                Download PDF
              </Button>
              <Button 
                variant="contained" 
                startIcon={<ShareIcon />}
              >
                Share
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default ReportGenerator; 