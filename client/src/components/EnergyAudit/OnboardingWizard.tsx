import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stepper, Step, StepLabel, Typography } from '@mui/material';

interface OnboardingWizardProps {
  open: boolean;
  onClose: () => void;
}

const steps = [
  'Welcome',
  'Set Organization Info',
  'Customize Theme',
  'Explore Analytics',
  'Export & Share',
];

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleFinish = () => {
    setActiveStep(0);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Getting Started Wizard</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Typography variant="body1" sx={{ mt: 2 }}>
          {steps[activeStep] === 'Welcome' && 'Welcome to the Energy Audit App! This wizard will help you get started.'}
          {steps[activeStep] === 'Set Organization Info' && 'Set your organization name and upload your logo in the settings.'}
          {steps[activeStep] === 'Customize Theme' && 'Try the theme settings to personalize your dashboard.'}
          {steps[activeStep] === 'Explore Analytics' && 'Review analytics, add comments, and use interactive charts.'}
          {steps[activeStep] === 'Export & Share' && 'Export your reports as PDF, Excel, or Word.'}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleBack} disabled={activeStep === 0}>Back</Button>
        {activeStep === steps.length - 1 ? (
          <Button onClick={handleFinish} variant="contained">Finish</Button>
        ) : (
          <Button onClick={handleNext} variant="contained">Next</Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default OnboardingWizard; 