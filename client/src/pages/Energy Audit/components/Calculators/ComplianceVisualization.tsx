import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Divider,
  Grid,
  Chip,
  Link,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Collapse,
  IconButton,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon,
  ElectricalServices as ElectricalServicesIcon,
  School as SchoolIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Code as CodeIcon,
  PriorityHigh as PriorityHighIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';
import ComplianceMeter from './ComplianceMeter';
import { VoltageDropCalculationResult } from './utils/voltageDropRecalculator';
import { UnifiedCircuitData } from './utils/CircuitSynchronization';

export interface ComplianceVisualizationProps {
  /**
   * Circuit data for the analyzed circuit
   */
  circuitData: UnifiedCircuitData;
  
  /**
   * Results from voltage drop calculation
   */
  voltageDropResult: VoltageDropCalculationResult;
  
  /**
   * Whether to show detailed PEC references
   */
  showStandardsReferences?: boolean;
  
  /**
   * Whether to show educational information
   */
  showEducationalInfo?: boolean;
  
  /**
   * Callback when user clicks a standard reference
   */
  onReferenceClick?: (reference: string) => void;
}

/**
 * Comprehensive compliance visualization component for voltage drop analysis
 * Displays compliance status, educational information, and PEC references
 */
const ComplianceVisualization: React.FC<ComplianceVisualizationProps> = ({
  circuitData,
  voltageDropResult,
  showStandardsReferences = true,
  showEducationalInfo = true,
  onReferenceClick
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogContent, setDialogContent] = useState<{title: string, content: string}>({
    title: '',
    content: ''
  });

  // Toggle expanded section
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  // Open dialog with standards reference content
  const openStandardsDialog = (title: string, content: string) => {
    setDialogContent({ title, content });
    setDialogOpen(true);
  };
  
  // Extract values from voltage drop result
  const {
    voltageDropPercent,
    voltageDrop,
    maxAllowedDrop,
    compliance,
    receivingEndVoltage,
    wireRating,
    recommendations
  } = voltageDropResult;
  
  // Determine compliance status
  const isCompliant = compliance === 'compliant';
  const complianceMargin = maxAllowedDrop - voltageDropPercent;
  const marginPercentage = (complianceMargin / maxAllowedDrop) * 100;
  
  // Create compliance insight text
  const getComplianceInsight = () => {
    if (complianceMargin > 0) {
      if (marginPercentage > 50) {
        return "Excellent margin. This circuit has significant headroom for future load increases.";
      } else if (marginPercentage > 20) {
        return "Good margin. This circuit has adequate headroom for moderate load increases.";
      } else {
        return "Minimal margin. Consider monitoring this circuit if loads may increase in the future.";
      }
    } else {
      if (marginPercentage < -50) {
        return "Critical issue. This circuit requires immediate attention and resizing.";
      } else {
        return "Non-compliant. This circuit needs attention to meet PEC requirements.";
      }
    }
  };

  // Calculate compliance severity
  const getComplianceSeverity = (): 'critical' | 'warning' | 'good' => {
    if (complianceMargin <= 0) {
      return marginPercentage < -30 ? 'critical' : 'warning';
    }
    return 'good';
  };

  const complianceSeverity = getComplianceSeverity();
  
  // Determine standards references for voltage drop
  const standardsReferences = [
    {
      id: "PEC-2.30",
      title: "PEC 2017 Section 2.30", 
      description: "General requirements for voltage drop limitations in feeders and branch circuits.",
      link: "/energy-audit/standards/pec-2017/2-30",
      content: "2.30 Branch-circuit, feeder, and service conductors shall be sized to prevent a voltage drop exceeding 3 percent at the farthest outlet of power, heating, and lighting loads, or combinations of such loads, and where the maximum total voltage drop on both feeders and branch circuits to the farthest outlet does not exceed 5 percent."
    },
    {
      id: "PEC-2.12",
      title: "PEC 2017 Section 2.12", 
      description: "Conductor sizing and ampacity requirements.",
      link: "/energy-audit/standards/pec-2017/2-12",
      content: "2.12 Conductors shall be sized to carry the load current without exceeding the permissible ampacity as specified in ampacity tables. The ampacity values shall be derated for ambient temperature, number of conductors in a raceway, and other factors affecting conductor heating."
    }
  ];
  
  // Educational information about voltage drop
  const educationalInfo = [
    "Voltage drop is the reduction in voltage along a conductor due to impedance.",
    "Excessive voltage drop can cause equipment malfunction, overheating, and reduced efficiency.",
    "PEC 2017 recommends maximum voltage drop of 3% for branch circuits and 5% for combined feeder and branch circuits.",
    "Conductor size, length, material, and load current all affect voltage drop."
  ];

  // Additional recommendations based on compliance status
  const getAdditionalRecommendations = () => {
    if (isCompliant) {
      if (marginPercentage > 50) {
        return [
          "Current conductor size provides excellent headroom for future load increases.",
          "Consider documenting this circuit as a model for future installations."
        ];
      } else if (marginPercentage > 20) {
        return [
          "Current design is compliant with a good safety margin.",
          "Monitor for future load increases that might affect compliance."
        ];
      } else {
        return [
          "Circuit is compliant but with minimal margin.",
          "Consider upsizing the conductor for better long-term reliability.",
          "Document this circuit for regular monitoring."
        ];
      }
    } else {
      if (marginPercentage < -50) {
        return [
          "CRITICAL: This circuit requires immediate attention.",
          "Increase conductor size by at least two sizes.",
          "Verify load calculations to ensure proper sizing.",
          "Consider dividing the load among multiple circuits if appropriate."
        ];
      } else {
        return [
          "Increase conductor size to meet voltage drop requirements.",
          "Verify actual conductor length and reassess if necessary.",
          "Consider relocating the load closer to the source if possible."
        ];
      }
    }
  };

  const additionalRecommendations = getAdditionalRecommendations();
  
  // Impact information based on compliance status
  const getImpactInformation = () => {
    if (isCompliant) {
      return [
        "Proper voltage supply to equipment ensures optimal operation.",
        "Reduced energy losses in conductors improves overall efficiency.",
        "Extended equipment lifespan due to proper operating voltage."
      ];
    } else {
      return [
        "Equipment may operate inefficiently or malfunction.",
        "Increased energy losses in conductors raises operating costs.",
        "Reduced equipment lifespan due to improper operating voltage.",
        "Potential safety issues with sensitive equipment."
      ];
    }
  };

  const impactInformation = getImpactInformation();
  
  return (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={3}>
        {/* Main compliance meter */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 2, 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${
                complianceSeverity === 'critical' ? theme.palette.error.main :
                complianceSeverity === 'warning' ? theme.palette.warning.main :
                theme.palette.success.main
              }`
            }}
          >
            <ComplianceMeter
              value={voltageDropPercent}
              threshold={maxAllowedDrop}
              label="Voltage Drop Compliance"
              showDetails={true}
              size="large"
              animated={true}
              description={`PEC 2017 maximum allowed voltage drop: ${maxAllowedDrop}%`}
            />
            
            <Box sx={{ mt: 2, width: '100%' }}>
              <Typography 
                variant="subtitle2" 
                color={isCompliant ? 'success.main' : 'error.main'}
                fontWeight="bold"
                textAlign="center"
              >
                {isCompliant ? 'PEC 2017 COMPLIANT' : 'PEC 2017 NON-COMPLIANT'}
              </Typography>
              
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ mt: 1, textAlign: 'center' }}
              >
                {getComplianceInsight()}
              </Typography>

              {complianceSeverity === 'critical' && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Chip 
                    icon={<PriorityHighIcon />} 
                    label="Critical Issue" 
                    color="error" 
                    variant="outlined" 
                  />
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Compliance details */}
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Compliance Analysis
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Voltage Drop:
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color={isCompliant ? 'success.main' : 'error.main'}
                    fontWeight="medium"
                  >
                    {voltageDropPercent.toFixed(2)}%
                  </Typography>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Maximum Allowed:
                  </Typography>
                  <Typography variant="body1">
                    {maxAllowedDrop}%
                  </Typography>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Compliance Margin:
                  </Typography>
                  <Typography 
                    variant="body1"
                    color={complianceMargin > 0 ? 'success.main' : 'error.main'}
                  >
                    {complianceMargin.toFixed(2)}%
                  </Typography>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Wire Ampacity:
                  </Typography>
                  <Typography 
                    variant="body1"
                    color={wireRating.isAdequate ? 'success.main' : 'error.main'}
                  >
                    {wireRating.ampacity.toFixed(1)} A
                  </Typography>
                </Grid>
              </Grid>
              
              {/* Circuit information */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <ElectricalServicesIcon fontSize="small" sx={{ mr: 1 }} />
                  Circuit Information
                </Typography>
                
                <Grid container spacing={1}>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">Conductor:</Typography>
                    <Typography variant="body2">
                      {circuitData.conductorSize} {circuitData.conductorMaterial}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">Length:</Typography>
                    <Typography variant="body2">
                      {circuitData.conductorLength} m
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">Load Current:</Typography>
                    <Typography variant="body2">
                      {circuitData.current?.toFixed(1)} A
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              
              {/* Recommendations */}
              <Box>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    mb: 1
                  }}
                  onClick={() => toggleSection('recommendations')}
                >
                  <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
                    <LightbulbIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    Recommendations
                  </Typography>
                  {expandedSection === 'recommendations' ? 
                    <ExpandLessIcon fontSize="small" /> : 
                    <ExpandMoreIcon fontSize="small" />
                  }
                </Box>
                
                <Collapse in={expandedSection === 'recommendations'}>
                  <List dense>
                    {recommendations.map((recommendation: string, index: number) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <ArrowForwardIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={recommendation}
                          primaryTypographyProps={{
                            variant: 'body2'
                          }}
                        />
                      </ListItem>
                    ))}
                    
                    {/* Additional recommendations based on compliance status */}
                    {additionalRecommendations.map((recommendation: string, index: number) => (
                      <ListItem key={`additional-${index}`} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <ArrowForwardIcon fontSize="small" color={
                            recommendation.startsWith('CRITICAL') ? 'error' : 'primary'
                          } />
                        </ListItemIcon>
                        <ListItemText 
                          primary={recommendation}
                          primaryTypographyProps={{
                            variant: 'body2',
                            color: recommendation.startsWith('CRITICAL') ? 'error.main' : 'inherit',
                            fontWeight: recommendation.startsWith('CRITICAL') ? 'bold' : 'normal'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </Box>
              
              {/* Impact information */}
              <Box sx={{ mt: 2 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    mb: 1
                  }}
                  onClick={() => toggleSection('impact')}
                >
                  <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
                    <InfoIcon fontSize="small" sx={{ mr: 1, color: 'info.main' }} />
                    Impact on Equipment and Operation
                  </Typography>
                  {expandedSection === 'impact' ? 
                    <ExpandLessIcon fontSize="small" /> : 
                    <ExpandMoreIcon fontSize="small" />
                  }
                </Box>
                
                <Collapse in={expandedSection === 'impact'}>
                  <List dense>
                    {impactInformation.map((info: string, index: number) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <InfoIcon fontSize="small" color="info" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={info}
                          primaryTypographyProps={{
                            variant: 'body2'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Standards References */}
        {showStandardsReferences && (
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SchoolIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    PEC 2017 References
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <List dense>
                  {standardsReferences.map((reference) => (
                    <ListItem 
                      key={reference.id}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                      onClick={() => openStandardsDialog(reference.title, reference.content)}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CodeIcon fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={reference.title}
                        secondary={reference.description}
                        primaryTypographyProps={{
                          variant: 'subtitle2'
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    size="small"
                    startIcon={<SchoolIcon />}
                    onClick={() => onReferenceClick && onReferenceClick('pec-2017-voltage-drop')}
                  >
                    View Full Standard
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
        
        {/* Educational Information */}
        {showEducationalInfo && (
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ElectricalServicesIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    About Voltage Drop
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <List dense>
                  {educationalInfo.map((info, index) => (
                    <ListItem key={index}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <InfoIcon fontSize="small" color="info" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={info}
                        primaryTypographyProps={{
                          variant: 'body2'
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Formula for calculating voltage drop:
                  </Typography>
                  <Box sx={{ 
                    bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100', 
                    p: 1, 
                    borderRadius: 1
                  }}>
                    <Typography variant="body2" fontFamily="monospace">
                      VD = 2 × I × R × L / 1000 (for single-phase)
                    </Typography>
                    <Typography variant="body2" fontFamily="monospace">
                      VD = √3 × I × R × L / 1000 (for three-phase)
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                      Where: VD = Voltage drop (V), I = Current (A), R = Resistance (Ω/km), L = Length (m)
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Chip 
                    label="Learn more about voltage drop"
                    color="primary"
                    size="small"
                    onClick={() => onReferenceClick && onReferenceClick('voltage-drop-guide')}
                    clickable={!!onReferenceClick}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Standards Reference Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
      >
        <DialogTitle>
          {dialogContent.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogContent.content}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {onReferenceClick && (
            <Button 
              onClick={() => {
                onReferenceClick('pec-2017-voltage-drop');
                setDialogOpen(false);
              }}
              color="primary"
            >
              View Full Standard
            </Button>
          )}
          <Button 
            onClick={() => setDialogOpen(false)} 
            color="primary" 
            autoFocus
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComplianceVisualization; 