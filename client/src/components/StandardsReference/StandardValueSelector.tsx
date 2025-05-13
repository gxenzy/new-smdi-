import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  FormHelperText,
  Grid,
  Paper,
  Tooltip,
  CircularProgress,
  Alert,
  Divider,
  Link
} from '@mui/material';
import {
  LibraryBooks as StandardIcon,
  InfoOutlined as InfoIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import axios from 'axios';

interface StandardValue {
  id: string;
  value: number | string;
  unit?: string;
  description?: string;
  source: string;
  reference?: string;
}

interface StandardCategory {
  id: string;
  name: string;
  values: StandardValue[];
}

interface StandardValueSelectorProps {
  type: 'illumination' | 'power-factor' | 'harmonic-distortion' | 'voltage-drop' | 'conductor-sizing' | 'custom';
  customEndpoint?: string;
  label: string;
  helperText?: string;
  onValueSelect: (value: StandardValue) => void;
  defaultCategory?: string;
  defaultValue?: string;
}

const StandardValueSelector: React.FC<StandardValueSelectorProps> = ({
  type,
  customEndpoint,
  label,
  helperText,
  onValueSelect,
  defaultCategory,
  defaultValue
}) => {
  const [categories, setCategories] = useState<StandardCategory[]>([]);
  const [values, setValues] = useState<StandardValue[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory || '');
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [standardInfo, setStandardInfo] = useState<string | null>(null);

  // Fetch categories based on type
  useEffect(() => {
    fetchCategories();
  }, [type, customEndpoint]);

  // Fetch values when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchValues(selectedCategory);
    } else {
      setValues([]);
    }
  }, [selectedCategory]);

  // Fetch categories from API
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let endpoint;
      
      switch (type) {
        case 'illumination':
          endpoint = '/api/standards-api/lookup/illumination/categories';
          break;
        case 'power-factor':
          endpoint = '/api/standards-api/lookup/power-factor/categories';
          break;
        case 'harmonic-distortion':
          endpoint = '/api/standards-api/lookup/harmonic-distortion/categories';
          break;
        case 'voltage-drop':
          endpoint = '/api/standards-api/lookup/voltage-drop/categories';
          break;
        case 'conductor-sizing':
          endpoint = '/api/standards-api/lookup/conductor-sizing/categories';
          break;
        case 'custom':
          if (!customEndpoint) {
            throw new Error('Custom endpoint is required for type "custom"');
          }
          endpoint = customEndpoint;
          break;
        default:
          throw new Error(`Unsupported standard type: ${type}`);
      }
      
      // For the demo, we'll simulate an API response for illumination
      if (type === 'illumination') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockCategories: StandardCategory[] = [
          { 
            id: 'offices', 
            name: 'Offices & Administrative Spaces',
            values: []
          },
          { 
            id: 'educational', 
            name: 'Educational Facilities',
            values: []
          },
          { 
            id: 'industrial', 
            name: 'Industrial Areas',
            values: []
          },
          { 
            id: 'commercial', 
            name: 'Commercial & Retail',
            values: []
          },
          { 
            id: 'healthcare', 
            name: 'Healthcare Facilities',
            values: []
          }
        ];
        
        setCategories(mockCategories);
        setStandardInfo('PEC 2017 Rule 1075 - Illumination Requirements');
      } else {
        // For actual API implementation:
        // const response = await axios.get(endpoint);
        // setCategories(response.data);
        
        // For demo purposes, provide some mock data for other types
        const mockCategories: StandardCategory[] = [
          { id: 'category1', name: 'Category 1', values: [] },
          { id: 'category2', name: 'Category 2', values: [] },
          { id: 'category3', name: 'Category 3', values: [] }
        ];
        
        setCategories(mockCategories);
        
        switch (type) {
          case 'power-factor':
            setStandardInfo('PEC 2017 Section 4.30 - Power Factor Requirements');
            break;
          case 'harmonic-distortion':
            setStandardInfo('IEEE 519-2014 - Harmonic Distortion Limits');
            break;
          default:
            setStandardInfo(null);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load standard categories');
    } finally {
      setLoading(false);
    }
  };

  // Fetch values for a category
  const fetchValues = async (categoryId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // For the demo, we'll simulate an API response for illumination
      if (type === 'illumination') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        let mockValues: StandardValue[] = [];
        
        if (categoryId === 'offices') {
          mockValues = [
            { 
              id: 'office_general', 
              value: 500, 
              unit: 'lux',
              description: 'General office areas, typing, writing, reading, data processing',
              source: 'PEC 2017',
              reference: 'Rule 1075, Table 1075.1'
            },
            { 
              id: 'office_filing', 
              value: 300, 
              unit: 'lux',
              description: 'Filing, copying, circulation, etc.',
              source: 'PEC 2017',
              reference: 'Rule 1075, Table 1075.1'
            },
            { 
              id: 'office_conference', 
              value: 500, 
              unit: 'lux',
              description: 'Conference and meeting rooms',
              source: 'PEC 2017',
              reference: 'Rule 1075, Table 1075.1'
            },
            { 
              id: 'office_reception', 
              value: 300, 
              unit: 'lux',
              description: 'Reception areas',
              source: 'PEC 2017',
              reference: 'Rule 1075, Table 1075.1'
            }
          ];
        } else if (categoryId === 'educational') {
          mockValues = [
            { 
              id: 'classroom_general', 
              value: 500, 
              unit: 'lux',
              description: 'Classrooms, tutorial rooms',
              source: 'PEC 2017',
              reference: 'Rule 1075, Table 1075.1'
            },
            { 
              id: 'classroom_evening', 
              value: 750, 
              unit: 'lux',
              description: 'Evening classes and adult education',
              source: 'PEC 2017',
              reference: 'Rule 1075, Table 1075.1'
            },
            { 
              id: 'lecture_hall', 
              value: 500, 
              unit: 'lux',
              description: 'Lecture halls',
              source: 'PEC 2017',
              reference: 'Rule 1075, Table 1075.1'
            },
            { 
              id: 'art_rooms', 
              value: 750, 
              unit: 'lux',
              description: 'Art rooms, studios',
              source: 'PEC 2017',
              reference: 'Rule 1075, Table 1075.1'
            },
            { 
              id: 'technical_drawing', 
              value: 750, 
              unit: 'lux',
              description: 'Technical drawing rooms',
              source: 'PEC 2017',
              reference: 'Rule 1075, Table 1075.1'
            },
            { 
              id: 'laboratory', 
              value: 500, 
              unit: 'lux',
              description: 'Science laboratories',
              source: 'PEC 2017',
              reference: 'Rule 1075, Table 1075.1'
            },
            { 
              id: 'library', 
              value: 500, 
              unit: 'lux',
              description: 'Libraries',
              source: 'PEC 2017',
              reference: 'Rule 1075, Table 1075.1'
            }
          ];
        } else if (categoryId === 'industrial') {
          mockValues = [
            { 
              id: 'assembly_simple', 
              value: 300, 
              unit: 'lux',
              description: 'Work necessitating limited perception of detail',
              source: 'PEC 2017',
              reference: 'Rule 1075, Table 1075.1'
            },
            { 
              id: 'assembly_medium', 
              value: 500, 
              unit: 'lux',
              description: 'Work necessitating perception of detail',
              source: 'PEC 2017',
              reference: 'Rule 1075, Table 1075.1'
            },
            { 
              id: 'assembly_fine', 
              value: 750, 
              unit: 'lux',
              description: 'Work necessitating perception of fine detail',
              source: 'PEC 2017',
              reference: 'Rule 1075, Table 1075.1'
            },
            { 
              id: 'precision_work', 
              value: 1000, 
              unit: 'lux',
              description: 'Precision work, inspection of fine detail',
              source: 'PEC 2017',
              reference: 'Rule 1075, Table 1075.1'
            }
          ];
        }
        
        setValues(mockValues);
      } else {
        // For actual API implementation:
        // const response = await axios.get(`/api/standards-api/lookup/${type}/values?category=${categoryId}`);
        // setValues(response.data);
        
        // For demo purposes, provide mock data for other types
        const mockValues: StandardValue[] = [
          { 
            id: 'value1', 
            value: '0.85', 
            description: 'Minimum power factor for installations above 5 kW',
            source: 'PEC 2017',
            reference: 'Section 4.30'
          },
          { 
            id: 'value2', 
            value: '0.90', 
            description: 'Recommended power factor for optimal performance',
            source: 'PEC 2017',
            reference: 'Section 4.30'
          },
          { 
            id: 'value3', 
            value: '0.95', 
            description: 'Best practice power factor for energy efficiency',
            source: 'PEC 2017',
            reference: 'Section 4.30'
          }
        ];
        
        setValues(mockValues);
      }
    } catch (error) {
      console.error('Error fetching values:', error);
      setError('Failed to load standard values');
    } finally {
      setLoading(false);
    }
  };

  // Handle category selection
  const handleCategoryChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string;
    setSelectedCategory(value);
    setSelectedValue('');
  };

  // Handle value selection
  const handleValueChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const valueId = event.target.value as string;
    setSelectedValue(valueId);
    
    if (valueId) {
      const selectedStandardValue = values.find(value => value.id === valueId);
      if (selectedStandardValue && onValueSelect) {
        onValueSelect(selectedStandardValue);
      }
    }
  };

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <StandardIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="subtitle1">
          {label}
        </Typography>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {standardInfo && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <InfoIcon fontSize="small" color="info" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Reference: {standardInfo}
          </Typography>
        </Box>
      )}
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth size="small">
            <InputLabel id="standard-category-label">Category</InputLabel>
            <Select
              labelId="standard-category-label"
              id="standard-category"
              value={selectedCategory}
              label="Category"
              onChange={handleCategoryChange as any}
              disabled={loading || categories.length === 0}
            >
              {categories.map(category => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth size="small">
            <InputLabel id="standard-value-label">Standard Value</InputLabel>
            <Select
              labelId="standard-value-label"
              id="standard-value"
              value={selectedValue}
              label="Standard Value"
              onChange={handleValueChange as any}
              disabled={loading || values.length === 0 || !selectedCategory}
            >
              {values.map(value => (
                <MenuItem key={value.id} value={value.id}>
                  {value.value} {value.unit && `${value.unit}`} - {value.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      
      {selectedValue && values.length > 0 && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          {values.filter(v => v.id === selectedValue).map(value => (
            <Box key={value.id}>
              <Typography variant="subtitle2">
                Selected Standard: {value.value} {value.unit}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {value.description}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Source: {value.source} {value.reference && `(${value.reference})`}
              </Typography>
              <Button 
                size="small" 
                startIcon={<SchoolIcon />}
                sx={{ mt: 1 }}
                component={Link}
                href="/energy-audit/standards-reference"
                target="_blank"
              >
                View in Standards Reference
              </Button>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default StandardValueSelector; 
 
 