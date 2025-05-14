# Compliance System Quick Reference

## Setup & Check Commands

| Command | Description |
|---------|-------------|
| `npm run compliance:setup` | Full setup: Run migrations + generate all mock data |
| `npm run compliance:check` | Check existing rules and checklists |
| `npm run compliance <command>` | Run a specific compliance manager command |

## Available Commands

| Command | Description |
|---------|-------------|
| `check-rules` | View all compliance rules in database |
| `check-checklists` | View all compliance checklists in database |
| `generate-rules` | Generate sample compliance rules |
| `generate-checklists` | Generate sample compliance checklists |
| `migrate` | Run all compliance-related migrations |
| `migrate-down` | Roll back compliance-related migrations |
| `setup-all` | Complete setup (migrations + mock data) |

## Examples

```bash
# Full setup
npm run compliance:setup

# Check existing data
npm run compliance:check

# Generate only rules
npm run compliance generate-rules

# Roll back all compliance migrations
npm run compliance migrate-down
```

## Recent Enhancements

- Fixed database connection refresh issues after migrations
- Added direct table creation as fallback if migrations fail
- Improved error handling and diagnostics
- Enhanced connection pool management

## Database Schema Summary

- **compliance_rules**: Rules derived from standards (severity, type, verification method)
- **compliance_checklists**: Named lists of rules for verification (draft/active/archived)
- **compliance_checks**: Individual rule verifications (pending/passed/failed/N/A)

For full documentation, see `README-compliance.md` 