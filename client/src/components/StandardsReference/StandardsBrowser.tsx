import React, { useState, useEffect } from 'react';
import { 
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  TextField,
  CircularProgress,
  Breadcrumbs,
  Link 
} from '@mui/material';
import { 
  Book as BookIcon,
  Article as ArticleIcon,
  Search as SearchIcon,
  ChevronRight as ChevronRightIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon
} from '@mui/icons-material';
import axios from 'axios';

interface Standard {
  id: number;
  code_name: string;
  full_name: string;
  version: string;
  issuing_body: string;
}

interface Section {
  id: number;
  standard_id: number;
  section_number: string;
  title: string;
  parent_section_id: number | null;
  has_tables: boolean;
  has_figures: boolean;
}

interface SearchResult {
  id: number;
  standard_id: number;
  section_number: string;
  title: string;
  code_name: string;
  full_name: string;
}

interface BreadcrumbItem {
  id: number;
  title: string;
  isStandard?: boolean;
}

const StandardsBrowser: React.FC<{
  onSectionSelect: (sectionId: number) => void;
}> = ({ onSectionSelect }) => {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Fetch standards on component mount
  useEffect(() => {
    fetchStandards();
  }, []);

  // Handle search query changes
  useEffect(() => {
    if (searchQuery.length >= 3) {
      setIsSearching(true);
      const delayDebounceFn = setTimeout(() => {
        searchSections(searchQuery);
      }, 500);
      
      return () => clearTimeout(delayDebounceFn);
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Fetch all standards
  const fetchStandards = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/standards-api/standards');
      setStandards(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching standards:', error);
      setLoading(false);
    }
  };

  // Fetch sections for a standard
  const fetchSections = async (standardId: number, parentId: number | null = null) => {
    try {
      setLoading(true);
      const url = `/api/standards-api/standards/${standardId}/sections${parentId ? `?parentId=${parentId}` : ''}`;
      const response = await axios.get(url);
      setSections(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sections:', error);
      setLoading(false);
    }
  };

  // Search sections
  const searchSections = async (query: string) => {
    try {
      const response = await axios.get(`/api/standards-api/search/sections?q=${query}`);
      setSearchResults(response.data);
      setIsSearching(false);
    } catch (error) {
      console.error('Error searching sections:', error);
      setIsSearching(false);
    }
  };

  // Handle standard selection
  const handleStandardSelect = (standard: Standard) => {
    setSelectedStandard(standard);
    setSelectedSectionId(null);
    fetchSections(standard.id);
    setBreadcrumbs([{ id: standard.id, title: standard.code_name, isStandard: true }]);
  };

  // Handle section selection
  const handleSectionSelect = (section: Section) => {
    // If section has children, fetch them
    if (section.has_tables || section.has_figures) {
      setSelectedSectionId(section.id);
      onSectionSelect(section.id);
    } else {
      // Navigate to child sections
      fetchSections(selectedStandard!.id, section.id);
      setSelectedSectionId(section.id);
      
      // Update breadcrumbs
      setBreadcrumbs([
        ...breadcrumbs,
        { id: section.id, title: `${section.section_number} ${section.title}` }
      ]);
    }
  };

  // Handle search result selection
  const handleSearchResultSelect = (result: SearchResult) => {
    setSearchQuery('');
    setSearchResults([]);
    onSectionSelect(result.id);
  };

  // Navigate to breadcrumb
  const navigateToBreadcrumb = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    
    const item = breadcrumbs[index];
    
    if (item.isStandard) {
      setSelectedSectionId(null);
      fetchSections(item.id);
    } else {
      const parentItem = index > 0 ? breadcrumbs[index - 1] : null;
      if (parentItem && parentItem.isStandard) {
        fetchSections(parentItem.id, item.id);
      }
      setSelectedSectionId(item.id);
    }
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Standards Browser
        </Typography>
        <TextField
          fullWidth
          placeholder="Search standards..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon color="action" />,
            endAdornment: isSearching ? <CircularProgress size={20} /> : null
          }}
        />
      </Box>
      
      {/* Breadcrumb navigation */}
      {breadcrumbs.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Breadcrumbs separator="›">
            {breadcrumbs.map((item, index) => (
              <Link
                key={index}
                color="inherit"
                component="button"
                variant="body2"
                onClick={() => navigateToBreadcrumb(index)}
                sx={{ 
                  fontWeight: index === breadcrumbs.length - 1 ? 'bold' : 'normal',
                  textDecoration: 'none' 
                }}
              >
                {item.title}
              </Link>
            ))}
          </Breadcrumbs>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : searchQuery.length >= 3 ? (
        // Search results
        <List>
          {searchResults.length > 0 ? (
            searchResults.map((result) => (
              <ListItem
                key={result.id}
                button
                onClick={() => handleSearchResultSelect(result)}
              >
                <ListItemIcon>
                  <ArticleIcon />
                </ListItemIcon>
                <ListItemText
                  primary={`${result.section_number} ${result.title}`}
                  secondary={`${result.code_name}`}
                />
              </ListItem>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              {isSearching ? (
                <Typography>Searching...</Typography>
              ) : (
                <Typography>No results found</Typography>
              )}
            </Box>
          )}
        </List>
      ) : !selectedStandard ? (
        // Standards list
        <List>
          {standards.map((standard) => (
            <React.Fragment key={standard.id}>
              <ListItem 
                button
                onClick={() => handleStandardSelect(standard)}
              >
                <ListItemIcon>
                  <BookIcon />
                </ListItemIcon>
                <ListItemText
                  primary={standard.code_name}
                  secondary={standard.full_name}
                />
                <ChevronRightIcon />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      ) : (
        // Sections list
        <List>
          {sections.length > 0 ? (
            sections.map((section) => (
              <React.Fragment key={section.id}>
                <ListItem 
                  button 
                  onClick={() => handleSectionSelect(section)}
                >
                  <ListItemIcon>
                    {section.has_tables || section.has_figures ? (
                      <ArticleIcon />
                    ) : (
                      selectedSectionId === section.id ? (
                        <FolderOpenIcon />
                      ) : (
                        <FolderIcon />
                      )
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={`${section.section_number} ${section.title}`}
                  />
                  {!(section.has_tables || section.has_figures) && <ChevronRightIcon />}
                </ListItem>
                <Divider />
              </React.Fragment>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography>No sections found</Typography>
            </Box>
          )}
        </List>
      )}
    </Paper>
  );
};

export default StandardsBrowser; 