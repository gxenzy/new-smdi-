import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Stack,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Label as LabelIcon
} from '@mui/icons-material';
import standardsService from '../../services/StandardsService';

interface Tag {
  id: string;
  name: string;
  created_at?: string;
}

interface TagManagementProps {
  sectionId: string;
  readOnly?: boolean;
}

const TagManagement: React.FC<TagManagementProps> = ({ sectionId, readOnly = false }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [newTagName, setNewTagName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (sectionId) {
      fetchTags();
    } else {
      setTags([]);
    }
  }, [sectionId]);

  const fetchTags = async () => {
    if (!sectionId) return;
    
    try {
      setLoading(true);
      const data = await standardsService.getSectionTags(sectionId);
      setTags(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setError('Failed to load tags');
      setLoading(false);
    }
  };

  const handleAddTag = async () => {
    if (!sectionId || !newTagName.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await standardsService.addSectionTag(sectionId, newTagName.trim());
      
      // Refresh tags
      fetchTags();
      setNewTagName('');
      setSuccess('Tag added successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error adding tag:', error);
      setError('Failed to add tag');
      setLoading(false);
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    if (!sectionId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await standardsService.removeSectionTag(sectionId, tagId);
      
      // Refresh tags
      fetchTags();
      setSuccess('Tag removed successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error removing tag:', error);
      setError('Failed to remove tag');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom display="flex" alignItems="center">
        <LabelIcon sx={{ mr: 1 }} />
        Tags
      </Typography>
      
      {/* Error/Success messages */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      {/* Display tags */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {loading && tags.length === 0 ? (
          <CircularProgress size={20} />
        ) : tags.length > 0 ? (
          tags.map((tag) => (
            <Chip 
              key={tag.id}
              label={tag.name}
              onDelete={!readOnly ? () => handleRemoveTag(tag.id) : undefined}
              color="primary"
              variant="outlined"
            />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No tags assigned to this section
          </Typography>
        )}
      </Box>
      
      {/* Add tag form */}
      {!readOnly && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Add new tag"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            disabled={loading}
            sx={{ flexGrow: 1, mr: 1 }}
          />
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddTag}
            disabled={loading || !newTagName.trim()}
          >
            Add
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default TagManagement; 
 
 