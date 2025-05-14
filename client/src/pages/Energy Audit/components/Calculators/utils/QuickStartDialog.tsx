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
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import InfoIcon from '@mui/icons-material/Info';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CalculateIcon from '@mui/icons-material/Calculate';
import SaveIcon from '@mui/icons-material/Save';

export interface QuickStartStep {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

export interface QuickStartExample {
  title: string;
  description: string;
  steps: string[];
}

export interface StandardReference {
  code: string;
  section: string;
  title: string;
  url?: string;
}

interface QuickStartDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Function called when the dialog is closed */
  onClose: () => void;
  /** Title of the calculator */
  title: string;
  /** Optional subtitle or description */
  description?: string;
  /** Steps to follow in the calculator */
  steps: QuickStartStep[];
  /** Optional example use case */
  example?: QuickStartExample;
  /** Optional key concepts to understand */
  keyConcepts?: Array<{ term: string, definition: string }>;
  /** Optional references to standards or documentation */
  references?: StandardReference[];
  /** Optional callback for viewing standards */
  onViewStandards?: (reference: StandardReference) => void;
  /** Optional extra content */
  children?: React.ReactNode;
}

/**
 * A reusable Quick Start dialog component for calculators
 * 
 * This component provides a standardized format for quick start guides
 * that can be customized for each calculator while maintaining consistency.
 */
const QuickStartDialog: React.FC<QuickStartDialogProps> = ({
  open,
  onClose,
  title,
  description,
  steps,
  example,
  keyConcepts,
  references,
  onViewStandards,
  children
}) => {
  // Default icons if none provided
  const defaultIcons = [
    <InfoIcon color="primary" />,
    <AddCircleOutlineIcon color="primary" />,
    <CalculateIcon color="primary" />,
    <SaveIcon color="primary" />
  ];
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        {title || 'Quick Start Guide'}
      </DialogTitle>
      
      <DialogContent dividers>
        {description && (
          <Typography variant="body1" paragraph>
            {description}
          </Typography>
        )}
        
        <Typography variant="h6" gutterBottom>
          How to Use
        </Typography>
        
        <List>
          {steps.map((step, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                {step.icon || defaultIcons[index % defaultIcons.length]}
              </ListItemIcon>
              <ListItemText 
                primary={`Step ${index + 1}: ${step.title}`} 
                secondary={step.description}
              />
            </ListItem>
          ))}
        </List>
        
        {keyConcepts && keyConcepts.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Key Concepts
            </Typography>
            
            <Box component="ul" sx={{ pl: 4 }}>
              {keyConcepts.map((concept, index) => (
                <li key={index}>
                  <Typography variant="body2" mb={1}>
                    <strong>{concept.term}:</strong> {concept.definition}
                  </Typography>
                </li>
              ))}
            </Box>
          </>
        )}
        
        {example && (
          <>
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Example
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="subtitle1">
                {example.title}
              </Typography>
              
              <Typography variant="body2" paragraph>
                {example.description}
              </Typography>
              
              <Box component="ol" sx={{ pl: 3 }}>
                {example.steps.map((step, index) => (
                  <li key={index}>
                    <Typography variant="body2">
                      {step}
                    </Typography>
                  </li>
                ))}
              </Box>
            </Paper>
          </>
        )}
        
        {references && references.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              References
            </Typography>
            
            <List dense>
              {references.map((reference, index) => {
                if (onViewStandards) {
                  return (
                    <ListItemButton
                      key={index}
                      onClick={() => onViewStandards(reference)}
                    >
                      <ListItemIcon>
                        <MenuBookIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`${reference.code} ${reference.section}`} 
                        secondary={reference.title}
                      />
                    </ListItemButton>
                  );
                }
                
                return (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <MenuBookIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`${reference.code} ${reference.section}`} 
                      secondary={reference.title}
                    />
                  </ListItem>
                );
              })}
            </List>
          </>
        )}
        
        {children}
        
        <Box mt={3} p={2} bgcolor="background.default" borderRadius={1}>
          <Typography variant="body2" color="text.secondary">
            <strong>Pro Tip:</strong> You can access this guide anytime by clicking the 
            <HelpOutlineIcon fontSize="small" sx={{ mx: 0.5, verticalAlign: 'middle' }} />
            button in the calculator toolbar.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
        {references && references.length > 0 && onViewStandards && (
          <Button 
            startIcon={<MenuBookIcon />} 
            color="primary"
            onClick={() => onViewStandards(references[0])}
          >
            View Standards
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default QuickStartDialog; 