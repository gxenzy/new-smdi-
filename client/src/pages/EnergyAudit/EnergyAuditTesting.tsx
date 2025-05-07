import React, { useState, useEffect, Suspense, useRef } from 'react';
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
  Modal,
  TextField,
  MenuItem,
  Tooltip,
  IconButton,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemSecondaryAction,
  CircularProgress,
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
  CheckCircleOutline as CheckCircleOutlineIcon,
  HighlightOff as HighlightOffIcon,
  Info as InfoIcon,
  HelpOutline as HelpOutlineIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import LightingCalculationWizard from './LightingCalculationWizard';
import { useEnergyAudit } from './EnergyAuditContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useEnergyAuditHistory } from './EnergyAuditHistoryContext';
import TestApprovalPanel from './TestApprovalPanel';
import EnergyAuditAnalytics from './EnergyAuditAnalytics';
import { ValidationSummary, StandardComparison, ComplianceHistory, HelpDialog } from './components/EnergyAuditComponents';
import ErrorBoundary from '../../components/ErrorBoundary';
import { visuallyHidden } from '@mui/utils';

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

// Standard options and values
const STANDARD_OPTIONS = [
  { label: 'ASHRAE 90.1-2019', value: 'ashrae2019' },
  { label: 'ASHRAE 90.1-2022', value: 'ashrae2022' },
  { label: 'Energy Management Handbook 2023', value: 'emh2023' },
  { label: 'ISO 50001:2018', value: 'iso50001' },
  { label: 'Manual', value: 'manual' },
];

const STANDARD_DESCRIPTIONS = {
  ashrae2019: 'ASHRAE 90.1-2019 Energy Standard for Buildings Except Low-Rise Residential Buildings',
  ashrae2022: 'ASHRAE 90.1-2022 Energy Standard for Buildings Except Low-Rise Residential Buildings',
  emh2023: 'Energy Management Handbook 2023 Edition - Comprehensive guide for energy efficiency',
  iso50001: 'ISO 50001:2018 Energy Management Systems - Requirements with guidance for use',
  manual: 'Custom values based on facility requirements and local regulations'
};

const DEFAULT_STANDARDS = {
  ashrae2019: {
    power: { facilityLimit: 12000, peakLimit: 9000, pfTarget: 0.95 },
    lighting: { lpd: 10, requiredLux: 500, requiredCRI: 80 },
    hvac: { eer: 10, tempRange: 1, freshAir: 15 }
  },
  ashrae2022: {
    power: { facilityLimit: 11000, peakLimit: 8500, pfTarget: 0.97 },
    lighting: { lpd: 9, requiredLux: 500, requiredCRI: 85 },
    hvac: { eer: 11, tempRange: 0.8, freshAir: 17 }
  },
  emh2023: {
    power: { facilityLimit: 12000, peakLimit: 9000, pfTarget: 0.95 },
    lighting: { lpd: 12, requiredLux: 500, requiredCRI: 80 },
    hvac: { eer: 9, tempRange: 1, freshAir: 12 }
  },
  iso50001: {
    power: { facilityLimit: 13000, peakLimit: 9500, pfTarget: 0.93 },
    lighting: { lpd: 11, requiredLux: 450, requiredCRI: 82 },
    hvac: { eer: 9.5, tempRange: 1.2, freshAir: 14 }
  },
  manual: {
    power: { facilityLimit: 12000, peakLimit: 9000, pfTarget: 0.95 },
    lighting: { lpd: 10, requiredLux: 500, requiredCRI: 80 },
    hvac: { eer: 10, tempRange: 1, freshAir: 15 }
  }
};

// Add validation ranges for manual inputs
const VALIDATION_RANGES = {
  power: {
    facilityLimit: { min: 5000, max: 20000 },
    peakLimit: { min: 3000, max: 15000 },
    pfTarget: { min: 0.8, max: 1.0 }
  },
  lighting: {
    lpd: { min: 5, max: 20 },
    requiredLux: { min: 300, max: 1000 },
    requiredCRI: { min: 70, max: 100 }
  },
  hvac: {
    eer: { min: 8, max: 15 },
    tempRange: { min: 0.5, max: 2 },
    freshAir: { min: 10, max: 25 }
  }
};

// Add error messages for validation
const ERROR_MESSAGES = {
  power: {
    facilityLimit: 'Facility limit must be between 5,000W and 20,000W',
    peakLimit: 'Peak limit must be between 3,000W and 15,000W',
    pfTarget: 'Power factor target must be between 0.8 and 1.0'
  },
  lighting: {
    lpd: 'LPD must be between 5 and 20 W/m²',
    requiredLux: 'Required lux must be between 300 and 1000',
    requiredCRI: 'Required CRI must be between 70 and 100'
  },
  hvac: {
    eer: 'EER must be between 8 and 15',
    tempRange: 'Temperature range must be between 0.5°C and 2°C',
    freshAir: 'Fresh air must be between 10 and 25 cfm/person'
  }
};

// Add error display component
const ErrorDisplay: React.FC<{ error: string | null }> = ({ error }) => {
  if (!error) return null;
  return (
    <Typography color="error" variant="caption" sx={{ display: 'block', mt: 0.5 }}>
      {error}
    </Typography>
  );
};

// Add standard info component
const StandardInfo: React.FC<{ standard: string }> = ({ standard }) => {
  return (
    <Box sx={{ mt: 1, p: 1, bgcolor: 'info.lighter', borderRadius: 1 }}>
      <Typography variant="body2" color="info.dark">
        {STANDARD_DESCRIPTIONS[standard]}
      </Typography>
    </Box>
  );
};

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
    <CircularProgress />
  </Box>
);

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <Box sx={{ p: 3, textAlign: 'center' }}>
    <Typography color="error" variant="h6" gutterBottom>
      Something went wrong
    </Typography>
    <Typography variant="body2" color="textSecondary" paragraph>
      {error.message}
    </Typography>
    <Button variant="contained" onClick={resetErrorBoundary}>
      Try Again
    </Button>
  </Box>
);

// Add skip-to-content link for accessibility
const SkipToContent = () => (
  <a href="#main-content" style={{ position: 'absolute', left: -9999, top: 'auto', width: 1, height: 1, overflow: 'hidden', zIndex: 1000 }}
    onFocus={e => { e.currentTarget.style.left = '8px'; e.currentTarget.style.top = '8px'; e.currentTarget.style.width = 'auto'; e.currentTarget.style.height = 'auto'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.padding = '8px'; e.currentTarget.style.border = '2px solid #1976d2'; }}
    onBlur={e => { e.currentTarget.style.left = '-9999px'; e.currentTarget.style.top = 'auto'; e.currentTarget.style.width = '1px'; e.currentTarget.style.height = '1px'; e.currentTarget.style.background = 'none'; e.currentTarget.style.padding = '0'; e.currentTarget.style.border = 'none'; }}
  >
    Skip to main content
  </a>
);

// Add currency formatter for PHP
const formatPHP = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);

