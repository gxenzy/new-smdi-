import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  ArrowForward,
  Person,
  DateRange,
  LocationOn,
  Business,
  CheckBox,
  Build,
  Lightbulb,
  AcUnit,
  DeveloperBoard,
  Camera,
  Save,
  Description
} from '@mui/icons-material';

// Audit steps
const AUDIT_STEPS = [
  {
    label: 'Initial Setup',
    description: 'Set up basic information for the energy audit',
  },
  {
    label: 'Planning & Preparation',
    description: 'Plan the audit activities and prepare necessary resources',
  },
  {
    label: 'Data Collection',
    description: 'Collect energy consumption data and building information',
  },
  {
    label: 'On-site Inspection',
    description: 'Conduct on-site inspection of building systems',
  },
  {
    label: 'Data Analysis',
    description: 'Analyze collected data to identify energy saving opportunities',
  },
  {
    label: 'Findings & Recommendations',
    description: 'Document findings and develop recommendations',
  },
  {
    label: 'Report Generation',
    description: 'Generate the final energy audit report',
  }
];

// Mock building data
const BUILDING_TYPES = [
  'Educational', 'Office', 'Commercial', 'Industrial', 'Residential', 'Healthcare', 'Mixed Use'
];

// Mock audit team roles
const TEAM_ROLES = [
  'Audit Lead', 'Electrical Engineer', 'Mechanical Engineer', 'Building Analyst', 'Energy Modeler', 'Financial Analyst'
];

