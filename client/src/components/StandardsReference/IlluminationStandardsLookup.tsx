import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Link
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import StandardsService from '../../services/StandardsService';

interface IlluminationRequirement {
  roomType: string;
  requiredIlluminance: number;
  notes: string;
  tableNumber: string;
  tableTitle: string;
  standard: string;
  standardFullName: string;
}

interface IlluminationStandardsLookupProps {
  onSelectRequirement?: (requirement: IlluminationRequirement) => void;
}

const IlluminationStandardsLookup: React.FC<IlluminationStandardsLookupProps> = ({ 
  onSelectRequirement 
}) => {
  const [roomType, setRoomType] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [requirement, setRequirement] = useState<IlluminationRequirement | null>(null);

  // List of common room types for quick selection
  const commonRoomTypes = [
    'Classroom',
    'Office',
    'Corridor',
    'Laboratory',
    'Library',
    'Auditorium',
    'Conference Room',
    'Gymnasium',
    'Cafeteria'
  ];

  const handleSearch = async () => {
    if (!roomType.trim()) {
      setError('Please enter a room type to search');
      return;
    }

    setLoading(true);
    setError(null);
    setRequirement(null);

    try {
      const result = await StandardsService.getIlluminationRequirement(roomType);
      setRequirement(result);
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        setError(`No illumination standards found for "${roomType}". Try a different room type or check spelling.`);
      } else {
        setError('An error occurred while searching. Please try again.');
        console.error('Lookup error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRequirementSelect = () => {
    if (requirement && onSelectRequirement) {
      onSelectRequirement(requirement);
    }
  };

  const handleRoomTypeChipClick = (type: string) => {
    setRoomType(type);
    // Optional: Auto-search when selecting a room type chip
    setTimeout(() => {
      StandardsService.getIlluminationRequirement(type)
        .then(result => {
          setRequirement(result);
          setError(null);
        })
        .catch(err => {
          if (err.response && err.response.status === 404) {
            setError(`No illumination standards found for "${type}".`);
          } else {
            setError('An error occurred while searching. Please try again.');
          }
        });
    }, 0);
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          PEC Rule 1075 Illumination Standards Lookup
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Look up required illumination levels for different room types based on the Philippine Electrical Code (PEC) Rule 1075.
        </Typography>
        
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            fullWidth
            label="Room Type"
            variant="outlined"
            size="small"
            placeholder="e.g., Classroom, Office, Laboratory"
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button 
            variant="contained" 
            onClick={handleSearch}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Common room types:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {commonRoomTypes.map((type) => (
              <Chip 
                key={type} 
                label={type} 
                onClick={() => handleRoomTypeChipClick(type)} 
                color={roomType === type ? 'primary' : 'default'}
                size="small"
              />
            ))}
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {requirement && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              {requirement.roomType}
            </Typography>
            
            <List dense disablePadding>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemText 
                  primary={`Required Illuminance: ${requirement.requiredIlluminance} lux`}
                  secondary={`Standard: ${requirement.standard} (${requirement.standardFullName})`}
                />
              </ListItem>
              
              {requirement.notes && (
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemText 
                    primary="Notes"
                    secondary={requirement.notes}
                  />
                </ListItem>
              )}
              
              <ListItem disablePadding>
                <ListItemText 
                  primary={`Reference: ${requirement.tableNumber} - ${requirement.tableTitle}`}
                  secondary={
                    <Link 
                      component="button"
                      variant="body2"
                      onClick={() => window.open('/system-tools/standards-reference')}
                    >
                      View in Standards Reference System
                    </Link>
                  }
                />
              </ListItem>
            </List>
            
            {onSelectRequirement && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={handleRequirementSelect}
                >
                  Use This Standard
                </Button>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default IlluminationStandardsLookup; 