import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import TuneIcon from '@mui/icons-material/Tune';
import standardsService from '../../services/StandardsService';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchBarProps {
  onSearch: (query: string, options: any) => void;
  standards?: Array<{ id: string; code_name: string; full_name: string }>;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, standards = [] }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [standardId, setStandardId] = useState('');
  const [exactMatch, setExactMatch] = useState(false);
  const [sort, setSort] = useState<'relevance' | 'title' | 'section_number' | 'standard'>('relevance');
  
  const debouncedQuery = useDebounce(query, 300);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // Load recent searches on component mount
  useEffect(() => {
    const fetchRecentSearches = async () => {
      try {
        const terms = await standardsService.getRecentSearchTerms();
        setRecentSearches(terms);
      } catch (error) {
        console.error('Error fetching recent searches:', error);
      }
    };
    
    fetchRecentSearches();
  }, []);

  // Fetch suggestions when query changes
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        setIsSearching(true);
        const results = await standardsService.getSearchSuggestions(debouncedQuery);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;
    
    setShowSuggestions(false);
    
    // Add to recent searches if not already there
    if (!recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev].slice(0, 10));
    }
    
    // Call the onSearch prop with query and options
    onSearch(query, {
      standardId: standardId || undefined,
      exactMatch,
      sort
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    
    // Call search with the selected suggestion
    onSearch(suggestion, {
      standardId: standardId || undefined,
      exactMatch,
      sort
    });
  };

  const handleClearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <Box ref={searchBarRef} sx={{ width: '100%', position: 'relative' }}>
      <TextField
        fullWidth
        placeholder="Search standards..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        onFocus={() => query.length >= 2 && setSuggestions.length > 0 && setShowSuggestions(true)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {isSearching ? (
                <CircularProgress size={20} />
              ) : query ? (
                <IconButton size="small" onClick={handleClearSearch}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              ) : null}
              <IconButton size="small" onClick={() => setShowAdvanced(!showAdvanced)}>
                <TuneIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 1 }}
      />

      {/* Advanced search options */}
      {showAdvanced && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Standard</InputLabel>
                <Select
                  value={standardId}
                  onChange={(e) => setStandardId(e.target.value as string)}
                  label="Standard"
                >
                  <MenuItem value="">All Standards</MenuItem>
                  {standards.map((standard) => (
                    <MenuItem key={standard.id} value={standard.id}>
                      {standard.code_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as any)}
                  label="Sort By"
                >
                  <MenuItem value="relevance">Relevance</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="section_number">Section Number</MenuItem>
                  <MenuItem value="standard">Standard</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <Chip
                  label="Exact Match"
                  color={exactMatch ? "primary" : "default"}
                  onClick={() => setExactMatch(!exactMatch)}
                  sx={{ height: 40 }}
                />
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Search suggestions dropdown */}
      {showSuggestions && (
        <Paper 
          elevation={3} 
          sx={{ 
            position: 'absolute', 
            width: '100%', 
            zIndex: 1000,
            maxHeight: 400,
            overflow: 'auto'
          }}
        >
          {suggestions.length > 0 ? (
            <List>
              {suggestions.map((suggestion, index) => (
                <ListItem 
                  button 
                  key={index} 
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <ListItemText primary={suggestion} />
                </ListItem>
              ))}
            </List>
          ) : debouncedQuery.length >= 2 && !isSearching ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="text.secondary">No suggestions found</Typography>
            </Box>
          ) : null}

          {/* Recent searches */}
          {!debouncedQuery && recentSearches.length > 0 && (
            <>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  <HistoryIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Recent Searches
                </Typography>
              </Box>
              <Divider />
              <List>
                {recentSearches.map((term, index) => (
                  <ListItem 
                    button 
                    key={index}
                    onClick={() => handleSuggestionClick(term)}
                  >
                    <ListItemText primary={term} />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default SearchBar; 