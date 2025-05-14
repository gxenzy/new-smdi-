import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { ComplianceResultsCard } from './index';

/**
 * Example usage of the ComplianceResultsCard component
 */
const ComplianceResultsExample = () => {
  // Sample compliance results data
  const sampleComplianceResults = {
    status: 'failed',
    compliantCount: 3,
    nonCompliantCount: 2,
    needsReviewCount: 1,
    rules: [
      {
        rule: {
          id: 1,
          rule_code: 'PEC-1075',
          title: 'Illumination Requirements',
          evaluation_criteria: 'Minimum 500 lux for office spaces'
        },
        status: 'compliant',
        details: 'Calculated illumination (550 lux) meets the required minimum (500 lux)'
      },
      {
        rule: {
          id: 2,
          rule_code: 'PEC-1075-CLR',
          title: 'Color Rendering Index',
          evaluation_criteria: 'CRI of at least 80 for office work areas'
        },
        status: 'compliant',
        details: 'Calculated CRI (85) meets the required minimum (80)'
      },
      {
        rule: {
          id: 3,
          rule_code: 'PEC-1075-UNIF',
          title: 'Illumination Uniformity',
          evaluation_criteria: 'Uniformity ratio of at least 0.7 for workspaces'
        },
        status: 'non_compliant',
        details: 'Calculated uniformity ratio (0.65) is below the required minimum (0.7)'
      },
      {
        rule: {
          id: 4,
          rule_code: 'PGBC-LPD',
          title: 'Lighting Power Density',
          evaluation_criteria: 'Maximum 10 W/m² for office spaces'
        },
        status: 'non_compliant',
        details: 'Lighting Power Density (12.5 W/m²) exceeds the limit (10 W/m²) for office'
      },
      {
        rule: {
          id: 5,
          rule_code: 'PEC-1075-GLARE',
          title: 'Glare Control',
          evaluation_criteria: 'UGR less than 19 for office environments'
        },
        status: 'compliant',
        details: 'Calculated UGR (17) is within acceptable limits (< 19)'
      },
      {
        rule: {
          id: 6,
          rule_code: 'PEC-EMER',
          title: 'Emergency Lighting',
          evaluation_criteria: 'Minimum 1 lux for escape routes'
        },
        status: 'needs_review',
        details: 'Manual verification required for emergency lighting layout'
      }
    ]
  };

  // Sample handlers for button actions
  const handleExportToPdf = () => {
    console.log('Exporting compliance results to PDF');
    // In a real implementation, this would call a PDF generation service
  };

  const handleAddToReport = () => {
    console.log('Adding compliance results to report');
    // In a real implementation, this would dispatch an action to add to report
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Compliance Verification Example
        </Typography>
        
        <Typography variant="body1" paragraph>
          This example demonstrates the ComplianceResultsCard component with sample illumination calculator results.
        </Typography>
        
        <ComplianceResultsCard
          complianceResults={sampleComplianceResults}
          calculationType="illumination"
          onExportToPdf={handleExportToPdf}
          onAddToReport={handleAddToReport}
        />
      </Box>
    </Container>
  );
};

export default ComplianceResultsExample; 