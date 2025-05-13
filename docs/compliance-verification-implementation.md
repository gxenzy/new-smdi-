# Compliance Verification System Implementation

This document describes the implementation of the database-driven compliance verification system for the Energy Audit Platform.

## Overview

The compliance verification system now uses a database-driven approach to store standards values and recommendations, making the system more maintainable, flexible, and extensible. This replaces the previous approach of hardcoding standards in the code.

## Database Tables

Three new tables have been added to the system:

1. **building_type_standards** - Stores building-specific standard values
   - Includes fields for minimum/maximum values, units, descriptions
   - Linked to source standards (PEC, ASHRAE, etc.)
   - Contains specialized methods for common lookups (EUI, LPD)

2. **project_type_standards** - Stores project-specific financial benchmarks
   - Includes fields for minimum/maximum values, units, descriptions
   - Contains specialized methods for financial standards (ROI, payback period, NPV ratio, IRR)

3. **compliance_recommendations** - Stores recommendation templates for non-compliant results
   - Linked to compliance rules
   - Contains recommendations for different non-compliance types
   - Includes priority levels and calculator type categorization

## Implementation Files

### Database Migrations
- `server/src/database/migrations/20230825_create_building_type_standards.js`
- `server/src/database/migrations/20230826_create_project_type_standards.js`
- `server/src/database/migrations/20230827_create_compliance_recommendations.js`

### Models
- `server/src/models/BuildingTypeStandard.js`
- `server/src/models/ProjectTypeStandard.js`
- `server/src/models/ComplianceRecommendation.js`

### Seeders
- `server/src/database/seeders/building_type_standards_seeder.js`
- `server/src/database/seeders/project_type_standards_seeder.js`
- `server/src/database/seeders/compliance_recommendations_seeder.js`
- `server/src/database/runSeeders.js` (script to run all seeders)

### Controller and Routes
- `server/src/controllers/complianceVerificationController.js` (updated)
- `server/src/routes/compliance-verification.js` (updated with new endpoints)

### Frontend Components
- `client/src/services/complianceService.js` (new API service)
- `client/src/components/ComplianceResults/ComplianceResultsCard.jsx` (updated)

## New API Endpoints

The following API endpoints have been added or updated:

1. `POST /api/compliance/verify-calculation` - Enhanced to support building and project types
2. `GET /api/compliance/building-standards` - Get standards for a building type
3. `GET /api/compliance/project-standards` - Get standards for a project type
4. `GET /api/compliance/recommendations` - Get recommendations for non-compliant results

## Usage

### Running the Migrations and Seeders

1. First, run the database migrations:
   ```bash
   npx sequelize-cli db:migrate
   ```

2. Then, run the seeders to populate the tables:
   ```bash
   node server/src/database/runSeeders.js
   ```

### Using the API

To verify a calculation with building and project type context:

```javascript
// Example API call with building and project types
const results = await complianceService.verifyCalculation(
  calculationData,
  'illumination',
  'calc-123',
  'office',  // building type
  'lighting_retrofit'  // project type
);
```

To get building type standards:

```javascript
// Get all standards for a building type
const standards = await complianceService.getBuildingTypeStandards('office');

// Get specific standard type for a building
const illuminationStandards = await complianceService.getBuildingTypeStandards('office', 'illumination');
```

To get recommendations for non-compliant results:

```javascript
// Get recommendations for a calculator type
const recommendations = await complianceService.getComplianceRecommendations({
  calculatorType: 'illumination'
});

// Get recommendations for a specific rule and non-compliance type
const specificRecommendation = await complianceService.getComplianceRecommendations({
  ruleId: 123,
  nonComplianceType: 'below_minimum'
});
```

## Frontend Integration

The `ComplianceResultsCard` component now automatically fetches and displays recommendations from the database when non-compliant results are detected. It falls back to generated recommendations if the API call fails.

## Next Steps

1. Add support for more building types and standard values
2. Create an admin interface for managing standards
3. Implement versioning for standards to track changes over time
4. Add support for location-specific standards
5. Enhance the recommendation system with more detailed corrective actions 