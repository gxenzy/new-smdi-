import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  CircularProgress,
  Button
} from '@mui/material';
import { 
  Label as LabelIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import standardsService from '../../services/StandardsService';

interface Tag {
  id: string;
  name: string;
}

interface TagFilterProps {
  onFilterChange: (selectedTagIds: string[]) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ onFilterChange }) => {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  useEffect(() => {
    fetchAllTags();
  }, []);
  
  const fetchAllTags = async () => {
    try {
      setLoading(true);
      const data = await standardsService.getAllTags();
      setAllTags(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setLoading(false);
    }
  };
  
  const handleTagSelect = (event: any) => {
    const selected = event.target.value as string[];
    setSelectedTags(selected);
    onFilterChange(selected);
  };
  
  const handleClearFilter = () => {
    setSelectedTags([]);
    onFilterChange([]);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom display="flex" alignItems="center">
        <FilterIcon fontSize="small" sx={{ mr: 0.5 }} />
        Filter by Tags
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControl size="small" fullWidth sx={{ mr: 1 }}>
          <Select
            multiple
            displayEmpty
            value={selectedTags}
            onChange={handleTagSelect}
            input={<OutlinedInput />}
            renderValue={(selected) => {
              if (selected.length === 0) {
                return <Typography variant="body2" color="text.secondary">Select tags...</Typography>;
              }
              
              return (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((tagId) => {
                    const tag = allTags.find(t => t.id === tagId);
                    return tag ? (
                      <Chip key={tagId} label={tag.name} size="small" />
                    ) : null;
                  })}
                </Box>
              );
            }}
            disabled={loading || allTags.length === 0}
          >
            {loading ? (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Loading tags...
              </MenuItem>
            ) : allTags.length > 0 ? (
              allTags.map((tag) => (
                <MenuItem key={tag.id} value={tag.id}>
                  <Checkbox checked={selectedTags.indexOf(tag.id) > -1} />
                  <ListItemText primary={tag.name} />
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No tags available</MenuItem>
            )}
          </Select>
        </FormControl>
        
        {selectedTags.length > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<ClearIcon />}
            onClick={handleClearFilter}
          >
            Clear
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default TagFilter; 
 
 