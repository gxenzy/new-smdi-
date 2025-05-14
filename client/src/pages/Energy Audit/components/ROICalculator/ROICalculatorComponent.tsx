import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  SelectChangeEvent
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CalculateIcon from '@mui/icons-material/Calculate';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

interface ROICalculationInputs {
  initialCost: string;
  annualSavings: string;
  maintenanceCost: string;
  projectLifespan: string;
  discountRate: string;
  inflationRate: string;
  electricityEscalationRate: string;
}

interface ROICalculationResults {
  simplePayback: number;
  npv: number;
  irr: number;
  roi: number;
  savingsToInvestmentRatio: number;
  yearlyResults: YearlyResult[];
}

interface YearlyResult {
  year: number;
  cashFlow: number;
  discountedCashFlow: number;
  cumulativeCashFlow: number;
  cumulativeDiscountedCashFlow: number;
}

interface ProjectOption {
  name: string;
  description: string;
  initialCost: number;
  annualSavings: number;
  maintenanceCost: number;
  projectLifespan: number;
  reference: string;
  notes: string;
  calculationDetails: string[];
}

// Define project options with realistic data based on industry references
const projectOptions = [
  {
    name: 'LED Lighting Retrofit',
    description: 'Replace traditional fluorescent lighting with energy-efficient LED fixtures',
    initialCost: 250000,
    annualSavings: 75000,
    maintenanceCost: 5000,
    projectLifespan: 10,
    reference: 'DOE Lighting Handbook 2021'
  },
  {
    name: 'HVAC Controls Upgrade',
    description: 'Install programmable thermostats and building automation system',
    initialCost: 350000,
    annualSavings: 120000,
    maintenanceCost: 15000,
    projectLifespan: 8,
    reference: 'ASHRAE 90.1-2019'
  },
  {
    name: 'Solar PV Installation',
    description: 'Install rooftop solar photovoltaic system for renewable energy generation',
    initialCost: 1500000,
    annualSavings: 225000,
    maintenanceCost: 20000,
    projectLifespan: 25,
    reference: 'DOE Philippines Solar Guidelines'
  },
  {
    name: 'Building Envelope Improvements',
    description: 'Upgrade insulation and seal air leaks to reduce HVAC load',
    initialCost: 420000,
    annualSavings: 95000,
    maintenanceCost: 5000,
    projectLifespan: 15,
    reference: 'IECC 2021'
  },
  {
    name: 'Energy-Efficient Motors',
    description: 'Replace standard motors with premium efficiency models',
    initialCost: 180000,
    annualSavings: 45000,
    maintenanceCost: 8000,
    projectLifespan: 12,
    reference: 'IEC 60034-30-1'
  }
];