const EnergyAuditTesting: React.FC = () => {
  const { audit } = useEnergyAudit();
  const { addTestResult } = useEnergyAuditHistory();
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
  const [lightingWizardOpen, setLightingWizardOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [userRole] = useState<'admin' | 'auditor' | 'reviewer'>('admin'); // This would come from your auth system
  const [userName] = useState('John Doe'); // This would come from your auth system
  const [helpOpen, setHelpOpen] = useState(false);

  // Calculate default values from findings
  const defaultLighting = audit.lighting.reduce((sum, f) => sum + (f.estimatedCost || 0), 0);
  const defaultHVAC = audit.hvac.reduce((sum, f) => sum + (f.estimatedCost || 0), 0);
  const defaultEquipment = audit.envelope.reduce((sum, f) => sum + (f.estimatedCost || 0), 0);

  // State for Power Usage Analysis steps
  const [step1, setStep1] = useState({ lighting: defaultLighting, hvac: defaultHVAC, equipment: defaultEquipment });
  const [step2, setStep2] = useState({ peakHours: '14:00-17:00', averageLoad: 8500 });
  const [step3, setStep3] = useState({ actualPF: 0.85, targetPF: 0.95 });
  const [showStep1, setShowStep1] = useState(false);
  const [showStep2, setShowStep2] = useState(false);
  const [showStep3, setShowStep3] = useState(false);

  // Add state for selected standard and manual values for each test
  const [powerStandard, setPowerStandard] = useState('ashrae2019');
  const [powerManual, setPowerManual] = useState({ facilityLimit: 12000, peakLimit: 9000, pfTarget: 0.95 });
  const [lightingStandard, setLightingStandard] = useState('ashrae2019');
  const [lightingManual, setLightingManual] = useState({ lpd: 10, requiredLux: 500, requiredCRI: 80 });
  const [hvacStandard, setHvacStandard] = useState('ashrae2019');
  const [hvacManual, setHvacManual] = useState({ eer: 10, tempRange: 1, freshAir: 15 });

  // Use selected or manual values for calculations
  const facilityLimit = powerStandard === 'manual' ? powerManual.facilityLimit : (powerStandard === 'emh2023' ? 12000 : 12000);
  const peakLimit = powerStandard === 'manual' ? powerManual.peakLimit : (powerStandard === 'emh2023' ? 9000 : 9000);
  const pfTarget = powerStandard === 'manual' ? powerManual.pfTarget : (powerStandard === 'emh2023' ? 0.95 : 0.95);
  const lpdStandard = lightingStandard === 'manual' ? lightingManual.lpd : DEFAULT_STANDARDS[lightingStandard].lpd;
  const requiredLux = lightingStandard === 'manual' ? lightingManual.requiredLux : 500;
  const requiredCRI = lightingStandard === 'manual' ? lightingManual.requiredCRI : 80;
  const eerStandard = hvacStandard === 'manual' ? hvacManual.eer : DEFAULT_STANDARDS[hvacStandard].eer;
  const tempRange = hvacStandard === 'manual' ? hvacManual.tempRange : 1;
  const freshAirStandard = hvacStandard === 'manual' ? hvacManual.freshAir : DEFAULT_STANDARDS[hvacStandard].freshAir;

  // Step 1 calculation
  const totalPower = Number(step1.lighting) + Number(step1.hvac) + Number(step1.equipment);
  const passStep1 = totalPower <= facilityLimit;

  // Step 2 calculation
  const passStep2 = Number(step2.averageLoad) < peakLimit;

  // Step 3 calculation
  const passStep3 = Number(step3.actualPF) >= Number(step3.targetPF);

  // Live compliance status for Power Usage Analysis
  const liveCompliance = passStep1 && passStep2 && passStep3;
  const liveComplianceLabel = liveCompliance ? 'Compliant' : 'Non-compliant';
  const liveComplianceColor = liveCompliance ? 'success' : 'error';

  // Lighting System Evaluation state
  const [lightingStep1, setLightingStep1] = useState({ measured: 450, required: 500 });
  const [lightingStep2, setLightingStep2] = useState({ totalWattage: defaultLighting, floorArea: 200 });
  const [lightingStep3, setLightingStep3] = useState({ CRI: 82, required: 80 });
  const [showLightingStep1, setShowLightingStep1] = useState(false);
  const [showLightingStep2, setShowLightingStep2] = useState(false);
  const [showLightingStep3, setShowLightingStep3] = useState(false);
  const lpd = lightingStep2.floorArea ? (Number(lightingStep2.totalWattage) / Number(lightingStep2.floorArea)) : 0;

  // HVAC Performance Testing state
  const [hvacStep1, setHvacStep1] = useState({ cooling: 36000, power: 3500 });
  const [hvacStep2, setHvacStep2] = useState({ setpoint: 24, measured: [23.5, 24.2, 24.0] });
  const [hvacStep3, setHvacStep3] = useState({ occupants: 50, freshAir: 750 });
  const [showHvacStep1, setShowHvacStep1] = useState(false);
  const [showHvacStep2, setShowHvacStep2] = useState(false);
  const [showHvacStep3, setShowHvacStep3] = useState(false);
  const eer = hvacStep1.power ? (Number(hvacStep1.cooling) / Number(hvacStep1.power)) : 0;
  const tempVariance = Math.max(...hvacStep2.measured) - Math.min(...hvacStep2.measured);
  const freshAirPerPerson = hvacStep3.occupants ? (Number(hvacStep3.freshAir) / Number(hvacStep3.occupants)) : 0;

  // Lighting System Evaluation live compliance
  const lightingLiveCompliance = lightingStep1.measured >= lightingStep1.required && lpd <= lpdStandard && lightingStep3.CRI >= lightingStep3.required;
  const lightingLiveComplianceLabel = lightingLiveCompliance ? 'Compliant' : 'Non-compliant';
  const lightingLiveComplianceColor = lightingLiveCompliance ? 'success' : 'error';
  // HVAC Performance Testing live compliance
  const hvacLiveCompliance = eer >= eerStandard && tempVariance <= tempRange && freshAirPerPerson >= freshAirStandard;
  const hvacLiveComplianceLabel = hvacLiveCompliance ? 'Compliant' : 'Non-compliant';
  const hvacLiveComplianceColor = hvacLiveCompliance ? 'success' : 'error';

  // Add this function to save test results
  const saveTestResults = (testType: 'power' | 'lighting' | 'hvac', results: any) => {
    addTestResult({
      testType,
      results,
      standard: testType === 'power' ? powerStandard : testType === 'lighting' ? lightingStandard : hvacStandard,
      status: 'pending',
    });
  };

  // Update the existing test completion handlers
  const handlePowerTestComplete = async () => {
    await handleAsyncOperation(async () => {
      saveTestResults('power', {
        powerUsage: totalPower,
        compliance: {
          power: passStep1 && passStep2 && passStep3,
        },
      });
    });
  };

  const handleLightingTestComplete = () => {
    saveTestResults('lighting', {
      lightingEfficiency: (lightingStep1.measured / lightingStep1.required) * 100,
      compliance: {
        lighting: lightingStep1.measured >= lightingStep1.required && lpd <= lpdStandard && lightingStep3.CRI >= lightingStep3.required,
      },
    });
  };

  const handleHVACTestComplete = () => {
    saveTestResults('hvac', {
      hvacEfficiency: eer,
      compliance: {
        hvac: eer >= eerStandard && tempVariance <= tempRange && freshAirPerPerson >= freshAirStandard,
      },
    });
  };

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

  // Add reset handlers for each test
  const resetPowerUsage = () => {
    setStep1({ lighting: defaultLighting, hvac: defaultHVAC, equipment: defaultEquipment });
    setStep2({ peakHours: '14:00-17:00', averageLoad: 8500 });
    setStep3({ actualPF: 0.85, targetPF: pfTarget });
    setShowStep1(false);
    setShowStep2(false);
    setShowStep3(false);
  };
  const resetLighting = () => {
    setLightingStep1({ measured: 450, required: requiredLux });
    setLightingStep2({ totalWattage: defaultLighting, floorArea: 200 });
    setLightingStep3({ CRI: 82, required: requiredCRI });
    setShowLightingStep1(false);
    setShowLightingStep2(false);
    setShowLightingStep3(false);
  };
  const resetHVAC = () => {
    setHvacStep1({ cooling: 36000, power: 3500 });
    setHvacStep2({ setpoint: 24, measured: [23.5, 24.2, 24.0] });
    setHvacStep3({ occupants: 50, freshAir: freshAirStandard });
    setShowHvacStep1(false);
    setShowHvacStep2(false);
    setShowHvacStep3(false);
  };

  // Export handlers
  const exportPowerUsageCSV = () => {
    const rows = [
      ['Parameter', 'Value'],
      ['Lighting (W)', step1.lighting],
      ['HVAC (W)', step1.hvac],
      ['Equipment (W)', step1.equipment],
      ['Facility Limit (W)', facilityLimit],
      ['Total Power Usage (W)', totalPower],
      ['Compliance', passStep1 ? 'PASS' : 'FAIL'],
      ['Peak Hours', step2.peakHours],
      ['Average Load (W)', step2.averageLoad],
      ['Peak Limit (W)', peakLimit],
      ['Peak Compliance', passStep2 ? 'PASS' : 'FAIL'],
      ['Actual PF', step3.actualPF],
      ['Target PF', pfTarget],
      ['PF Compliance', passStep3 ? 'PASS' : 'FAIL'],
      ['Standard', STANDARD_OPTIONS.find(opt => opt.value === powerStandard)?.label || ''],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'power_usage_analysis.csv';
    link.click();
    setExportMessage('Power Usage Analysis exported as CSV.');
  };
  const exportPowerUsagePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Power Usage Analysis', 14, 18);
    doc.setFontSize(12);
    doc.text(`Standard: ${STANDARD_OPTIONS.find(opt => opt.value === powerStandard)?.label || ''}`, 14, 28);
    // @ts-ignore
    doc.autoTable({
      startY: 34,
      head: [['Parameter', 'Value']],
      body: [
        ['Lighting (W)', step1.lighting],
        ['HVAC (W)', step1.hvac],
        ['Equipment (W)', step1.equipment],
        ['Facility Limit (W)', facilityLimit],
        ['Total Power Usage (W)', totalPower],
        ['Compliance', passStep1 ? 'PASS' : 'FAIL'],
        ['Peak Hours', step2.peakHours],
        ['Average Load (W)', step2.averageLoad],
        ['Peak Limit (W)', peakLimit],
        ['Peak Compliance', passStep2 ? 'PASS' : 'FAIL'],
        ['Actual PF', step3.actualPF],
        ['Target PF', pfTarget],
        ['PF Compliance', passStep3 ? 'PASS' : 'FAIL'],
      ],
    });
    doc.save('power_usage_analysis.pdf');
    setExportMessage('Power Usage Analysis exported as PDF.');
  };

  // Export handlers for Lighting System Evaluation
  const exportLightingCSV = () => {
    const rows = [
      ['Parameter', 'Value'],
      ['Measured Lux', lightingStep1.measured],
      ['Required Lux', lightingStep1.required],
      ['Illumination Compliance', lightingStep1.measured >= lightingStep1.required ? 'PASS' : 'FAIL'],
      ['Total Wattage (W)', lightingStep2.totalWattage],
      ['Floor Area (m²)', lightingStep2.floorArea],
      ['LPD (W/m²)', lpd.toFixed(2)],
      ['LPD Standard', lpdStandard],
      ['LPD Compliance', lpd <= lpdStandard ? 'PASS' : 'FAIL'],
      ['CRI', lightingStep3.CRI],
      ['Required CRI', lightingStep3.required],
      ['CRI Compliance', lightingStep3.CRI >= lightingStep3.required ? 'PASS' : 'FAIL'],
      ['Standard', STANDARD_OPTIONS.find(opt => opt.value === lightingStandard)?.label || ''],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'lighting_system_evaluation.csv';
    link.click();
    setExportMessage('Lighting System Evaluation exported as CSV.');
  };
  const exportLightingPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Lighting System Evaluation', 14, 18);
    doc.setFontSize(12);
    doc.text(`Standard: ${STANDARD_OPTIONS.find(opt => opt.value === lightingStandard)?.label || ''}`, 14, 28);
    // @ts-ignore
    doc.autoTable({
      startY: 34,
      head: [['Parameter', 'Value']],
      body: [
        ['Measured Lux', lightingStep1.measured],
        ['Required Lux', lightingStep1.required],
        ['Illumination Compliance', lightingStep1.measured >= lightingStep1.required ? 'PASS' : 'FAIL'],
        ['Total Wattage (W)', lightingStep2.totalWattage],
        ['Floor Area (m²)', lightingStep2.floorArea],
        ['LPD (W/m²)', lpd.toFixed(2)],
        ['LPD Standard', lpdStandard],
        ['LPD Compliance', lpd <= lpdStandard ? 'PASS' : 'FAIL'],
        ['CRI', lightingStep3.CRI],
        ['Required CRI', lightingStep3.required],
        ['CRI Compliance', lightingStep3.CRI >= lightingStep3.required ? 'PASS' : 'FAIL'],
      ],
    });
    doc.save('lighting_system_evaluation.pdf');
    setExportMessage('Lighting System Evaluation exported as PDF.');
  };

  // Export handlers for HVAC Performance Testing
  const exportHVACCSV = () => {
    const rows = [
      ['Parameter', 'Value'],
      ['Cooling Output (BTU/hr)', hvacStep1.cooling],
      ['Power Input (W)', hvacStep1.power],
      ['EER', eer.toFixed(2)],
      ['EER Standard', eerStandard],
      ['EER Compliance', eer >= eerStandard ? 'PASS' : 'FAIL'],
      ['Setpoint (°C)', hvacStep2.setpoint],
      ['Measured Temps', hvacStep2.measured.join(', ')],
      ['Variance (°C)', tempVariance.toFixed(2)],
      ['Allowed Range (°C)', tempRange],
      ['Temp Compliance', tempVariance <= tempRange ? 'PASS' : 'FAIL'],
      ['Occupants', hvacStep3.occupants],
      ['Fresh Air (cfm)', hvacStep3.freshAir],
      ['Fresh Air per Person', freshAirPerPerson.toFixed(2)],
      ['Fresh Air Standard', freshAirStandard],
      ['Ventilation Compliance', freshAirPerPerson >= freshAirStandard ? 'PASS' : 'FAIL'],
      ['Standard', STANDARD_OPTIONS.find(opt => opt.value === hvacStandard)?.label || ''],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'hvac_performance_testing.csv';
    link.click();
    setExportMessage('HVAC Performance Testing exported as CSV.');
  };
  const exportHVACPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('HVAC Performance Testing', 14, 18);
    doc.setFontSize(12);
    doc.text(`Standard: ${STANDARD_OPTIONS.find(opt => opt.value === hvacStandard)?.label || ''}`, 14, 28);
    // @ts-ignore
    doc.autoTable({
      startY: 34,
      head: [['Parameter', 'Value']],
      body: [
        ['Cooling Output (BTU/hr)', hvacStep1.cooling],
        ['Power Input (W)', hvacStep1.power],
        ['EER', eer.toFixed(2)],
        ['EER Standard', eerStandard],
        ['EER Compliance', eer >= eerStandard ? 'PASS' : 'FAIL'],
        ['Setpoint (°C)', hvacStep2.setpoint],
        ['Measured Temps', hvacStep2.measured.join(', ')],
        ['Variance (°C)', tempVariance.toFixed(2)],
        ['Allowed Range (°C)', tempRange],
        ['Temp Compliance', tempVariance <= tempRange ? 'PASS' : 'FAIL'],
        ['Occupants', hvacStep3.occupants],
        ['Fresh Air (cfm)', hvacStep3.freshAir],
        ['Fresh Air per Person', freshAirPerPerson.toFixed(2)],
        ['Fresh Air Standard', freshAirStandard],
        ['Ventilation Compliance', freshAirPerPerson >= freshAirStandard ? 'PASS' : 'FAIL'],
      ],
    });
    doc.save('hvac_performance_testing.pdf');
    setExportMessage('HVAC Performance Testing exported as PDF.');
  };

  // Add step index state for each test
  const [powerStepIndex, setPowerStepIndex] = useState(0);
  const [lightingStepIndex, setLightingStepIndex] = useState(0);
  const [hvacStepIndex, setHvacStepIndex] = useState(0);

  // Helper: get step count for each test
  const POWER_STEPS = 3;
  const LIGHTING_STEPS = 3;
  const HVAC_STEPS = 3;

  // Load saved values on component mount
  useEffect(() => {
    const savedValues = loadSavedValues();
    setPowerStandard(savedValues.powerStandard);
    setLightingStandard(savedValues.lightingStandard);
    setHvacStandard(savedValues.hvacStandard);
    setPowerManual(savedValues.powerManual);
    setLightingManual(savedValues.lightingManual);
    setHvacManual(savedValues.hvacManual);
  }, []);

  // Add validation state
  const [validationErrors, setValidationErrors] = useState<{
    power: Record<string, string | null>;
    lighting: Record<string, string | null>;
    hvac: Record<string, string | null>;
  }>({
    power: {},
    lighting: {},
    hvac: {}
  });

  // Update manual value handlers with validation
  const handleManualValueChange = (
    category: 'power' | 'lighting' | 'hvac',
    field: string,
    value: number
  ) => {
    const error = validateManualInput(category, field, value);
    setValidationErrors(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: error }
    }));

    if (!error) {
      switch (category) {
        case 'power':
          setPowerManual(prev => ({ ...prev, [field]: value }));
          saveManualValues('power', { ...powerManual, [field]: value });
          break;
        case 'lighting':
          setLightingManual(prev => ({ ...prev, [field]: value }));
          saveManualValues('lighting', { ...lightingManual, [field]: value });
          break;
        case 'hvac':
          setHvacManual(prev => ({ ...prev, [field]: value }));
          saveManualValues('hvac', { ...hvacManual, [field]: value });
          break;
      }
    }
  };

  // Update standard selection handlers with persistence
  const handleStandardChange = (category: 'power' | 'lighting' | 'hvac', value: string) => {
    switch (category) {
      case 'power':
        setPowerStandard(value);
        saveStandardSelection('power', value);
        break;
      case 'lighting':
        setLightingStandard(value);
        saveStandardSelection('lighting', value);
        break;
      case 'hvac':
        setHvacStandard(value);
        saveStandardSelection('hvac', value);
        break;
    }
  };

  // Add validation function
  const validateManualInput = (category: 'power' | 'lighting' | 'hvac', field: string, value: number): string | null => {
    const range = VALIDATION_RANGES[category][field];
    if (value < range.min || value > range.max) {
      return ERROR_MESSAGES[category][field];
    }
    return null;
  };

  // Add persistence functions
  const saveStandardSelection = (category: 'power' | 'lighting' | 'hvac', standard: string) => {
    localStorage.setItem(`energyAudit_${category}Standard`, standard);
  };

  const saveManualValues = (category: 'power' | 'lighting' | 'hvac', values: any) => {
    localStorage.setItem(`energyAudit_${category}ManualValues`, JSON.stringify(values));
  };

  const loadSavedValues = () => {
    const powerStandard = localStorage.getItem('energyAudit_powerStandard') || 'ashrae2019';
    const lightingStandard = localStorage.getItem('energyAudit_lightingStandard') || 'ashrae2019';
    const hvacStandard = localStorage.getItem('energyAudit_hvacStandard') || 'ashrae2019';
    
    const powerManual = JSON.parse(localStorage.getItem('energyAudit_powerManualValues') || 'null');
    const lightingManual = JSON.parse(localStorage.getItem('energyAudit_lightingManualValues') || 'null');
    const hvacManual = JSON.parse(localStorage.getItem('energyAudit_hvacManualValues') || 'null');

    return {
      powerStandard,
      lightingStandard,
      hvacStandard,
      powerManual: powerManual || DEFAULT_STANDARDS.manual.power,
      lightingManual: lightingManual || DEFAULT_STANDARDS.manual.lighting,
      hvacManual: hvacManual || DEFAULT_STANDARDS.manual.hvac
    };
  };

  // Add state for help dialog
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);

  // Add addToHistory function
  const addToHistory = (category: 'power' | 'lighting' | 'hvac', standard: string, compliant: boolean) => {
    const savedHistory = localStorage.getItem(`energyAudit_${category}History`);
    const history = savedHistory ? JSON.parse(savedHistory) : [];
    const newHistory = [
      { date: new Date().toISOString(), standard, compliant },
      ...history.slice(0, 4)
    ];
    localStorage.setItem(`energyAudit_${category}History`, JSON.stringify(newHistory));
  };

  // Update the useEffect hooks to use the correct parameters
  useEffect(() => {
    if (showStep1 && showStep2 && showStep3) {
      addToHistory('power', powerStandard, passStep1 && passStep2 && passStep3);
    }
  }, [showStep1, showStep2, showStep3, powerStandard]);

  useEffect(() => {
    if (showLightingStep1 && showLightingStep2 && showLightingStep3) {
      addToHistory('lighting', lightingStandard, lightingStep1.measured >= lightingStep1.required && lpd <= lpdStandard && lightingStep3.CRI >= lightingStep3.required);
    }
  }, [showLightingStep1, showLightingStep2, showLightingStep3, lightingStandard]);

  useEffect(() => {
    if (showHvacStep1 && showHvacStep2 && showHvacStep3) {
      addToHistory('hvac', hvacStandard, eer >= eerStandard && tempVariance <= tempRange && freshAirPerPerson >= freshAirStandard);
    }
  }, [showHvacStep1, showHvacStep2, showHvacStep3, hvacStandard]);

  const [customStandards, setCustomStandards] = useState(() => {
    const saved = localStorage.getItem('energyAudit_customStandards');
    return saved ? JSON.parse(saved) : [];
  });
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [editingStandard, setEditingStandard] = useState(null);
  const [customForm, setCustomForm] = useState({
    name: '',
    power: { facilityLimit: '', peakLimit: '', pfTarget: '' },
    lighting: { lpd: '', requiredLux: '', requiredCRI: '' },
    hvac: { eer: '', tempRange: '', freshAir: '' }
  });

  const openCustomModal = (standard = null) => {
    setEditingStandard(standard);
    setCustomForm(standard || {
      name: '',
      power: { facilityLimit: '', peakLimit: '', pfTarget: '' },
      lighting: { lpd: '', requiredLux: '', requiredCRI: '' },
      hvac: { eer: '', tempRange: '', freshAir: '' }
    });
    setCustomModalOpen(true);
  };
  const closeCustomModal = () => setCustomModalOpen(false);
  const handleCustomFormChange = (cat, field, value) => {
    setCustomForm(f => ({
      ...f,
      [cat]: cat === 'name' ? value : { ...f[cat], [field]: value }
    }));
  };
  const saveCustomStandard = () => {
    let updated;
    if (editingStandard) {
      updated = customStandards.map(s => s === editingStandard ? customForm : s);
    } else {
      updated = [...customStandards, customForm];
    }
    setCustomStandards(updated);
    localStorage.setItem('energyAudit_customStandards', JSON.stringify(updated));
    setCustomModalOpen(false);
  };
  const deleteCustomStandard = (standard) => {
    const updated = customStandards.filter(s => s !== standard);
    setCustomStandards(updated);
    localStorage.setItem('energyAudit_customStandards', JSON.stringify(updated));
  };

  const customOptions = customStandards.map(s => ({ label: s.name, value: s.name }));
  const STANDARD_OPTIONS_WITH_CUSTOM = [
    ...STANDARD_OPTIONS,
    ...customOptions
  ];

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Add error handling wrapper
  const handleAsyncOperation = async (operation: () => Promise<void>) => {
    try {
      setIsLoading(true);
      setError(null);
      await operation();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  // Add refs for dialog openers
  const helpButtonRef = useRef<HTMLButtonElement>(null);
  const customButtonRef = useRef<HTMLButtonElement>(null);
  const lightingWizardButtonRef = useRef<HTMLButtonElement>(null);

  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Clear export message after a short delay
  useEffect(() => {
    if (exportMessage) {
      const timer = setTimeout(() => setExportMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [exportMessage]);

  // Add state for showing deleted history
  const [showDeletedPowerHistory, setShowDeletedPowerHistory] = useState(false);
  const [showDeletedLightingHistory, setShowDeletedLightingHistory] = useState(false);
  const [showDeletedHVACHistory, setShowDeletedHVACHistory] = useState(false);

  // Add clear history handlers
  const clearComplianceHistory = (category: 'power' | 'lighting' | 'hvac') => {
    const key = `energyAudit_${category}History`;
    const deletedKey = `energyAudit_${category}History_deleted`;
    const history = localStorage.getItem(key);
    if (history) {
      localStorage.setItem(deletedKey, history);
      localStorage.removeItem(key);
    }
    // Force re-render by updating state (could use a dummy state or reload)
    setDummyState(s => s + 1);
  };
  const [dummyState, setDummyState] = useState(0); // for re-render after clear

  return (
    <ErrorBoundary>
      <SkipToContent />
      <Box sx={{ p: 3 }} id="main-content" role="main" aria-label="Energy Audit Testing">
        {/* ARIA live region for export feedback */}
        <div aria-live="polite" style={visuallyHidden as React.CSSProperties}>
          {exportMessage}
          {isLoading && 'Loading, please wait...'}
        </div>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} role="alert">
            {error.message}
          </Alert>
        )}
        
        <Suspense fallback={<LoadingFallback />}>
          <React.Fragment>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h4" component="h1">Energy Audit Testing</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Tooltip title="Help & Documentation">
                  <IconButton
                    ref={helpButtonRef}
                    onClick={() => setHelpDialogOpen(true)}
                    aria-label="Open help and documentation"
                  >
                    <HelpOutlineIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={showAnalytics ? 'Hide Analytics' : 'Show Analytics'}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    aria-label={showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                    aria-expanded={showAnalytics}
                  >
                    {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                  </Button>
                </Tooltip>
                <Tooltip title="Export Results">
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={!testCases.some(t => t.status === 'passed' || t.status === 'failed')}
                    aria-label="Export Results"
        >
          Export Results
        </Button>
                </Tooltip>
              </Box>
      </Box>

            {showAnalytics && (
              <Box sx={{ mb: 3 }} role="region" aria-label="Analytics Dashboard">
                <EnergyAuditAnalytics />
              </Box>
            )}

            <HelpDialog
              open={helpDialogOpen}
              onClose={() => {
                setHelpDialogOpen(false);
                setTimeout(() => helpButtonRef.current?.focus(), 0);
              }}
            />

      <Grid container spacing={3}>
        {testCases.map((test) => (
          <Grid item xs={12} key={test.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ mr: 2 }} aria-hidden="true">{getCategoryIcon(test.category)}</Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">
                      {test.name}
                      {test.status !== 'pending' && (
                              <Box component="span" sx={{ ml: 2 }} aria-label={`Status: ${test.status}`}>
                          {getStatusIcon(test.status)}
                        </Box>
                      )}
                    </Typography>
                    <Typography color="textSecondary">{test.description}</Typography>
                  </Box>
                        {test.id === '1' && (
                          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Tooltip title="Select power standard">
                              <TextField
                                select
                                label="Standard"
                                value={powerStandard}
                                onChange={e => setPowerStandard(e.target.value)}
                                size="small"
                                sx={{ minWidth: 200 }}
                                aria-label="Select power standard"
                              >
                                {STANDARD_OPTIONS.map(opt => (
                                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                ))}
                              </TextField>
                            </Tooltip>
                            <Tooltip title={powerStandard === 'ashrae2019' ? 'ASHRAE 90.1-2019 - Facility Limit 12,000W, Peak 9,000W, PF 0.95' : powerStandard === 'ashrae2022' ? 'ASHRAE 90.1-2022 - Facility Limit 11,000W, Peak 8,500W, PF 0.97' : powerStandard === 'emh2023' ? 'Energy Management Handbook 2023 - Facility Limit 12,000W, Peak 9,000W, PF 0.95' : powerStandard === 'iso50001' ? 'ISO 50001:2018 - Facility Limit 13,000W, Peak 9,500W, PF 0.93' : 'Manual values'}>
                              <IconButton aria-label="Power standard info"><InfoIcon /></IconButton>
                            </Tooltip>
                            {powerStandard === 'manual' && (
                              <>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  <TextField
                                    label="Facility Limit (W)"
                                    type="number"
                                    value={powerManual.facilityLimit}
                                    onChange={e => handleManualValueChange('power', 'facilityLimit', Number(e.target.value))}
                                    size="small"
                                    sx={{ width: 120 }}
                                    error={!!validationErrors.power.facilityLimit}
                                    helperText={validationErrors.power.facilityLimit}
                                  />
                                  <TextField
                                    label="Peak Limit (W)"
                                    type="number"
                                    value={powerManual.peakLimit}
                                    onChange={e => handleManualValueChange('power', 'peakLimit', Number(e.target.value))}
                                    size="small"
                                    sx={{ width: 120 }}
                                    error={!!validationErrors.power.peakLimit}
                                    helperText={validationErrors.power.peakLimit}
                                  />
                                  <TextField
                                    label="PF Target"
                                    type="number"
                                    value={powerManual.pfTarget}
                                    onChange={e => handleManualValueChange('power', 'pfTarget', Number(e.target.value))}
                                    size="small"
                                    sx={{ width: 100 }}
                                    error={!!validationErrors.power.pfTarget}
                                    helperText={validationErrors.power.pfTarget}
                                  />
                </Box>
                              </>
                            )}
                            <Button variant="outlined" color="secondary" onClick={resetPowerUsage}>Reset All Steps</Button>
                            <Button variant="outlined" color="primary" onClick={exportPowerUsageCSV}>Export CSV</Button>
                            <Button variant="outlined" color="primary" onClick={exportPowerUsagePDF}>Export PDF</Button>
                          </Box>
                        )}

                        {test.id === '2' && (
                          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Tooltip title="Select lighting standard">
                              <TextField
                                select
                                label="Standard"
                                value={lightingStandard}
                                onChange={e => setLightingStandard(e.target.value)}
                                size="small"
                                sx={{ minWidth: 200 }}
                                aria-label="Select lighting standard"
                              >
                                {STANDARD_OPTIONS.map(opt => (
                                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                ))}
                              </TextField>
                            </Tooltip>
                            <Tooltip title={lightingStandard === 'ashrae2019' ? 'ASHRAE 90.1-2019 - LPD 10 W/m², Lux 500, CRI 80' : lightingStandard === 'ashrae2022' ? 'ASHRAE 90.1-2022 - LPD 9 W/m², Lux 500, CRI 85' : lightingStandard === 'emh2023' ? 'Energy Management Handbook 2023 - LPD 12 W/m², Lux 500, CRI 80' : lightingStandard === 'iso50001' ? 'ISO 50001:2018 - LPD 11 W/m², Lux 450, CRI 82' : 'Manual values'}>
                              <IconButton aria-label="Lighting standard info"><InfoIcon /></IconButton>
                            </Tooltip>
                            {lightingStandard === 'manual' && (
                              <>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  <TextField
                                    label="LPD (W/m²)"
                                    type="number"
                                    value={lightingManual.lpd}
                                    onChange={e => handleManualValueChange('lighting', 'lpd', Number(e.target.value))}
                                    size="small"
                                    sx={{ width: 120 }}
                                    error={!!validationErrors.lighting.lpd}
                                    helperText={validationErrors.lighting.lpd}
                                  />
                                  <TextField
                                    label="Required Lux"
                                    type="number"
                                    value={lightingManual.requiredLux}
                                    onChange={e => handleManualValueChange('lighting', 'requiredLux', Number(e.target.value))}
                                    size="small"
                                    sx={{ width: 120 }}
                                    error={!!validationErrors.lighting.requiredLux}
                                    helperText={validationErrors.lighting.requiredLux}
                                  />
                                  <TextField
                                    label="Required CRI"
                                    type="number"
                                    value={lightingManual.requiredCRI}
                                    onChange={e => handleManualValueChange('lighting', 'requiredCRI', Number(e.target.value))}
                                    size="small"
                                    sx={{ width: 120 }}
                                    error={!!validationErrors.lighting.requiredCRI}
                                    helperText={validationErrors.lighting.requiredCRI}
                                  />
                                </Box>
                              </>
                            )}
                            <Button variant="outlined" color="secondary" onClick={resetLighting}>Reset All Steps</Button>
                            <Button variant="outlined" color="primary" onClick={exportLightingCSV}>Export CSV</Button>
                            <Button variant="outlined" color="primary" onClick={exportLightingPDF}>Export PDF</Button>
                          </Box>
                        )}

                        {test.id === '3' && (
                          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Tooltip title="Select HVAC standard">
                              <TextField
                                select
                                label="Standard"
                                value={hvacStandard}
                                onChange={e => setHvacStandard(e.target.value)}
                                size="small"
                                sx={{ minWidth: 200 }}
                                aria-label="Select HVAC standard"
                              >
                                {STANDARD_OPTIONS.map(opt => (
                                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                ))}
                              </TextField>
                            </Tooltip>
                            <Tooltip title={hvacStandard === 'ashrae2019' ? 'ASHRAE 90.1-2019 - EER 10, Temp Range ±1°C, Fresh Air 15 cfm/person' : hvacStandard === 'ashrae2022' ? 'ASHRAE 90.1-2022 - EER 11, Temp Range ±0.8°C, Fresh Air 17 cfm/person' : hvacStandard === 'emh2023' ? 'Energy Management Handbook 2023 - EER 9, Temp Range ±1°C, Fresh Air 12 cfm/person' : hvacStandard === 'iso50001' ? 'ISO 50001:2018 - EER 9.5, Temp Range ±1.2°C, Fresh Air 14 cfm/person' : 'Manual values'}>
                              <IconButton aria-label="HVAC standard info"><InfoIcon /></IconButton>
                            </Tooltip>
                            {hvacStandard === 'manual' && (
                              <>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  <TextField
                                    label="EER"
                                    type="number"
                                    value={hvacManual.eer}
                                    onChange={e => handleManualValueChange('hvac', 'eer', Number(e.target.value))}
                                    size="small"
                                    sx={{ width: 100 }}
                                    error={!!validationErrors.hvac.eer}
                                    helperText={validationErrors.hvac.eer}
                                  />
                                  <TextField
                                    label="Temp Range (°C)"
                                    type="number"
                                    value={hvacManual.tempRange}
                                    onChange={e => handleManualValueChange('hvac', 'tempRange', Number(e.target.value))}
                                    size="small"
                                    sx={{ width: 120 }}
                                    error={!!validationErrors.hvac.tempRange}
                                    helperText={validationErrors.hvac.tempRange}
                                  />
                                  <TextField
                                    label="Fresh Air (cfm/person)"
                                    type="number"
                                    value={hvacManual.freshAir}
                                    onChange={e => handleManualValueChange('hvac', 'freshAir', Number(e.target.value))}
                                    size="small"
                                    sx={{ width: 150 }}
                                    error={!!validationErrors.hvac.freshAir}
                                    helperText={validationErrors.hvac.freshAir}
                                  />
                                </Box>
                              </>
                            )}
                            <Button variant="outlined" color="secondary" onClick={resetHVAC}>Reset All Steps</Button>
                            <Button variant="outlined" color="primary" onClick={exportHVACCSV}>Export CSV</Button>
                            <Button variant="outlined" color="primary" onClick={exportHVACPDF}>Export PDF</Button>
                          </Box>
                        )}
                      </Box>

                      {test.id === '1' && (
                  <Box sx={{ mb: 2 }}>
                          {/* Live compliance badge/banner */}
                          <Chip
                            label={`Live Compliance: ${liveComplianceLabel}`}
                            color={liveComplianceColor}
                            variant="outlined"
                            sx={{ mb: 1 }}
                          />
                  </Box>
                )}

                      {test.id === '1' && (
                        <>
                          <Box sx={{ mb: 2 }}>
                            <LinearProgress variant="determinate" value={((powerStepIndex + 1) / POWER_STEPS) * 100} sx={{ height: 8, borderRadius: 4 }} />
                            <Typography variant="caption" sx={{ ml: 1 }}>{`Step ${powerStepIndex + 1} of ${POWER_STEPS}`}</Typography>
                          </Box>
                          <Stepper activeStep={powerStepIndex} orientation="vertical">
                            {/* Step 1 */}
                            <Step completed={showStep1}>
                              <StepLabel>Calculate total power consumption</StepLabel>
                      <StepContent>
                        <Box sx={{ mb: 2 }}>
                                  <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                      <TextField
                                        label="Lighting (W)"
                                        type="number"
                                        value={step1.lighting}
                                        onChange={e => setStep1(s => ({ ...s, lighting: Number(e.target.value) }))}
                                        fullWidth
                                      />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                      <TextField
                                        label="HVAC (W)"
                                        type="number"
                                        value={step1.hvac}
                                        onChange={e => setStep1(s => ({ ...s, hvac: Number(e.target.value) }))}
                                        fullWidth
                                      />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                      <TextField
                                        label="Equipment (W)"
                                        type="number"
                                        value={step1.equipment}
                                        onChange={e => setStep1(s => ({ ...s, equipment: Number(e.target.value) }))}
                                        fullWidth
                                      />
                                    </Grid>
                                  </Grid>
                                  <Button variant="contained" sx={{ mt: 2, mr: 1 }} onClick={() => { setShowStep1(true); setPowerStepIndex(1); }}>Calculate</Button>
                                  <Button sx={{ mt: 2 }} disabled={powerStepIndex === 0} onClick={() => setPowerStepIndex(powerStepIndex - 1)}>Back</Button>
                        </Box>
                      </StepContent>
                    </Step>
                            {/* Step 2 */}
                            <Step active={powerStepIndex === 1} completed={showStep2}>
                              <StepLabel>Analyze peak demand</StepLabel>
                              <StepContent>
                                <Box sx={{ mb: 2 }}>
                                  <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                      <TextField
                                        label="Peak Hours"
                                        value={step2.peakHours}
                                        onChange={e => setStep2(s => ({ ...s, peakHours: e.target.value }))}
                                        fullWidth
                                      />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <TextField
                                        label="Average Load (W)"
                                        type="number"
                                        value={step2.averageLoad}
                                        onChange={e => setStep2(s => ({ ...s, averageLoad: Number(e.target.value) }))}
                                        fullWidth
                                      />
                                    </Grid>
                                  </Grid>
                                  <Button variant="contained" sx={{ mt: 2, mr: 1 }} onClick={() => { setShowStep2(true); setPowerStepIndex(2); }}>Analyze</Button>
                                  <Button sx={{ mt: 2 }} onClick={() => setPowerStepIndex(powerStepIndex - 1)}>Back</Button>
                                </Box>
                              </StepContent>
                            </Step>
                            {/* Step 3 */}
                            <Step active={powerStepIndex === 2} completed={showStep3}>
                              <StepLabel>Verify power factor</StepLabel>
                              <StepContent>
                                <Box sx={{ mb: 2 }}>
                                  <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                      <TextField
                                        label="Actual Power Factor"
                                        type="number"
                                        value={step3.actualPF}
                                        onChange={e => setStep3(s => ({ ...s, actualPF: Number(e.target.value) }))}
                                        fullWidth
                                      />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <TextField
                                        label="Target Power Factor"
                                        type="number"
                                        value={step3.targetPF}
                                        onChange={e => setStep3(s => ({ ...s, targetPF: Number(e.target.value) }))}
                                        fullWidth
                                      />
                                    </Grid>
                                  </Grid>
                                  <Button variant="contained" sx={{ mt: 2, mr: 1 }} onClick={() => setShowStep3(true)}>Verify</Button>
                                  <Button sx={{ mt: 2 }} onClick={() => setPowerStepIndex(powerStepIndex - 1)}>Back</Button>
                                </Box>
                              </StepContent>
                            </Step>
                </Stepper>
                        </>
                      )}

                      {/* Only show detailed compliance after all steps completed */}
                      {test.id === '1' && showStep1 && showStep2 && showStep3 && (
                        <Box sx={{ mt: 3 }}>
                          <Card sx={{ p: 2, bgcolor: (passStep1 && passStep2 && passStep3) ? 'success.lighter' : 'error.lighter', color: (passStep1 && passStep2 && passStep3) ? 'success.main' : 'error.main', border: `2px solid ${(passStep1 && passStep2 && passStep3) ? '#2e7d32' : '#d32f2f'}` }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              Overall Compliance: {(passStep1 && passStep2 && passStep3) ? 'PASS' : 'FAIL'}
                            </Typography>
                            <Typography sx={{ mt: 1 }}>
                              <b>Key Findings:</b><br />
                              - Total Power Usage: {totalPower} W ({passStep1 ? 'Compliant' : 'Non-compliant'})<br />
                              - Peak Demand: {step2.averageLoad} W ({passStep2 ? 'Compliant' : 'Non-compliant'})<br />
                              - Power Factor: {step3.actualPF} ({passStep3 ? 'Compliant' : 'Non-compliant'})
                            </Typography>
                            <Typography sx={{ mt: 1 }}>
                              <b>Recommendations:</b><br />
                              {!passStep1 && '- Reduce total power usage or improve efficiency.\n'}
                              {!passStep2 && '- Manage peak demand or shift loads.\n'}
                              {!passStep3 && '- Improve power factor (consider correction equipment).\n'}
                              {(passStep1 && passStep2 && passStep3) && '- All parameters are compliant. Maintain current practices.'}
                            </Typography>
                          </Card>
                        </Box>
                      )}

                      {test.id === '2' && (
                        <>
                          <Box sx={{ mb: 2 }}>
                            <LinearProgress variant="determinate" value={((lightingStepIndex + 1) / LIGHTING_STEPS) * 100} sx={{ height: 8, borderRadius: 4 }} />
                            <Typography variant="caption" sx={{ ml: 1 }}>{`Step ${lightingStepIndex + 1} of ${LIGHTING_STEPS}`}</Typography>
                          </Box>
                          <Stepper activeStep={lightingStepIndex} orientation="vertical">
                            {/* Step 1 */}
                            <Step completed={showLightingStep1}>
                              <StepLabel>Measure illumination levels</StepLabel>
                              <StepContent>
                                <Box sx={{ mb: 2 }}>
                                  <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                      <TextField
                                        label="Measured (lux)"
                                        type="number"
                                        value={lightingStep1.measured}
                                        onChange={e => setLightingStep1(s => ({ ...s, measured: Number(e.target.value) }))}
                                        fullWidth
                                      />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <TextField
                                        label="Required (lux)"
                                        type="number"
                                        value={lightingStep1.required}
                                        onChange={e => setLightingStep1(s => ({ ...s, required: Number(e.target.value) }))}
                                        fullWidth
                                      />
                                    </Grid>
                                  </Grid>
                                  <Button variant="contained" sx={{ mt: 2, mr: 1 }} onClick={() => { setShowLightingStep1(true); setLightingStepIndex(1); }}>Measure</Button>
                                  <Button sx={{ mt: 2 }} disabled={lightingStepIndex === 0} onClick={() => setLightingStepIndex(lightingStepIndex - 1)}>Back</Button>
                                </Box>
                              </StepContent>
                            </Step>
                            {/* Step 2 */}
                            <Step active={lightingStepIndex === 1} completed={showLightingStep2}>
                              <StepLabel>Calculate lighting power density</StepLabel>
                              <StepContent>
                                <Box sx={{ mb: 2 }}>
                                  <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                      <TextField
                                        label="Total Wattage (W)"
                                        type="number"
                                        value={lightingStep2.totalWattage}
                                        onChange={e => setLightingStep2(s => ({ ...s, totalWattage: Number(e.target.value) }))}
                                        fullWidth
                                      />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <TextField
                                        label="Floor Area (m²)"
                                        type="number"
                                        value={lightingStep2.floorArea}
                                        onChange={e => setLightingStep2(s => ({ ...s, floorArea: Number(e.target.value) }))}
                                        fullWidth
                                      />
                                    </Grid>
                                  </Grid>
                                  <Button variant="contained" sx={{ mt: 2, mr: 1 }} onClick={() => { setShowLightingStep2(true); setLightingStepIndex(2); }}>Calculate</Button>
                                  <Button sx={{ mt: 2 }} onClick={() => setLightingStepIndex(lightingStepIndex - 1)}>Back</Button>
                                </Box>
                              </StepContent>
                            </Step>
                            {/* Step 3 */}
                            <Step active={lightingStepIndex === 2} completed={showLightingStep3}>
                              <StepLabel>Evaluate color rendering</StepLabel>
                              <StepContent>
                                <Box sx={{ mb: 2 }}>
                                  <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                      <TextField
                                        label="CRI"
                                        type="number"
                                        value={lightingStep3.CRI}
                                        onChange={e => setLightingStep3(s => ({ ...s, CRI: Number(e.target.value) }))}
                                        fullWidth
                                      />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <TextField
                                        label="Required CRI"
                                        type="number"
                                        value={lightingStep3.required}
                                        onChange={e => setLightingStep3(s => ({ ...s, required: Number(e.target.value) }))}
                                        fullWidth
                                      />
                                    </Grid>
                                  </Grid>
                                  <Button variant="contained" sx={{ mt: 2, mr: 1 }} onClick={() => setShowLightingStep3(true)}>Evaluate</Button>
                                  <Button sx={{ mt: 2 }} onClick={() => setLightingStepIndex(lightingStepIndex - 1)}>Back</Button>
                                </Box>
                              </StepContent>
                            </Step>
                          </Stepper>
                        </>
                      )}

                      {test.id === '2' && showLightingStep1 && showLightingStep2 && showLightingStep3 && (
                        <Box sx={{ mt: 3 }}>
                          <Card sx={{ p: 2, bgcolor: (lightingStep1.measured >= lightingStep1.required && lpd <= lpdStandard && lightingStep3.CRI >= lightingStep3.required) ? 'success.lighter' : 'error.lighter', color: (lightingStep1.measured >= lightingStep1.required && lpd <= lpdStandard && lightingStep3.CRI >= lightingStep3.required) ? 'success.main' : 'error.main', border: `2px solid ${(lightingStep1.measured >= lightingStep1.required && lpd <= lpdStandard && lightingStep3.CRI >= lightingStep3.required) ? '#2e7d32' : '#d32f2f'}` }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              Overall Compliance: {(lightingStep1.measured >= lightingStep1.required && lpd <= lpdStandard && lightingStep3.CRI >= lightingStep3.required) ? 'PASS' : 'FAIL'}
                            </Typography>
                            <Typography sx={{ mt: 1 }}>
                              <b>Key Findings:</b><br />
                              - Illumination: {lightingStep1.measured} lux ({lightingStep1.measured >= lightingStep1.required ? 'Compliant' : 'Non-compliant'})<br />
                              - LPD: {lpd.toFixed(2)} W/m² ({lpd <= lpdStandard ? 'Compliant' : 'Non-compliant'})<br />
                              - CRI: {lightingStep3.CRI} ({lightingStep3.CRI >= lightingStep3.required ? 'Compliant' : 'Non-compliant'})
                            </Typography>
                            <Typography sx={{ mt: 1 }}>
                              <b>Recommendations:</b><br />
                              {lightingStep1.measured < lightingStep1.required && '- Increase illumination to meet standard.\n'}
                              {lpd > lpdStandard && '- Reduce lighting power density or improve efficiency.\n'}
                              {lightingStep3.CRI < lightingStep3.required && '- Upgrade lighting to improve color rendering.\n'}
                              {(lightingStep1.measured >= lightingStep1.required && lpd <= lpdStandard && lightingStep3.CRI >= lightingStep3.required) && '- All parameters are compliant. Maintain current practices.'}
                            </Typography>
                          </Card>
                        </Box>
                      )}

                      {test.id === '3' && (
                        <>
                          <Box sx={{ mb: 2 }}>
                            <LinearProgress variant="determinate" value={((hvacStepIndex + 1) / HVAC_STEPS) * 100} sx={{ height: 8, borderRadius: 4 }} />
                            <Typography variant="caption" sx={{ ml: 1 }}>{`Step ${hvacStepIndex + 1} of ${HVAC_STEPS}`}</Typography>
                          </Box>
                          <Stepper activeStep={hvacStepIndex} orientation="vertical">
                            {/* Step 1 */}
                            <Step completed={showHvacStep1}>
                              <StepLabel>Measure system efficiency</StepLabel>
                              <StepContent>
                                <Box sx={{ mb: 2 }}>
                                  <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                      <TextField
                                        label="Cooling Output (BTU/hr)"
                                        type="number"
                                        value={hvacStep1.cooling}
                                        onChange={e => setHvacStep1(s => ({ ...s, cooling: Number(e.target.value) }))}
                                        fullWidth
                                      />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <TextField
                                        label="Power Input (W)"
                                        type="number"
                                        value={hvacStep1.power}
                                        onChange={e => setHvacStep1(s => ({ ...s, power: Number(e.target.value) }))}
                                        fullWidth
                                      />
                                    </Grid>
                                  </Grid>
                                  <Button variant="contained" sx={{ mt: 2, mr: 1 }} onClick={() => { setShowHvacStep1(true); setHvacStepIndex(1); }}>Calculate</Button>
                                  <Button sx={{ mt: 2 }} disabled={hvacStepIndex === 0} onClick={() => setHvacStepIndex(hvacStepIndex - 1)}>Back</Button>
                                </Box>
                              </StepContent>
                            </Step>
                            {/* Step 2 */}
                            <Step active={hvacStepIndex === 1} completed={showHvacStep2}>
                              <StepLabel>Check temperature distribution</StepLabel>
                              <StepContent>
                                <Box sx={{ mb: 2 }}>
                                  <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                      <TextField
                                        label="Setpoint (°C)"
                                        type="number"
                                        value={hvacStep2.setpoint}
                                        onChange={e => setHvacStep2(s => ({ ...s, setpoint: Number(e.target.value) }))}
                                        fullWidth
                                      />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <TextField
                                        label="Measured Temps (comma separated)"
                                        value={hvacStep2.measured.join(', ')}
                                        onChange={e => setHvacStep2(s => ({ ...s, measured: e.target.value.split(',').map(v => Number(v.trim())) }))}
                                        fullWidth
                                      />
                                    </Grid>
                                  </Grid>
                                  <Button variant="contained" sx={{ mt: 2, mr: 1 }} onClick={() => { setShowHvacStep2(true); setHvacStepIndex(2); }}>Check</Button>
                                  <Button sx={{ mt: 2 }} onClick={() => setHvacStepIndex(hvacStepIndex - 1)}>Back</Button>
                                </Box>
                              </StepContent>
                            </Step>
                            {/* Step 3 */}
                            <Step active={hvacStepIndex === 2} completed={showHvacStep3}>
                              <StepLabel>Verify ventilation rates</StepLabel>
                              <StepContent>
                                <Box sx={{ mb: 2 }}>
                                  <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                      <TextField
                                        label="Occupants"
                                        type="number"
                                        value={hvacStep3.occupants}
                                        onChange={e => setHvacStep3(s => ({ ...s, occupants: Number(e.target.value) }))}
                                        fullWidth
                                      />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <TextField
                                        label="Fresh Air (cfm)"
                                        type="number"
                                        value={hvacStep3.freshAir}
                                        onChange={e => setHvacStep3(s => ({ ...s, freshAir: Number(e.target.value) }))}
                                        fullWidth
                                      />
                                    </Grid>
                                  </Grid>
                                  <Button variant="contained" sx={{ mt: 2, mr: 1 }} onClick={() => setShowHvacStep3(true)}>Verify</Button>
                                  <Button sx={{ mt: 2 }} onClick={() => setHvacStepIndex(hvacStepIndex - 1)}>Back</Button>
                                </Box>
                              </StepContent>
                            </Step>
                          </Stepper>
                        </>
                      )}

                      {test.id === '3' && showHvacStep1 && showHvacStep2 && showHvacStep3 && (
                        <Box sx={{ mt: 3 }}>
                          <Card sx={{ p: 2, bgcolor: (eer >= eerStandard && tempVariance <= tempRange && freshAirPerPerson >= freshAirStandard) ? 'success.lighter' : 'error.lighter', color: (eer >= eerStandard && tempVariance <= tempRange && freshAirPerPerson >= freshAirStandard) ? 'success.main' : 'error.main', border: `2px solid ${(eer >= eerStandard && tempVariance <= tempRange && freshAirPerPerson >= freshAirStandard) ? '#2e7d32' : '#d32f2f'}` }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              Overall Compliance: {(eer >= eerStandard && tempVariance <= tempRange && freshAirPerPerson >= freshAirStandard) ? 'PASS' : 'FAIL'}
                            </Typography>
                            <Typography sx={{ mt: 1 }}>
                              <b>Key Findings:</b><br />
                              - EER: {eer.toFixed(2)} ({eer >= eerStandard ? 'Compliant' : 'Non-compliant'})<br />
                              - Temp Variance: {tempVariance.toFixed(2)}°C ({tempVariance <= tempRange ? 'Compliant' : 'Non-compliant'})<br />
                              - Fresh Air per Person: {freshAirPerPerson.toFixed(2)} cfm ({freshAirPerPerson >= freshAirStandard ? 'Compliant' : 'Non-compliant'})
                            </Typography>
                            <Typography sx={{ mt: 1 }}>
                              <b>Recommendations:</b><br />
                              {eer < eerStandard && '- Improve system efficiency (maintenance or upgrades).\n'}
                              {tempVariance > tempRange && '- Balance system to reduce temperature variance.\n'}
                              {freshAirPerPerson < freshAirStandard && '- Increase ventilation to meet standard.\n'}
                              {(eer >= eerStandard && tempVariance <= tempRange && freshAirPerPerson >= freshAirStandard) && '- All parameters are compliant. Maintain current practices.'}
                            </Typography>
                          </Card>
                        </Box>
                      )}

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

                      {/* Add standard info display after each standard selection */}
                      <StandardInfo standard={powerStandard} />
                      <StandardInfo standard={lightingStandard} />
                      <StandardInfo standard={hvacStandard} />

                      {/* Add validation summary component */}
                      <ValidationSummary category="power" errors={validationErrors.power} />
                      <ValidationSummary category="lighting" errors={validationErrors.lighting} />
                      <ValidationSummary category="hvac" errors={validationErrors.hvac} />

                      {/* Add standard comparison and compliance history to each test section */}
                      {test.id === '1' && (
                        <Box>
                          <StandardComparison 
                            category="power" 
                            standards={STANDARD_OPTIONS.filter(opt => opt.value !== 'manual')}
                            defaultStandards={DEFAULT_STANDARDS}
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Button size="small" variant="outlined" color="error" onClick={() => clearComplianceHistory('power')}>Clear History</Button>
                            <Button size="small" variant="text" onClick={() => setShowDeletedPowerHistory(v => !v)}>{showDeletedPowerHistory ? 'Hide' : 'View'} Deleted History</Button>
                          </Box>
                          <ComplianceHistory 
                            category="power" 
                            history={JSON.parse(localStorage.getItem('energyAudit_powerHistory') || '[]')}
                          />
                          {showDeletedPowerHistory && (
                            <Box sx={{ mt: 1, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                              <Typography variant="subtitle2">Deleted Power Compliance History</Typography>
                              <ComplianceHistory 
                                category="power" 
                                history={JSON.parse(localStorage.getItem('energyAudit_powerHistory_deleted') || '[]')}
                              />
                            </Box>
                          )}
                        </Box>
                      )}

                      {test.id === '2' && (
                        <Box>
                          <StandardComparison 
                            category="lighting" 
                            standards={STANDARD_OPTIONS.filter(opt => opt.value !== 'manual')}
                            defaultStandards={DEFAULT_STANDARDS}
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Button size="small" variant="outlined" color="error" onClick={() => clearComplianceHistory('lighting')}>Clear History</Button>
                            <Button size="small" variant="text" onClick={() => setShowDeletedLightingHistory(v => !v)}>{showDeletedLightingHistory ? 'Hide' : 'View'} Deleted History</Button>
                          </Box>
                          <ComplianceHistory 
                            category="lighting" 
                            history={JSON.parse(localStorage.getItem('energyAudit_lightingHistory') || '[]')}
                          />
                          {showDeletedLightingHistory && (
                            <Box sx={{ mt: 1, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                              <Typography variant="subtitle2">Deleted Lighting Compliance History</Typography>
                              <ComplianceHistory 
                                category="lighting" 
                                history={JSON.parse(localStorage.getItem('energyAudit_lightingHistory_deleted') || '[]')}
                              />
                            </Box>
                          )}
                        </Box>
                      )}

                      {test.id === '3' && (
                        <Box>
                          <StandardComparison 
                            category="hvac" 
                            standards={STANDARD_OPTIONS.filter(opt => opt.value !== 'manual')}
                            defaultStandards={DEFAULT_STANDARDS}
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Button size="small" variant="outlined" color="error" onClick={() => clearComplianceHistory('hvac')}>Clear History</Button>
                            <Button size="small" variant="text" onClick={() => setShowDeletedHVACHistory(v => !v)}>{showDeletedHVACHistory ? 'Hide' : 'View'} Deleted History</Button>
                          </Box>
                          <ComplianceHistory 
                            category="hvac" 
                            history={JSON.parse(localStorage.getItem('energyAudit_hvacHistory') || '[]')}
                          />
                          {showDeletedHVACHistory && (
                            <Box sx={{ mt: 1, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                              <Typography variant="subtitle2">Deleted HVAC Compliance History</Typography>
                              <ComplianceHistory 
                                category="hvac" 
                                history={JSON.parse(localStorage.getItem('energyAudit_hvacHistory_deleted') || '[]')}
                              />
                            </Box>
                          )}
                        </Box>
                      )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

            {/* Lighting System Evaluation Wizard Button */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6">Lighting System Evaluation</Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Assess lighting system efficiency and compliance
                </Typography>
                <Button
                  ref={lightingWizardButtonRef}
                  variant="outlined"
                  color="primary"
                  sx={{ mt: 1 }}
                  onClick={() => setLightingWizardOpen(true)}
                >
                  Advanced Lighting Calculation Wizard
                </Button>
              </CardContent>
            </Card>

            <Modal
              open={lightingWizardOpen}
              onClose={() => {
                setLightingWizardOpen(false);
                setTimeout(() => lightingWizardButtonRef.current?.focus(), 0);
              }}
              aria-labelledby="lighting-wizard-title"
              aria-describedby="lighting-wizard-desc"
            >
              <Box sx={{ outline: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <LightingCalculationWizard onClose={() => {
                  setLightingWizardOpen(false);
                  setTimeout(() => lightingWizardButtonRef.current?.focus(), 0);
                }} />
    </Box>
            </Modal>

            {/* Custom Standards Dialog Button */}
            <Button
              ref={customButtonRef}
              variant="outlined"
              sx={{ mb: 2 }}
              onClick={() => setCustomModalOpen(true)}
            >
              Manage Custom Standards
            </Button>
            <Dialog
              open={customModalOpen}
              onClose={() => {
                setCustomModalOpen(false);
                setTimeout(() => customButtonRef.current?.focus(), 0);
              }}
              maxWidth="md"
              fullWidth
              aria-labelledby="custom-standards-title"
            >
              <DialogTitle id="custom-standards-title">{editingStandard ? 'Edit Custom Standard' : 'Add Custom Standard'}</DialogTitle>
              <DialogContent>
                <TextField label="Name" value={customForm.name} onChange={e => handleCustomFormChange('name', null, e.target.value)} fullWidth sx={{ mb: 2 }} />
                <Typography variant="subtitle2">Power</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField label="Facility Limit (W)" value={customForm.power.facilityLimit} onChange={e => handleCustomFormChange('power', 'facilityLimit', e.target.value)} type="number" />
                  <TextField label="Peak Limit (W)" value={customForm.power.peakLimit} onChange={e => handleCustomFormChange('power', 'peakLimit', e.target.value)} type="number" />
                  <TextField label="PF Target" value={customForm.power.pfTarget} onChange={e => handleCustomFormChange('power', 'pfTarget', e.target.value)} type="number" />
                </Box>
                <Typography variant="subtitle2">Lighting</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField label="LPD (W/m²)" value={customForm.lighting.lpd} onChange={e => handleCustomFormChange('lighting', 'lpd', e.target.value)} type="number" />
                  <TextField label="Required Lux" value={customForm.lighting.requiredLux} onChange={e => handleCustomFormChange('lighting', 'requiredLux', e.target.value)} type="number" />
                  <TextField label="Required CRI" value={customForm.lighting.requiredCRI} onChange={e => handleCustomFormChange('lighting', 'requiredCRI', e.target.value)} type="number" />
                </Box>
                <Typography variant="subtitle2">HVAC</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField label="EER" value={customForm.hvac.eer} onChange={e => handleCustomFormChange('hvac', 'eer', e.target.value)} type="number" />
                  <TextField label="Temp Range (°C)" value={customForm.hvac.tempRange} onChange={e => handleCustomFormChange('hvac', 'tempRange', e.target.value)} type="number" />
                  <TextField label="Fresh Air (cfm/person)" value={customForm.hvac.freshAir} onChange={e => handleCustomFormChange('hvac', 'freshAir', e.target.value)} type="number" />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={closeCustomModal}>Cancel</Button>
                <Button onClick={saveCustomStandard} variant="contained">Save</Button>
              </DialogActions>
            </Dialog>
            <List>
              {customStandards.map(s => (
                <ListItem key={s.name}>
                  <ListItemText primary={s.name} />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => openCustomModal(s)}><EditIcon /></IconButton>
                    <IconButton edge="end" onClick={() => deleteCustomStandard(s)}><DeleteIcon /></IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            {/* Inside the main render, as the first child of <Box sx={{ p: 3 }}>... */}
            <Card sx={{ mb: 3, p: 2, bgcolor: 'grey.100' }} role="region" aria-label="Audit Compliance Summary">
              <Typography variant="h5" sx={{ mb: 2 }} component="h2">Audit Compliance Summary</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    {liveCompliance ? <CheckCircleIcon color="success" aria-label="Power Usage Compliant" /> : <HighlightOffIcon color="error" aria-label="Power Usage Non-compliant" />}
                    <Typography variant="subtitle1" component="span">Power Usage:</Typography>
                    <Typography color={liveCompliance ? 'success.main' : 'error.main'} sx={{ fontWeight: 700 }} component="span">
                      {liveCompliance ? 'Compliant' : 'Non-compliant'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    {lightingLiveCompliance ? <CheckCircleIcon color="success" aria-label="Lighting Compliant" /> : <HighlightOffIcon color="error" aria-label="Lighting Non-compliant" />}
                    <Typography variant="subtitle1" component="span">Lighting:</Typography>
                    <Typography color={lightingLiveCompliance ? 'success.main' : 'error.main'} sx={{ fontWeight: 700 }} component="span">
                      {lightingLiveCompliance ? 'Compliant' : 'Non-compliant'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    {hvacLiveCompliance ? <CheckCircleIcon color="success" aria-label="HVAC Compliant" /> : <HighlightOffIcon color="error" aria-label="HVAC Non-compliant" />}
                    <Typography variant="subtitle1" component="span">HVAC:</Typography>
                    <Typography color={hvacLiveCompliance ? 'success.main' : 'error.main'} sx={{ fontWeight: 700 }} component="span">
                      {hvacLiveCompliance ? 'Compliant' : 'Non-compliant'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2">
                <b>Total Compliant:</b> {[liveCompliance, lightingLiveCompliance, hvacLiveCompliance].filter(Boolean).length} / 3
              </Typography>
            </Card>
          </React.Fragment>
        </Suspense>
      </Box>
    </ErrorBoundary>
  );
};

export default EnergyAuditTesting; 