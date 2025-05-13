# Compliance Verification System Documentation

## Overview

The Compliance Verification System is a database-driven module that allows for real-time verification of calculations against established standards. It replaces the previous hardcoded approach with a more flexible, maintainable database solution.

## Architecture

The system consists of the following components:

### 1. Database Models

- **StandardModel**: Base model for standards documents and references
- **BuildingTypeStandard**: Standards specific to building types (illumination, LPD, etc.)
- **ProjectTypeStandard**: Standards specific to project types (ROI, payback, etc.)
- **ComplianceRule**: Rules used to verify compliance
- **ComplianceRecommendation**: Recommendations for non-compliant results
- **Compliance**: Helper class for verification logic

### 2. API Endpoints

- **GET /api/compliance/building-standards**: Get standards for building types
- **GET /api/compliance/project-standards**: Get standards for project types
- **GET /api/compliance/recommendations**: Get recommendations for non-compliant results
- **POST /api/compliance/verify-calculation**: Verify a calculation against applicable standards

### 3. Admin Interface

- **StandardsManagement**: Admin interface for managing standards and recommendations

## How It Works

1. When a calculation is submitted, the system identifies applicable rules based on the calculation type
2. It then compares the calculation results against the standards defined in the database
3. For building-specific calculations, it looks up the appropriate standards based on building type
4. For project-specific calculations, it looks up the appropriate standards based on project type
5. For non-compliant results, it generates recommendations from the database
6. Results are returned to the client, and optionally saved to the database if the user is authenticated

## Database Schema

### standards

| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| code_name | VARCHAR(50) | Standard code name (e.g., "PEC 2017") |
| full_name | VARCHAR(255) | Full name of standard |
| version | VARCHAR(50) | Version number |
| issuing_body | VARCHAR(255) | Organization that issued the standard |
| effective_date | DATE | When the standard became effective |
| description | TEXT | Description of the standard |

### building_type_standards

| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| building_type | VARCHAR(50) | Type of building (office, school, etc.) |
| standard_type | VARCHAR(50) | Type of standard (illumination, lpd, etc.) |
| standard_code | VARCHAR(50) | Standard code reference |
| minimum_value | DECIMAL | Minimum allowable value |
| maximum_value | DECIMAL | Maximum allowable value |
| unit | VARCHAR(20) | Unit of measurement |
| source_standard_id | INT | Reference to standards table |
| description | TEXT | Description of the standard |

### project_type_standards

| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| project_type | VARCHAR(50) | Type of project (lighting retrofit, etc.) |
| standard_type | VARCHAR(50) | Type of standard (roi, payback, etc.) |
| standard_code | VARCHAR(50) | Standard code reference |
| minimum_value | DECIMAL | Minimum allowable value |
| maximum_value | DECIMAL | Maximum allowable value |
| unit | VARCHAR(20) | Unit of measurement |
| source_standard_id | INT | Reference to standards table |
| description | TEXT | Description of the standard |

### compliance_rules

| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| rule_code | VARCHAR(20) | Unique rule code |
| title | VARCHAR(255) | Rule title |
| description | TEXT | Rule description |
| severity | ENUM | Rule severity (critical, major, minor) |
| type | ENUM | Rule type (prescriptive, performance, mandatory) |
| verification_method | VARCHAR(255) | Method to verify compliance |
| evaluation_criteria | TEXT | Criteria for evaluation |
| active | BOOLEAN | Whether the rule is active |

### compliance_recommendations

| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| rule_id | INT | Reference to compliance_rules |
| non_compliance_type | VARCHAR(50) | Type of non-compliance |
| recommendation_text | TEXT | Recommendation text |
| priority | ENUM | Priority (high, medium, low) |
| calculator_type | VARCHAR(50) | Type of calculator |

### compliance_verifications

| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| calculation_id | VARCHAR(36) | ID of the verified calculation |
| user_id | INT | User who performed verification |
| result_data | TEXT | JSON result data |
| compliant_count | INT | Number of compliant rules |
| non_compliant_count | INT | Number of non-compliant rules |
| status | VARCHAR(20) | Overall status |

## Using the API

### Verifying a Calculation

```js
// Client-side
const results = await complianceService.verifyCalculation(
  calculationData,
  'illumination',
  calculationId,
  'office',    // Optional building type
  'lighting'   // Optional project type
);

// Results structure
{
  compliantCount: 2,
  nonCompliantCount: 1,
  status: 'non_compliant',
  rules: [
    {
      ruleId: 1,
      ruleCode: 'PEC-1075-ILLUM',
      title: 'Minimum Illumination Levels',
      status: 'non_compliant',
      details: 'Calculated illumination (300 lux) is below the required minimum (500 lux)',
      recommendation: 'Increase lighting levels by adding fixtures...'
    },
    // ... other rules
  ]
}
```

### Getting Standards

```js
// Get standards for a building type
const standards = await complianceService.getBuildingTypeStandards('hospital');

// Get standards for a project type
const standards = await complianceService.getProjectTypeStandards('lighting_retrofit');
```

## Admin Management

Administrators can manage standards through the Standards Management interface at `/admin/standards-management`. This interface allows:

- Viewing all standards in a tabular format
- Adding new standards
- Editing existing standards
- Deleting standards

## Setup and Maintenance

### Initial Setup

1. Run database migrations:
   ```
   npm run migrate
   ```

2. Seed the database with initial data:
   ```
   npm run seed
   ```

3. Or do both at once:
   ```
   npm run setup:db
   ```

### Adding New Standards

1. Create a new migration file if a new table is needed
2. Update or create a new seeder file for initial data
3. Run migrations and seeders

### Best Practices

- Always validate data when adding standards
- Provide comprehensive descriptions for standards
- Use source_standard_id to link to the original standard document
- Create rules with clear evaluation criteria
- Write recommendations that are specific and actionable

## Extending the System

### Adding a New Standard Type

1. Add the new standard type to the appropriate database table
2. Update or create appropriate rules
3. Add recommendations for non-compliance
4. Update the frontend to support the new standard type

### Adding a New Calculator Type

1. Add rules specific to the new calculator
2. Add recommendations for the new calculator
3. Update the verification logic in the Compliance model
4. Update the frontend to support the new calculator

## Troubleshooting

### Common Issues

- **Missing Standard**: If a standard is not found, the system will fall back to extracting values from rule text
- **Missing Rule**: If no rule is found for a calculation type, general rules will be used
- **Missing Recommendation**: If no recommendation is found, a generic recommendation will be provided

### Debugging

- Check the compliance verification results for details about which rules failed
- Verify that the appropriate standards are defined for the building/project type
- Check that the calculation data includes all required fields

## Support

For questions or issues, please contact the development team. 