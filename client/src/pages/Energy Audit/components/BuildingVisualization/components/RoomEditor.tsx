import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Divider,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Slider,
  Tooltip,
  Paper,
  FormControlLabel,
  Switch,
  SelectChangeEvent
} from '@mui/material';
import {
  Save,
  Cancel,
  Delete,
  ColorLens,
  FormatSize,
  Straighten,
  SquareFoot,
  LightbulbOutlined,
  GridOn,
  Visibility,
  Calculate
} from '@mui/icons-material';
import { RoomDetail } from '../interfaces';

interface RoomEditorProps {
  open: boolean;
  room: RoomDetail | null;
  onClose: () => void;
  onSave: (room: RoomDetail) => void;
  onDelete?: (roomId: string) => void;
  isNewRoom?: boolean;
}

// Define available room types
const ROOM_TYPES = [
  'office',
  'classroom',
  'laboratory',
  'restroom',
  'kitchen',
  'storage',
  'electrical',
  'hallway',
  'server',
  'conference',
  'reception',
  'lobby',
  'stairs',
  'other'
];

// Standard lighting requirements in lux per room type
const LIGHTING_REQUIREMENTS: { [key: string]: number } = {
  'office': 500,
  'classroom': 500,
  'laboratory': 750,
  'restroom': 150,
  'kitchen': 500,
  'storage': 150,
  'electrical': 300,
  'hallway': 150,
  'server': 400,
  'conference': 400,
  'reception': 300,
  'lobby': 200,
  'stairs': 200,
  'other': 300
};

// Room colors based on type
const ROOM_COLORS: { [key: string]: string } = {
  'office': '#4CAF50',      // Green
  'classroom': '#2196F3',   // Blue
  'laboratory': '#F44336',  // Red
  'restroom': '#9C27B0',    // Purple
  'kitchen': '#FF9800',     // Orange
  'storage': '#795548',     // Brown
  'electrical': '#F44336',  // Red
  'hallway': '#607D8B',     // Blue Grey
  'server': '#E91E63',      // Pink
  'conference': '#3F51B5',  // Indigo
  'reception': '#8BC34A',   // Light Green
  'lobby': '#3F51B5',       // Indigo
  'stairs': '#607D8B',      // Blue Grey
  'other': '#9E9E9E'        // Grey
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab panel component for organizing the editor
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`room-editor-tabpanel-${index}`}
      aria-labelledby={`room-editor-tab-${index}`}
      {...other}
      style={{ padding: '16px 0' }}
    >
      {value === index && (
        <Box>{children}</Box>
      )}
    </div>
  );
}

/**
 * Room editor component with comprehensive editing capabilities
 */
