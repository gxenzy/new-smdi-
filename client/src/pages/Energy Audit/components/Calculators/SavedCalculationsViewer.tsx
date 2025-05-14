import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  Divider,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Chip,
  Menu,
  MenuItem,
  InputAdornment,
  Tooltip,
  ListItemButton
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FolderOpen as FolderOpenIcon
} from '@mui/icons-material';
import { 
  getStoredCalculations, 
  getCalculationsByType, 
  deleteCalculation, 
  saveCalculation
} from './utils/storage';
import { useSnackbar } from 'notistack';

// Make CalculatorType type match storage.ts
type CalculatorType = 'illumination' | 'roi' | 'powerfactor' | 'power-factor' | 'hvac' | 'equipment' | 'harmonic' | 'harmonic-distortion' | 'lighting' | 'schedule-of-loads' | 'voltage-regulation' | 'voltage-drop';

// Define StoredCalculation interface to match storage.ts
interface StoredCalculation {
  id: string;
  name: string;
  timestamp: number;
  type: CalculatorType;
  data: any;
}

interface SavedCalculationsViewerProps {
  onCalculationSelect?: (calculation: StoredCalculation) => void;
  selectedType?: string;
  calculationType?: string;
  onLoadCalculation?: (data: any) => void;
  open?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`saved-calculations-tabpanel-${index}`}
      aria-labelledby={`saved-calculations-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const calculatorTypeLabels: Record<string, string> = {
  'illumination': 'Illumination',
  'lighting': 'Lighting',
  'hvac': 'HVAC',
  'equipment': 'Equipment',
  'power-factor': 'Power Factor',
  'powerfactor': 'Power Factor',
  'harmonic': 'Harmonic Distortion',
  'harmonic-distortion': 'Harmonic Distortion',
  'roi': 'ROI',
  'schedule-of-loads': 'Schedule of Loads',
  'voltage-regulation': 'Voltage Regulation',
  'voltage-drop': 'Voltage Drop'
};

// Add updateCalculationName function
const updateCalculationName = (id: string, newName: string): boolean => {
  try {
    // Get all stored calculations of all types
    const allCalculations = getStoredCalculations();
    const calculationIndex = allCalculations.findIndex(calc => calc.id === id);
    
    if (calculationIndex === -1) {
      return false;
    }
    
    const calculation = allCalculations[calculationIndex];
    
    // Update the name
    calculation.name = newName;
    
    // Update in type-specific storage
    const typedCalculations = getCalculationsByType(calculation.type);
    const typedIndex = typedCalculations.findIndex(calc => calc.id === id);
    
    if (typedIndex !== -1) {
      typedCalculations[typedIndex].name = newName;
      localStorage.setItem(`${calculation.type}_calculations`, JSON.stringify(typedCalculations));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating calculation name:', error);
    return false;
  }
};

const SavedCalculationsViewer: React.FC<SavedCalculationsViewerProps> = ({
  onCalculationSelect,
  selectedType,
  calculationType,
  onLoadCalculation,
  open,
  isOpen,
  onClose
}) => {
  const [calculations, setCalculations] = useState<StoredCalculation[]>([]);
  const [filteredCalculations, setFilteredCalculations] = useState<StoredCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCalculation, setSelectedCalculation] = useState<StoredCalculation | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [calculationToDelete, setCalculationToDelete] = useState<string | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [calculationToRename, setCalculationToRename] = useState<string | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeCalculation, setActiveCalculation] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Use open or isOpen prop if provided, otherwise use internal state
  const [internalDialogOpen, setInternalDialogOpen] = useState(false);
  // Determine actual dialogOpen state based on props or internal state
  const dialogOpen = open !== undefined ? open : (isOpen !== undefined ? isOpen : internalDialogOpen);
  
  const { enqueueSnackbar } = useSnackbar();
  
  // Load calculations on mount
  useEffect(() => {
    loadCalculations();
  }, []);
  
  // Filter calculations when search query or tab changes
  useEffect(() => {
    filterCalculations();
  }, [searchQuery, calculations, tabValue]);
  
  // Change tab if selectedType prop changes
  useEffect(() => {
    if (selectedType) {
      const calculatorTypes = ['all', 'illumination', 'lighting', 'hvac', 'equipment', 'power-factor', 'harmonic-distortion', 'schedule-of-loads'];
      const typeIndex = calculatorTypes.indexOf(selectedType);
      if (typeIndex !== -1) {
        setTabValue(typeIndex);
      }
    } else if (calculationType) {
      const calculatorTypes = ['all', 'illumination', 'lighting', 'hvac', 'equipment', 'powerfactor', 'harmonic', 'schedule-of-loads'];
      const normalizedType = calculationType.replace('-', '');
      const typeIndex = calculatorTypes.indexOf(normalizedType);
      if (typeIndex !== -1) {
        setTabValue(typeIndex);
      }
    }
  }, [selectedType, calculationType]);
  
  // Load all calculations from storage
  const loadCalculations = () => {
    setLoading(true);
    try {
      console.log(`Loading calculations for type: ${calculationType || 'all'}`);
      if (calculationType) {
        // Convert calculationType string to CalculatorType
        const type = calculationType as CalculatorType;
        const typedCalculations = getCalculationsByType(type);
        console.log(`Loaded ${typedCalculations.length} calculations for type: ${type}`);
        // Use type assertion to fix incompatible types
        setCalculations(typedCalculations as any);
      } else {
        const allCalculations = getStoredCalculations();
        console.log(`Loaded ${allCalculations.length} calculations in total`);
        // Use type assertion to fix incompatible types
        setCalculations(allCalculations as any);
      }
      
      filterCalculations();
    } catch (error) {
      console.error('Error loading calculations:', error);
      enqueueSnackbar(`Error loading saved calculations: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
        variant: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Filter calculations based on search query and selected tab
  const filterCalculations = () => {
    let filtered = [...calculations];
    
    // Filter by type if not on "All" tab
    if (tabValue > 0) {
      const types = ['all', 'illumination', 'lighting', 'hvac', 'equipment', 'power-factor', 'harmonic-distortion', 'schedule-of-loads'];
      const selectedType = types[tabValue];
      
      // Handle special case for harmonic/harmonic-distortion
      if (selectedType === 'harmonic-distortion') {
        filtered = filtered.filter(calc => 
          calc.type === 'harmonic' || calc.type === 'harmonic-distortion'
        );
      } else if (selectedType === 'power-factor') {
        // Handle legacy powerfactor naming
        filtered = filtered.filter(calc => 
          calc.type === 'power-factor' || calc.type === 'powerfactor'
        );
      } else {
        filtered = filtered.filter(calc => calc.type === selectedType);
      }
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(calc => 
        calc.name.toLowerCase().includes(query) || 
        calc.type.toLowerCase().includes(query)
      );
    }
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp - a.timestamp);
    
    setFilteredCalculations(filtered);
  };
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle calculation selection
  const handleCalculationSelect = (calculation: StoredCalculation) => {
    setSelectedCalculation(calculation);
    
    if (onLoadCalculation) {
      onLoadCalculation(calculation.data);
    }
    
    if (onCalculationSelect) {
      onCalculationSelect(calculation);
    }

    // Close the dialog after loading a calculation
    setInternalDialogOpen(false);
  };
  
  // Handle calculation delete
  const handleDeleteClick = (id: string) => {
    setCalculationToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  // Confirm calculation deletion
  const confirmDelete = () => {
    if (calculationToDelete) {
      try {
        // Find the calculation type first
        const calculation = calculations.find(calc => calc.id === calculationToDelete);
        if (calculation) {
          console.log(`Deleting calculation: ${calculation.id} (${calculation.type})`);
          const success = deleteCalculation(calculation.type, calculationToDelete);
          
          if (success) {
            enqueueSnackbar('Calculation deleted successfully', { variant: 'success' });
            loadCalculations();
            
            // Clear selection if the deleted calculation was selected
            if (selectedCalculation?.id === calculationToDelete) {
              setSelectedCalculation(null);
            }
          } else {
            enqueueSnackbar('Failed to delete calculation', { variant: 'error' });
          }
        } else {
          enqueueSnackbar('Calculation not found', { variant: 'error' });
        }
      } catch (error) {
        console.error('Error deleting calculation:', error);
        enqueueSnackbar(`Error deleting calculation: ${error instanceof Error ? error.message : 'Unknown error'}`, {
          variant: 'error'
        });
      }
      
      // Close the confirmation dialog
      setDeleteDialogOpen(false);
      setCalculationToDelete(null);
    }
  };
  
  // Handle rename click
  const handleRenameClick = (id: string, name: string) => {
    setCalculationToRename(id);
    setNewName(name);
    setRenameDialogOpen(true);
  };
  
  // Confirm rename
  const confirmRename = () => {
    if (calculationToRename && newName.trim()) {
      const success = updateCalculationName(calculationToRename, newName.trim());
      if (success) {
        enqueueSnackbar('Calculation renamed successfully', { variant: 'success' });
        loadCalculations();
        
        // Update selected calculation if it was renamed
        if (selectedCalculation?.id === calculationToRename) {
          setSelectedCalculation({
            ...selectedCalculation,
            name: newName.trim()
          });
        }
      } else {
        enqueueSnackbar('Error renaming calculation', { variant: 'error' });
      }
      setRenameDialogOpen(false);
      setCalculationToRename(null);
      setNewName('');
    }
  };
  
  // Open menu for a calculation
  const handleMenuOpen = (id: string, event: React.MouseEvent<HTMLButtonElement>) => {
    setActiveCalculation(id);
    setMenuAnchorEl(event.currentTarget);
  };
  
  // Close menu
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveCalculation(null);
  };
  
  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Get color for calculator type chip
  const getChipColor = (type: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (type) {
      case 'illumination':
        return 'primary';
      case 'lighting':
        return 'secondary';
      case 'hvac':
        return 'success';
      case 'equipment':
        return 'warning';
      case 'power-factor':
        return 'info';
      case 'harmonic-distortion':
        return 'error';
      case 'schedule-of-loads':
        return 'default';
      default:
        return 'default';
    }
  };

  // Handle dialog close
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalDialogOpen(false);
    }
  };
  
  // Update the handleOpenDialog function
  const handleOpenDialog = () => {
    if (onClose === undefined) {
      setInternalDialogOpen(true);
    }
  };
  
  const handleLoadCalculation = (calculation: StoredCalculation) => {
    console.log(`Loading calculation of type '${calculationType}' with ID: ${calculation.id}`);
    console.log('Calculation data:', calculation);
    
    if (onLoadCalculation) {
      try {
        // For 'power-factor' type, also try 'powerfactor' for backward compatibility
        if (calculationType === 'power-factor' && calculation.type === 'powerfactor') {
          console.log('Converting legacy powerfactor type to power-factor');
          onLoadCalculation(calculation.data);
          
          // Show success notification
          enqueueSnackbar(`Successfully loaded ${calculation.name}`, { 
            variant: 'success',
            autoHideDuration: 3000
          });
          return;
        }
        
        // Only load calculations of matching type
        if (calculation.type === calculationType) {
          onLoadCalculation(calculation.data);
          
          // Show success notification
          enqueueSnackbar(`Successfully loaded ${calculation.name}`, { 
            variant: 'success',
            autoHideDuration: 3000
          });
        } else {
          console.warn(`Type mismatch: Trying to load a '${calculation.type}' calculation in a '${calculationType}' viewer`);
          enqueueSnackbar(`Error: Cannot load a ${calculatorTypeLabels[calculation.type] || calculation.type} calculation in a ${calculatorTypeLabels[calculationType || ''] || calculationType} calculator`, {
            variant: 'error'
          });
        }
      } catch (error) {
        console.error("Error loading calculation:", error);
        enqueueSnackbar(`Error loading calculation: ${error instanceof Error ? error.message : 'Unknown error'}`, {
          variant: 'error'
        });
      }
    }
    
    setInternalDialogOpen(false);
  };
  
  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<FolderOpenIcon />}
        onClick={handleOpenDialog}
        size="small"
      >
        Saved Calculations
      </Button>
      
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {calculationType ? 
                `${calculatorTypeLabels[calculationType] || calculationType.charAt(0).toUpperCase() + calculationType.slice(1)} Saved Calculations` :
                'Saved Calculations'}
            </Typography>
            <IconButton onClick={loadCalculations} size="small" title="Refresh">
              <RefreshIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            size="small"
            placeholder="Search calculations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
          />
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="saved calculations tabs"
            >
              <Tab label="All" />
              <Tab label="Illumination" />
              <Tab label="Lighting" />
              <Tab label="HVAC" />
              <Tab label="Equipment" />
              <Tab label="Power Factor" />
              <Tab label="Harmonic Distortion" />
              <Tab label="Schedule of Loads" />
            </Tabs>
          </Box>
          
          <Box sx={{ pt: 2, height: 400, overflow: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
                <CircularProgress size={40} />
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  Loading saved calculations...
                </Typography>
              </Box>
            ) : filteredCalculations.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                No saved calculations found. Use the calculator save buttons to store your calculations.
              </Alert>
            ) : (
              <List sx={{ pt: 0 }}>
                {filteredCalculations.map((calculation) => (
                  <ListItem
                    key={calculation.id}
                    divider
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteClick(calculation.id)}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemButton onClick={() => handleLoadCalculation(calculation)}>
                      <ListItemText
                        primary={calculation.name || `Calculation ${calculation.id}`}
                        secondary={`Saved on: ${formatDate(calculation.timestamp)}`}
                        primaryTypographyProps={{ noWrap: true }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Menu for calculation actions */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (activeCalculation) {
            const calculation = calculations.find(c => c.id === activeCalculation);
            if (calculation) {
              handleCalculationSelect(calculation);
            }
          }
          handleMenuClose();
        }}>
          <SaveIcon fontSize="small" sx={{ mr: 1 }} />
          Load
        </MenuItem>
        <MenuItem onClick={() => {
          if (activeCalculation) {
            const calculation = calculations.find(c => c.id === activeCalculation);
            if (calculation) {
              handleRenameClick(calculation.id, calculation.name);
            }
          }
          handleMenuClose();
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Rename
        </MenuItem>
        <MenuItem onClick={() => {
          if (activeCalculation) {
            handleDeleteClick(activeCalculation);
          }
          handleMenuClose();
        }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
      
      {/* Dialogs */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Calculation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this calculation? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)}>
        <DialogTitle>Rename Calculation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a new name for this calculation.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="New name"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmRename} color="primary" disabled={!newName.trim()}>Rename</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SavedCalculationsViewer; 