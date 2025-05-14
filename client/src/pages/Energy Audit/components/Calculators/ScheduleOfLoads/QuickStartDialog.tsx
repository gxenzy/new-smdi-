import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
import CalculateIcon from '@mui/icons-material/Calculate';
import MenuBookIcon from '@mui/icons-material/MenuBook';

interface QuickStartDialogProps {
  open: boolean;
  onClose: () => void;
}

const QuickStartDialog: React.FC<QuickStartDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Schedule of Loads Calculator - Quick Start Guide
      </DialogTitle>
      <DialogContent>
        <Typography variant="h6" gutterBottom>
          How to Use the Schedule of Loads Calculator
        </Typography>
        
        <Typography variant="body1" paragraph>
          The Schedule of Loads Calculator helps you create and manage detailed listings of electrical loads for your project.
          Follow these steps to get started:
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <InfoIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Step 1: Enter Basic Information" 
              secondary="Start by entering the panel name, voltage, and power factor. This information is essential for accurate calculations."
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <AddIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Step 2: Add Load Items" 
              secondary="Add each electrical load item with its description, quantity, rating in watts, and demand factor. You can add as many items as needed."
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <CalculateIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Step 3: Review Results" 
              secondary="View the calculated results including connected load, demand load, current, and energy consumption estimates."
            />
          </ListItem>
        </List>
        
        <Typography variant="h6" mt={3} gutterBottom>
          Key Concepts
        </Typography>
        
        <Box component="ul" sx={{ pl: 4 }}>
          <li>
            <Typography variant="body2" mb={1}>
              <strong>Connected Load:</strong> The total nameplate rating of all equipment. Calculated as Quantity × Rating.
            </Typography>
          </li>
          <li>
            <Typography variant="body2" mb={1}>
              <strong>Demand Factor:</strong> The ratio of maximum demand to the total connected load. Values range from 0 to 1.
            </Typography>
          </li>
          <li>
            <Typography variant="body2" mb={1}>
              <strong>Demand Load:</strong> The actual load expected to be drawn. Calculated as Connected Load × Demand Factor.
            </Typography>
          </li>
          <li>
            <Typography variant="body2" mb={1}>
              <strong>Current (A):</strong> The electrical current drawn by the load, calculated using the formula I = P ÷ V for single-phase circuits.
            </Typography>
          </li>
        </Box>
        
        <Box mt={3} p={2} bgcolor="background.default" borderRadius={1}>
          <Typography variant="body2" color="text.secondary">
            <strong>Pro Tip:</strong> You can synchronize your Schedule of Loads with the Voltage Drop Calculator using the synchronization panel at the top. 
            This ensures circuit data stays consistent across both calculators.
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" mt={3}>
          For more detailed information about Schedule of Loads requirements, refer to the PEC 2017 Standards Reference section.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
        <Button 
          startIcon={<MenuBookIcon />} 
          color="primary"
          onClick={() => window.location.href = '/energy-audit/standards-reference?standard=PEC-2017&section=2.4'}
        >
          View PEC Standards
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickStartDialog; 