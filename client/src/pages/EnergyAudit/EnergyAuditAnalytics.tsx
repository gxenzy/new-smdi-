import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Paper,
  Divider,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
  Drawer,
  SwipeableDrawer,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { useEnergyAuditHistory } from './EnergyAuditHistoryContext';
import { useAuthContext } from '../../contexts/AuthContext';
import SignatureCanvas from 'react-signature-canvas';
import SaveIcon from '@mui/icons-material/Save';
import VerifiedIcon from '@mui/icons-material/Verified';
import LockIcon from '@mui/icons-material/Lock';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SettingsIcon from '@mui/icons-material/Settings';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { jsPDF as jsPDFType } from 'jspdf';
import html2canvas from 'html2canvas';
import InfoIcon from '@mui/icons-material/Info';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CommentsSection from '../../components/EnergyAudit/CommentsSection';
import AnalyticsDashboard from '../../components/EnergyAudit/AnalyticsDashboard';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import HelpDialog from '../../components/EnergyAudit/HelpDialog';
import OnboardingWizard from '../../components/EnergyAudit/OnboardingWizard';
import type { Comment, Severity, Status, ApprovalStatus } from './EnergyAuditContext';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (...args: any[]) => any;
    lastAutoTable?: { finalY: number };
  }
}

interface TestResult {
  date: string;
  powerUsage: number;
  lightingEfficiency: number;
  hvacEfficiency: number;
  compliance: {
    power: boolean;
    lighting: boolean;
    hvac: boolean;
  };
}

interface HistoricalData extends TestResult {
  year: number;
  month: number;
  comments?: string;
  recommendations?: string;
}

interface CustomBenchmark {
  id: string;
  name: string;
  lighting: number;
  hvac: number;
  power: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface DigitalSignature {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  timestamp: string;
  signatureData: string;
  comments?: string;
}

interface RoleBasedAccess {
  role: 'admin' | 'auditor' | 'reviewer' | 'viewer';
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canSign: boolean;
    canExport: boolean;
    canManageBenchmarks: boolean;
  };
}

const ROLE_PERMISSIONS: Record<string, RoleBasedAccess> = {
  admin: {
    role: 'admin',
    permissions: {
      canEdit: true,
      canDelete: true,
      canSign: true,
      canExport: true,
      canManageBenchmarks: true,
    },
  },
  auditor: {
    role: 'auditor',
    permissions: {
      canEdit: true,
      canDelete: false,
      canSign: true,
      canExport: true,
      canManageBenchmarks: false,
    },
  },
  reviewer: {
    role: 'reviewer',
    permissions: {
      canEdit: false,
      canDelete: false,
      canSign: true,
      canExport: true,
      canManageBenchmarks: false,
    },
  },
  viewer: {
    role: 'viewer',
    permissions: {
      canEdit: false,
      canDelete: false,
      canSign: false,
      canExport: false,
      canManageBenchmarks: false,
    },
  },
};

// Add PHP currency formatter
const formatPHP = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);

