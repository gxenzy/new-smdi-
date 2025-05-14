import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  TextField,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  InputAdornment
} from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';
import { loadScheduleToUnifiedCircuit, loadItemToUnifiedCircuit, UnifiedCircuitData } from './utils/circuitDataExchange';
import { LoadSchedule, LoadItem } from './ScheduleOfLoads/types';
import { loadSavedCalculations } from './utils/storage';

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
      id={`load-circuit-tabpanel-${index}`}
      aria-labelledby={`load-circuit-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

interface LoadCircuitDialogProps {
  open: boolean;
  onClose: () => void;
  onLoadCircuit: (circuitData: UnifiedCircuitData) => void;
}

const LoadCircuitDialog: React.FC<LoadCircuitDialogProps> = ({
  open,
  onClose,
  onLoadCircuit
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [panels, setPanels] = useState<LoadSchedule[]>([]);
  const [selectedPanel, setSelectedPanel] = useState<LoadSchedule | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Fetch saved Schedule of Loads calculations on dialog open
  useEffect(() => {
    if (open) {
      setLoading(true);
      try {
        const savedCalcs = loadSavedCalculations('schedule-of-loads');
        
        if (savedCalcs && savedCalcs.length > 0) {
          // Extract LoadSchedule data from saved calculations
          const panelData = savedCalcs.map((calc: any) => calc.data as LoadSchedule)
            .filter(Boolean); // Filter out undefined or null values
          
          setPanels(panelData);
          setSelectedPanel(null);
        } else {
          setPanels([]);
          setError('No saved Schedule of Loads calculations found.');
        }
      } catch (err) {
        console.error('Error loading saved calculations:', err);
        setError('Failed to load saved Schedule of Loads calculations.');
      } finally {
        setLoading(false);
      }
    }
  }, [open]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle searching
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  // Filter panels based on search term
  const filteredPanels = panels.filter(panel => 
    panel.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    panel.panelName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle selecting a panel
  const handleSelectPanel = (panel: LoadSchedule) => {
    setSelectedPanel(panel);
    setTabValue(1); // Switch to circuit tab
  };
  
  // Handle loading a panel as a feeder circuit
  const handleLoadPanel = () => {
    if (!selectedPanel) return;
    
    const circuitData = loadScheduleToUnifiedCircuit(selectedPanel);
    onLoadCircuit(circuitData);
  };
  
  // Handle loading a specific load item as a branch circuit
  const handleLoadCircuit = (loadItem: LoadItem) => {
    if (!selectedPanel) return;
    
    const circuitData = loadItemToUnifiedCircuit(
      loadItem, 
      selectedPanel.voltage, 
      selectedPanel.powerFactor
    );
    onLoadCircuit(circuitData);
  };
  
  const renderPanelList = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert severity="info" sx={{ my: 2 }}>
          {error}
        </Alert>
      );
    }
    
    if (filteredPanels.length === 0) {
      return (
        <Alert severity="info" sx={{ my: 2 }}>
          No panels found matching your search criteria.
        </Alert>
      );
    }
    
    return (
      <List>
        {filteredPanels.map((panel) => (
          <React.Fragment key={panel.id}>
            <ListItem 
              button 
              onClick={() => handleSelectPanel(panel)}
              selected={selectedPanel?.id === panel.id}
            >
              <ListItemText
                primary={panel.panelName}
                secondary={
                  <>
                    <Typography variant="body2" component="span">
                      {panel.name}
                    </Typography>
                    <br />
                    <Typography variant="body2" component="span" color="text.secondary">
                      {panel.loads.length} loads, {panel.voltage}V, {panel.totalDemandLoad.toFixed(2)}W
                    </Typography>
                  </>
                }
              />
              <Chip 
                label={`${panel.current.toFixed(2)}A`}
                color="primary"
                variant="outlined"
                size="small"
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    );
  };
  
  const renderCircuitList = () => {
    if (!selectedPanel) {
      return (
        <Alert severity="info" sx={{ my: 2 }}>
          Select a panel first to view its circuits.
        </Alert>
      );
    }
    
    if (selectedPanel.loads.length === 0) {
      return (
        <Alert severity="info" sx={{ my: 2 }}>
          This panel has no load items.
        </Alert>
      );
    }
    
    // Filter circuits by search term if on the circuit tab
    const filteredCircuits = tabValue === 1 && searchTerm
      ? selectedPanel.loads.filter(load => 
          load.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : selectedPanel.loads;
    
    return (
      <>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">
            Panel: {selectedPanel.panelName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedPanel.voltage}V, {selectedPanel.totalDemandLoad.toFixed(2)}W, {selectedPanel.current.toFixed(2)}A
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleLoadPanel}
            sx={{ mt: 1 }}
            fullWidth
          >
            Load Panel as Feeder Circuit
          </Button>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <List>
          {filteredCircuits.map((circuit) => (
            <React.Fragment key={circuit.id}>
              <ListItem button onClick={() => handleLoadCircuit(circuit)}>
                <ListItemText
                  primary={circuit.description}
                  secondary={
                    <>
                      <Typography variant="body2" component="span">
                        {circuit.rating}W × {circuit.quantity} units
                      </Typography>
                      <br />
                      <Typography variant="body2" component="span" color="text.secondary">
                        {circuit.connectedLoad.toFixed(2)}W, {circuit.current?.toFixed(2) || 'N/A'}A
                      </Typography>
                    </>
                  }
                />
                {circuit.conductorSize && (
                  <Chip 
                    label={circuit.conductorSize}
                    color="secondary"
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                )}
                <Chip 
                  label={`${circuit.demandLoad.toFixed(2)}W`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </>
    );
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Load Circuit from Schedule of Loads</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search panels or circuits..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <InputAdornment position="end">
                  <IconButton 
                    size="small" 
                    onClick={() => setSearchTerm('')}
                    edge="end"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
          />
        </Box>
        
        <Paper variant="outlined">
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
          >
            <Tab label="Panels" />
            <Tab label="Circuits" disabled={!selectedPanel} />
          </Tabs>
          
          <TabPanel value={tabValue} index={0}>
            {renderPanelList()}
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            {renderCircuitList()}
          </TabPanel>
        </Paper>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoadCircuitDialog; 