import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Paper,
  Chip,
  Snackbar,
  Alert,
  InputAdornment,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalOffer as TagIcon,
  Search as SearchIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import axios from 'axios';

interface Tag {
  id: number;
  name: string;
}

const TagManagement: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Add/Edit states
  const [newTagName, setNewTagName] = useState('');
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const [editTagName, setEditTagName] = useState('');
  
  // Delete dialog states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  
  // Fetch all tags on component mount
  useEffect(() => {
    fetchTags();
  }, []);
  
  // Filter tags when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTags(tags);
    } else {
      const filtered = tags.filter(tag => 
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTags(filtered);
    }
  }, [searchTerm, tags]);
  
  const fetchTags = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/tags/tags');
      setTags(response.data);
      setFilteredTags(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError('Failed to load tags');
      showSnackbar('Failed to load tags', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.post('/api/tags/tags', {
        name: newTagName.trim()
      });
      
      // Add the new tag to the list
      setTags([...tags, response.data]);
      setNewTagName('');
      showSnackbar('Tag added successfully', 'success');
    } catch (err) {
      console.error('Error adding tag:', err);
      showSnackbar('Failed to add tag', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditTag = async () => {
    if (!editTagName.trim() || !editingTagId) return;
    
    setLoading(true);
    try {
      const response = await axios.put(`/api/tags/tags/${editingTagId}`, {
        name: editTagName.trim()
      });
      
      // Update the tag in the list
      setTags(tags.map(tag => 
        tag.id === editingTagId ? response.data : tag
      ));
      
      // Reset edit state
      setEditingTagId(null);
      setEditTagName('');
      
      showSnackbar('Tag updated successfully', 'success');
    } catch (err) {
      console.error('Error updating tag:', err);
      showSnackbar('Failed to update tag', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const confirmDeleteTag = (tag: Tag) => {
    setTagToDelete(tag);
    setDeleteConfirmOpen(true);
  };
  
  const handleDeleteTag = async () => {
    if (!tagToDelete) return;
    
    setLoading(true);
    try {
      await axios.delete(`/api/tags/tags/${tagToDelete.id}`);
      
      // Remove the tag from the list
      setTags(tags.filter(tag => tag.id !== tagToDelete.id));
      
      showSnackbar('Tag deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting tag:', err);
      showSnackbar('Failed to delete tag', 'error');
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
      setTagToDelete(null);
    }
  };
  
  const startEditTag = (tag: Tag) => {
    setEditingTagId(tag.id);
    setEditTagName(tag.name);
  };
  
  const cancelEditTag = () => {
    setEditingTagId(null);
    setEditTagName('');
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <TagIcon sx={{ mr: 1 }} color="primary" />
        <Typography variant="h6">Tag Management</Typography>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Add new tag */}
      <Box display="flex" mb={3}>
        <TextField
          fullWidth
          label="New Tag Name"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          size="small"
          disabled={loading}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddTag}
          disabled={!newTagName.trim() || loading}
          sx={{ ml: 1 }}
        >
          Add
        </Button>
      </Box>
      
      {/* Search and filter */}
      <TextField
        fullWidth
        placeholder="Search tags..."
        value={searchTerm}
        onChange={handleSearchChange}
        variant="outlined"
        size="small"
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
      
      {/* Tags list */}
      {loading && tags.length === 0 ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : error && tags.length === 0 ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Typography variant="subtitle2" gutterBottom>
            {filteredTags.length} {filteredTags.length === 1 ? 'Tag' : 'Tags'}
          </Typography>
          
          <List>
            {filteredTags.length === 0 ? (
              <Alert severity="info">
                {searchTerm ? 'No tags matching your search' : 'No tags created yet'}
              </Alert>
            ) : (
              filteredTags.map(tag => (
                <ListItem
                  key={tag.id}
                  secondaryAction={
                    editingTagId === tag.id ? (
                      <>
                        <IconButton 
                          edge="end" 
                          aria-label="save" 
                          onClick={handleEditTag}
                          disabled={!editTagName.trim() || loading}
                        >
                          <SaveIcon />
                        </IconButton>
                        <IconButton 
                          edge="end" 
                          aria-label="cancel" 
                          onClick={cancelEditTag}
                          disabled={loading}
                        >
                          <CancelIcon />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton 
                          edge="end" 
                          aria-label="edit" 
                          onClick={() => startEditTag(tag)}
                          disabled={loading}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          edge="end" 
                          aria-label="delete" 
                          onClick={() => confirmDeleteTag(tag)}
                          disabled={loading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )
                  }
                >
                  {editingTagId === tag.id ? (
                    <TextField
                      fullWidth
                      value={editTagName}
                      onChange={(e) => setEditTagName(e.target.value)}
                      size="small"
                      disabled={loading}
                      autoFocus
                    />
                  ) : (
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center">
                          <Chip 
                            label={tag.name} 
                            variant="outlined" 
                            size="small" 
                            color="primary"
                          />
                        </Box>
                      }
                    />
                  )}
                </ListItem>
              ))
            )}
          </List>
        </>
      )}
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Delete Tag</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the tag "{tagToDelete?.name}"? 
            This will remove it from all associated sections.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)} 
            color="primary"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteTag} 
            color="error" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default TagManagement; 