const ROICalculatorComponent: React.FC = () => {
  const [inputs, setInputs] = useState<ROICalculationInputs>({
    initialCost: '250000',
    annualSavings: '75000',
    maintenanceCost: '5000',
    projectLifespan: '10',
    discountRate: '8',
    inflationRate: '4',
    electricityEscalationRate: '5'
  });
  
  const [results, setResults] = useState<ROICalculationResults | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('LED Lighting Retrofit');
  const [activeTab, setActiveTab] = useState(0);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  
  // Handle input changes
  const handleInputChange = (field: keyof ROICalculationInputs) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({
      ...inputs,
      [field]: event.target.value
    });
  };
  
  // Handle project selection
  const handleProjectSelect = (event: SelectChangeEvent) => {
    const projectName = event.target.value as string;
    setSelectedProject(projectName);
    
    const project = projectOptions.find(p => p.name === projectName);
    if (project) {
      setInputs({
        ...inputs,
        initialCost: project.initialCost.toString(),
        annualSavings: project.annualSavings.toString(),
        maintenanceCost: project.maintenanceCost.toString(),
        projectLifespan: project.projectLifespan.toString()
      });
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Calculate ROI metrics
  const calculateROI = () => {
    try {
      setCalculationError(null);
      
      const initialCost = parseFloat(inputs.initialCost);
      const annualSavings = parseFloat(inputs.annualSavings);
      const maintenanceCost = parseFloat(inputs.maintenanceCost);
      const projectLifespan = parseInt(inputs.projectLifespan);
      const discountRate = parseFloat(inputs.discountRate) / 100;
      const inflationRate = parseFloat(inputs.inflationRate) / 100;
      const electricityEscalationRate = parseFloat(inputs.electricityEscalationRate) / 100;
      
      // Simple payback period
      const simplePayback = initialCost / (annualSavings - maintenanceCost);
      
      // Calculate yearly results
      const yearlyResults: YearlyResult[] = [];
      let npv = -initialCost;
      let cumulativeCashFlow = -initialCost;
      let cumulativeDiscountedCashFlow = -initialCost;
      
      yearlyResults.push({
        year: 0,
        cashFlow: -initialCost,
        discountedCashFlow: -initialCost,
        cumulativeCashFlow,
        cumulativeDiscountedCashFlow
      });
      
      // Calculate IRR using Newton-Raphson method
      const calculateIRR = (cashFlows: number[], guess = 0.1): number => {
        const maxIterations = 1000;
        const tolerance = 0.00001;
        let irr = guess;
        
        for (let i = 0; i < maxIterations; i++) {
          let npv = 0;
          let derivativeNpv = 0;
          
          for (let j = 0; j < cashFlows.length; j++) {
            const factor = Math.pow(1 + irr, j);
            npv += cashFlows[j] / factor;
            derivativeNpv -= j * cashFlows[j] / Math.pow(1 + irr, j + 1);
          }
          
          if (Math.abs(npv) < tolerance) {
            return irr;
          }
          
          irr = irr - npv / derivativeNpv;
        }
        
        return irr;
      };
      
      const cashFlows = [-initialCost];
      
      for (let year = 1; year <= projectLifespan; year++) {
        // Apply escalation rate to savings
        const adjustedSavings = annualSavings * Math.pow(1 + electricityEscalationRate, year - 1);
        
        // Apply inflation to maintenance costs
        const adjustedMaintenance = maintenanceCost * Math.pow(1 + inflationRate, year - 1);
        
        // Net cash flow for the year
        const cashFlow = adjustedSavings - adjustedMaintenance;
        cashFlows.push(cashFlow);
        
        // Discounted cash flow
        const discountedCashFlow = cashFlow / Math.pow(1 + discountRate, year);
        
        // Update NPV
        npv += discountedCashFlow;
        
        // Update cumulative values
        cumulativeCashFlow += cashFlow;
        cumulativeDiscountedCashFlow += discountedCashFlow;
        
        yearlyResults.push({
          year,
          cashFlow,
          discountedCashFlow,
          cumulativeCashFlow,
          cumulativeDiscountedCashFlow
        });
      }
      
      // Calculate IRR
      const irr = calculateIRR(cashFlows) * 100;
      
      // ROI over project lifespan
      const roi = ((cumulativeCashFlow + initialCost) / initialCost) * 100;
      
      // Savings to Investment Ratio (SIR)
      const savingsToInvestmentRatio = (cumulativeDiscountedCashFlow + initialCost) / initialCost;
      
      setResults({
        simplePayback,
        npv,
        irr,
        roi,
        savingsToInvestmentRatio,
        yearlyResults
      });
    } catch (error) {
      setCalculationError('Error in calculation. Please check your inputs and try again.');
      console.error('ROI calculation error:', error);
    }
  };
  
  // Calculate on project selection or input change
  useEffect(() => {
    calculateROI();
  }, [selectedProject]);
  
  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>ROI Calculator</Typography>
      <Typography variant="subtitle1" gutterBottom color="text.secondary">
        Calculate return on investment for energy efficiency projects
      </Typography>
      
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Calculator" />
        <Tab label="Educational Resources" />
      </Tabs>
      
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Input Section */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Project Parameters</Typography>
              <Divider sx={{ mb: 3 }} />
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="project-select-label">Select Project Type</InputLabel>
                <Select
                  labelId="project-select-label"
                  value={selectedProject}
                  onChange={handleProjectSelect}
                  label="Select Project Type"
                >
                  {projectOptions.map(option => (
                    <MenuItem key={option.name} value={option.name}>
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {projectOptions.find(p => p.name === selectedProject) && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  {projectOptions.find(p => p.name === selectedProject)?.description}
                </Alert>
              )}
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Initial Investment Cost (₱)"
                    value={inputs.initialCost}
                    onChange={handleInputChange('initialCost')}
                    fullWidth
                    type="number"
                    InputProps={{
                      startAdornment: <MonetizationOnIcon color="action" sx={{ mr: 1 }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Annual Energy Savings (₱)"
                    value={inputs.annualSavings}
                    onChange={handleInputChange('annualSavings')}
                    fullWidth
                    type="number"
                    InputProps={{
                      startAdornment: <TrendingUpIcon color="action" sx={{ mr: 1 }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Annual Maintenance Cost (₱)"
                    value={inputs.maintenanceCost}
                    onChange={handleInputChange('maintenanceCost')}
                    fullWidth
                    type="number"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Project Lifespan (years)"
                    value={inputs.projectLifespan}
                    onChange={handleInputChange('projectLifespan')}
                    fullWidth
                    type="number"
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Discount Rate (%)"
                    value={inputs.discountRate}
                    onChange={handleInputChange('discountRate')}
                    fullWidth
                    type="number"
                    InputProps={{
                      endAdornment: (
                        <Tooltip title="The rate used to discount future cash flows to present value. Often based on cost of capital.">
                          <IconButton size="small">
                            <HelpOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Inflation Rate (%)"
                    value={inputs.inflationRate}
                    onChange={handleInputChange('inflationRate')}
                    fullWidth
                    type="number"
                    InputProps={{
                      endAdornment: (
                        <Tooltip title="General inflation rate affecting maintenance costs.">
                          <IconButton size="small">
                            <HelpOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Electricity Escalation (%)"
                    value={inputs.electricityEscalationRate}
                    onChange={handleInputChange('electricityEscalationRate')}
                    fullWidth
                    type="number"
                    InputProps={{
                      endAdornment: (
                        <Tooltip title="Annual rate at which electricity prices are expected to increase.">
                          <IconButton size="small">
                            <HelpOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
              </Grid>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<CalculateIcon />}
                onClick={calculateROI}
                fullWidth
                sx={{ mt: 3 }}
              >
                Calculate ROI
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                sx={{ mt: 2, width: '100%' }}
              >
                Save Calculation
              </Button>
            </Paper>
          </Grid>
          
          {/* Results Section */}
          <Grid item xs={12} md={7}>
            {calculationError ? (
              <Alert severity="error" sx={{ mb: 3 }}>{calculationError}</Alert>
            ) : results ? (
              <>
                {/* Key Metrics */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">Simple Payback</Typography>
                        <Typography variant="h5">{results.simplePayback.toFixed(1)} years</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Time to recoup investment
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">Net Present Value</Typography>
                        <Typography variant="h5" color={results.npv > 0 ? 'success.main' : 'error.main'}>
                          {formatCurrency(results.npv)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Present value of future cash flows
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">Internal Rate of Return</Typography>
                        <Typography variant="h5" color={results.irr > parseFloat(inputs.discountRate) ? 'success.main' : 'error.main'}>
                          {results.irr.toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {results.irr > parseFloat(inputs.discountRate) ? 'Above discount rate ✓' : 'Below discount rate ✗'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">Return on Investment</Typography>
                        <Typography variant="h5" color="success.main">{results.roi.toFixed(1)}%</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total return over project lifespan
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">Savings to Investment Ratio</Typography>
                        <Typography variant="h5" color={results.savingsToInvestmentRatio > 1 ? 'success.main' : 'error.main'}>
                          {results.savingsToInvestmentRatio.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {results.savingsToInvestmentRatio > 1 ? 'Economically viable ✓' : 'Not economically viable ✗'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                {/* Cash Flow Chart */}
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Cash Flow Analysis</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Cumulative cash flow over the project lifespan
                  </Typography>
                  
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={results.yearlyResults}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottomRight', offset: -5 }} />
                      <YAxis tickFormatter={(value) => formatCurrency(value).replace('PHP', '₱')} />
                      <RechartsTooltip formatter={(value: any) => formatCurrency(value)} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="cumulativeCashFlow"
                        name="Cumulative Cash Flow"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="cumulativeDiscountedCashFlow"
                        name="Cumulative Discounted Cash Flow"
                        stroke="#82ca9d"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
                
                {/* Yearly Results Table */}
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Yearly Cash Flow Breakdown</Typography>
                  <TableContainer sx={{ maxHeight: 400 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Year</TableCell>
                          <TableCell align="right">Cash Flow</TableCell>
                          <TableCell align="right">Discounted Cash Flow</TableCell>
                          <TableCell align="right">Cumulative Cash Flow</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {results.yearlyResults.map((row) => (
                          <TableRow
                            key={row.year}
                            sx={{
                              backgroundColor: row.cumulativeCashFlow > 0 && row.cumulativeCashFlow - row.cashFlow <= 0
                                ? 'success.light'
                                : 'inherit'
                            }}
                          >
                            <TableCell>{row.year}</TableCell>
                            <TableCell align="right">{formatCurrency(row.cashFlow)}</TableCell>
                            <TableCell align="right">{formatCurrency(row.discountedCashFlow)}</TableCell>
                            <TableCell align="right">
                              {formatCurrency(row.cumulativeCashFlow)}
                              {row.cumulativeCashFlow > 0 && row.cumulativeCashFlow - row.cashFlow <= 0 && (
                                <Tooltip title="Payback achieved this year">
                                  <IconButton size="small" color="success">
                                    <InfoOutlinedIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="body1" color="text.secondary">
                  Enter project parameters and click Calculate ROI to see results
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      )}
      
      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Educational Resources on ROI Calculation</Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="subtitle1" gutterBottom>Key Financial Metrics for Energy Projects</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>Simple Payback Period</Typography>
                  <Typography variant="body2">
                    The time required to recover the initial investment through project savings.
                  </Typography>
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2" fontFamily="monospace">
                      Simple Payback = Initial Investment / (Annual Savings - Annual Costs)
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    <strong>Pros:</strong> Easy to calculate and understand
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Cons:</strong> Ignores time value of money and cash flows after the payback period
                  </Typography>
                </CardContent>
              </Card>
              
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>Net Present Value (NPV)</Typography>
                  <Typography variant="body2">
                    The difference between the present value of cash inflows and the present value of cash outflows over the project lifespan.
                  </Typography>
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2" fontFamily="monospace">
                      NPV = -Initial Investment + Σ (Cash Flow_t / (1 + r)^t)
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      where r = discount rate, t = time period
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    <strong>Decision rule:</strong> Accept projects with positive NPV
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>Internal Rate of Return (IRR)</Typography>
                  <Typography variant="body2">
                    The discount rate that makes the NPV of all cash flows equal to zero.
                  </Typography>
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2" fontFamily="monospace">
                      0 = -Initial Investment + Σ (Cash Flow_t / (1 + IRR)^t)
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    <strong>Decision rule:</strong> Accept projects with IRR greater than the discount rate
                  </Typography>
                </CardContent>
              </Card>
              
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>Savings to Investment Ratio (SIR)</Typography>
                  <Typography variant="body2">
                    The ratio of the present value of savings to the initial investment.
                  </Typography>
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2" fontFamily="monospace">
                      SIR = Present Value of Savings / Initial Investment
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    <strong>Decision rule:</strong> Accept projects with SIR greater than 1.0
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>References</Typography>
          <Typography variant="body2" paragraph>
            • Department of Energy - Guidelines for Energy Conserving Design of Buildings
          </Typography>
          <Typography variant="body2" paragraph>
            • ASHRAE - Energy Efficiency Guide for Existing Commercial Buildings
          </Typography>
          <Typography variant="body2">
            • Philippine Green Building Code - Energy Efficiency Requirements
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ROICalculatorComponent; 