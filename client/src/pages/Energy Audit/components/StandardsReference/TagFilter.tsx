import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Paper,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  LocalOffer as TagIcon
} from '@mui/icons-material';
import axios from 'axios';

interface Tag {
  id: number;
  name: string;
}

interface TagFilterProps {
  onTagsChange: (tags: number[]) => void;
  initialSelectedTags?: number[];
}

const TagFilter: React.FC<TagFilterProps> = ({ onTagsChange, initialSelectedTags = [] }) => {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>(initialSelectedTags);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState(false);
  
  // Fetch all tags on component mount
  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/tags/tags');
        setAllTags(response.data);
        setFilteredTags(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching tags:', err);
        setError('Failed to load tags');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTags();
  }, []);
  
  // Filter tags when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTags(allTags);
    } else {
      const filtered = allTags.filter(tag => 
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTags(filtered);
    }
  }, [searchTerm, allTags]);
  
  // Notify parent when selected tags change
  useEffect(() => {
    onTagsChange(selectedTags);
  }, [selectedTags, onTagsChange]);
  
  const handleTagToggle = (tagId: number) => {
    setSelectedTags(prevSelected => {
      if (prevSelected.includes(tagId)) {
        return prevSelected.filter(id => id !== tagId);
      } else {
        return [...prevSelected, tagId];
      }
    });
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handleAccordionChange = () => {
    setExpanded(!expanded);
  };
  
  const getSelectedTagsDisplay = () => {
    if (selectedTags.length === 0) {
      return <Typography variant="body2" color="text.secondary">No tags selected</Typography>;
    }
    
    return (
      <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
        {selectedTags.map(tagId => {
          const tag = allTags.find(t => t.id === tagId);
          return tag ? (
            <Chip
              key={tagId}
              label={tag.name}
              size="small"
              onDelete={() => handleTagToggle(tagId)}
              color="primary"
              variant="outlined"
            />
          ) : null;
        })}
      </Box>
    );
  };
  
  return (
    <Paper sx={{ mb: 2 }}>
      <Accordion expanded={expanded} onChange={handleAccordionChange}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="tag-filter-content"
          id="tag-filter-header"
        >
          <Box display="flex" alignItems="center" width="100%">
            <TagIcon sx={{ mr: 1 }} color="primary" />
            <Typography variant="subtitle1">Filter by Tags</Typography>
            
            {selectedTags.length > 0 && (
              <Chip 
                label={selectedTags.length} 
                size="small" 
                color="primary" 
                sx={{ ml: 'auto', mr: 1 }} 
              />
            )}
          </Box>
        </AccordionSummary>
        
        <AccordionDetails>
          {loading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <>
              <TextField
                fullWidth
                size="small"
                placeholder="Search tags..."
                value={searchTerm}
                onChange={handleSearchChange}
                variant="outlined"
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Box mt={2} mb={1}>
                <Typography variant="subtitle2" gutterBottom>
                  Available Tags ({filteredTags.length})
                </Typography>
                
                <FormGroup>
                  {filteredTags.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No tags found
                    </Typography>
                  ) : (
                    filteredTags.map(tag => (
                      <FormControlLabel
                        key={tag.id}
                        control={
                          <Checkbox
                            checked={selectedTags.includes(tag.id)}
                            onChange={() => handleTagToggle(tag.id)}
                            size="small"
                          />
                        }
                        label={tag.name}
                      />
                    ))
                  )}
                </FormGroup>
              </Box>
              
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Tags
                </Typography>
                {getSelectedTagsDisplay()}
              </Box>
            </>
          )}
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default TagFilter; 