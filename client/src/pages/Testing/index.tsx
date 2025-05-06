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

const TestingPage: React.FC = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: '1',
      category: 'Load Calculation',
      name: 'Load Calculation Accuracy',
      description: 'Verify the accuracy of electrical load calculations against PEC standards',
      status: 'pending',
      steps: [
        {
          id: '1.1',
          description: 'Calculate total connected load',
          status: 'pending',
          input: {
            lights: 1200,
            outlets: 2400,
            hvac: 3500,
          },
          expectedOutput: 7100,
        },
        {
          id: '1.2',
          description: 'Apply demand factors',
          status: 'pending',
          input: {
            demandFactor: 0.8,
          },
          expectedOutput: 5680,
        },
        {
          id: '1.3',
          description: 'Verify voltage drop calculations',
          status: 'pending',
          input: {
            current: 25,
            length: 50,
            voltage: 230,
          },
          expectedOutput: '< 3%',
        },
      ],
      requirements: [
        'Total load must be calculated with ±2% accuracy',
        'Demand factors must comply with PEC Table 3.2',
        'Voltage drop must not exceed 3%',
      ],
      standards: [
        'PEC 1 Section 3.1.2 - Load Calculations',
        'PEC 1 Table 3.2 - Demand Factors',
      ],
    },
    {
      id: '2',
      category: 'PEC Compliance',
      name: 'PEC Standards Compliance',
      description: 'Evaluate compliance with Philippine Electrical Code requirements',
      status: 'pending',
      steps: [
        {
          id: '2.1',
          description: 'Verify conductor sizing',
          status: 'pending',
          input: {
            current: 30,
            temperature: 75,
            material: 'copper',
          },
          expectedOutput: '10 AWG',
        },
        {
          id: '2.2',
          description: 'Check overcurrent protection',
          status: 'pending',
          input: {
            conductorAmpacity: 30,
            load: 25,
          },
          expectedOutput: '30A breaker',
        },
        {
          id: '2.3',
          description: 'Validate grounding system',
          status: 'pending',
          input: {
            systemType: 'TN-S',
            voltage: 230,
          },
          expectedOutput: 'Compliant',
        },
      ],
      requirements: [
        'Conductor sizes must meet minimum PEC requirements',
        'Overcurrent protection must be properly coordinated',
        'Grounding system must comply with PEC Article 5.0',
      ],
      standards: [
        'PEC 1 Article 3.0 - Wiring and Protection',
        'PEC 1 Article 5.0 - Grounding',
      ],
    },
    {
      id: '3',
      category: 'Energy Management',
      name: 'Energy Management Guidelines',
      description: 'Validate adherence to energy management handbook guidelines',
      status: 'pending',
      steps: [
        {
          id: '3.1',
          description: 'Check power factor correction',
          status: 'pending',
          input: {
            actualPF: 0.85,
            targetPF: 0.95,
          },
          expectedOutput: 'Correction needed',
        },
        {
          id: '3.2',
          description: 'Evaluate lighting efficiency',
          status: 'pending',
          input: {
            area: 100,
            wattage: 1000,
          },
          expectedOutput: '10 W/m²',
        },
        {
          id: '3.3',
          description: 'Assess HVAC performance',
          status: 'pending',
          input: {
            cooling: 36000,
            power: 3500,
          },
          expectedOutput: 'EER > 10',
        },
      ],
      requirements: [
        'Power factor must be at least 0.95',
        'Lighting power density must meet energy code',
        'HVAC systems must meet minimum efficiency ratings',
      ],
      standards: [
        'Energy Management Handbook Ch. 4 - Power Factor',
        'Energy Management Handbook Ch. 7 - Lighting',
        'Energy Management Handbook Ch. 9 - HVAC',
      ],
    },
  ]);

  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const runTest = async (testId: string) => {
    setActiveTest(testId);
    const test = testCases.find(t => t.id === testId);
    if (!test) return;

    // Update test status to running
    updateTestStatus(testId, 'running');

    // Run each step
    for (const step of test.steps) {
      await runTestStep(testId, step.id);
    }

    // Evaluate final test result
    const allStepsPassed = test.steps.every(step => step.status === 'completed');
    updateTestStatus(testId, allStepsPassed ? 'passed' : 'failed');
    setActiveTest(null);
  };

  const runTestStep = async (testId: string, stepId: string) => {
    // Simulate step execution
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate step result (random for demo)
    const success = Math.random() > 0.3;
    updateStepStatus(testId, stepId, success ? 'completed' : 'failed');

    // Update progress
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
      case 'Load Calculation':
        return <CalculateIcon />;
      case 'PEC Compliance':
        return <ComplianceIcon />;
      case 'Energy Management':
        return <GuidelinesIcon />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Testing</Typography>
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

export default TestingPage;
