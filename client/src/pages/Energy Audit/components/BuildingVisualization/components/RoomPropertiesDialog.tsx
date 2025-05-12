import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Slider,
  InputAdornment,
  SelectChangeEvent
} from '@mui/material';
import { RoomDetail } from '../interfaces';

interface RoomPropertiesDialogProps {
  open: boolean;
  room: RoomDetail | null;
  onClose: () => void;
  onSave: (updatedRoom: RoomDetail) => void;
}

const ROOM_TYPES = [
  'office',
  'conference',
  'restroom',
  'kitchen',
  'storage',
  'electrical',
  'hallway',
  'server',
  'classroom',
  'reception',
  'lobby',
  'other'
];

// Standard lighting requirements in lux per room type
const LIGHTING_REQUIREMENTS: { [key: string]: number } = {
  'office': 300,
  'conference': 400,
  'restroom': 150,
  'kitchen': 500,
  'storage': 100,
  'electrical': 200,
  'hallway': 100,
  'server': 300,
  'classroom': 500,
  'reception': 300,
  'lobby': 200,
  'other': 300
};

/**
 * Dialog component for editing room properties
 */
const RoomPropertiesDialog: React.FC<RoomPropertiesDialogProps> = ({
  open,
  room,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<RoomDetail> | null>(null);
  
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
        maintenanceFactor: room.maintenanceFactor || 0.8
      });
    } else {
      setFormData(null);
    }
  }, [room]);
  
  if (!formData || !room) {
    return null;
  }
  
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
      requiredLux: LIGHTING_REQUIREMENTS[roomType] || 300
    });
  };
  
  // Handle reflectance slider changes
  const handleSliderChange = (name: string) => (_: Event, value: number | number[]) => {
    setFormData({
      ...formData,
      [name]: typeof value === 'number' ? value : value[0]
    });
  };
  
  // Calculate area from dimensions
  const calculateArea = () => {
    if (formData.length && formData.width) {
      const area = formData.length * formData.width;
      setFormData({
        ...formData,
        area
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (formData) {
      onSave(formData as RoomDetail);
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Edit Room: {formData.name}
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Basic Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Room Name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Room Type</InputLabel>
              <Select
                name="roomType"
                value={formData.roomType || ''}
                onChange={handleRoomTypeChange}
                label="Room Type"
              >
                {ROOM_TYPES.map(type => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Dimensions */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Room Dimensions
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
                endAdornment: <InputAdornment position="end">m</InputAdornment>
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
                endAdornment: <InputAdornment position="end">m</InputAdornment>
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
                endAdornment: <InputAdornment position="end">m</InputAdornment>
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Area"
              name="area"
              type="number"
              value={formData.area || 0}
              onChange={handleChange}
              InputProps={{
                endAdornment: <InputAdornment position="end">m²</InputAdornment>,
                readOnly: true
              }}
            />
          </Grid>
          
          {/* Lighting Properties */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Lighting Properties
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
                endAdornment: <InputAdornment position="end">lux</InputAdornment>
              }}
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
            />
          </Grid>
          
          {/* Reflectance Values */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Surface Reflectance
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography gutterBottom>
              Ceiling: {(formData.reflectanceCeiling || 0.7) * 100}%
            </Typography>
            <Slider
              value={formData.reflectanceCeiling || 0.7}
              onChange={handleSliderChange('reflectanceCeiling')}
              min={0.1}
              max={0.9}
              step={0.05}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography gutterBottom>
              Walls: {(formData.reflectanceWalls || 0.5) * 100}%
            </Typography>
            <Slider
              value={formData.reflectanceWalls || 0.5}
              onChange={handleSliderChange('reflectanceWalls')}
              min={0.1}
              max={0.9}
              step={0.05}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography gutterBottom>
              Floor: {(formData.reflectanceFloor || 0.2) * 100}%
            </Typography>
            <Slider
              value={formData.reflectanceFloor || 0.2}
              onChange={handleSliderChange('reflectanceFloor')}
              min={0.1}
              max={0.5}
              step={0.05}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography gutterBottom>
              Maintenance Factor: {(formData.maintenanceFactor || 0.8) * 100}%
            </Typography>
            <Slider
              value={formData.maintenanceFactor || 0.8}
              onChange={handleSliderChange('maintenanceFactor')}
              min={0.6}
              max={0.9}
              step={0.05}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
            />
          </Grid>
          
          {/* Notes */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomPropertiesDialog; 