import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  TextField,
  MenuItem,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  Switch,
  Alert,
  Chip,
  Tooltip,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  SelectChangeEvent
} from '@mui/material';

import {
  AddAPhoto as CameraIcon,
  MyLocation as LocationIcon,
  Save as SaveIcon,
  CloudUpload as UploadIcon,
  CloudOff as OfflineIcon,
  CloudDone as OnlineIcon,
  DeviceHub as DeviceIcon,
  AddBox as AddIcon,
  Send as SendIcon,
  Room as MapPinIcon,
  Sync as SyncIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  Check as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

// Mock data structure
interface FieldData {
  id: string;
  timestamp: string;
  equipmentId: string;
  equipmentType: string;
  measurementType: string;
  value: number;
  unit: string;
  notes: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null;
  images: Array<{
    id: string;
    url: string;
    thumbnail: string;
    timestamp: string;
  }>;
  synced: boolean;
}

// Mock list of equipment
const equipmentOptions = [
  { id: 'hvac-001', name: 'Air Handling Unit 1', type: 'HVAC' },
  { id: 'hvac-002', name: 'Chiller System', type: 'HVAC' },
  { id: 'light-001', name: 'Lighting Control System', type: 'Lighting' },
  { id: 'pump-001', name: 'Primary Pump P-1', type: 'Pumping' },
  { id: 'motor-001', name: 'Electric Motor M-1', type: 'Motor' },
  { id: 'meter-001', name: 'Main Electric Meter', type: 'Meter' }
];

// Mock measurement types
const measurementTypes = [
  { value: 'temperature', label: 'Temperature', units: ['°C', '°F'] },
  { value: 'pressure', label: 'Pressure', units: ['kPa', 'psi', 'bar'] },
  { value: 'flow', label: 'Flow Rate', units: ['m³/h', 'L/s', 'gpm'] },
  { value: 'power', label: 'Power', units: ['kW', 'W', 'hp'] },
  { value: 'current', label: 'Current', units: ['A'] },
  { value: 'voltage', label: 'Voltage', units: ['V'] },
  { value: 'energy', label: 'Energy', units: ['kWh', 'MWh'] },
  { value: 'humidity', label: 'Humidity', units: ['%RH'] }
];

interface MobileDataCollectionProps {
  auditId?: string;
  onDataCollected?: (data: FieldData) => void;
}

const MobileDataCollection: React.FC<MobileDataCollectionProps> = ({
  auditId,
  onDataCollected
}) => {
  const theme = useTheme();
  
  // State for network status
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  
  // State for current form
  const [currentData, setCurrentData] = useState<Partial<FieldData>>({
    equipmentId: '',
    equipmentType: '',
    measurementType: '',
    value: 0,
    unit: '',
    notes: '',
    location: null,
    images: []
  });
  
  // State for saved data entries (would be stored in IndexedDB in a real app)
  const [savedEntries, setSavedEntries] = useState<FieldData[]>([]);
  const [pendingSync, setPendingSync] = useState<FieldData[]>([]);
  
  // UI states
  const [isCapturingImage, setIsCapturingImage] = useState(false);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Load saved entries from local storage (simulating IndexedDB)
  useEffect(() => {
    const loadSavedEntries = () => {
      const entriesFromStorage = localStorage.getItem('fieldDataEntries');
      if (entriesFromStorage) {
        setSavedEntries(JSON.parse(entriesFromStorage));
      }
      
      const pendingFromStorage = localStorage.getItem('pendingSyncEntries');
      if (pendingFromStorage) {
        setPendingSync(JSON.parse(pendingFromStorage));
      }
      
      const lastSync = localStorage.getItem('lastFieldDataSync');
      if (lastSync) {
        setLastSyncTime(lastSync);
      }
    };
    
    loadSavedEntries();
  }, []);
  
  // Save entries to local storage when they change
  useEffect(() => {
    if (savedEntries.length > 0) {
      localStorage.setItem('fieldDataEntries', JSON.stringify(savedEntries));
    }
    
    if (pendingSync.length > 0) {
      localStorage.setItem('pendingSyncEntries', JSON.stringify(pendingSync));
    }
  }, [savedEntries, pendingSync]);
  
  // Get location data
  const captureLocation = () => {
    setIsCapturingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentData({
            ...currentData,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            }
          });
          setIsCapturingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsCapturingLocation(false);
          // In a real app, show a proper error message
          alert('Could not get your location. Please check permissions.');
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      setIsCapturingLocation(false);
      alert('Geolocation is not supported by this browser.');
    }
  };
  
  // Simulate image capture (in a real app, this would use the device camera)
  const captureImage = () => {
    setIsCapturingImage(true);
    
    // Simulate delay for camera operation
    setTimeout(() => {
      // Generate a random "captured" image (in reality this would be from camera)
      const imageId = `img-${Date.now()}`;
      const imageUrl = `https://source.unsplash.com/random/800x600?equipment&_=${Date.now()}`;
      
      setCurrentData({
        ...currentData,
        images: [
          ...(currentData.images || []),
          {
            id: imageId,
            url: imageUrl,
            thumbnail: imageUrl,
            timestamp: new Date().toISOString()
          }
        ]
      });
      
      setIsCapturingImage(false);
    }, 1500);
  };
  
  // Remove image
  const removeImage = (imageId: string) => {
    setCurrentData({
      ...currentData,
      images: (currentData.images || []).filter(img => img.id !== imageId)
    });
  };
  
  // Handle equipment selection
  const handleEquipmentChange = (event: SelectChangeEvent) => {
    const equipmentId = event.target.value;
    const selectedEquipment = equipmentOptions.find(eq => eq.id === equipmentId);
    
    setCurrentData({
      ...currentData,
      equipmentId,
      equipmentType: selectedEquipment?.type || ''
    });
  };
  
  // Handle measurement type selection
  const handleMeasurementTypeChange = (event: SelectChangeEvent) => {
    const measurementType = event.target.value;
    const selectedMeasurement = measurementTypes.find(m => m.value === measurementType);
    
    setCurrentData({
      ...currentData,
      measurementType,
      unit: selectedMeasurement?.units[0] || ''
    });
  };
  
  // Get available units for selected measurement type
  const getAvailableUnits = () => {
    const selectedMeasurement = measurementTypes.find(m => m.value === currentData.measurementType);
    return selectedMeasurement?.units || [];
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!currentData.equipmentId) {
      errors.equipmentId = 'Equipment is required';
    }
    
    if (!currentData.measurementType) {
      errors.measurementType = 'Measurement type is required';
    }
    
    if (currentData.value === undefined || currentData.value === null) {
      errors.value = 'Value is required';
    }
    
    if (!currentData.unit) {
      errors.unit = 'Unit is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Save data entry
  const saveDataEntry = () => {
    if (!validateForm()) {
      return;
    }
    
    const newEntry: FieldData = {
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      equipmentId: currentData.equipmentId || '',
      equipmentType: currentData.equipmentType || '',
      measurementType: currentData.measurementType || '',
      value: currentData.value || 0,
      unit: currentData.unit || '',
      notes: currentData.notes || '',
      location: currentData.location || null,
      images: currentData.images || [],
      synced: false
    };
    
    // Add to saved entries
    setSavedEntries([newEntry, ...savedEntries]);
    
    // Add to pending sync if offline
    if (!isOnline) {
      setPendingSync([...pendingSync, newEntry]);
    } else {
      // If online, simulate immediate sync
      syncEntry(newEntry);
    }
    
    // Reset form
    setCurrentData({
      equipmentId: '',
      equipmentType: '',
      measurementType: '',
      value: 0,
      unit: '',
      notes: '',
      location: null,
      images: []
    });
    
    // Show success message
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    
    // Call the callback if provided
    if (onDataCollected) {
      onDataCollected(newEntry);
    }
  };
  
  // Sync a single entry
  const syncEntry = (entry: FieldData) => {
    // In a real app, this would send data to the server
    console.log('Syncing entry:', entry);
    
    // Simulate successful sync
    setTimeout(() => {
      // Update the entry as synced
      setSavedEntries(prevEntries => 
        prevEntries.map(e => 
          e.id === entry.id ? { ...e, synced: true } : e
        )
      );
      
      // Remove from pending sync
      setPendingSync(prevPending => 
        prevPending.filter(p => p.id !== entry.id)
      );
    }, 1000);
  };
  
  // Sync all pending entries
  const syncAllPending = () => {
    if (pendingSync.length === 0) return;
    
    setIsSyncing(true);
    
    // Simulate API call to sync all pending entries
    setTimeout(() => {
      // Mark all as synced
      setSavedEntries(prevEntries => 
        prevEntries.map(entry => ({
          ...entry,
          synced: true
        }))
      );
      
      // Clear pending sync
      setPendingSync([]);
      
      // Update last sync time
      const now = new Date().toISOString();
      setLastSyncTime(now);
      localStorage.setItem('lastFieldDataSync', now);
      
      setIsSyncing(false);
    }, 2000);
  };
  
  // Get equipment name from ID
  const getEquipmentName = (id: string): string => {
    return equipmentOptions.find(eq => eq.id === id)?.name || id;
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp: string): string => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch (e) {
      return timestamp;
    }
  };
  
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold">Mobile Field Data Collection</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip 
            icon={isOnline ? <OnlineIcon /> : <OfflineIcon />}
            label={isOnline ? 'Online' : 'Offline Mode'}
            color={isOnline ? 'success' : 'warning'}
            variant="outlined"
          />
          {pendingSync.length > 0 && (
            <Button 
              variant="outlined" 
              color="primary"
              startIcon={isSyncing ? <CircularProgress size={20} /> : <SyncIcon />}
              onClick={syncAllPending}
              disabled={!isOnline || isSyncing}
            >
              Sync {pendingSync.length} {pendingSync.length === 1 ? 'Entry' : 'Entries'}
            </Button>
          )}
        </Box>
      </Box>
      
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Data entry saved successfully{!isOnline ? ' (will sync when online)' : ''}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: { xs: 3, md: 0 } }}>
            <Typography variant="h6" gutterBottom>
              Collect New Data
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!validationErrors.equipmentId}>
                  <InputLabel>Equipment</InputLabel>
                  <Select
                    value={currentData.equipmentId || ''}
                    label="Equipment"
                    onChange={handleEquipmentChange}
                  >
                    {equipmentOptions.map(option => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.name} ({option.type})
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.equipmentId && (
                    <Typography color="error" variant="caption">
                      {validationErrors.equipmentId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!validationErrors.measurementType}>
                  <InputLabel>Measurement Type</InputLabel>
                  <Select
                    value={currentData.measurementType || ''}
                    label="Measurement Type"
                    onChange={handleMeasurementTypeChange}
                  >
                    {measurementTypes.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.measurementType && (
                    <Typography color="error" variant="caption">
                      {validationErrors.measurementType}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!validationErrors.unit}>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    value={currentData.unit || ''}
                    label="Unit"
                    onChange={(e) => setCurrentData({...currentData, unit: e.target.value as string})}
                    disabled={!currentData.measurementType}
                  >
                    {getAvailableUnits().map(unit => (
                      <MenuItem key={unit} value={unit}>
                        {unit}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.unit && (
                    <Typography color="error" variant="caption">
                      {validationErrors.unit}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Value"
                  type="number"
                  value={currentData.value || ''}
                  onChange={(e) => setCurrentData({...currentData, value: parseFloat(e.target.value) || 0})}
                  error={!!validationErrors.value}
                  helperText={validationErrors.value}
                  InputProps={{
                    endAdornment: currentData.unit ? (
                      <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                        {currentData.unit}
                      </Typography>
                    ) : null
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={currentData.notes || ''}
                  onChange={(e) => setCurrentData({...currentData, notes: e.target.value})}
                  placeholder="Enter any additional observations or notes"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={isCapturingLocation ? <CircularProgress size={20} /> : <LocationIcon />}
                    onClick={captureLocation}
                    disabled={isCapturingLocation}
                  >
                    {currentData.location ? 'Update Location' : 'Capture Location'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={isCapturingImage ? <CircularProgress size={20} /> : <CameraIcon />}
                    onClick={captureImage}
                    disabled={isCapturingImage}
                  >
                    Add Image
                  </Button>
                </Box>
                
                {currentData.location && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Location captured: {currentData.location.latitude.toFixed(6)}, {currentData.location.longitude.toFixed(6)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Accuracy: ±{currentData.location.accuracy.toFixed(1)}m
                    </Typography>
                  </Alert>
                )}
                
                {currentData.images && currentData.images.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Attached Images ({currentData.images.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {currentData.images.map(image => (
                        <Box 
                          key={image.id} 
                          sx={{ 
                            position: 'relative', 
                            width: 80, 
                            height: 80,
                            borderRadius: 1,
                            overflow: 'hidden',
                            boxShadow: 1
                          }}
                        >
                          <img 
                            src={image.thumbnail} 
                            alt="Equipment" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              bgcolor: 'rgba(0,0,0,0.5)',
                              color: 'white',
                              '&:hover': {
                                bgcolor: 'rgba(255,0,0,0.7)',
                              }
                            }}
                            onClick={() => removeImage(image.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<SaveIcon />}
                  onClick={saveDataEntry}
                >
                  Save Data Entry
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Recent Entries</Typography>
              <Box>
                {lastSyncTime && (
                  <Typography variant="caption" color="text.secondary">
                    Last synced: {formatTimestamp(lastSyncTime)}
                  </Typography>
                )}
              </Box>
            </Box>
            
            {savedEntries.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
                <DeviceIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography color="text.secondary">
                  No data entries yet. Use the form to collect equipment data.
                </Typography>
              </Box>
            ) : (
              <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                {savedEntries.map((entry) => (
                  <Box key={entry.id} sx={{ mb: 2 }}>
                    <ListItem
                      sx={{ 
                        bgcolor: 'background.default', 
                        borderRadius: 1,
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: 4,
                          bgcolor: entry.synced ? 'success.main' : 'warning.main'
                        }
                      }}
                    >
                      <ListItemIcon>
                        {entry.equipmentType === 'HVAC' ? <DeviceIcon /> : 
                         entry.equipmentType === 'Lighting' ? <CameraIcon /> :
                         <DeviceIcon />}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2">
                              {getEquipmentName(entry.equipmentId)}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {entry.location && <LocationIcon fontSize="small" color="info" />}
                              {entry.images.length > 0 && <ImageIcon fontSize="small" color="info" />}
                              <Chip 
                                size="small" 
                                label={entry.synced ? 'Synced' : 'Pending'}
                                color={entry.synced ? 'success' : 'warning'}
                                icon={entry.synced ? <CheckIcon /> : <SyncIcon />}
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        }
                        secondary={
                          <>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2" component="span">
                                {entry.measurementType}: <strong>{entry.value} {entry.unit}</strong>
                              </Typography>
                              <Typography variant="caption" color="text.secondary" component="span">
                                {formatTimestamp(entry.timestamp)}
                              </Typography>
                            </Box>
                            {entry.notes && (
                              <Typography variant="caption" color="text.secondary" component="div">
                                {entry.notes}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  </Box>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MobileDataCollection; 