const RoomEditor: React.FC<RoomEditorProps> = ({
  open,
  room,
  onClose,
  onSave,
  onDelete,
  isNewRoom = false
}) => {
  // Room data state
  const [formData, setFormData] = useState<RoomDetail | null>(null);
  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  
  // Initialize form with room data when opened
  useEffect(() => {
    if (room) {
      setFormData({
        ...room,
        // Set default values for fields that might be undefined
        requiredLux: room.requiredLux || LIGHTING_REQUIREMENTS[room.roomType] || 300,
        actualFixtures: room.actualFixtures || 0,
        reflectanceCeiling: room.reflectanceCeiling || 0.7,
        reflectanceWalls: room.reflectanceWalls || 0.5,
        reflectanceFloor: room.reflectanceFloor || 0.2,
        maintenanceFactor: room.maintenanceFactor || 0.8,
        color: room.color || ROOM_COLORS[room.roomType] || '#9E9E9E'
      });
    } else {
      setFormData(null);
    }
  }, [room]);
  
  if (!formData) {
    return null;
  }
  
  // Update area when dimensions change
  const calculateArea = () => {
    if (formData) {
      const area = formData.length * formData.width;
      setFormData({
        ...formData,
        area
      });
    }
  };
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'name' ? value : Number(value)
    });
  };
  
  // Handle room type selection
  const handleRoomTypeChange = (e: SelectChangeEvent<string>) => {
    const roomType = e.target.value;
    setFormData({
      ...formData,
      roomType,
      requiredLux: LIGHTING_REQUIREMENTS[roomType] || 300,
      color: ROOM_COLORS[roomType] || formData.color || '#9E9E9E'
    });
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Handle sliders and other controlled inputs
  const handleSliderChange = (name: string) => (event: Event, newValue: number | number[]) => {
    setFormData({
      ...formData,
      [name]: newValue
    });
  };
  
  // Handle color change
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      color: e.target.value
    });
  };
  
  // Handle save
  const handleSave = () => {
    if (formData) {
      // Recalculate area to ensure consistency
      const area = formData.length * formData.width;
      
      // Calculate recommended fixtures based on area and required illuminance
      const recommendedFixtures = Math.ceil(area * formData.requiredLux / 5000);
      
      // Calculate compliance based on actual fixtures vs recommended
      const compliance = formData.actualFixtures >= recommendedFixtures 
        ? 100 
        : Math.round((formData.actualFixtures / recommendedFixtures) * 100);
      
      const updatedRoom: RoomDetail = {
        ...formData,
        area,
        recommendedFixtures,
        compliance
      };
      
      onSave(updatedRoom);
    }
  };
  
  // Handle delete
  const handleDelete = () => {
    if (formData && onDelete) {
      onDelete(formData.id);
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
    >
      <DialogTitle>
        {isNewRoom ? 'Add New Room' : `Edit Room: ${formData.name}`}
      </DialogTitle>
      
      <DialogContent dividers>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          aria-label="room editor tabs"
        >
          <Tab label="Basic Info" />
          <Tab label="Dimensions" />
          <Tab label="Lighting" />
          <Tab label="Advanced" />
        </Tabs>
        
        {/* Basic Information Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Room Name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Room Type</InputLabel>
                <Select
                  name="roomType"
                  value={formData.roomType || ''}
                  onChange={handleRoomTypeChange}
                  label="Room Type"
                >
                  {ROOM_TYPES.map(type => (
                    <MenuItem key={type} value={type} sx={{ 
                      borderLeft: `4px solid ${ROOM_COLORS[type] || '#9E9E9E'}`
                    }}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Color"
                name="color"
                type="color"
                value={formData.color || ROOM_COLORS[formData.roomType] || '#9E9E9E'}
                onChange={handleColorChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ColorLens style={{ color: formData.color }} />
                    </InputAdornment>
                  ),
                }}
                helperText="Room display color"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                placeholder="Any additional information about this room"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Room ID: {formData.id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Position: ({formData.coords.x}, {formData.coords.y}) • 
                  Size: {formData.coords.width}px × {formData.coords.height}px
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Dimensions Tab */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Physical Dimensions
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Length"
                name="length"
                type="number"
                value={formData.length || 0}
                onChange={handleChange}
                onBlur={calculateArea}
                InputProps={{
                  endAdornment: <InputAdornment position="end">m</InputAdornment>,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Straighten fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Width"
                name="width"
                type="number"
                value={formData.width || 0}
                onChange={handleChange}
                onBlur={calculateArea}
                InputProps={{
                  endAdornment: <InputAdornment position="end">m</InputAdornment>,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Straighten fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Height"
                name="height"
                type="number"
                value={formData.height || 0}
                onChange={handleChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">m</InputAdornment>,
                  startAdornment: (
                    <InputAdornment position="start">
                      <FormatSize fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Area"
                name="area"
                type="number"
                value={formData.area.toFixed(2) || 0}
                InputProps={{
                  readOnly: true,
                  endAdornment: <InputAdornment position="end">m²</InputAdornment>,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SquareFoot fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                helperText="Automatically calculated from length and width"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Volume"
                type="number"
                value={(formData.area * formData.height).toFixed(2)}
                InputProps={{
                  readOnly: true,
                  endAdornment: <InputAdornment position="end">m³</InputAdornment>,
                }}
                helperText="Automatically calculated from area and height"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Coordinate System
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="X"
                      name="coords.x"
                      type="number"
                      value={formData.coords.x}
                      onChange={(e) => setFormData({
                        ...formData,
                        coords: {
                          ...formData.coords,
                          x: Number(e.target.value)
                        }
                      })}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Y"
                      name="coords.y"
                      type="number"
                      value={formData.coords.y}
                      onChange={(e) => setFormData({
                        ...formData,
                        coords: {
                          ...formData.coords,
                          y: Number(e.target.value)
                        }
                      })}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Width"
                      name="coords.width"
                      type="number"
                      value={formData.coords.width}
                      onChange={(e) => setFormData({
                        ...formData,
                        coords: {
                          ...formData.coords,
                          width: Number(e.target.value)
                        }
                      })}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Height"
                      name="coords.height"
                      type="number"
                      value={formData.coords.height}
                      onChange={(e) => setFormData({
                        ...formData,
                        coords: {
                          ...formData.coords,
                          height: Number(e.target.value)
                        }
                      })}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Lighting Tab */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Lighting Requirements
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Required Illuminance"
                name="requiredLux"
                type="number"
                value={formData.requiredLux || 0}
                onChange={handleChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">lux</InputAdornment>,
                  startAdornment: (
                    <InputAdornment position="start">
                      <LightbulbOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                helperText={`Standard for ${formData.roomType}: ${LIGHTING_REQUIREMENTS[formData.roomType] || 300} lux`}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Recommended Fixtures"
                name="recommendedFixtures"
                type="number"
                value={Math.ceil((formData.area * formData.requiredLux) / 5000) || 0}
                InputProps={{
                  readOnly: true,
                }}
                helperText="Calculated based on area and required illuminance"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Actual Fixtures"
                name="actualFixtures"
                type="number"
                value={formData.actualFixtures || 0}
                onChange={handleChange}
                helperText="Number of light fixtures installed"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <Typography variant="body1" sx={{ flexGrow: 1 }}>
                  Compliance: 
                  <Typography
                    component="span"
                    variant="body1"
                    fontWeight="bold"
                    color={
                      (formData.actualFixtures >= Math.ceil((formData.area * formData.requiredLux) / 5000)) 
                        ? 'success.main' 
                        : (formData.actualFixtures >= Math.ceil((formData.area * formData.requiredLux) / 5000) * 0.7) 
                          ? 'warning.main' 
                          : 'error.main'
                    }
                    sx={{ ml: 1 }}
                  >
                    {formData.actualFixtures >= Math.ceil((formData.area * formData.requiredLux) / 5000) 
                      ? '100%' 
                      : Math.round((formData.actualFixtures / Math.ceil((formData.area * formData.requiredLux) / 5000)) * 100) + '%'}
                  </Typography>
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Surface Reflectance Values
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Typography gutterBottom>Ceiling: {(formData.reflectanceCeiling * 100).toFixed(0)}%</Typography>
              <Slider
                value={formData.reflectanceCeiling}
                onChange={handleSliderChange('reflectanceCeiling')}
                step={0.05}
                marks
                min={0.1}
                max={0.9}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
                aria-labelledby="ceiling-reflectance-slider"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Typography gutterBottom>Walls: {(formData.reflectanceWalls * 100).toFixed(0)}%</Typography>
              <Slider
                value={formData.reflectanceWalls}
                onChange={handleSliderChange('reflectanceWalls')}
                step={0.05}
                marks
                min={0.1}
                max={0.8}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
                aria-labelledby="walls-reflectance-slider"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Typography gutterBottom>Floor: {(formData.reflectanceFloor * 100).toFixed(0)}%</Typography>
              <Slider
                value={formData.reflectanceFloor}
                onChange={handleSliderChange('reflectanceFloor')}
                step={0.05}
                marks
                min={0.05}
                max={0.5}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
                aria-labelledby="floor-reflectance-slider"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography gutterBottom>Maintenance Factor: {(formData.maintenanceFactor * 100).toFixed(0)}%</Typography>
              <Slider
                value={formData.maintenanceFactor}
                onChange={handleSliderChange('maintenanceFactor')}
                step={0.05}
                marks
                min={0.5}
                max={0.95}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
                aria-labelledby="maintenance-factor-slider"
              />
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Advanced Tab */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Advanced Settings
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl component="fieldset" variant="standard">
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.shape === 'polygon'}
                      onChange={(e) => setFormData({
                        ...formData,
                        shape: e.target.checked ? 'polygon' : 'rect'
                      })}
                      name="shape"
                    />
                  }
                  label="Use Polygon Shape (Advanced)"
                />
              </FormControl>
              <Typography variant="caption" color="text.secondary" display="block">
                Enables irregular room shapes beyond rectangular. Requires manual point placement.
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" gutterBottom color="primary">
                Calculation Settings
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Manual Area Override"
                name="manualArea"
                type="number"
                value={formData.manualArea || ''}
                onChange={handleChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">m²</InputAdornment>,
                }}
                helperText="Only if automatic calculation is incorrect"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!formData.manualArea}
                    onChange={(e) => {
                      if (!e.target.checked) {
                        // Remove manual area override
                        const { manualArea, ...rest } = formData;
                        setFormData(rest);
                      }
                    }}
                    name="useManualArea"
                  />
                }
                label="Use Manual Area"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" color="warning.main" gutterBottom>
                  Danger Zone
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={handleDelete}
                  disabled={!onDelete || isNewRoom}
                  sx={{ mt: 1 }}
                >
                  Delete Room
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} startIcon={<Cancel />}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          color="primary" 
          variant="contained"
          startIcon={<Save />}
          disabled={!formData.name || !formData.roomType}
        >
          {isNewRoom ? 'Add Room' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomEditor; 