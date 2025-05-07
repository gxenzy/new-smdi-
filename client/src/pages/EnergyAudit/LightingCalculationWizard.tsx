import React, { useState } from 'react';
import { Box, Button, Stepper, Step, StepLabel, Typography, TextField, Paper, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const steps = [
  'Input Lighting Data',
  'Calculation Breakdown',
  'Result & Recommendation',
  'References'
];

const STANDARD_LPD = 10; // Example: 10 W/m² (ASHRAE 90.1)

const LightingCalculationWizard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [numFixtures, setNumFixtures] = useState('');
  const [wattage, setWattage] = useState('');
  const [hours, setHours] = useState('');
  const [days, setDays] = useState('');
  const [area, setArea] = useState('');

  // Calculation
  const totalConsumption = Number(numFixtures) * Number(wattage) * Number(hours) * Number(days);
  const lpd = area ? (Number(numFixtures) * Number(wattage)) / Number(area) : 0;

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  return (
    <Paper sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>
      {activeStep === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>Enter Lighting Data</Typography>
          <TextField label="Number of Fixtures" value={numFixtures} onChange={e => setNumFixtures(e.target.value)} type="number" fullWidth sx={{ mb: 2 }} />
          <TextField label="Wattage per Fixture (W)" value={wattage} onChange={e => setWattage(e.target.value)} type="number" fullWidth sx={{ mb: 2 }} />
          <TextField label="Hours Used per Day" value={hours} onChange={e => setHours(e.target.value)} type="number" fullWidth sx={{ mb: 2 }} />
          <TextField label="Days per Month" value={days} onChange={e => setDays(e.target.value)} type="number" fullWidth sx={{ mb: 2 }} />
          <TextField label="Area (m²)" value={area} onChange={e => setArea(e.target.value)} type="number" fullWidth sx={{ mb: 2 }} />
          <Button variant="contained" onClick={handleNext} disabled={!numFixtures || !wattage || !hours || !days || !area}>Next</Button>
        </Box>
      )}
      {activeStep === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>Calculation Breakdown</Typography>
          <Typography gutterBottom>
            <b>Total Lighting Consumption (Wh/month):</b><br />
            = Number of Fixtures × Wattage × Hours/Day × Days/Month<br />
            = {numFixtures} × {wattage} × {hours} × {days} = <b>{totalConsumption || 0} Wh/month</b>
          </Typography>
          <Typography gutterBottom>
            <b>Lighting Power Density (W/m²):</b><br />
            = (Number of Fixtures × Wattage) / Area<br />
            = ({numFixtures} × {wattage}) / {area} = <b>{lpd.toFixed(2)} W/m²</b>
          </Typography>
          <Button onClick={handleBack} sx={{ mr: 2 }}>Back</Button>
          <Button variant="contained" onClick={handleNext}>Next</Button>
        </Box>
      )}
      {activeStep === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>Result & Recommendation</Typography>
          <Typography gutterBottom>
            <b>Total Lighting Consumption:</b> {totalConsumption || 0} Wh/month
          </Typography>
          <Typography gutterBottom>
            <b>Lighting Power Density (LPD):</b> {lpd.toFixed(2)} W/m²
          </Typography>
          <Typography gutterBottom>
            <b>Standard (ASHRAE 90.1):</b> {STANDARD_LPD} W/m²
          </Typography>
          <Typography gutterBottom color={lpd > STANDARD_LPD ? 'error' : 'success.main'}>
            {lpd > STANDARD_LPD
              ? 'Recommendation: Reduce lighting load or improve efficiency.'
              : 'Your lighting system meets the recommended standard!'}
          </Typography>
          <Button onClick={handleBack} sx={{ mr: 2 }}>Back</Button>
          <Button variant="contained" onClick={handleNext}>Next</Button>
        </Box>
      )}
      {activeStep === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>References & Standards</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Tooltip title="ASHRAE 90.1 - Lighting Power Density Standard"><InfoIcon color="primary" sx={{ mr: 1 }} /></Tooltip>
            <Typography>ASHRAE 90.1 - Lighting Power Density</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Tooltip title="IEEE 739-1995 - Energy Management"><InfoIcon color="primary" sx={{ mr: 1 }} /></Tooltip>
            <Typography>IEEE 739-1995 - Energy Management</Typography>
          </Box>
          <Button onClick={handleBack} sx={{ mr: 2 }}>Back</Button>
          <Button variant="contained" color="success" onClick={onClose}>Finish</Button>
        </Box>
      )}
    </Paper>
  );
};

export default LightingCalculationWizard; 