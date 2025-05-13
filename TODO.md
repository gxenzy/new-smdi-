# Energy Audit Platform TODO List

## Standards Reference System

- [x] Move Standards from main sidebar to Energy Audit section
- [x] Implement hierarchical standards browser with breadcrumb navigation
- [x] Add bookmarking functionality for standards sections
- [x] Create user notes system for standards sections
- [x] Implement full-text search across all standards content
- [x] Add filters for standard type, section, and relevance
- [x] Add highlighting for search terms in results
- [x] Implement search history and saved searches
- [ ] Create advanced filtering by compliance requirements 
- [x] Add keyword tagging system for standards
- [x] Create advanced search options (exact match, date range, etc.)
- [x] Add search suggestions and autocomplete functionality
- [x] Integrate search UI with standards browser and section viewer
- [ ] Implement versioning for standards updates
- [ ] Add version comparison view for changes between standards versions

## Calculator Tools

- [x] Fix coordinate systems in PDF export charts
- [x] Create SavedCalculationsViewer component for managing calculations
- [x] Add save/load functionality for calculations
- [x] Add navigation to saved calculations from Energy Audit dashboard
- [ ] Update remaining calculators to use standards API for requirements
- [ ] Implement validation with standards-based guidance
- [ ] Add compliance checking for all calculators
- [ ] Create calculator presets for common scenarios
- [ ] Add unit conversion throughout calculators
- [ ] Implement calculation comparison feature

## Reports Module

- [x] Move Reports from main sidebar to Energy Audit section
- [ ] Add customization options for generated reports
- [ ] Create templates for different audit types and scopes
- [ ] Implement findings and recommendations tracking
- [ ] Add company branding/logo options for reports
- [ ] Create report database for storing generated reports
- [ ] Build report browsing interface
- [ ] Add report filtering and search capabilities
- [ ] Add report sharing via email or link

## User Experience Improvements

- [x] Update navigation to include hierarchical structure
- [ ] Create embedded help system
- [ ] Add tutorials for major features
- [ ] Implement guided tours for new users
- [ ] Add keyboard shortcuts for common actions
- [ ] Improve accessibility for screen readers
- [ ] Add dark mode toggle
- [ ] Create quick tips system for calculators

## Integration Improvements

- [ ] Connect all calculators with standards reference for requirements lookup
- [ ] Link findings directly to relevant standards
- [ ] Create API for external data integration
- [ ] Add import/export functionality for building data
- [ ] Implement real-time collaboration features 

# Implementation TODO and Progress

## Recent Implementations
- [x] Fixed calculator save/load functionality
- [x] Improved naming for saved calculations with descriptive defaults
- [x] Enhanced error handling in Schedule of Loads calculator
- [x] Implemented user feedback with snackbar notifications
- [x] Added success notifications when loading saved calculations 
- [x] Enhanced the Standards Reference System with bookmarks and notes
- [x] Created intuitive UI for managing bookmarks with search capability
- [x] Implemented user notes with rich editing and management
- [x] Implemented enhanced search functionality with relevance scoring
- [x] Added search suggestions and autocomplete for faster discovery
- [x] Created search results UI with highlighting and filtering options
- [x] Integrated seamless bookmark functionality with search results
- [x] Standardized interfaces between components using services
- [x] Fixed type inconsistencies between components (string vs number IDs)
- [x] Implemented localStorage hook for bookmarks persistence

## Current Priorities
- [x] Complete full text search for Standards Reference System
- [x] Integrate the search UI with the Standards Reference System
- [x] Fix linter errors by installing required dependencies
- [x] Update components to fix remaining type errors
- [ ] Update all calculators to use standards API for validation
- [ ] Implement report saving to database
- [ ] Add WCAG 2.1 AA compliance for charts
- [ ] Create linked charts that update together

## Technical Improvements In Progress
- [x] Fix TypeScript errors in standardsService imports
- [x] Install required dependencies (knex, winston)
- [x] Fix StandardsBrowser import casing issue for consistency
- [x] Create proper type definitions for all API responses
  - [x] Search API type definitions
  - [x] Standards API type definitions
  - [x] Report API type definitions
- [ ] Optimize chart rendering for large datasets
- [x] Add caching mechanisms for frequently used charts
  - [x] Search suggestions caching
  - [ ] Chart data caching
  - [ ] Standards data caching
- [ ] Refactor calculator logic into separate utility functions
- [ ] Improve test coverage for calculator modules
- [x] Standardize error handling across components
  - [x] Create central error handling utility
  - [x] Implement consistent error response format
  - [x] Add better error logging
- [x] Enhance database connection reliability
  - [x] Implement connection pooling
  - [x] Add retry logic for failed connections
  - [x] Validate connections before use

## Next Features
- [ ] Building Profile System
- [ ] Report Management System
- [ ] Data Analysis Dashboard
- [ ] Mobile Field Data Collection
 
 