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
  Card,
  CardMedia,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Alert,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  Snackbar
} from '@mui/material';
import {
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Print as PrintIcon,
  School as SchoolIcon,
  Link as LinkIcon,
  NoteAdd as NoteAddIcon,
  Notes as NotesIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
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
  resource_type: 'video' | 'article' | 'case_study' | 'webinar' | 'guide' | 'tool';
  title: string;
  description?: string;
  url: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
  tags?: string;
}

interface NoteData {
  id: number;
  user_id: number;
  section_id: number;
  note_text: string;
  created_at: string;
  updated_at: string;
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

interface SectionViewerProps {
  sectionId: number | null;
  userId?: number;
}

const SectionViewer: React.FC<SectionViewerProps> = ({ sectionId, userId }) => {
  const [section, setSection] = useState<SectionData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  const [userNotes, setUserNotes] = useState<NoteData[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Fetch section data when ID changes
  useEffect(() => {
    if (sectionId) {
      fetchSection(sectionId);
      if (userId) {
        checkBookmarkStatus(sectionId);
        fetchUserNotes(sectionId);
      }
    } else {
      setSection(null);
      setUserNotes([]);
    }
    setTabValue(0);
  }, [sectionId, userId]);

  // Check if section is bookmarked
  useEffect(() => {
    if (sectionId) {
      checkBookmarkStatus(sectionId);
    }
  }, [sectionId]);

  const checkBookmarkStatus = async (sectionId: number) => {
    if (!userId) return;
    
    try {
      const response = await axios.get(`/api/users/${userId}/bookmarks`);
      const bookmarks = response.data;
      setBookmarked(bookmarks.some((bookmark: any) => bookmark.section_id === sectionId));
    } catch (err) {
      console.error('Error checking bookmark status:', err);
    }
  };

  const fetchSection = async (id: number) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/sections/${id}`);
      setSection(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load section');
      setLoading(false);
      console.error('Error fetching section:', err);
    }
  };

  const fetchUserNotes = async (sectionId: number) => {
    if (!userId) return;
    
    try {
      const response = await axios.get(`/api/users/${userId}/sections/${sectionId}/notes`);
      setUserNotes(response.data);
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const toggleBookmark = async () => {
    if (!userId || !sectionId) return;
    
    try {
      if (bookmarked) {
        await axios.delete(`/api/users/${userId}/bookmarks/${sectionId}`);
      } else {
        await axios.post('/api/bookmarks', { userId, sectionId });
      }
      
      setBookmarked(!bookmarked);
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  const addNote = async () => {
    if (!userId || !sectionId || !newNoteText.trim()) return;
    
    try {
      const response = await axios.post('/api/notes', {
        user_id: userId,
        section_id: sectionId,
        note_text: newNoteText.trim()
      });
      
      const addedNote = response.data;
      setUserNotes([addedNote, ...userNotes]);
      setNewNoteText('');
      setIsAddingNote(false);
      showSnackbar('Note added successfully');
    } catch (err) {
      console.error('Error adding note:', err);
    }
  };

  const startEditingNote = (note: NoteData) => {
    setEditingNoteId(note.id);
    setEditingNoteText(note.note_text);
  };

  const updateNote = async () => {
    if (!editingNoteId || !editingNoteText.trim() || !sectionId) return;
    
    try {
      const response = await axios.put(`/api/notes/${editingNoteId}`, {
        user_id: userId,
        section_id: sectionId,
        note_text: editingNoteText.trim()
      });
      
      const updatedNote = response.data;
      setUserNotes(userNotes.map((note) =>
        note.id === editingNoteId ? updatedNote : note
      ));
      setEditingNoteId(null);
      showSnackbar('Note updated successfully');
    } catch (err) {
      console.error('Error updating note:', err);
    }
  };

  const openDeleteDialog = (noteId: number) => {
    setNoteToDelete(noteId);
    setIsDeleteDialogOpen(true);
  };

  const deleteNote = async () => {
    if (!noteToDelete || !sectionId) return;
    
    try {
      await axios.delete(`/api/notes/${noteToDelete}`);
      setUserNotes(userNotes.filter((note) => note.id !== noteToDelete));
      setIsDeleteDialogOpen(false);
      setNoteToDelete(null);
      showSnackbar('Note deleted successfully');
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  const printSection = () => {
    window.print();
  };

  const copyLinkToClipboard = () => {
    if (!sectionId) return;
    
    const url = `${window.location.origin}/energy-audit/standards-reference?section=${sectionId}`;
    navigator.clipboard.writeText(url).then(
      () => {
        showSnackbar('Link copied to clipboard');
      },
      (err) => {
        console.error('Could not copy text: ', err);
        showSnackbar('Failed to copy link');
      }
    );
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
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

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
          <IconButton onClick={toggleBookmark} title={bookmarked ? "Remove bookmark" : "Bookmark this section"}>
            {bookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
          </IconButton>
          <IconButton onClick={copyLinkToClipboard} title="Copy link to this section">
            <LinkIcon />
          </IconButton>
          <IconButton onClick={printSection} title="Print this section">
            <PrintIcon />
          </IconButton>
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
        <Tab label={`Notes (${userNotes.length})`} id="section-tab-5" aria-controls="section-tabpanel-5" />
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
          {section.figures.map(figure => (
            <Card key={figure.id} sx={{ mb: 3 }}>
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
          ))}
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
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {resource.title}
                      {resource.tags && resource.tags.split(',').map(tag => (
                        <Chip key={tag} label={tag.trim()} size="small" />
                      ))}
                    </Box>
                  }
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
                  <Box>
                    <Button 
                      variant="outlined" 
                      size="small"
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open
                    </Button>
                  </Box>
                )}
              </ListItem>
            ))}
          </List>
        </TabPanel>
      )}
      
      <TabPanel value={tabValue} index={5}>
        <Box sx={{ mb: 3 }}>
          {isAddingNote ? (
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="New note"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                variant="outlined"
                placeholder="Enter your notes about this section..."
              />
              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button onClick={() => setIsAddingNote(false)}>Cancel</Button>
                <Button 
                  variant="contained" 
                  onClick={addNote}
                  disabled={!newNoteText.trim()}
                  startIcon={<SaveIcon />}
                >
                  Save
                </Button>
              </Box>
            </Box>
          ) : (
            <Button 
              variant="outlined" 
              onClick={() => setIsAddingNote(true)}
              startIcon={<NoteAddIcon />}
            >
              Add Note
            </Button>
          )}
        </Box>
        
        {userNotes.length > 0 ? (
          <List>
            {userNotes.map(note => (
              <Paper key={note.id} sx={{ p: 2, mb: 2 }}>
                {editingNoteId === note.id ? (
                  <Box>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Edit note"
                      value={editingNoteText}
                      onChange={(e) => setEditingNoteText(e.target.value)}
                      variant="outlined"
                    />
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button onClick={() => setEditingNoteId(null)}>Cancel</Button>
                      <Button 
                        variant="contained" 
                        onClick={updateNote}
                        disabled={!editingNoteText.trim()}
                      >
                        Update
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {note.note_text}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(note.updated_at)}
                      </Typography>
                      <Box>
                        <IconButton size="small" onClick={() => startEditingNote(note)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => openDeleteDialog(note.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </>
                )}
              </Paper>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <NotesIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              You don't have any notes for this section yet.
            </Typography>
          </Box>
        )}
      </TabPanel>
      
      {/* Confirmation dialog for note deletion */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Note</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this note? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={deleteNote} color="primary" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Paper>
  );
};

export default SectionViewer; 