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
  Link,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  ListItemButton
} from '@mui/material';
import { 
  Book as BookIcon,
  Article as ArticleIcon,
  Search as SearchIcon,
  ChevronRight as ChevronRightIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Bookmark as BookmarkIcon,
  Clear as ClearIcon,
  Home as HomeIcon,
  ExpandMore,
  ExpandLess
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
  has_children?: boolean;
}

interface SearchResult {
  id: number;
  standard_id: number;
  section_number: string;
  title: string;
  code_name: string;
}

interface BreadcrumbItem {
  id: number;
  title: string;
  isStandard?: boolean;
}

interface StandardsBrowserProps {
  onSectionSelect: (sectionId: number) => void;
}

const StandardsBrowser: React.FC<StandardsBrowserProps> = ({ onSectionSelect }) => {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedStandard, setSelectedStandard] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [bookmarkedSections, setBookmarkedSections] = useState<number[]>([]);
  const [expandedSections, setExpandedSections] = useState<{[key: number]: boolean}>({});
  const [error, setError] = useState<string | null>(null);

  // Load mock data on component mount
  useEffect(() => {
    // Mock standards data
    const mockStandards = [
      {
        id: 1,
        code_name: 'PEC 2017',
        full_name: 'Philippine Electrical Code',
        version: '2017',
        issuing_body: 'Board of Electrical Engineering'
      },
      {
        id: 2,
        code_name: 'PEEP',
        full_name: 'Philippine Energy Efficiency Project',
        version: '2.0',
        issuing_body: 'Department of Energy (DOE)'
      },
      {
        id: 3,
        code_name: 'ASHRAE 90.1',
        full_name: 'Energy Standard for Buildings',
        version: '2019',
        issuing_body: 'ASHRAE'
      },
      {
        id: 4, 
        code_name: 'IEEE 519',
        full_name: 'Harmonic Control Standard',
        version: '2014',
        issuing_body: 'IEEE'
      }
    ];
    setStandards(mockStandards);
    
    // Load bookmarks from localStorage
    const bookmarks = JSON.parse(localStorage.getItem('standardBookmarks') || '[]');
    setBookmarkedSections(bookmarks);
  }, []);

  // Mock API call for sections
  const fetchSections = (standardId: number, parentId: number | null = null) => {
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      let mockSections: Section[] = [];
      
      // Generate different sections based on standard ID
      if (standardId === 1) { // PEC
        mockSections = [
          {
            id: 101,
            standard_id: 1,
            section_number: '1.0',
            title: 'Introduction',
            parent_section_id: null,
            has_tables: false,
            has_figures: false
          },
          {
            id: 102,
            standard_id: 1,
            section_number: '2.0',
            title: 'General Requirements',
            parent_section_id: null,
            has_tables: false,
            has_figures: false
          },
          {
            id: 103,
            standard_id: 1,
            section_number: '3.0',
            title: 'Wiring and Protection',
            parent_section_id: null,
            has_tables: true,
            has_figures: true
          }
        ];
      } else if (standardId === 2) { // PEEP
        mockSections = [
          {
            id: 201,
            standard_id: 2,
            section_number: '1.0',
            title: 'Introduction',
            parent_section_id: null,
            has_tables: false,
            has_figures: false
          },
          {
            id: 202,
            standard_id: 2,
            section_number: '2.0',
            title: 'Lighting Efficiency',
            parent_section_id: null,
            has_tables: true,
            has_figures: false
          }
        ];
      } else {
        mockSections = [
          {
            id: 301,
            standard_id: standardId,
            section_number: '1.0',
            title: 'Introduction',
            parent_section_id: null,
            has_tables: false,
            has_figures: false
          },
          {
            id: 302,
            standard_id: standardId,
            section_number: '2.0',
            title: 'Requirements',
            parent_section_id: null,
            has_tables: true,
            has_figures: true
          }
        ];
      }
      
      // Filter by parent ID if provided
      if (parentId !== null) {
        mockSections = mockSections.filter(s => s.parent_section_id === parentId);
      }
      
      setSections(mockSections);
      setLoading(false);
    }, 500);
  };

  // Mock search function
  const searchSections = (query: string) => {
    // Simulate API delay
    setTimeout(() => {
      const results: SearchResult[] = [
        {
          id: 103,
          standard_id: 1,
          section_number: '3.0',
          title: 'Wiring and Protection',
          code_name: 'PEC 2017'
        },
        {
          id: 202,
          standard_id: 2,
          section_number: '2.0',
          title: 'Lighting Efficiency',
          code_name: 'PEEP'
        }
      ].filter(r => 
        r.title.toLowerCase().includes(query.toLowerCase()) || 
        r.section_number.includes(query)
      );
      
      setSearchResults(results);
    }, 300);
  };

  // Handle standard selection
  const handleStandardSelect = (standard: Standard) => {
    setSelectedStandard(standard.id);
    setSelectedSectionId(null);
    fetchSections(standard.id);
    setBreadcrumbs([{ id: standard.id, title: standard.code_name, isStandard: true }]);
  };

  // Handle section selection
  const handleSectionSelect = (section: Section) => {
    // If section has content, tables, or figures, view it
    if (section.has_tables || section.has_figures) {
      setSelectedSectionId(section.id);
      onSectionSelect(section.id);
    } else {
      // Navigate to child sections
      fetchSections(selectedStandard!, section.id);
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
    
    // When selecting from search, also update the standard and breadcrumb context
    if (selectedStandard !== result.standard_id) {
      const standard = standards.find(s => s.id === result.standard_id);
      if (standard) {
        setSelectedStandard(result.standard_id);
        setBreadcrumbs([
          { id: result.standard_id, title: standard.code_name, isStandard: true },
          { id: result.id, title: `${result.section_number} ${result.title}` }
        ]);
      }
    }
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

  // Reset to standards list (home)
  const goToStandardsList = () => {
    setSelectedStandard(null);
    setSelectedSectionId(null);
    setBreadcrumbs([]);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  // Check if a section is bookmarked
  const isBookmarked = (sectionId: number) => {
    return bookmarkedSections.includes(sectionId);
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length >= 3) {
      searchSections(value);
    } else {
      setSearchResults([]);
    }
  };

  const handleExpandSection = async (sectionId: number) => {
    // Toggle expanded state
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
    
    // If not already expanded, fetch child sections
    if (!expandedSections[sectionId]) {
      try {
        const response = await axios.get(`/api/standards/${selectedStandard}/sections?parentId=${sectionId}`);
        
        // Add child sections to current sections list
        setSections(prevSections => {
          // Find the index where to insert child sections
          const parentIndex = prevSections.findIndex(s => s.id === sectionId);
          
          if (parentIndex !== -1) {
            // Create new array with child sections inserted after parent
            const childSections = response.data;
            const updatedSections = [
              ...prevSections.slice(0, parentIndex + 1),
              ...childSections,
              ...prevSections.slice(parentIndex + 1)
            ];
            
            return updatedSections;
          }
          
          return prevSections;
        });
      } catch (err) {
        console.error('Error fetching child sections:', err);
      }
    }
  };

  if (loading && standards.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error && standards.length === 0) {
    return (
      <Paper sx={{ p: 3, bgcolor: 'error.light' }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Standards Browser
        </Typography>
        <TextField
          fullWidth
          placeholder="Search standards..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            endAdornment: searchQuery ? (
              <IconButton size="small" onClick={clearSearch}>
                <ClearIcon />
              </IconButton>
            ) : null
          }}
        />
      </Box>
      
      {/* Breadcrumb navigation */}
      {breadcrumbs.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <IconButton size="small" onClick={goToStandardsList} sx={{ mr: 1 }}>
            <HomeIcon />
          </IconButton>
          <Breadcrumbs separator="›" sx={{ flexGrow: 1 }}>
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

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
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
                  sx={{
                    borderLeft: isBookmarked(result.id) ? '4px solid' : 'none',
                    borderColor: 'primary.main',
                    pl: isBookmarked(result.id) ? 1 : 2,
                  }}
                >
                  <ListItemIcon>
                    <ArticleIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${result.section_number} ${result.title}`}
                    secondary={`${result.code_name}`}
                  />
                  {isBookmarked(result.id) && (
                    <BookmarkIcon color="primary" fontSize="small" />
                  )}
                </ListItem>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography>No results found</Typography>
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
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {standard.code_name}
                        <Chip 
                          label={standard.version} 
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    }
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
              sections.map((section) => {
                const isParent = section.parent_section_id === null;
                const isChild = section.parent_section_id !== null;
                const isExpanded = expandedSections[section.id] || false;
                const hasChildren = section.has_children;
                
                return (
                  <React.Fragment key={section.id}>
                    <ListItem 
                      sx={{ 
                        pl: isChild ? 4 : 2,
                        bgcolor: isChild ? 'rgba(0, 0, 0, 0.02)' : 'inherit'
                      }}
                      disablePadding
                    >
                      <ListItemButton 
                        onClick={() => handleSectionSelect(section)}
                        dense={isChild}
                      >
                        {hasChildren && (
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExpandSection(section.id);
                            }}
                            sx={{ mr: 1 }}
                          >
                            {isExpanded ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        )}
                        {!hasChildren && isParent && (
                          <ChevronRightIcon sx={{ mr: 1, opacity: 0.5 }} />
                        )}
                        <ListItemText 
                          primary={
                            <Typography variant={isParent ? "subtitle1" : "body2"}>
                              {section.section_number} - {section.title}
                            </Typography>
                          } 
                        />
                      </ListItemButton>
                    </ListItem>
                  </React.Fragment>
                );
              })
            ) : (
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography>No sections found</Typography>
              </Box>
            )}
          </List>
        )}
      </Box>
    </Paper>
  );
};

export default StandardsBrowser; 