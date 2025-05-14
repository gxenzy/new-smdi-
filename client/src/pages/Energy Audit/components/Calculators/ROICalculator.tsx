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
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CalculateIcon from '@mui/icons-material/Calculate';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

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
}

const projectOptions: ProjectOption[] = [
  {
    name: 'LED Lighting Retrofit',
    description: 'Replace fluorescent fixtures with LED lighting',
    initialCost: 50000,
    annualSavings: 15000,
    maintenanceCost: 1000,
    projectLifespan: 10
  },
  {
    name: 'HVAC Upgrade',
    description: 'Replace old AC units with energy-efficient models',
    initialCost: 120000,
    annualSavings: 25000,
    maintenanceCost: 3000,
    projectLifespan: 15
  },
  {
    name: 'Solar PV Installation',
    description: 'Install rooftop solar panels',
    initialCost: 250000,
    annualSavings: 40000,
    maintenanceCost: 5000,
    projectLifespan: 25
  },
  {
    name: 'Building Automation System',
    description: 'Install smart controls for lighting and HVAC',
    initialCost: 80000,
    annualSavings: 20000,
    maintenanceCost: 2000,
    projectLifespan: 12
  }
];

const ROICalculator: React.FC = () => {
  const [inputs, setInputs] = useState<ROICalculationInputs>({
    initialCost: '50000',
    annualSavings: '15000',
    maintenanceCost: '1000',
    projectLifespan: '10',
    discountRate: '8',
    inflationRate: '4',
    electricityEscalationRate: '5'
  });
  
  const [results, setResults] = useState<ROICalculationResults | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('');
  
  // Handle input changes
  const handleInputChange = (field: keyof ROICalculationInputs) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({
      ...inputs,
      [field]: event.target.value
    });
  };
  
  // Handle project selection
  const handleProjectSelect = (event: SelectChangeEvent) => {
    setSelectedProject(event.target.value);
    
    const project = projectOptions.find(p => p.name === event.target.value);
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
  
  // Calculate ROI metrics
  const calculateROI = () => {
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
    
    for (let year = 1; year <= projectLifespan; year++) {
      // Apply escalation rate to savings
      const adjustedSavings = annualSavings * Math.pow(1 + electricityEscalationRate, year - 1);
      
      // Apply inflation to maintenance costs
      const adjustedMaintenance = maintenanceCost * Math.pow(1 + inflationRate, year - 1);
      
      // Net cash flow for the year
      const cashFlow = adjustedSavings - adjustedMaintenance;
      
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
    
    // Calculate IRR (simplified approximation)
    // For a more accurate IRR, you would use an iterative method
    const irr = (annualSavings - maintenanceCost) / initialCost * 100;
    
    // ROI over project lifespan
    const totalSavings = yearlyResults.reduce((acc, year) => acc + year.cashFlow, 0) + initialCost;
    const roi = (totalSavings / initialCost) * 100;
    
    // Savings to Investment Ratio (SIR)
    const savingsToInvestmentRatio = npv / initialCost + 1;
    
    setResults({
      simplePayback,
      npv,
      irr,
      roi,
      savingsToInvestmentRatio,
      yearlyResults
    });
  };
  
  // Calculate on mount and when inputs change
  useEffect(() => {
    if (
      parseFloat(inputs.initialCost) > 0 &&
      parseFloat(inputs.annualSavings) > 0 &&
      parseInt(inputs.projectLifespan) > 0
    ) {
      calculateROI();
    }
  }, [inputs]);
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Return on Investment (ROI) Calculator
      </Typography>
      <Typography variant="body1" paragraph>
        Evaluate the financial viability of energy efficiency projects by calculating payback period, 
        net present value (NPV), internal rate of return (IRR), and other metrics.
      </Typography>
      
      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Project Inputs
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="project-select-label">Select Project Template</InputLabel>
              <Select
                labelId="project-select-label"
                value={selectedProject}
                label="Select Project Template"
                onChange={handleProjectSelect}
              >
                <MenuItem value="">
                  <em>Custom Project</em>
                </MenuItem>
                {projectOptions.map((project) => (
                  <MenuItem key={project.name} value={project.name}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {selectedProject && (
              <Alert severity="info" sx={{ mb: 3 }}>
                {projectOptions.find(p => p.name === selectedProject)?.description}
              </Alert>
            )}
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Initial Investment Cost (₱)"
                  type="number"
                  value={inputs.initialCost}
                  onChange={handleInputChange('initialCost')}
                  fullWidth
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Annual Energy Savings (₱)"
                  type="number"
                  value={inputs.annualSavings}
                  onChange={handleInputChange('annualSavings')}
                  fullWidth
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Annual Maintenance Cost (₱)"
                  type="number"
                  value={inputs.maintenanceCost}
                  onChange={handleInputChange('maintenanceCost')}
                  fullWidth
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Project Lifespan (years)"
                  type="number"
                  value={inputs.projectLifespan}
                  onChange={handleInputChange('projectLifespan')}
                  fullWidth
                  InputProps={{ inputProps: { min: 1, max: 50 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Financial Parameters
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Discount Rate (%)"
                  type="number"
                  value={inputs.discountRate}
                  onChange={handleInputChange('discountRate')}
                  fullWidth
                  InputProps={{ inputProps: { min: 0, max: 30, step: 0.1 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Inflation Rate (%)"
                  type="number"
                  value={inputs.inflationRate}
                  onChange={handleInputChange('inflationRate')}
                  fullWidth
                  InputProps={{ inputProps: { min: 0, max: 20, step: 0.1 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Electricity Price Escalation (%)"
                  type="number"
                  value={inputs.electricityEscalationRate}
                  onChange={handleInputChange('electricityEscalationRate')}
                  fullWidth
                  InputProps={{ inputProps: { min: 0, max: 20, step: 0.1 } }}
                />
              </Grid>
            </Grid>
            
            <Button
              variant="contained"
              startIcon={<CalculateIcon />}
              onClick={calculateROI}
              sx={{ mt: 3 }}
              fullWidth
            >
              Calculate ROI
            </Button>
          </Paper>
        </Grid>
        
        {/* Results Section */}
        <Grid item xs={12} md={7}>
          {results && (
            <Box>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  ROI Summary
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        bgcolor: results.simplePayback < 5 ? '#e8f5e9' : '#fff3e0',
                        height: '100%'
                      }}
                    >
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Simple Payback Period
                        </Typography>
                        <Typography variant="h4">
                          {results.simplePayback.toFixed(1)} years
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                          {results.simplePayback < 5 
                            ? 'Excellent payback period'
                            : results.simplePayback < 10
                              ? 'Good payback period'
                              : 'Long-term investment'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        bgcolor: results.npv > 0 ? '#e8f5e9' : '#ffebee',
                        height: '100%'
                      }}
                    >
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Net Present Value (NPV)
                        </Typography>
                        <Typography variant="h4">
                          ₱{results.npv.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                          {results.npv > 0 
                            ? 'Financially viable project'
                            : 'Project may not be financially viable'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        bgcolor: results.roi > 100 ? '#e8f5e9' : '#fff3e0',
                        height: '100%'
                      }}
                    >
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Return on Investment (ROI)
                        </Typography>
                        <Typography variant="h4">
                          {results.roi.toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                          {results.roi > 200 
                            ? 'Excellent return on investment'
                            : results.roi > 100
                              ? 'Good return on investment'
                              : 'Moderate return on investment'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        bgcolor: results.savingsToInvestmentRatio > 1 ? '#e8f5e9' : '#ffebee',
                        height: '100%'
                      }}
                    >
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Savings to Investment Ratio
                        </Typography>
                        <Typography variant="h4">
                          {results.savingsToInvestmentRatio.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                          {results.savingsToInvestmentRatio > 1 
                            ? 'Project benefits exceed costs'
                            : 'Project costs exceed benefits'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
              
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Cash Flow Analysis
                </Typography>
                <TableContainer sx={{ maxHeight: 300 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Year</TableCell>
                        <TableCell align="right">Cash Flow (₱)</TableCell>
                        <TableCell align="right">Discounted Cash Flow (₱)</TableCell>
                        <TableCell align="right">Cumulative Cash Flow (₱)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {results.yearlyResults.map((year) => (
                        <TableRow 
                          key={year.year}
                          sx={{ 
                            bgcolor: year.cumulativeCashFlow >= 0 && year.year > 0 ? '#f1f8e9' : 'inherit',
                            '&:nth-of-type(even)': { bgcolor: (theme) => theme.palette.action.hover }
                          }}
                        >
                          <TableCell component="th" scope="row">
                            {year.year}
                          </TableCell>
                          <TableCell align="right">
                            {year.cashFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </TableCell>
                          <TableCell align="right">
                            {year.discountedCashFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </TableCell>
                          <TableCell align="right">
                            {year.cumulativeCashFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<SaveIcon />}
                    sx={{ mr: 1 }}
                  >
                    Save Analysis
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<TrendingUpIcon />}
                  >
                    Export Chart
                  </Button>
                </Box>
              </Paper>
            </Box>
          )}
          
          {!results && (
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <MonetizationOnIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Enter project details to calculate ROI
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center">
                Provide the initial investment cost, annual energy savings, and other parameters to evaluate the financial viability of your energy efficiency project.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          About ROI Calculations
        </Typography>
        <Typography variant="body2" paragraph>
          This calculator helps evaluate the financial viability of energy efficiency projects using several key metrics:
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Simple Payback Period
            </Typography>
            <Typography variant="body2" paragraph>
              The time required to recover the initial investment through energy savings.
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom>
              Net Present Value (NPV)
            </Typography>
            <Typography variant="body2" paragraph>
              The difference between the present value of cash inflows and outflows over the project lifespan, accounting for the time value of money.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Return on Investment (ROI)
            </Typography>
            <Typography variant="body2" paragraph>
              The percentage return on the initial investment over the project lifespan.
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom>
              Savings to Investment Ratio (SIR)
            </Typography>
            <Typography variant="body2" paragraph>
              The ratio of the present value of savings to the initial investment. A ratio greater than 1 indicates a financially viable project.
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ROICalculator; 