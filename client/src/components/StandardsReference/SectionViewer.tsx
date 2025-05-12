import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Tabs, 
  Tab, 
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  Grid,
  Card,
  CardMedia,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  IconButton,
  Alert
} from '@mui/material';
import {
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Print as PrintIcon,
  School as SchoolIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import axios from 'axios';

interface SectionData {
  id: number;
  standard_id: number;
  section_number: string;
  title: string;
  content: string;
  has_tables: boolean;
  has_figures: boolean;
  tables: TableData[];
  figures: FigureData[];
  compliance_requirements: RequirementData[];
  educational_resources: ResourceData[];
}

interface TableData {
  id: number;
  table_number: string;
  title: string;
  content: any;
  notes?: string;
}

interface FigureData {
  id: number;
  figure_number: string;
  title: string;
  image_path: string;
  caption?: string;
}

interface RequirementData {
  id: number;
  requirement_type: 'mandatory' | 'prescriptive' | 'performance';
  description: string;
  verification_method?: string;
  severity: 'critical' | 'major' | 'minor';
}

interface ResourceData {
  id: number;
  resource_type: 'video' | 'article' | 'case_study' | 'guide';
  title: string;
  description?: string;
  url?: string;
  file_path?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`section-tabpanel-${index}`}
      aria-labelledby={`section-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const SectionViewer: React.FC<{
  sectionId: number | null;
}> = ({ sectionId }) => {
  const [section, setSection] = useState<SectionData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [bookmarked, setBookmarked] = useState<boolean>(false);

  // Fetch section data when ID changes
  useEffect(() => {
    if (sectionId) {
      fetchSection(sectionId);
    } else {
      setSection(null);
    }
  }, [sectionId]);

  // Check if section is bookmarked
  useEffect(() => {
    if (sectionId) {
      const bookmarks = JSON.parse(localStorage.getItem('standardBookmarks') || '[]');
      setBookmarked(bookmarks.includes(sectionId));
    }
  }, [sectionId]);

  const fetchSection = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/standards-api/sections/${id}`);
      setSection(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching section:', error);
      setError('Failed to load section. Please try again.');
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const toggleBookmark = () => {
    if (!sectionId) return;
    
    const bookmarks = JSON.parse(localStorage.getItem('standardBookmarks') || '[]');
    
    if (bookmarked) {
      const updatedBookmarks = bookmarks.filter((id: number) => id !== sectionId);
      localStorage.setItem('standardBookmarks', JSON.stringify(updatedBookmarks));
    } else {
      bookmarks.push(sectionId);
      localStorage.setItem('standardBookmarks', JSON.stringify(bookmarks));
    }
    
    setBookmarked(!bookmarked);
  };

  const printSection = () => {
    window.print();
  };

  // Function to render table content from JSON
  const renderTableContent = (tableData: any) => {
    if (!tableData) return null;
    
    try {
      const data = typeof tableData === 'string' ? JSON.parse(tableData) : tableData;
      
      if (!data.headers || !data.rows) {
        return <Typography color="error">Invalid table format</Typography>;
      }
      
      return (
        <Table size="small">
          <TableHead>
            <TableRow>
              {data.headers.map((header: string, index: number) => (
                <TableCell key={index} sx={{ fontWeight: 'bold' }}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.rows.map((row: string[], rowIndex: number) => (
              <TableRow key={rowIndex}>
                {row.map((cell: string, cellIndex: number) => (
                  <TableCell key={cellIndex}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    } catch (error) {
      console.error('Error rendering table:', error);
      return <Typography color="error">Error parsing table data</Typography>;
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'major': return 'warning';
      case 'minor': return 'info';
      default: return 'primary';
    }
  };

  if (!sectionId) {
    return (
      <Paper sx={{ p: 4, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Select a section to view its content
        </Typography>
      </Paper>
    );
  }

  if (loading) {
    return (
      <Paper sx={{ p: 4, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 4, height: '100%' }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  if (!section) {
    return (
      <Paper sx={{ p: 4, height: '100%' }}>
        <Typography variant="h6" color="text.secondary">
          Section not found
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, height: '100%', overflow: 'auto' }} id="section-viewer">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" component="h2">
          {section.section_number} {section.title}
        </Typography>
        <Box>
          <Tooltip title={bookmarked ? "Remove bookmark" : "Bookmark this section"}>
            <IconButton onClick={toggleBookmark}>
              {bookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Print this section">
            <IconButton onClick={printSection}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
        <Tab label="Content" id="section-tab-0" aria-controls="section-tabpanel-0" />
        {section.tables && section.tables.length > 0 && (
          <Tab label={`Tables (${section.tables.length})`} id="section-tab-1" aria-controls="section-tabpanel-1" />
        )}
        {section.figures && section.figures.length > 0 && (
          <Tab label={`Figures (${section.figures.length})`} id="section-tab-2" aria-controls="section-tabpanel-2" />
        )}
        {section.compliance_requirements && section.compliance_requirements.length > 0 && (
          <Tab label="Compliance" id="section-tab-3" aria-controls="section-tabpanel-3" />
        )}
        {section.educational_resources && section.educational_resources.length > 0 && (
          <Tab label="Resources" id="section-tab-4" aria-controls="section-tabpanel-4" />
        )}
      </Tabs>
      
      <TabPanel value={tabValue} index={0}>
        <Typography component="div">
          {section.content ? (
            <div dangerouslySetInnerHTML={{ __html: section.content }} />
          ) : (
            <Typography color="text.secondary">No content available for this section.</Typography>
          )}
        </Typography>
      </TabPanel>
      
      {section.tables && section.tables.length > 0 && (
        <TabPanel value={tabValue} index={1}>
          {section.tables.map(table => (
            <Box key={table.id} sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Table {table.table_number}: {table.title}
              </Typography>
              {renderTableContent(table.content)}
              {table.notes && (
                <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                  Note: {table.notes}
                </Typography>
              )}
            </Box>
          ))}
        </TabPanel>
      )}
      
      {section.figures && section.figures.length > 0 && (
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {section.figures.map(figure => (
              <Grid item xs={12} md={6} key={figure.id}>
                <Card>
                  <CardMedia
                    component="img"
                    image={figure.image_path}
                    alt={figure.title}
                    sx={{ maxHeight: 300, objectFit: 'contain' }}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Figure {figure.figure_number}: {figure.title}
                    </Typography>
                    {figure.caption && (
                      <Typography variant="body2">
                        {figure.caption}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      )}
      
      {section.compliance_requirements && section.compliance_requirements.length > 0 && (
        <TabPanel value={tabValue} index={3}>
          <List>
            {section.compliance_requirements.map(requirement => (
              <Box key={requirement.id} sx={{ mb: 2 }}>
                <Alert 
                  severity={getSeverityColor(requirement.severity) as any}
                  icon={<InfoIcon />}
                >
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                      {requirement.requirement_type.toUpperCase()} Requirement
                    </Typography>
                  </Box>
                  <Typography variant="body1">{requirement.description}</Typography>
                  {requirement.verification_method && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Verification:</strong> {requirement.verification_method}
                    </Typography>
                  )}
                </Alert>
              </Box>
            ))}
          </List>
        </TabPanel>
      )}
      
      {section.educational_resources && section.educational_resources.length > 0 && (
        <TabPanel value={tabValue} index={4}>
          <List>
            {section.educational_resources.map(resource => (
              <ListItem
                key={resource.id}
                sx={{ 
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 2
                }}
              >
                <ListItemIcon>
                  <SchoolIcon />
                </ListItemIcon>
                <ListItemText
                  primary={resource.title}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {resource.resource_type.charAt(0).toUpperCase() + resource.resource_type.slice(1)}
                        {resource.difficulty && ` • ${resource.difficulty.charAt(0).toUpperCase() + resource.difficulty.slice(1)} level`}
                        {resource.duration && ` • ${resource.duration}`}
                      </Typography>
                      {resource.description && (
                        <Typography component="p" variant="body2">
                          {resource.description}
                        </Typography>
                      )}
                    </>
                  }
                />
                {resource.url && (
                  <Button 
                    variant="outlined" 
                    size="small"
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </Button>
                )}
              </ListItem>
            ))}
          </List>
        </TabPanel>
      )}
    </Paper>
  );
};

export default SectionViewer; 