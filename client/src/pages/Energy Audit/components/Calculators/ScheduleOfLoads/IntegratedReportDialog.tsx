import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Switch,
  FormControlLabel,
  Box,
  Tabs,
  Tab,
  Divider,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  Business as BusinessIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { LoadSchedule } from './types';
import { generateIntegratedReport, IntegratedReportOptions } from '../utils/integratedReportGenerator';
import { CircuitOptimizationResult } from '../utils/circuitOptimizationUtils';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`integrated-report-tabpanel-${index}`}
      aria-labelledby={`integrated-report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

interface IntegratedReportDialogProps {
  open: boolean;
  onClose: () => void;
  loadSchedule: LoadSchedule;
  voltageDropData?: {
    [loadItemId: string]: {
      voltageDropPercent: number | null;
      isCompliant: boolean | null;
      optimizedSize: string | null;
      optimizationResult?: CircuitOptimizationResult | null;
    };
  };
  optimizationParams?: {
    operatingHoursPerYear: number;
    energyCostPerKwh: number;
  };
}

const IntegratedReportDialog: React.FC<IntegratedReportDialogProps> = ({
  open,
  onClose,
  loadSchedule,
  voltageDropData,
  optimizationParams
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [reportOptions, setReportOptions] = useState<IntegratedReportOptions>({
    title: `Electrical Analysis Report - ${loadSchedule.panelName}`,
    client: '',
    project: '',
    preparedBy: '',
    date: new Date().toLocaleDateString(),
    includeVoltageDropAnalysis: true,
    includePowerCalculations: true,
    includeLoadDetails: true,
    includeOptimizationSuggestions: true,
    paperSize: 'a4',
    orientation: 'portrait',
    includeLogo: false,
    logoUrl: '',
    includeCompanyInfo: false,
    companyInfo: {
      name: '',
      address: '',
      contact: '',
      email: '',
      website: ''
    },
    includeTableOfContents: true,
    customFooter: ''
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOptionChange = (field: keyof IntegratedReportOptions) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setReportOptions({
      ...reportOptions,
      [field]: event.target.value
    });
  };

  const handleBooleanOptionChange = (field: keyof IntegratedReportOptions) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setReportOptions({
      ...reportOptions,
      [field]: event.target.checked
    });
  };

  const handleCompanyInfoChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!reportOptions.companyInfo) {
      setReportOptions({
        ...reportOptions,
        companyInfo: {
          [field]: event.target.value
        }
      });
    } else {
      setReportOptions({
        ...reportOptions,
        companyInfo: {
          ...reportOptions.companyInfo,
          [field]: event.target.value
        }
      });
    }
  };

  const handleGenerateReport = () => {
    generateIntegratedReport({
      loadSchedule,
      voltageDropData,
      options: {
        ...reportOptions,
        optimizationParams: optimizationParams
      }
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Generate Integrated Report</Typography>
          <Button
            onClick={onClose}
            color="inherit"
            size="small"
            startIcon={<CloseIcon />}
          >
            Close
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ mb: 2 }}
        >
          <Tab label="General" icon={<SettingsIcon />} iconPosition="start" />
          <Tab label="Company" icon={<BusinessIcon />} iconPosition="start" />
          <Tab label="Content" icon={<PdfIcon />} iconPosition="start" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Report Information
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Report Title"
                        value={reportOptions.title}
                        onChange={handleOptionChange('title')}
                        margin="normal"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Client"
                        value={reportOptions.client}
                        onChange={handleOptionChange('client')}
                        margin="normal"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Project"
                        value={reportOptions.project}
                        onChange={handleOptionChange('project')}
                        margin="normal"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Prepared By"
                        value={reportOptions.preparedBy}
                        onChange={handleOptionChange('preparedBy')}
                        margin="normal"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Date"
                        type="date"
                        value={reportOptions.date}
                        onChange={handleOptionChange('date')}
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Custom Footer"
                        value={reportOptions.customFooter}
                        onChange={handleOptionChange('customFooter')}
                        margin="normal"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Page Settings
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Paper Size</InputLabel>
                        <Select
                          value={reportOptions.paperSize}
                          onChange={handleOptionChange('paperSize') as any}
                          label="Paper Size"
                        >
                          <MenuItem value="a4">A4</MenuItem>
                          <MenuItem value="letter">Letter</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Orientation</InputLabel>
                        <Select
                          value={reportOptions.orientation}
                          onChange={handleOptionChange('orientation') as any}
                          label="Orientation"
                        >
                          <MenuItem value="portrait">Portrait</MenuItem>
                          <MenuItem value="landscape">Landscape</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={reportOptions.includeTableOfContents}
                            onChange={handleBooleanOptionChange('includeTableOfContents')}
                            color="primary"
                          />
                        }
                        label="Include Table of Contents"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Company Information
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={reportOptions.includeCompanyInfo}
                      onChange={handleBooleanOptionChange('includeCompanyInfo')}
                      color="primary"
                    />
                  }
                  label="Include"
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={reportOptions.companyInfo?.name || ''}
                    onChange={handleCompanyInfoChange('name')}
                    margin="normal"
                    disabled={!reportOptions.includeCompanyInfo}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={reportOptions.companyInfo?.address || ''}
                    onChange={handleCompanyInfoChange('address')}
                    margin="normal"
                    disabled={!reportOptions.includeCompanyInfo}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Number"
                    value={reportOptions.companyInfo?.contact || ''}
                    onChange={handleCompanyInfoChange('contact')}
                    margin="normal"
                    disabled={!reportOptions.includeCompanyInfo}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={reportOptions.companyInfo?.email || ''}
                    onChange={handleCompanyInfoChange('email')}
                    margin="normal"
                    disabled={!reportOptions.includeCompanyInfo}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Website"
                    value={reportOptions.companyInfo?.website || ''}
                    onChange={handleCompanyInfoChange('website')}
                    margin="normal"
                    disabled={!reportOptions.includeCompanyInfo}
                  />
                </Grid>
              </Grid>

              <Box mt={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={reportOptions.includeLogo}
                      onChange={handleBooleanOptionChange('includeLogo')}
                      color="primary"
                    />
                  }
                  label="Include Logo"
                />

                {reportOptions.includeLogo && (
                  <TextField
                    fullWidth
                    label="Logo URL"
                    value={reportOptions.logoUrl}
                    onChange={handleOptionChange('logoUrl')}
                    margin="normal"
                    helperText="Enter the path to your company logo"
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Report Content
              </Typography>

              <Typography variant="body2" color="text.secondary" paragraph>
                Select which sections to include in the report
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={reportOptions.includeLoadDetails}
                        onChange={handleBooleanOptionChange('includeLoadDetails')}
                        color="primary"
                      />
                    }
                    label="Include Schedule of Loads Details"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={reportOptions.includeVoltageDropAnalysis}
                        onChange={handleBooleanOptionChange('includeVoltageDropAnalysis')}
                        color="primary"
                        disabled={!voltageDropData}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center">
                        <span>Include Voltage Drop Analysis</span>
                        {!voltageDropData && (
                          <Chip 
                            label="No Data" 
                            size="small" 
                            color="warning" 
                            sx={{ ml: 1 }} 
                          />
                        )}
                      </Box>
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={reportOptions.includeOptimizationSuggestions}
                        onChange={handleBooleanOptionChange('includeOptimizationSuggestions')}
                        color="primary"
                        disabled={!voltageDropData || !reportOptions.includeVoltageDropAnalysis}
                      />
                    }
                    label="Include Circuit Optimization Recommendations"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={reportOptions.includePowerCalculations}
                        onChange={handleBooleanOptionChange('includePowerCalculations')}
                        color="primary"
                      />
                    }
                    label="Include Power Consumption Analysis"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Box mt={3}>
            <Typography variant="subtitle2" gutterBottom>
              Report Preview
            </Typography>
            
            <Box 
              sx={{ 
                p: 2, 
                border: '1px dashed grey', 
                borderRadius: 1,
                height: 200,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'background.paper'
              }}
            >
              <PdfIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="body2" color="text.secondary" align="center">
                The report will include the following sections:
              </Typography>
              <Box mt={1} display="flex" flexWrap="wrap" justifyContent="center" gap={1}>
                {reportOptions.includeLoadDetails && <Chip label="Schedule of Loads" size="small" color="primary" />}
                {reportOptions.includeVoltageDropAnalysis && voltageDropData && <Chip label="Voltage Drop Analysis" size="small" color="primary" />}
                {reportOptions.includeOptimizationSuggestions && voltageDropData && reportOptions.includeVoltageDropAnalysis && <Chip label="Optimization Recommendations" size="small" color="primary" />}
                {reportOptions.includePowerCalculations && <Chip label="Power Consumption" size="small" color="primary" />}
              </Box>
            </Box>
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button 
          variant="outlined" 
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PdfIcon />}
          onClick={handleGenerateReport}
        >
          Generate Report
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IntegratedReportDialog; 