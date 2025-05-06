import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  CheckCircle as PassedIcon,
  Error as FailedIcon,
  Warning as WarningIcon,
  Speed as PerformanceIcon,
  Calculate as CalculateIcon,
  Rule as ComplianceIcon,
  MenuBook as GuidelinesIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

interface TestCase {
  id: string;
  category: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  duration?: number;
  error?: string;
  steps: TestStep[];
  requirements: string[];
  standards: string[];
}

interface TestStep {
  id: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input?: any;
  expectedOutput?: any;
  actualOutput?: any;
}

const EnergyAuditTesting: React.FC = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: '1',
      category: 'Energy Consumption',
      name: 'Power Usage Analysis',
      description: 'Verify power consumption measurements and calculations',
      status: 'pending',
      steps: [
        {
          id: '1.1',
          description: 'Calculate total power consumption',
          status: 'pending',
          input: {
            lighting: 2500,
            hvac: 5000,
            equipment: 3500,
          },
          expectedOutput: 11000,
        },
        {
          id: '1.2',
          description: 'Analyze peak demand',
          status: 'pending',
          input: {
            peakHours: '14:00-17:00',
            averageLoad: 8500,
          },
          expectedOutput: '< 9000W',
        },
        {
          id: '1.3',
          description: 'Verify power factor',
          status: 'pending',
          input: {
            actualPF: 0.85,
            targetPF: 0.95,
          },
          expectedOutput: 'Correction needed',
        },
      ],
      requirements: [
        'Total consumption must be calculated with ±1% accuracy',
        'Peak demand must not exceed facility limits',
        'Power factor must meet utility requirements',
      ],
      standards: [
        'IEEE 739-1995 - Energy Management',
        'ASHRAE 90.1 - Energy Standard',
      ],
    },
    {
      id: '2',
      category: 'Lighting Efficiency',
      name: 'Lighting System Evaluation',
      description: 'Assess lighting system efficiency and compliance',
      status: 'pending',
      steps: [
        {
          id: '2.1',
          description: 'Measure illumination levels',
          status: 'pending',
          input: {
            area: 'Office space',
            measured: 450,
            required: 500,
          },
          expectedOutput: 'Below standard',
        },
        {
          id: '2.2',
          description: 'Calculate lighting power density',
          status: 'pending',
          input: {
            totalWattage: 2500,
            floorArea: 200,
          },
          expectedOutput: '12.5 W/m²',
        },
        {
          id: '2.3',
          description: 'Evaluate color rendering',
          status: 'pending',
          input: {
            CRI: 82,
            required: 80,
          },
          expectedOutput: 'Compliant',
        },
      ],
      requirements: [
        'Illumination levels must meet IES standards',
        'LPD must comply with energy codes',
        'Color rendering must meet application requirements',
      ],
      standards: [
        'IES Lighting Handbook',
        'ASHRAE 90.1 - Lighting Power Density',
      ],
    },
    {
      id: '3',
      category: 'HVAC Efficiency',
      name: 'HVAC Performance Testing',
      description: 'Evaluate HVAC system performance and efficiency',
      status: 'pending',
      steps: [
        {
          id: '3.1',
          description: 'Measure system efficiency',
          status: 'pending',
          input: {
            cooling: 36000,
            power: 3500,
          },
          expectedOutput: 'EER > 10',
        },
        {
          id: '3.2',
          description: 'Check temperature distribution',
          status: 'pending',
          input: {
            setpoint: 24,
            measured: [23.5, 24.2, 24.0],
          },
          expectedOutput: '±1°C variance',
        },
        {
          id: '3.3',
          description: 'Verify ventilation rates',
          status: 'pending',
          input: {
            occupants: 50,
            freshAir: 750,
          },
          expectedOutput: '15 cfm/person',
        },
      ],
      requirements: [
        'System efficiency must meet minimum standards',
        'Temperature variation must be within comfort range',
        'Ventilation must meet ASHRAE requirements',
      ],
      standards: [
        'ASHRAE 90.1 - HVAC Efficiency',
        'ASHRAE 62.1 - Ventilation',
      ],
    },
  ]);

  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const runTest = async (testId: string) => {
    setActiveTest(testId);
    const test = testCases.find(t => t.id === testId);
    if (!test) return;

    updateTestStatus(testId, 'running');

    for (const step of test.steps) {
      await runTestStep(testId, step.id);
    }

    const allStepsPassed = test.steps.every(step => step.status === 'completed');
    updateTestStatus(testId, allStepsPassed ? 'passed' : 'failed');
    setActiveTest(null);
  };

  const runTestStep = async (testId: string, stepId: string) => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const success = Math.random() > 0.3;
    updateStepStatus(testId, stepId, success ? 'completed' : 'failed');

    const test = testCases.find(t => t.id === testId);
    if (test) {
      const completedSteps = test.steps.filter(s => s.status === 'completed').length;
      setProgress((completedSteps / test.steps.length) * 100);
    }
  };

  const updateTestStatus = (testId: string, status: TestCase['status']) => {
    setTestCases(prev =>
      prev.map(test =>
        test.id === testId
          ? { ...test, status }
          : test
      )
    );
  };

  const updateStepStatus = (testId: string, stepId: string, status: TestStep['status']) => {
    setTestCases(prev =>
      prev.map(test =>
        test.id === testId
          ? {
              ...test,
              steps: test.steps.map(step =>
                step.id === stepId
                  ? { ...step, status }
                  : step
              ),
            }
          : test
      )
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <PassedIcon color="success" />;
      case 'failed':
        return <FailedIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'running':
        return <PerformanceIcon color="info" />;
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Energy Consumption':
        return <CalculateIcon />;
      case 'Lighting Efficiency':
        return <ComplianceIcon />;
      case 'HVAC Efficiency':
        return <GuidelinesIcon />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Energy Audit Testing</Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={!testCases.some(t => t.status === 'passed' || t.status === 'failed')}
        >
          Export Results
        </Button>
      </Box>

      <Grid container spacing={3}>
        {testCases.map((test) => (
          <Grid item xs={12} key={test.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ mr: 2 }}>{getCategoryIcon(test.category)}</Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">
                      {test.name}
                      {test.status !== 'pending' && (
                        <Box component="span" sx={{ ml: 2 }}>
                          {getStatusIcon(test.status)}
                        </Box>
                      )}
                    </Typography>
                    <Typography color="textSecondary">{test.description}</Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={test.status === 'running' ? <StopIcon /> : <StartIcon />}
                    onClick={() => runTest(test.id)}
                    disabled={test.status === 'running' || activeTest !== null}
                  >
                    {test.status === 'running' ? 'Running...' : 'Run Test'}
                  </Button>
                </Box>

                {test.status === 'running' && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress variant="determinate" value={progress} />
                  </Box>
                )}

                <Stepper orientation="vertical">
                  {test.steps.map((step) => (
                    <Step key={step.id} active={step.status !== 'pending'} completed={step.status === 'completed'}>
                      <StepLabel error={step.status === 'failed'}>
                        {step.description}
                      </StepLabel>
                      <StepContent>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2">Input Parameters:</Typography>
                          <pre>{JSON.stringify(step.input, null, 2)}</pre>
                          <Typography variant="subtitle2">Expected Output:</Typography>
                          <pre>{JSON.stringify(step.expectedOutput, null, 2)}</pre>
                        </Box>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>

                <Divider sx={{ my: 2 }} />

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Requirements:
                  </Typography>
                  <List dense>
                    {test.requirements.map((req, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircleIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={req} />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Applicable Standards:
                  </Typography>
                  <List dense>
                    {test.standards.map((std, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <ComplianceIcon color="secondary" />
                        </ListItemIcon>
                        <ListItemText primary={std} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default EnergyAuditTesting; 