const AuditWorkflowComponent: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [buildingType, setBuildingType] = useState('');
  const [auditScope, setAuditScope] = useState<string[]>([]);
  
  // Handle next step
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Handle reset
  const handleReset = () => {
    setActiveStep(0);
  };
  
  // Handle building type change
  const handleBuildingTypeChange = (event: SelectChangeEvent) => {
    setBuildingType(event.target.value);
  };
  
  // Handle audit scope change
  const handleScopeChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setAuditScope(typeof value === 'string' ? value.split(',') : value);
  };
  
  // Render Initial Setup step
  const renderInitialSetup = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Audit Title"
            fullWidth
            variant="outlined"
            placeholder="e.g., Annual Energy Audit - Main Campus"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Audit ID"
            fullWidth
            variant="outlined"
            placeholder="e.g., AUDIT-2023-001"
            defaultValue="AUDIT-2023-001"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Client/Organization"
            fullWidth
            variant="outlined"
            placeholder="e.g., University of Lapu-Lapu and Mandaue"
            defaultValue="University of Lapu-Lapu and Mandaue"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Location"
            fullWidth
            variant="outlined"
            placeholder="e.g., Mandaue City, Cebu"
            defaultValue="Mandaue City, Cebu"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="building-type-label">Building Type</InputLabel>
            <Select
              labelId="building-type-label"
              value={buildingType}
              label="Building Type"
              onChange={handleBuildingTypeChange}
            >
              {BUILDING_TYPES.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Start Date"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            defaultValue={new Date().toISOString().split('T')[0]}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="audit-scope-label">Audit Scope</InputLabel>
            <Select
              labelId="audit-scope-label"
              multiple
              value={auditScope}
              onChange={handleScopeChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="Lighting Systems">Lighting Systems</MenuItem>
              <MenuItem value="HVAC Systems">HVAC Systems</MenuItem>
              <MenuItem value="Building Envelope">Building Envelope</MenuItem>
              <MenuItem value="Electrical Systems">Electrical Systems</MenuItem>
              <MenuItem value="Renewable Energy">Renewable Energy</MenuItem>
              <MenuItem value="Water Systems">Water Systems</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Audit Objectives"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="Describe the main objectives of this energy audit..."
            defaultValue="Identify energy saving opportunities, recommend energy efficiency measures, and establish baseline energy consumption for the university campus."
          />
        </Grid>
      </Grid>
    </Box>
  );
  
  // Render Planning & Preparation step
  const renderPlanning = () => (
    <Box>
      <Typography variant="subtitle1" gutterBottom>Audit Team Assignment</Typography>
      <Grid container spacing={3}>
        {TEAM_ROLES.map((role, index) => (
          <Grid item xs={12} md={6} key={index}>
            <TextField
              label={role}
              fullWidth
              variant="outlined"
              placeholder={`Enter ${role} name`}
            />
          </Grid>
        ))}
      </Grid>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="subtitle1" gutterBottom>Required Documents</Typography>
      <List>
        <ListItem>
          <ListItemIcon>
            <CheckBox />
          </ListItemIcon>
          <ListItemText 
            primary="Utility Bills (Last 12 Months)" 
            secondary="Electricity, water, and fuel bills"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <CheckBox />
          </ListItemIcon>
          <ListItemText 
            primary="Building Plans & Drawings" 
            secondary="Floor plans, electrical layouts, mechanical plans"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <CheckBox />
          </ListItemIcon>
          <ListItemText 
            primary="Equipment Inventory" 
            secondary="Major energy-consuming equipment details"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <CheckBox />
          </ListItemIcon>
          <ListItemText 
            primary="Previous Audit Reports (if any)" 
            secondary="For comparison and progress tracking"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <CheckBox />
          </ListItemIcon>
          <ListItemText 
            primary="Occupancy Schedules" 
            secondary="Building usage patterns and hours"
          />
        </ListItem>
      </List>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="subtitle1" gutterBottom>Equipment Checklist</Typography>
      <Grid container spacing={2}>
        <Grid item xs={6} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="primary">Measurement Tools</Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><CheckCircle fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Power Analyzer" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircle fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Light Meter" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircle fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Infrared Thermometer" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="primary">Safety Equipment</Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><CheckCircle fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Personal Protective Equipment" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircle fontSize="small" /></ListItemIcon>
                  <ListItemText primary="First Aid Kit" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircle fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Warning Signs" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="primary">Documentation</Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><CheckCircle fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Checklists & Templates" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircle fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Digital Camera" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircle fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Audit Software Access" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
  
  // Render Data Collection step
  const renderDataCollection = () => (
    <Box>
      <Typography variant="subtitle1" gutterBottom>Energy Consumption Data</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Annual Electricity Consumption (kWh)"
            fullWidth
            variant="outlined"
            type="number"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Annual Cost (PHP)"
            fullWidth
            variant="outlined"
            type="number"
          />
        </Grid>
        <Grid item xs={12}>
          <Button variant="outlined" startIcon={<Description />} sx={{ mr: 1 }}>
            Upload Utility Bills
          </Button>
          <Button variant="outlined" startIcon={<Save />}>
            Save Consumption Data
          </Button>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="subtitle1" gutterBottom>Building Information</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Building Area (m²)"
            fullWidth
            variant="outlined"
            type="number"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Number of Floors"
            fullWidth
            variant="outlined"
            type="number"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Year Built"
            fullWidth
            variant="outlined"
            type="number"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Operating Hours per Week"
            fullWidth
            variant="outlined"
            type="number"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Building Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
          />
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="subtitle1" gutterBottom>Equipment Inventory</Typography>
      <Button variant="contained" color="primary" sx={{ mb: 2 }}>
        Add Equipment
      </Button>
      <Typography variant="body2" color="text.secondary">
        No equipment added yet. Click "Add Equipment" to start building your inventory.
      </Typography>
    </Box>
  );
  
  // Render On-site Inspection step
  const renderOnSiteInspection = () => (
    <Box>
      <Typography variant="subtitle1" gutterBottom>Inspection Areas</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                <Lightbulb color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Lighting Systems
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Type & Quantity of Fixtures" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Light Levels (lux)" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Control Systems" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Operating Hours" />
                </ListItem>
              </List>
              <Button size="small" variant="outlined" startIcon={<Assignment />} sx={{ mt: 1 }}>
                Open Checklist
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                <AcUnit color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
                HVAC Systems
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Equipment Type & Capacity" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="System Efficiency" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Temperature Settings" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Control Systems" />
                </ListItem>
              </List>
              <Button size="small" variant="outlined" startIcon={<Assignment />} sx={{ mt: 1 }}>
                Open Checklist
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                <DeveloperBoard color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Electrical Systems
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Main Distribution Panel" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Power Factor" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Sub-meters" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Safety Issues" />
                </ListItem>
              </List>
              <Button size="small" variant="outlined" startIcon={<Assignment />} sx={{ mt: 1 }}>
                Open Checklist
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="subtitle1" gutterBottom>Documentation</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Button variant="outlined" startIcon={<Camera />} fullWidth>
            Add Photos
          </Button>
        </Grid>
        <Grid item xs={12} md={6}>
          <Button variant="outlined" startIcon={<Description />} fullWidth>
            Add Notes
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
  
  // Render the content for the active step
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderInitialSetup();
      case 1:
        return renderPlanning();
      case 2:
        return renderDataCollection();
      case 3:
        return renderOnSiteInspection();
      case 4:
        return <Typography>Step 5: Data Analysis content will be implemented here</Typography>;
      case 5:
        return <Typography>Step 6: Findings & Recommendations content will be implemented here</Typography>;
      case 6:
        return <Typography>Step 7: Report Generation content will be implemented here</Typography>;
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Energy Audit Workflow</Typography>
      <Typography variant="subtitle1" gutterBottom color="text.secondary">
        Step-by-step guide to conducting a comprehensive energy audit
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {AUDIT_STEPS.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>
                <Typography variant="subtitle1">{step.label}</Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {step.description}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  {getStepContent(index)}
                  
                  <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                    <Button
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      variant="outlined"
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      endIcon={activeStep !== AUDIT_STEPS.length - 1 ? <ArrowForward /> : undefined}
                    >
                      {activeStep === AUDIT_STEPS.length - 1 ? 'Finish' : 'Continue'}
                    </Button>
                  </Box>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        
        {activeStep === AUDIT_STEPS.length && (
          <Box sx={{ p: 3, mt: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>Energy Audit Complete!</Typography>
            <Typography variant="body1" paragraph>
              You have successfully completed all steps of the energy audit workflow.
              You can now generate the final report or start a new audit.
            </Typography>
            <Button onClick={handleReset} variant="outlined" sx={{ mt: 1 }}>
              Start New Audit
            </Button>
            <Button variant="contained" sx={{ mt: 1, ml: 1 }}>
              Generate Final Report
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AuditWorkflowComponent; 