// Generate sample data with current year/month
const getCurrentYearMonth = (offset: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

// Sample data - in real app, this would come from your backend
const sampleData: TestResult[] = [
  {
    date: getCurrentYearMonth(2),
    powerUsage: 11000,
    lightingEfficiency: 85,
    hvacEfficiency: 92,
    compliance: { power: true, lighting: true, hvac: true },
  },
  {
    date: getCurrentYearMonth(1),
    powerUsage: 10800,
    lightingEfficiency: 88,
    hvacEfficiency: 90,
    compliance: { power: true, lighting: true, hvac: true },
  },
  {
    date: getCurrentYearMonth(0),
    powerUsage: 11200,
    lightingEfficiency: 82,
    hvacEfficiency: 88,
    compliance: { power: false, lighting: true, hvac: true },
  },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const BENCHMARK_PROFILES = [
  { label: 'Office (Default)', value: 'office', lighting: 85, hvac: 90, power: 10500 },
  { label: 'School', value: 'school', lighting: 80, hvac: 88, power: 9500 },
  { label: 'Hospital', value: 'hospital', lighting: 90, hvac: 92, power: 12000 },
  { label: 'Retail', value: 'retail', lighting: 88, hvac: 89, power: 11000 },
];

const ORG_NAME = 'Your Organization Name';
const ORG_LOGO = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="16" fill="%230088FE"/><text x="40" y="48" font-size="32" fill="white" text-anchor="middle" font-family="Arial">LOGO</text></svg>';
const PROJECT_NAME = 'Energy Audit Analytics Report';

// Utility to get image format from data URL
const getImageFormat = (dataUrl: string) => {
  if (typeof dataUrl !== 'string') return 'PNG';
  if (dataUrl.startsWith('data:image/png')) return 'PNG';
  if (dataUrl.startsWith('data:image/jpeg')) return 'JPEG';
  if (dataUrl.startsWith('data:image/jpg')) return 'JPEG';
  if (dataUrl.startsWith('data:image/gif')) return 'GIF';
  return 'PNG';
};

// Move component definitions outside the main component
const HistoricalComparisonChart: React.FC<{ data: HistoricalData[] }> = ({ data }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Historical Comparison
      </Typography>
      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Line type="monotone" dataKey="powerUsage" stroke="#8884d8" name="Power Usage (W)" />
            <Line type="monotone" dataKey="lightingEfficiency" stroke="#82ca9d" name="Lighting Efficiency (%)" />
            <Line type="monotone" dataKey="hvacEfficiency" stroke="#ffc658" name="HVAC Efficiency (%)" />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </CardContent>
  </Card>
);

interface CustomBenchmarkDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (benchmark: CustomBenchmark) => void;
}

const CustomBenchmarkDialog: React.FC<CustomBenchmarkDialogProps> = ({ open, onClose, onAdd }) => {
  const [newBenchmark, setNewBenchmark] = React.useState<Partial<CustomBenchmark>>({
    name: '',
    lighting: 85,
    hvac: 90,
    power: 10500,
    description: '',
  });

  const handleAdd = () => {
    const benchmark: CustomBenchmark = {
      id: Date.now().toString(),
      name: newBenchmark.name || 'New Benchmark',
      lighting: newBenchmark.lighting || 85,
      hvac: newBenchmark.hvac || 90,
      power: newBenchmark.power || 10500,
      description: newBenchmark.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onAdd(benchmark);
    setNewBenchmark({});
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Custom Benchmark</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Benchmark Name"
            value={newBenchmark.name}
            onChange={e => setNewBenchmark({ ...newBenchmark, name: e.target.value })}
            fullWidth
          />
          <TextField
            label="Lighting Efficiency (%)"
            type="number"
            value={newBenchmark.lighting}
            onChange={e => setNewBenchmark({ ...newBenchmark, lighting: Number(e.target.value) })}
            fullWidth
          />
          <TextField
            label="HVAC Efficiency (%)"
            type="number"
            value={newBenchmark.hvac}
            onChange={e => setNewBenchmark({ ...newBenchmark, hvac: Number(e.target.value) })}
            fullWidth
          />
          <TextField
            label="Power Usage (W)"
            type="number"
            value={newBenchmark.power}
            onChange={e => setNewBenchmark({ ...newBenchmark, power: Number(e.target.value) })}
            fullWidth
          />
          <TextField
            label="Description"
            value={newBenchmark.description}
            onChange={e => setNewBenchmark({ ...newBenchmark, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAdd} variant="contained">Add Benchmark</Button>
      </DialogActions>
    </Dialog>
  );
};

interface CustomBenchmarksSectionProps {
  benchmarks: CustomBenchmark[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<CustomBenchmark>) => void;
  onDelete: (id: string) => void;
}

const CustomBenchmarksSection: React.FC<CustomBenchmarksSectionProps> = ({
  benchmarks,
  onAdd,
  onUpdate,
  onDelete,
}) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Custom Benchmarks</Typography>
        <Button
          variant="outlined"
          onClick={onAdd}
          startIcon={<AddIcon />}
        >
          Add Benchmark
        </Button>
      </Box>
      <List>
        {benchmarks.map(benchmark => (
          <ListItem
            key={benchmark.id}
            secondaryAction={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  edge="end"
                  onClick={() => onUpdate(benchmark.id, { ...benchmark })}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => onDelete(benchmark.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemText
              primary={benchmark.name}
              secondary={`Lighting: ${benchmark.lighting}%, HVAC: ${benchmark.hvac}%, Power: ${benchmark.power}W`}
            />
          </ListItem>
        ))}
      </List>
    </CardContent>
  </Card>
);

// Add new component for digital signature
interface SignatureDialogProps {
  open: boolean;
  onClose: () => void;
  onSign: (signature: DigitalSignature) => void;
  userRole: string;
  userName: string;
}

const SignatureDialog: React.FC<SignatureDialogProps> = ({ open, onClose, onSign, userRole, userName }) => {
  const [signature, setSignature] = React.useState('');
  const [comments, setComments] = React.useState('');

  const handleSign = () => {
    if (signature) {
      onSign({
        id: Date.now().toString(),
        userId: 'current-user-id',
        userName,
        userRole,
        timestamp: new Date().toISOString(),
        signatureData: signature,
        comments,
      });
      setSignature('');
      setComments('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Digital Signature</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <Typography variant="subtitle2">Sign below:</Typography>
          <Box
            sx={{
              border: '1px solid #ccc',
              borderRadius: 1,
              height: 200,
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="body2" color="textSecondary">
              Signature pad will be implemented here
            </Typography>
          </Box>
          <TextField
            label="Comments"
            value={comments}
            onChange={e => setComments(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSign}
          variant="contained"
          startIcon={<VerifiedIcon />}
          disabled={!signature}
        >
          Sign & Approve
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Add new component for role-based access control
interface RoleBasedAccessControlProps {
  userRole: string;
  permissions: RoleBasedAccess['permissions'];
}

const RoleBasedAccessControl: React.FC<RoleBasedAccessControlProps> = ({ userRole, permissions }) => {
  // Determine the actual role name based on permissions
  let displayRole = 'VIEWER';
  if (permissions.canManageBenchmarks) {
    displayRole = 'ADMIN';
  } else if (permissions.canEdit) {
    displayRole = 'AUDITOR';
  } else if (permissions.canSign) {
    displayRole = 'REVIEWER';
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Chip
        icon={<LockIcon />}
        label={displayRole}
        color={displayRole === 'ADMIN' ? 'primary' : 'default'}
        size="small"
      />
      {!permissions.canEdit && (
        <Tooltip title="View-only mode">
          <Chip
            icon={<LockIcon />}
            label="View Only"
            color="warning"
            size="small"
          />
        </Tooltip>
      )}
    </Box>
  );
}

interface ThemeSettings {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
}

// Add theme customization component
interface ThemeCustomizationDialogProps {
  open: boolean;
  onClose: () => void;
  settings: ThemeSettings;
  onSettingsChange: (settings: ThemeSettings) => void;
}

const ThemeCustomizationDialog: React.FC<ThemeCustomizationDialogProps> = ({
  open,
  onClose,
  settings,
  onSettingsChange,
}) => {
  const handleChange = (key: keyof ThemeSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Theme Settings</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <FormControl>
            <InputLabel>Theme Mode</InputLabel>
            <Select
              value={settings.mode}
              label="Theme Mode"
              onChange={e => handleChange('mode', e.target.value)}
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
            </Select>
          </FormControl>

          <FormControl>
            <InputLabel>Primary Color</InputLabel>
            <Select
              value={settings.primaryColor}
              label="Primary Color"
              onChange={e => handleChange('primaryColor', e.target.value)}
            >
              <MenuItem value="#1976d2">Blue</MenuItem>
              <MenuItem value="#2e7d32">Green</MenuItem>
              <MenuItem value="#ed6c02">Orange</MenuItem>
              <MenuItem value="#9c27b0">Purple</MenuItem>
            </Select>
          </FormControl>

          <FormControl>
            <InputLabel>Secondary Color</InputLabel>
            <Select
              value={settings.secondaryColor}
              label="Secondary Color"
              onChange={e => handleChange('secondaryColor', e.target.value)}
            >
              <MenuItem value="#9c27b0">Purple</MenuItem>
              <MenuItem value="#2e7d32">Green</MenuItem>
              <MenuItem value="#ed6c02">Orange</MenuItem>
              <MenuItem value="#1976d2">Blue</MenuItem>
            </Select>
          </FormControl>

          <FormControl>
            <InputLabel>Font Size</InputLabel>
            <Select
              value={settings.fontSize}
              label="Font Size"
              onChange={e => handleChange('fontSize', e.target.value)}
            >
              <MenuItem value="small">Small</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="large">Large</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const EnergyAuditAnalytics: React.FC = () => {
  const { testHistory } = useEnergyAuditHistory();
  const [timeRange, setTimeRange] = React.useState('3m'); // 1m, 3m, 6m, 1y
  const [benchmarkProfile, setBenchmarkProfile] = React.useState('office');
  const [peakRate, setPeakRate] = React.useState(11); // ₱/kWh
  const [offPeakRate, setOffPeakRate] = React.useState(7); // ₱/kWh
  const [peakPercent, setPeakPercent] = React.useState(0.6); // 60% usage at peak
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const [exportSuccess, setExportSuccess] = React.useState(false);
  const [exportType, setExportType] = React.useState<'pdf' | 'csv'>('pdf');
  const [includePower, setIncludePower] = React.useState(true);
  const [includeLighting, setIncludeLighting] = React.useState(true);
  const [includeHVAC, setIncludeHVAC] = React.useState(true);
  const [includeCharts, setIncludeCharts] = React.useState(true);
  // Custom cover page state
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [orgName, setOrgName] = React.useState(localStorage.getItem('energyAudit_orgName') || 'Your Organization Name');
  const [orgLogo, setOrgLogo] = React.useState(localStorage.getItem('energyAudit_orgLogo') || ORG_LOGO);
  const [coverNotes, setCoverNotes] = React.useState(localStorage.getItem('energyAudit_coverNotes') || '');
  const [logoError, setLogoError] = React.useState<string | null>(null);

  // Add new state variables
  const [historicalData, setHistoricalData] = React.useState<HistoricalData[]>([]);
  const [customBenchmarks, setCustomBenchmarks] = React.useState<CustomBenchmark[]>([]);
  const [selectedHistoricalYear, setSelectedHistoricalYear] = React.useState<number>(new Date().getFullYear());
  const [selectedCustomBenchmark, setSelectedCustomBenchmark] = React.useState<string>('');
  const [showHistoricalComparison, setShowHistoricalComparison] = React.useState(false);
  const [showCustomBenchmarkDialog, setShowCustomBenchmarkDialog] = React.useState(false);
  const [newBenchmark, setNewBenchmark] = React.useState<Partial<CustomBenchmark>>({
    name: '',
    lighting: 85,
    hvac: 90,
    power: 10500,
    description: '',
  });

  // Add new state variables for digital signatures and role-based access
  const [signatures, setSignatures] = React.useState<DigitalSignature[]>([]);
  const [showSignatureDialog, setShowSignatureDialog] = React.useState(false);
  const { user } = useAuthContext();
  
  // Fix role mismatch by converting UserRole enum to lowercase for lookup
  const userRoleKey = user?.role ? String(user.role).toLowerCase() : 'viewer';
  const userRole = ROLE_PERMISSIONS[userRoleKey] ? userRoleKey : 'viewer';
  const userPermissions = ROLE_PERMISSIONS[userRole]?.permissions || ROLE_PERMISSIONS['viewer'].permissions;

  // Find selected benchmark
  const selectedBenchmark = BENCHMARK_PROFILES.find(b => b.value === benchmarkProfile) || BENCHMARK_PROFILES[0];

  // Calculate compliance percentages
  const complianceData = [
    { name: 'Power Usage', value: sampleData.filter(d => d.compliance.power).length },
    { name: 'Lighting', value: sampleData.filter(d => d.compliance.lighting).length },
    { name: 'HVAC', value: sampleData.filter(d => d.compliance.hvac).length },
    { name: 'Non-compliant', value: sampleData.filter(d => !d.compliance.power || !d.compliance.lighting || !d.compliance.hvac).length },
  ];

  // Calculate average efficiencies
  const avgLightingEfficiency = sampleData.reduce((sum, d) => sum + d.lightingEfficiency, 0) / sampleData.length;
  const avgHVACEfficiency = sampleData.reduce((sum, d) => sum + d.hvacEfficiency, 0) / sampleData.length;

  // Calculate energy savings and cost with peak/off-peak
  const energySavings = useMemo(() => {
    const baseline = sampleData[0].powerUsage;
    const current = sampleData[sampleData.length - 1].powerUsage;
    const savings = ((baseline - current) / baseline) * 100;
    // Cost calculation
    const peakKWh = (baseline - current) * peakPercent;
    const offPeakKWh = (baseline - current) * (1 - peakPercent);
    const cost = peakKWh * peakRate + offPeakKWh * offPeakRate;
    return {
      percentage: savings,
      amount: baseline - current,
      cost,
    };
  }, [peakRate, offPeakRate, peakPercent]);

  // Calculate trend data
  const trendData = useMemo(() => {
    return sampleData.map((d, i) => ({
      ...d,
      trend: i > 0 ? ((d.powerUsage - sampleData[i - 1].powerUsage) / sampleData[i - 1].powerUsage) * 100 : 0,
    }));
  }, []);

  // Calculate benchmarking data (use selected profile)
  const benchmarkingData = useMemo(() => {
    return {
      lighting: (avgLightingEfficiency / selectedBenchmark.lighting) * 100,
      hvac: (avgHVACEfficiency / selectedBenchmark.hvac) * 100,
      power: (sampleData[sampleData.length - 1].powerUsage / selectedBenchmark.power) * 100,
    };
  }, [selectedBenchmark, avgLightingEfficiency, avgHVACEfficiency]);

  // Cost Impact Analysis (use peak/off-peak)
  const costImpactData = [
    { name: 'Lighting', cost: 2500 * (peakRate * peakPercent + offPeakRate * (1 - peakPercent)) },
    { name: 'HVAC', cost: 5000 * (peakRate * peakPercent + offPeakRate * (1 - peakPercent)) },
    { name: 'Equipment', cost: 3500 * (peakRate * peakPercent + offPeakRate * (1 - peakPercent)) },
  ];

  // Chart refs
  const powerTrendRef = React.useRef<HTMLDivElement>(null);
  const efficiencyRef = React.useRef<HTMLDivElement>(null);
  const benchmarkingRef = React.useRef<HTMLDivElement>(null);
  const costImpactRef = React.useRef<HTMLDivElement>(null);

  // Export chart as PNG
  const handleExportChartPNG = async (ref: React.RefObject<HTMLDivElement>, filename: string) => {
    if (ref.current) {
      const canvas = await html2canvas(ref.current);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = filename;
      link.click();
    }
  };

  // Export handlers (PDF now includes chart images)
  const handleExportPDF = async () => {
    setExporting(true);
    setExportDialogOpen(false);
    const doc = new jsPDF() as jsPDFType & { autoTable: (...args: any[]) => any; lastAutoTable?: { finalY: number } };
    // Cover page
    doc.setFontSize(24);
    doc.text(PROJECT_NAME, 105, 40, { align: 'center' });
    doc.setFontSize(16);
    doc.text(orgName, 105, 60, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Exported: ${new Date().toLocaleDateString()}`, 105, 75, { align: 'center' });
    if (coverNotes) {
      doc.setFontSize(12);
      doc.text(coverNotes, 105, 90, { align: 'center' });
    }
    // Center logo and add more space below
    const safeLogo = (typeof orgLogo === 'string' && orgLogo.startsWith('data:image/')) ? orgLogo : ORG_LOGO;
    const logoFormat = getImageFormat(safeLogo);
    doc.addImage(safeLogo, logoFormat, 90, 110, 30, 30);
    doc.setFontSize(10);
    doc.text('Confidential - For internal use only', 105, 150, { align: 'center' });
    doc.addPage();
    // Add header/footer to each page
    const addHeaderFooter = (pageNum: number, totalPages: number) => {
      doc.setFontSize(10);
      doc.text(orgName, 20, 10);
      doc.addImage(safeLogo, logoFormat, 175, 4, 12, 12);
      doc.text(`Page ${pageNum} of ${totalPages}`, 105, 290, { align: 'center' });
    };
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Energy Audit Analytics Summary', 14, 18);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Benchmark: ${selectedBenchmark.label}`, 14, 30);
    doc.text(`Peak Rate: ${formatPHP(peakRate)}/kWh, Off-Peak Rate: ${formatPHP(offPeakRate)}/kWh`, 14, 38);
    doc.text(`Peak Usage: ${(peakPercent * 100).toFixed(0)}%`, 14, 46);
    doc.text(`Time Range: ${timeRange}`, 14, 54);
    doc.text('---', 14, 60);
    doc.setFont(undefined, 'bold');
    doc.text('Overview', 14, 70);
    doc.setFont(undefined, 'normal');
    doc.autoTable({
      startY: 75,
      head: [['Metric', 'Value']],
      body: [
        ['Avg Lighting Efficiency (%)', avgLightingEfficiency.toFixed(1)],
        ['Avg HVAC Efficiency (%)', avgHVACEfficiency.toFixed(1)],
        ['Overall Compliance Rate (%)', ((sampleData.filter(d => d.compliance.power && d.compliance.lighting && d.compliance.hvac).length / sampleData.length) * 100).toFixed(1)],
        ['Energy Savings (%)', energySavings.percentage.toFixed(1)],
        ['Energy Savings (kWh)', energySavings.amount.toFixed(0)],
        ['Estimated Cost Savings', energySavings.cost.toFixed(2)],
      ],
    });
    let y = doc.lastAutoTable?.finalY ?? 90;
    // Add chart images
    const chartImages: { ref: React.RefObject<HTMLDivElement>, label: string }[] = [];
    if (includePower) {
      chartImages.push({ ref: powerTrendRef, label: 'Power Usage Trend' });
    }
    if (includeLighting) {
      chartImages.push({ ref: efficiencyRef, label: 'System Efficiency Comparison' });
    }
    if (includeHVAC) {
      chartImages.push({ ref: benchmarkingRef, label: 'Industry Benchmarking' });
    }
    if (includeCharts) {
      chartImages.push({ ref: costImpactRef, label: 'Cost Impact Analysis' });
    }
    for (const chart of chartImages) {
      if (chart.ref.current) {
        const canvas = await html2canvas(chart.ref.current);
        const imgData = canvas.toDataURL('image/png');
        y += 10;
        doc.text(chart.label, 14, y);
        doc.addImage(imgData, 'PNG', 14, y + 2, 180, 60);
        y += 65;
      }
    }
    doc.text('Cost Impact Analysis', 14, y + 10);
    doc.autoTable({
      startY: y + 14,
      head: [['Category', 'Monthly Cost (₱)']],
      body: costImpactData.map(row => [row.name, formatPHP(row.cost)]),
    });
    y = doc.lastAutoTable?.finalY ?? y + 30;
    doc.text('Benchmarking', 14, y + 10);
    doc.autoTable({
      startY: y + 14,
      head: [['System', 'Your Facility (%)', 'Industry Benchmark (%)']],
      body: [
        ['Lighting', benchmarkingData.lighting.toFixed(1), '100'],
        ['HVAC', benchmarkingData.hvac.toFixed(1), '100'],
        ['Power', benchmarkingData.power.toFixed(1), '100'],
      ],
    });
    y = doc.lastAutoTable?.finalY ?? y + 30;
    doc.text('Key Insights', 14, y + 10);
    doc.setFontSize(10);
    doc.text([
      `- Energy savings potential: ${Math.max(0, 100 - benchmarkingData.power).toFixed(1)}% additional possible.`,
      `- Current monthly energy costs: ${formatPHP(sampleData[sampleData.length - 1].powerUsage * (peakRate * peakPercent + offPeakRate * (1 - peakPercent)))}`,
      `- Performance trend: ${trendData[trendData.length - 1].trend > 0 ? 'Increasing' : 'Decreasing'} energy usage.`,
      trendData[trendData.length - 1].trend > 0 ? '- Consider implementing energy-saving measures.' : '- Current measures are effective.'
    ], 14, y + 16);
    // After all content is added:
    const pageCount = doc.getNumberOfPages();
    for (let i = 2; i <= pageCount; i++) {
      doc.setPage(i);
      addHeaderFooter(i, pageCount);
    }
    doc.save('energy_audit_analytics.pdf');
    setExporting(false);
    setExportSuccess(true);
  };

  const handleExportCSV = () => {
    setExporting(true);
    setExportDialogOpen(false);
    let csv = '';
    csv += `${PROJECT_NAME}\n`;
    csv += `Organization,${ORG_NAME}\n`;
    csv += `Exported,${new Date().toLocaleDateString()}\n`;
    csv += '\n';
    csv += 'Energy Audit Analytics Summary\n';
    csv += `Benchmark,${selectedBenchmark.label}\n`;
    csv += `Peak Rate (PHP/kWh),${peakRate}\n`;
    csv += `Off-Peak Rate (PHP/kWh),${offPeakRate}\n`;
    csv += `Peak Usage (%),${(peakPercent * 100).toFixed(0)}\n`;
    csv += `Time Range,${timeRange}\n`;
    csv += '\nOverview\n';
    csv += 'Metric,Value\n';
    csv += `Avg Lighting Efficiency (%),${avgLightingEfficiency.toFixed(1)}\n`;
    csv += `Avg HVAC Efficiency (%),${avgHVACEfficiency.toFixed(1)}\n`;
    csv += `Overall Compliance Rate (%),${((sampleData.filter(d => d.compliance.power && d.compliance.lighting && d.compliance.hvac).length / sampleData.length) * 100).toFixed(1)}\n`;
    csv += `Energy Savings (%),${energySavings.percentage.toFixed(1)}\n`;
    csv += `Energy Savings (kWh),${energySavings.amount.toFixed(0)}\n`;
    csv += `Estimated Cost Savings,${energySavings.cost.toFixed(2)}\n`;
    csv += '\nCost Impact Analysis\n';
    csv += 'Category,Monthly Cost (PHP)\n';
    costImpactData.forEach(row => {
      csv += `${row.name},${row.cost.toFixed(2)}\n`;
    });
    csv += '\nBenchmarking\n';
    csv += 'System,Your Facility (%),Industry Benchmark (%)\n';
    csv += `Lighting,${benchmarkingData.lighting.toFixed(1)},100\n`;
    csv += `HVAC,${benchmarkingData.hvac.toFixed(1)},100\n`;
    csv += `Power,${benchmarkingData.power.toFixed(1)},100\n`;
    csv += '\nKey Insights\n';
    csv += `Energy savings potential,${Math.max(0, 100 - benchmarkingData.power).toFixed(1)}% additional possible\n`;
    csv += `Current monthly energy costs,${(sampleData[sampleData.length - 1].powerUsage * (peakRate * peakPercent + offPeakRate * (1 - peakPercent))).toFixed(2)}\n`;
    csv += `Performance trend,${trendData[trendData.length - 1].trend > 0 ? 'Increasing' : 'Decreasing'} energy usage\n`;
    csv += trendData[trendData.length - 1].trend > 0 ? 'Recommendation,Consider implementing energy-saving measures.\n' : 'Recommendation,Current measures are effective.\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'energy_audit_analytics.csv';
    link.click();
    setExporting(false);
    setExportSuccess(true);
  };

  const handleOpenExportDialog = (type: 'pdf' | 'csv') => {
    setExportType(type);
    setExportDialogOpen(true);
  };
  const handleCloseExportDialog = () => setExportDialogOpen(false);

  const handleExport = async () => {
    setExporting(true);
    setExportDialogOpen(false);
    if (exportType === 'pdf') {
      await handleExportPDF();
    } else {
      handleExportCSV();
    }
    setExporting(false);
    setExportSuccess(true);
  };

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('energyAudit_orgName', orgName);
    localStorage.setItem('energyAudit_orgLogo', orgLogo);
    localStorage.setItem('energyAudit_coverNotes', coverNotes);
    setSettingsOpen(false);
  };

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoError(null);
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match(/^image\/(png|jpeg|jpg|gif)$/)) {
        setLogoError('Only PNG, JPEG, or GIF images are allowed.');
        setOrgLogo(ORG_LOGO);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (!result.startsWith('data:image/')) {
          setLogoError('Invalid image file.');
          setOrgLogo(ORG_LOGO);
          return;
        }
        setOrgLogo(result);
      };
      reader.onerror = () => {
        setLogoError('Failed to load image.');
        setOrgLogo(ORG_LOGO);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add new functions for historical data and custom benchmarks
  const handleAddCustomBenchmark = (benchmark: CustomBenchmark) => {
    if (!userPermissions.canManageBenchmarks) {
      return;
    }
    setCustomBenchmarks([...customBenchmarks, benchmark]);
    setShowCustomBenchmarkDialog(false);
  };

  const handleUpdateCustomBenchmark = (id: string, updates: Partial<CustomBenchmark>) => {
    if (!userPermissions.canManageBenchmarks) {
      return;
    }
    setCustomBenchmarks(customBenchmarks.map(b => 
      b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
    ));
  };

  const handleDeleteCustomBenchmark = (id: string) => {
    if (!userPermissions.canManageBenchmarks) {
      return;
    }
    setCustomBenchmarks(customBenchmarks.filter(b => b.id !== id));
  };

  // Add signature section to the UI
  const SignatureSection = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Digital Signatures</Typography>
          {userPermissions.canSign && (
            <Button
              variant="outlined"
              onClick={() => setShowSignatureDialog(true)}
              startIcon={<VerifiedIcon />}
            >
              Add Signature
            </Button>
          )}
        </Box>
        <List>
          {signatures.map(signature => (
            <ListItem
              key={signature.id}
              secondaryAction={
                <Typography variant="caption" color="textSecondary">
                  {new Date(signature.timestamp).toLocaleString()}
                </Typography>
              }
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24 }}>
                      {signature.userName[0]}
                    </Avatar>
                    <Typography variant="body2">
                      {signature.userName} ({signature.userRole})
                    </Typography>
                  </Box>
                }
                secondary={signature.comments}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  // Add handlers for digital signatures
  const handleAddSignature = (signature: DigitalSignature) => {
    setSignatures([...signatures, signature]);
  };

  // Add theme customization state
  const [themeSettings, setThemeSettings] = React.useState<ThemeSettings>(() => {
    const saved = localStorage.getItem('energyAudit_themeSettings');
    return saved ? JSON.parse(saved) : {
      mode: 'light',
      primaryColor: '#1976d2',
      secondaryColor: '#9c27b0',
      fontSize: 'medium',
    };
  });

  const [showThemeDialog, setShowThemeDialog] = React.useState(false);

  // Create theme based on settings
  const theme = React.useMemo(() => createTheme({
    palette: {
      mode: themeSettings.mode,
      primary: {
        main: themeSettings.primaryColor,
      },
      secondary: {
        main: themeSettings.secondaryColor,
      },
    },
    typography: {
      fontSize: themeSettings.fontSize === 'small' ? 14 : themeSettings.fontSize === 'large' ? 18 : 16,
    },
  }), [themeSettings]);

  // Save theme settings to localStorage
  React.useEffect(() => {
    localStorage.setItem('energyAudit_themeSettings', JSON.stringify(themeSettings));
  }, [themeSettings]);

  // Add mobile responsiveness
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Mobile menu component
  const MobileMenu = () => (
    <SwipeableDrawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      onOpen={() => setMobileMenuOpen(true)}
    >
      <Box sx={{ width: 250, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Menu
        </Typography>
        <List>
          <ListItem>
            <FormControl fullWidth>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
                size="small"
              >
                <MenuItem value="1m">Last Month</MenuItem>
                <MenuItem value="3m">Last 3 Months</MenuItem>
                <MenuItem value="6m">Last 6 Months</MenuItem>
                <MenuItem value="1y">Last Year</MenuItem>
              </Select>
            </FormControl>
          </ListItem>
          <ListItem>
            <FormControl fullWidth>
              <InputLabel>Benchmark</InputLabel>
              <Select
                value={benchmarkProfile}
                label="Benchmark"
                onChange={e => setBenchmarkProfile(e.target.value)}
                size="small"
              >
                {BENCHMARK_PROFILES.map(b => (
                  <MenuItem key={b.value} value={b.value}>{b.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </ListItem>
          {userPermissions.canExport && (
            <>
              <ListItem>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    handleOpenExportDialog('pdf');
                    setMobileMenuOpen(false);
                  }}
                >
                  Export PDF
                </Button>
              </ListItem>
              <ListItem>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    handleOpenExportDialog('csv');
                    setMobileMenuOpen(false);
                  }}
                >
                  Export CSV
                </Button>
              </ListItem>
            </>
          )}
          <ListItem>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setShowThemeDialog(true);
                setMobileMenuOpen(false);
              }}
              startIcon={<SettingsIcon />}
            >
              Theme Settings
            </Button>
          </ListItem>
        </List>
      </Box>
    </SwipeableDrawer>
  );

  // [2] STATE FOR HELP/WIZARD
  const [helpOpen, setHelpOpen] = React.useState(false);
  const [wizardOpen, setWizardOpen] = React.useState(false);

  // [3] STATE FOR COMMENTS/ANNOTATIONS
  const [comments, setComments] = React.useState<{ [key: string]: Comment[] }>(() => JSON.parse(localStorage.getItem('energyAudit_comments') || '{}'));
  const handleAddComment = (section: string, text: string, attachments?: any[]) => {
    const newComment: Comment = { id: Date.now().toString(), author: user?.name || 'Anonymous', text, createdAt: new Date().toISOString(), attachments };
    setComments(prev => {
      const updated = { ...prev, [section]: [...(prev[section] || []), newComment] };
      localStorage.setItem('energyAudit_comments', JSON.stringify(updated));
      return updated;
    });
  };
  const handleEditComment = (section: string, id: string, text: string, attachments?: any[]) => {
    setComments(prev => {
      const updated = { ...prev, [section]: prev[section].map(c => c.id === id ? { ...c, text, attachments } : c) };
      localStorage.setItem('energyAudit_comments', JSON.stringify(updated));
      return updated;
    });
  };
  const handleDeleteComment = (section: string, id: string) => {
    setComments(prev => {
      const updated = { ...prev, [section]: prev[section].filter(c => c.id !== id) };
      localStorage.setItem('energyAudit_comments', JSON.stringify(updated));
      return updated;
    });
  };

  // [4] EXPORT TO EXCEL
  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Analytics');
    XLSX.writeFile(wb, 'energy_audit_analytics.xlsx');
  };

  // [5] EXPORT TO WORD
  const handleExportWord = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ children: [new TextRun({ text: PROJECT_NAME, bold: true, size: 32 })] }),
          new Paragraph({ children: [new TextRun({ text: orgName, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: `Exported: ${new Date().toLocaleDateString()}`, size: 20 })] }),
          new Paragraph({ children: [new TextRun({ text: coverNotes, size: 20 })] }),
          new Paragraph({ children: [new TextRun({ text: '---', size: 20 })] }),
          new Paragraph({ children: [new TextRun({ text: 'Summary:', bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: `Avg Lighting Efficiency: ${avgLightingEfficiency.toFixed(1)}%`, size: 20 })] }),
          new Paragraph({ children: [new TextRun({ text: `Avg HVAC Efficiency: ${avgHVACEfficiency.toFixed(1)}%`, size: 20 })] }),
          new Paragraph({ children: [new TextRun({ text: `Overall Compliance Rate: ${((sampleData.filter(d => d.compliance.power && d.compliance.lighting && d.compliance.hvac).length / sampleData.length) * 100).toFixed(1)}%`, size: 20 })] }),
          new Paragraph({ children: [new TextRun({ text: `Energy Savings: ${energySavings.percentage.toFixed(1)}%`, size: 20 })] }),
          new Paragraph({ children: [new TextRun({ text: `Estimated Cost Savings: ${formatPHP(energySavings.cost)}`, size: 20 })] }),
        ],
      }],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, 'energy_audit_analytics.docx');
  };

  // [9] INTEGRATE AnalyticsDashboard
  // Map sampleData to Finding[]
  const findings = sampleData.map((d, i) => ({
    id: i.toString(),
    description: `Test on ${d.date}`,
    recommendation: '',
    createdAt: d.date,
    comments: comments['power'] || [],
    activityLog: [],
    section: (['lighting', 'hvac', 'envelope'] as const)[i % 3],
    severity: 'Low' as Severity,
    estimatedCost: 0,
    status: 'Resolved' as Status,
    approvalStatus: 'Approved' as ApprovalStatus,
  }));

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              Energy Audit Analytics
            </Typography>
            <RoleBasedAccessControl userRole={userRole} permissions={userPermissions} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            {isMobile ? (
              <IconButton
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <MenuIcon />
              </IconButton>
            ) : (
              <>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Time Range</InputLabel>
                  <Select
                    value={timeRange}
                    label="Time Range"
                    onChange={(e) => setTimeRange(e.target.value)}
                    size="small"
                  >
                    <MenuItem value="1m">Last Month</MenuItem>
                    <MenuItem value="3m">Last 3 Months</MenuItem>
                    <MenuItem value="6m">Last 6 Months</MenuItem>
                    <MenuItem value="1y">Last Year</MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 180 }}>
                  <InputLabel>Benchmark</InputLabel>
                  <Select
                    value={benchmarkProfile}
                    label="Benchmark"
                    onChange={e => setBenchmarkProfile(e.target.value)}
                    size="small"
                  >
                    {BENCHMARK_PROFILES.map(b => (
                      <MenuItem key={b.value} value={b.value}>{b.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {userPermissions.canExport && (
                  <>
                    <Button variant="outlined" onClick={() => handleOpenExportDialog('pdf')}>Export PDF</Button>
                    <Button variant="outlined" onClick={() => handleOpenExportDialog('csv')}>Export CSV</Button>
                  </>
                )}
                <IconButton
                  onClick={() => setShowThemeDialog(true)}
                  aria-label="Theme settings"
                >
                  {themeSettings.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </>
            )}
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Overview Cards */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Average Lighting Efficiency
                </Typography>
                <Typography variant="h3" color="primary">
                  {avgLightingEfficiency.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Based on {sampleData.length} tests
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Average HVAC Efficiency
                </Typography>
                <Typography variant="h3" color="primary">
                  {avgHVACEfficiency.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Based on {sampleData.length} tests
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Overall Compliance Rate
                </Typography>
                <Typography variant="h3" color="primary">
                  {((sampleData.filter(d => d.compliance.power && d.compliance.lighting && d.compliance.hvac).length / sampleData.length) * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Based on {sampleData.length} tests
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Energy Savings Card */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Energy Savings
                </Typography>
                <Typography variant="h3" color="success.main">
                  {energySavings.percentage.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {energySavings.amount.toFixed(0)} kWh saved
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Estimated cost savings: {formatPHP(energySavings.cost)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Power Usage Trend */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Power Usage Trend
                  </Typography>
                  <Button size="small" onClick={() => handleExportChartPNG(powerTrendRef, 'power_usage_trend.png')} aria-label="Export Power Usage Trend as PNG">Export PNG</Button>
                </Box>
                <Box ref={powerTrendRef} sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sampleData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="powerUsage" stroke="#8884d8" name="Power Usage (W)" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Efficiency Comparison */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    System Efficiency Comparison
                  </Typography>
                  <Button size="small" onClick={() => handleExportChartPNG(efficiencyRef, 'system_efficiency_comparison.png')} aria-label="Export System Efficiency Comparison as PNG">Export PNG</Button>
                </Box>
                <Box ref={efficiencyRef} sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sampleData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="lightingEfficiency" fill="#8884d8" name="Lighting Efficiency (%)" />
                      <Bar dataKey="hvacEfficiency" fill="#82ca9d" name="HVAC Efficiency (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Compliance Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Compliance Distribution
                </Typography>
                <Box>
                  <PieChart width={300} height={300}>
                    <Pie
                      data={complianceData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label
                    >
                      {complianceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Trend Analysis */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Trend Analysis
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <RechartsTooltip />
                      <Legend />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="powerUsage"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.3}
                        name="Power Usage (W)"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="trend"
                        stroke="#82ca9d"
                        name="Trend (%)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Benchmarking */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Industry Benchmarking
                  </Typography>
                  <Button size="small" onClick={() => handleExportChartPNG(benchmarkingRef, 'industry_benchmarking.png')} aria-label="Export Industry Benchmarking as PNG">Export PNG</Button>
                </Box>
                <Box ref={benchmarkingRef} sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={[
                      { subject: 'Lighting', A: benchmarkingData.lighting, B: 100 },
                      { subject: 'HVAC', A: benchmarkingData.hvac, B: 100 },
                      { subject: 'Power', A: benchmarkingData.power, B: 100 },
                    ]}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 150]} />
                      <Radar
                        name="Your Facility"
                        dataKey="A"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                      <Radar
                        name="Industry Average"
                        dataKey="B"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        fillOpacity={0.6}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Cost Impact Analysis */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Cost Impact Analysis
                  </Typography>
                  <Button size="small" onClick={() => handleExportChartPNG(costImpactRef, 'cost_impact_analysis.png')} aria-label="Export Cost Impact Analysis as PNG">Export PNG</Button>
                </Box>
                <Box ref={costImpactRef} sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={costImpactData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip formatter={(value: number) => [formatPHP(Number(value)), 'Cost']} />
                      <Legend />
                      <Bar dataKey="cost" fill="#8884d8" name="Monthly Cost (₱)" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Enhanced Insights */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Enhanced Insights
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Energy Savings Potential
                      </Typography>
                      <Typography variant="body2">
                        Based on industry benchmarks, there's potential for {Math.max(0, 100 - benchmarkingData.power).toFixed(1)}% additional energy savings through optimization.
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Cost Optimization
                      </Typography>
                      <Typography variant="body2">
                        Current monthly energy costs: {formatPHP(sampleData[sampleData.length - 1].powerUsage * (peakRate * peakPercent + offPeakRate * (1 - peakPercent)))}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Performance Trends
                      </Typography>
                      <Typography variant="body2">
                        {trendData[trendData.length - 1].trend > 0 ? 'Increasing' : 'Decreasing'} energy usage trend. {trendData[trendData.length - 1].trend > 0 ? 'Consider implementing energy-saving measures.' : 'Current measures are effective.'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Historical Comparison */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Historical Comparison</Typography>
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Year</InputLabel>
                    <Select
                      value={selectedHistoricalYear}
                      label="Year"
                      onChange={e => setSelectedHistoricalYear(Number(e.target.value))}
                      size="small"
                    >
                      {[2020, 2021, 2022, 2023, 2024].map(year => (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <HistoricalComparisonChart data={historicalData.filter(d => d.year === selectedHistoricalYear)} />
              </CardContent>
            </Card>
          </Grid>

          {/* Custom Benchmarks */}
          <Grid item xs={12}>
            <CustomBenchmarksSection
              benchmarks={customBenchmarks}
              onAdd={() => setShowCustomBenchmarkDialog(true)}
              onUpdate={handleUpdateCustomBenchmark}
              onDelete={handleDeleteCustomBenchmark}
            />
          </Grid>
        </Grid>
        <Dialog open={exportDialogOpen} onClose={handleCloseExportDialog}>
          <DialogTitle>Export Options</DialogTitle>
          <DialogContent>
            <FormControlLabel control={<Checkbox checked={includePower} onChange={e => setIncludePower(e.target.checked)} />} label="Include Power Usage Analysis" />
            <FormControlLabel control={<Checkbox checked={includeLighting} onChange={e => setIncludeLighting(e.target.checked)} />} label="Include Lighting System Evaluation" />
            <FormControlLabel control={<Checkbox checked={includeHVAC} onChange={e => setIncludeHVAC(e.target.checked)} />} label="Include HVAC Performance Testing" />
            <FormControlLabel control={<Checkbox checked={includeCharts} onChange={e => setIncludeCharts(e.target.checked)} />} label="Include Analytics Charts" />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseExportDialog}>Cancel</Button>
            <Button onClick={handleExport} variant="contained">Export</Button>
          </DialogActions>
        </Dialog>
        {exporting && <Dialog open><DialogContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><CircularProgress size={24} />Generating export...</DialogContent></Dialog>}
        <Snackbar open={exportSuccess} autoHideDuration={3000} onClose={() => setExportSuccess(false)}>
          <Alert severity="success" sx={{ width: '100%' }}>Export complete!</Alert>
        </Snackbar>
        <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>PDF Cover Page Settings</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Organization Name"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                fullWidth
              />
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Logo</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <img src={orgLogo} alt="Organization Logo" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', border: '1px solid #ccc' }} />
                  <Button variant="contained" component="label" startIcon={<PhotoCamera />}>
                    Upload Logo
                    <input type="file" accept="image/*" hidden onChange={handleLogoUpload} />
                  </Button>
                </Box>
                {logoError && (
                  <Typography color="error" variant="caption">{logoError}</Typography>
                )}
              </Box>
              <TextField
                label="Cover Notes / Subtitle"
                value={coverNotes}
                onChange={e => setCoverNotes(e.target.value)}
                fullWidth
                multiline
                minRows={2}
                maxRows={4}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
            <Button onClick={saveSettings} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
        {/* Add Custom Benchmark Dialog */}
        <CustomBenchmarkDialog
          open={showCustomBenchmarkDialog}
          onClose={() => setShowCustomBenchmarkDialog(false)}
          onAdd={handleAddCustomBenchmark}
        />
        {/* Add Theme Customization Dialog */}
        <ThemeCustomizationDialog
          open={showThemeDialog}
          onClose={() => setShowThemeDialog(false)}
          settings={themeSettings}
          onSettingsChange={setThemeSettings}
        />
        {/* [6] RENDER HELP/WIZARD BUTTONS */}
        <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 2000 }}>
          <Button variant="contained" color="info" onClick={() => setHelpOpen(true)} sx={{ mr: 1 }}>Help</Button>
          <Button variant="contained" color="primary" onClick={() => setWizardOpen(true)}>Wizard</Button>
        </Box>
        <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
        <OnboardingWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
        {/* [7] RENDER COMMENTS/ANNOTATIONS FOR EACH SECTION */}
        <CommentsSection
          comments={comments['power'] || []}
          onAddComment={(text, attachments) => handleAddComment('power', text, attachments)}
          onEditComment={(id, text, attachments) => handleEditComment('power', id, text, attachments)}
          onDeleteComment={id => handleDeleteComment('power', id)}
          currentUser={user?.name || 'Anonymous'}
          users={[]}
        />
        {/* [8] EXPORT BUTTONS */}
        <Button onClick={handleExportExcel}>Export Excel</Button>
        <Button onClick={handleExportWord}>Export Word</Button>
        {/* [9] INTEGRATE AnalyticsDashboard */}
        <AnalyticsDashboard findings={findings} activityLog={[]} />
      </Box>
      {/* Add Mobile Menu */}
      <MobileMenu />
    </ThemeProvider>
  );
};

export default EnergyAuditAnalytics; 