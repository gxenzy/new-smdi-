import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Lightbulb as LightbulbIcon,
  PowerSettingsNew as PowerIcon,
  ThreeDRotation as ThreeDIcon,
} from '@mui/icons-material';
import { glassCardSx } from '../../theme/glassCardSx';

interface ElectricalComponent {
  id: string;
  name: string;
  type: 'lighting' | 'power';
  location: string;
  load: number;
  voltage: number;
  current: number;
  powerFactor: number;
  status: 'active' | 'inactive';
  lastUpdated: Date;
}

interface DIALuxModel {
  id: string;
  name: string;
  createdAt: Date;
  fileUrl: string;
  thumbnail?: string;
}

const ElectricalSystem = () => {
  const [components, setComponents] = useState<ElectricalComponent[]>([]);
  const [dialuxModels, setDialuxModels] = useState<DIALuxModel[]>([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<ElectricalComponent | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleAddComponent = () => {
    setSelectedComponent(null);
    setOpenAddDialog(true);
  };

  const handleEditComponent = (component: ElectricalComponent) => {
    setSelectedComponent(component);
    setOpenAddDialog(true);
  };

  const handleSaveComponent = (formData: Partial<ElectricalComponent>) => {
    try {
      if (selectedComponent) {
        // Update existing component
        setComponents(prev =>
          prev.map(comp =>
            comp.id === selectedComponent.id
              ? { ...comp, ...formData, lastUpdated: new Date() }
              : comp
          )
        );
      } else {
        // Add new component
        const newComponent: ElectricalComponent = {
          id: Math.random().toString(36).substr(2, 9),
          ...formData as ElectricalComponent,
          status: 'active',
          lastUpdated: new Date(),
        };
        setComponents(prev => [...prev, newComponent]);
      }
      setOpenAddDialog(false);
      setAlert({ type: 'success', message: 'Component saved successfully' });
    } catch (error) {
      setAlert({ type: 'error', message: 'Error saving component' });
    }
  };

  const handleDeleteComponent = (id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id));
    setAlert({ type: 'success', message: 'Component deleted successfully' });
  };

  const handleImportLayout = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle DIALux file import
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // Process DIALux file
          const newModel: DIALuxModel = {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            createdAt: new Date(),
            fileUrl: e.target?.result as string,
          };
          setDialuxModels(prev => [...prev, newModel]);
          setAlert({ type: 'success', message: 'DIALux model imported successfully' });
        } catch (error) {
          setAlert({ type: 'error', message: 'Error importing DIALux model' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportLayout = () => {
    try {
      const layoutData = {
        components,
        dialuxModels,
        exportDate: new Date(),
      };
      const blob = new Blob([JSON.stringify(layoutData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `electrical-layout-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setAlert({ type: 'success', message: 'Layout exported successfully' });
    } catch (error) {
      setAlert({ type: 'error', message: 'Error exporting layout' });
    }
  };

  const getTotalLoad = () => {
    return components.reduce((total, component) => total + component.load, 0);
  };

  const getComponentIcon = (type: 'lighting' | 'power') => {
    return type === 'lighting' ? (
      <LightbulbIcon color="primary" />
    ) : (
      <PowerIcon color="secondary" />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {alert && (
        <Typography variant="body2" color={alert.type === 'success' ? 'green' : 'red'} sx={{ mb: 3 }}>
          {alert.message}
        </Typography>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Electrical System Layout</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddComponent}
            sx={{ mr: 1 }}
          >
            Add Component
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={handleImportLayout}
            sx={{ mr: 1 }}
          >
            Import DIALux
          </Button>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleExportLayout}
          >
            Export Layout
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".stf,.evo"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* System Overview */}
        <Grid item xs={12} md={4}>
          <Card sx={glassCardSx({ blur: 10, accent: '#1976d2', bgOpacity: 0.6 })}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Overview
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Total Components"
                    secondary={components.length}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Total Load"
                    secondary={`${getTotalLoad()} W`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Active Components"
                    secondary={components.filter(c => c.status === 'active').length}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="DIALux Models"
                    secondary={dialuxModels.length}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* DIALux Models */}
          <Card sx={glassCardSx({ blur: 10, accent: '#1976d2', bgOpacity: 0.6 })}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                3D Models (DIALux)
              </Typography>
              <List>
                {dialuxModels.map((model) => (
                  <React.Fragment key={model.id}>
                    <ListItem>
                      <ListItemIcon>
                        <ThreeDIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={model.name}
                        secondary={new Date(model.createdAt).toLocaleDateString()}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          size="small"
                          onClick={() => {/* Handle view model */}}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Component List */}
        <Grid item xs={12} md={8}>
          <Card sx={glassCardSx({ blur: 10, accent: '#1976d2', bgOpacity: 0.6 })}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Components
              </Typography>
              <List>
                {components.map((component) => (
                  <React.Fragment key={component.id}>
                    <ListItem>
                      <Box sx={{ mr: 2 }}>
                        {getComponentIcon(component.type)}
                      </Box>
                      <ListItemText
                        primary={component.name}
                        secondary={
                          <>
                            <Typography variant="body2">
                              Location: {component.location}
                            </Typography>
                            <Typography variant="body2">
                              Load: {component.load}W | Voltage: {component.voltage}V | Current: {component.current}A
                            </Typography>
                            <Typography variant="body2">
                              Power Factor: {component.powerFactor} | Status: {component.status}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Last Updated: {new Date(component.lastUpdated).toLocaleString()}
                            </Typography>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          size="small"
                          onClick={() => handleEditComponent(component)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteComponent(component.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add/Edit Component Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedComponent ? 'Edit Component' : 'Add New Component'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Component Name"
              defaultValue={selectedComponent?.name}
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                defaultValue={selectedComponent?.type || 'lighting'}
                label="Type"
              >
                <MenuItem value="lighting">Lighting</MenuItem>
                <MenuItem value="power">Power</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Location"
              defaultValue={selectedComponent?.location}
            />
            <TextField
              fullWidth
              label="Load (W)"
              type="number"
              defaultValue={selectedComponent?.load}
            />
            <TextField
              fullWidth
              label="Voltage (V)"
              type="number"
              defaultValue={selectedComponent?.voltage}
            />
            <TextField
              fullWidth
              label="Current (A)"
              type="number"
              defaultValue={selectedComponent?.current}
            />
            <TextField
              fullWidth
              label="Power Factor"
              type="number"
              defaultValue={selectedComponent?.powerFactor}
              inputProps={{ step: 0.01, min: 0, max: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => handleSaveComponent({})} // Add form data here
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ElectricalSystem;
