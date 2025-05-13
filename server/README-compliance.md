# Compliance Management System

## Overview

The Compliance Management System is a component of the Energy Audit Platform that helps verify compliance with electrical standards and regulations. It provides a structured way to create, manage, and report on compliance rules and checklists.

## Architecture

The system consists of:

1. **Database Tables**
   - `compliance_rules`: Stores standards-based compliance rules
   - `compliance_checklists`: Defines sets of rules for verification
   - `compliance_checks`: Links rules to checklists with verification status
   - `calculation_compliance_verifications`: Tracks calculation verification results
   - `calculation_compliance_details`: Stores detailed rule verification data

2. **API Endpoints**
   - `/compliance/rules`: Manage compliance rules
   - `/compliance/checklists`: Manage compliance checklists
   - `/compliance-verification`: Verify calculations against rules

3. **Unified Management Script**
   - `compliance-manager.js`: A single script to handle all compliance-related operations

## Quick Start

### Setup

To set up the complete compliance system:

```bash
npm run compliance:setup
```

This will:
1. Run all compliance-related migrations
2. Generate mock compliance rules
3. Generate mock compliance checklists

> **Note**: The setup script is designed to be idempotent - you can run it multiple times without causing issues. If tables or data already exist, it will skip those steps.

### Checking Current Data

To check the current state of your compliance data:

```bash
npm run compliance:check
```

## Available Commands

The compliance system provides these npm scripts:

```bash
# Run the compliance manager with a command
npm run compliance <command>

# Full setup: migrations + data generation
npm run compliance:setup

# Check existing rules and checklists
npm run compliance:check
```

## Compliance Manager Commands

The compliance manager supports these commands:

- `check-rules`: View all compliance rules in the database
- `check-checklists`: View all compliance checklists in the database
- `generate-rules`: Generate sample compliance rules
- `generate-checklists`: Generate sample compliance checklists
- `migrate`: Run all compliance-related migrations
- `migrate-down`: Roll back compliance-related migrations
- `setup-all`: Complete setup (migrations + mock data generation)

Example usage:

```bash
npm run compliance check-rules
npm run compliance migrate
```

## Database Schema

### compliance_rules Table

Stores rules derived from electrical standards:

- `id`: Primary key
- `rule_code`: Unique code (e.g., "PEC-IL-001")
- `title`: Rule title
- `description`: Detailed description
- `severity`: critical, major, minor
- `type`: prescriptive, performance, mandatory
- `verification_method`: How to verify compliance
- `evaluation_criteria`: Criteria for passing
- `failure_impact`: Impact of non-compliance
- `remediation_advice`: Suggested fixes
- `section_id`: Link to standards section

### compliance_checklists Table

Defines sets of rules for verification:

- `id`: Primary key
- `name`: Checklist name
- `description`: Detailed description
- `created_by`: User ID of creator
- `status`: draft, active, archived

### compliance_checks Table

Links rules to checklists with verification status:

- `id`: Primary key
- `checklist_id`: Reference to checklist
- `rule_id`: Reference to rule
- `status`: pending, passed, failed, not_applicable
- `notes`: Notes from verification
- `evidence`: Evidence paths/URLs
- `checked_by`: User ID of verifier

## Development Notes

The compliance system was unified into a single script to simplify management and avoid confusion from multiple separate scripts. The `compliance-manager.js` file contains all functionality previously split across multiple files.

When extending the system, consider adding new commands to the compliance manager rather than creating new standalone scripts.

### Recent Bug Fixes

- Fixed an issue where the checklist generator would fail with "Required tables not found" error
- Enhanced the script to automatically run migrations if tables are missing
- Added automatic rule generation if no rules exist when trying to create checklists

## Troubleshooting

### Common Issues

1. **"Required tables not found" error**
   This typically occurs when the database migrations haven't been run. The script now attempts to run migrations automatically, but you can also run them manually:
   ```bash
   npm run compliance migrate
   ```

2. **"No matching rules found for checklist" warning**
   This warning appears when you're trying to create a checklist that references rule codes that don't exist in the database. Try generating rules first:
   ```bash
   npm run compliance generate-rules
   ```

3. **Database connection issues**
   If you see database connection errors, verify your settings in the `.env` file or run the database setup:
   ```bash
   npm run setup:db
   ```

### Manual Reset

If you want to completely reset the compliance system:

1. Roll back all migrations:
   ```bash
   npm run compliance migrate-down
   ```

2. Re-run the setup:
   ```bash
   npm run compliance:setup
   ``` 