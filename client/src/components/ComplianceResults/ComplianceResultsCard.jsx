import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Box,
  Button,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  CheckCircleOutline as CheckIcon,
  ErrorOutline as ErrorIcon,
  HelpOutline as HelpIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  InfoOutlined as InfoIcon,
  PictureAsPdf as PdfIcon,
  LightbulbOutlined as RecommendationIcon
} from '@mui/icons-material';
import { green, red, amber, grey, blue } from '@mui/material/colors';
import complianceService from '../../services/complianceService';

/**
 * ComplianceResultsCard - A component to display compliance verification results
 * @param {Object} props - Component props
 * @param {Object} props.complianceResults - The compliance verification results object
 * @param {String} props.calculationType - The type of calculation that was verified
 * @param {Function} props.onExportToPdf - Callback for exporting results to PDF
 * @param {Function} props.onAddToReport - Callback for adding results to a report
 */
const ComplianceResultsCard = ({ complianceResults, calculationType, onExportToPdf, onAddToReport }) => {
  const [expandedRules, setExpandedRules] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Load recommendations when compliance results change
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!complianceResults || !complianceResults.rules) return;
      
      // Get non-compliant rules
      const nonCompliantRules = complianceResults.rules.filter(
        item => item.status === 'non_compliant'
      );
      
      if (nonCompliantRules.length === 0) return;
      
      setLoadingRecommendations(true);
      try {
        // Fetch recommendations for the calculator type
        const recommendationsData = await complianceService.getComplianceRecommendations({
          calculatorType: calculationType
        });
        
        setRecommendations(recommendationsData);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        // Fallback to generated recommendations
        setRecommendations(generateFallbackRecommendations());
      } finally {
        setLoadingRecommendations(false);
      }
    };
    
    fetchRecommendations();
  }, [complianceResults, calculationType]);

  // Handle rule expansion toggle
  const handleToggleRule = (ruleId) => {
    setExpandedRules(prev => ({
      ...prev,
      [ruleId]: !prev[ruleId]
    }));
  };

  // Get status chip color and text
  const getStatusChip = (status) => {
    switch(status) {
      case 'compliant':
      case 'passed':
        return <Chip 
          label="COMPLIANT" 
          icon={<CheckIcon />} 
          sx={{ 
            bgcolor: green[100], 
            color: green[800],
            fontWeight: 'bold',
            '& .MuiChip-icon': { color: green[800] }
          }} 
        />;
      case 'non_compliant':
      case 'failed':
        return <Chip 
          label="NON-COMPLIANT" 
          icon={<ErrorIcon />} 
          sx={{ 
            bgcolor: red[100], 
            color: red[800],
            fontWeight: 'bold',
            '& .MuiChip-icon': { color: red[800] }
          }} 
        />;
      case 'needs_review':
        return <Chip 
          label="NEEDS REVIEW" 
          icon={<HelpIcon />} 
          sx={{ 
            bgcolor: amber[100], 
            color: amber[800],
            fontWeight: 'bold',
            '& .MuiChip-icon': { color: amber[800] }
          }} 
        />;
      default:
        return <Chip 
          label="UNKNOWN" 
          icon={<HelpIcon />} 
          sx={{ 
            bgcolor: grey[100], 
            color: grey[800],
            '& .MuiChip-icon': { color: grey[800] }
          }} 
        />;
    }
  };

  // Get rule status icon
  const getRuleStatusIcon = (status) => {
    switch(status) {
      case 'compliant':
        return <CheckIcon sx={{ color: green[800] }} />;
      case 'non_compliant':
        return <ErrorIcon sx={{ color: red[800] }} />;
      case 'needs_review':
      case 'not_applicable':
      default:
        return <HelpIcon sx={{ color: amber[800] }} />;
    }
  };

  // Generate fallback recommendations if API call fails
  const generateFallbackRecommendations = () => {
    if (!complianceResults || !complianceResults.rules) return [];
    
    return complianceResults.rules
      .filter(item => item.status === 'non_compliant')
      .map(item => {
        // Generate recommendation based on rule and details
        const match = item.details.match(/\(([^)]+)\) is below the required minimum \(([^)]+)\)/);
        
        if (match) {
          const [_, actual, required] = match;
          return {
            id: item.ruleId || item.rule?.id,
            title: `Improve ${item.title || item.rule?.title}`,
            recommendationText: `Current value of ${actual} needs to be improved to meet the minimum requirement of ${required}.`,
            priority: 'high'
          };
        }
        
        return {
          id: item.ruleId || item.rule?.id,
          title: `Address ${item.title || item.rule?.title} Compliance`,
          recommendationText: `Review and address: ${item.details}`,
          priority: 'medium'
        };
      });
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high':
        return red[800];
      case 'medium':
        return amber[800];
      case 'low':
        return blue[800];
      default:
        return grey[800];
    }
  };

  // Format calculation type for display
  const formatCalculationType = (type) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // If no compliance results, show placeholder
  if (!complianceResults || !complianceResults.rules) {
    return (
      <Card>
        <CardHeader title="Compliance Results" />
        <CardContent>
          <Typography>No compliance verification results available.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader 
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              {formatCalculationType(calculationType)} Standards Compliance
            </Typography>
            {getStatusChip(complianceResults.status)}
          </Box>
        }
        subheader={
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {complianceResults.compliantCount} Compliant • {complianceResults.nonCompliantCount} Non-Compliant • {complianceResults.needsReviewCount} Needs Review
            </Typography>
          </Box>
        }
      />
      <Divider />
      <CardContent sx={{ p: 0 }}>
        {/* Rules List */}
        <List dense sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {complianceResults.rules.map((item) => {
            // Handle both old and new structure
            const ruleId = item.ruleId || (item.rule && item.rule.id);
            const ruleCode = item.ruleCode || (item.rule && item.rule.rule_code);
            const ruleTitle = item.title || (item.rule && item.rule.title);
            const evaluationCriteria = item.evaluationCriteria || (item.rule && item.rule.evaluation_criteria);
            
            return (
              <React.Fragment key={ruleId}>
                <ListItem
                  alignItems="flex-start"
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleToggleRule(ruleId)}>
                      {expandedRules[ruleId] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    {getRuleStatusIcon(item.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ mr: 1 }}>
                          {ruleTitle}
                        </Typography>
                        <Chip 
                          label={ruleCode} 
                          size="small" 
                          variant="outlined" 
                          sx={{ height: 20, fontSize: '0.7rem' }} 
                        />
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ display: 'inline' }}
                      >
                        {item.status === 'compliant' ? '✓ ' : item.status === 'non_compliant' ? '✗ ' : '? '}
                        {item.details}
                      </Typography>
                    }
                  />
                </ListItem>
                <Collapse in={expandedRules[ruleId]} timeout="auto" unmountOnExit>
                  <Box sx={{ p: 2, pl: 7, bgcolor: 'action.hover' }}>
                    <Typography variant="subtitle2">Standard Requirement:</Typography>
                    <Typography variant="body2" gutterBottom>
                      {evaluationCriteria}
                    </Typography>
                    {item.status === 'non_compliant' && item.recommendation && (
                      <>
                        <Typography variant="subtitle2" sx={{ mt: 1 }}>Recommendation:</Typography>
                        <Typography variant="body2" color="error">
                          {item.recommendation}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Collapse>
                <Divider component="li" />
              </React.Fragment>
            );
          })}
        </List>

        {/* Recommendations Section */}
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <RecommendationIcon sx={{ color: blue[700], mr: 1 }} />
            <Typography variant="h6">
              Recommendations
            </Typography>
            {loadingRecommendations && (
              <CircularProgress size={20} sx={{ ml: 2 }} />
            )}
          </Box>
          
          {recommendations.length > 0 ? (
            <List>
              {recommendations.map((rec) => (
                <ListItem key={rec.id} alignItems="flex-start">
                  <ListItemIcon>
                    <InfoIcon sx={{ color: getPriorityColor(rec.priority) }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {rec.title || `${rec.non_compliance_type} Issue`}
                        <Chip 
                          label={rec.priority} 
                          size="small" 
                          sx={{ 
                            ml: 1, 
                            bgcolor: getPriorityColor(rec.priority),
                            color: 'white',
                            fontSize: '0.7rem',
                            height: 20
                          }} 
                        />
                      </Box>
                    }
                    secondary={rec.recommendationText || rec.recommendation_text}
                  />
                </ListItem>
              ))}
            </List>
          ) : complianceResults.nonCompliantCount > 0 ? (
            <Typography color="text.secondary">
              {loadingRecommendations 
                ? 'Loading recommendations...' 
                : 'No specific recommendations available for the non-compliant items.'}
            </Typography>
          ) : (
            <Typography color="text.secondary">
              All standards are compliant. No recommendations needed.
            </Typography>
          )}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <Tooltip title="Export to PDF">
            <Button 
              startIcon={<PdfIcon />} 
              onClick={onExportToPdf}
              sx={{ mr: 1 }}
            >
              Export PDF
            </Button>
          </Tooltip>
          <Button 
            variant="contained" 
            color="primary"
            onClick={onAddToReport}
          >
            Add to Report
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

ComplianceResultsCard.propTypes = {
  complianceResults: PropTypes.shape({
    status: PropTypes.string,
    compliantCount: PropTypes.number,
    nonCompliantCount: PropTypes.number,
    needsReviewCount: PropTypes.number,
    rules: PropTypes.arrayOf(PropTypes.shape({
      // Support for new structure
      ruleId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      ruleCode: PropTypes.string,
      title: PropTypes.string,
      evaluationCriteria: PropTypes.string,
      status: PropTypes.string,
      details: PropTypes.string,
      recommendation: PropTypes.string,
      // Support for old structure
      rule: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        rule_code: PropTypes.string,
        title: PropTypes.string,
        evaluation_criteria: PropTypes.string
      }),
      status: PropTypes.string,
      details: PropTypes.string
    }))
  }),
  calculationType: PropTypes.string.isRequired,
  onExportToPdf: PropTypes.func,
  onAddToReport: PropTypes.func
};

ComplianceResultsCard.defaultProps = {
  onExportToPdf: () => {},
  onAddToReport: () => {}
};

export default ComplianceResultsCard; 