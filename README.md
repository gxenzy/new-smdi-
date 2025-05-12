# Energy Audit School Portal

## Overview
A modern, educational, and user-friendly Energy Audit system for the University of Cebu-Lapu-Lapu and Mandaue (UCLM), focused on manual inspection, reference-driven learning, and role-based access for students, faculty, maintenance, and admin.

---

## Implementation Roadmap

### Phase 1: Foundation
- [x] User authentication and role management
- [x] Main dashboard and navigation
- [x] Standards reference library (basic)

### Phase 2: Core Audit Tools
- [x] Energy Audit Wizard (manual, reference-driven)
  - [x] Lighting inspection checklist with PEC 2017/EMH references
  - [x] HVAC inspection checklist with ASHRAE references
  - [x] Building envelope inspection checklist with energy code references
  - [x] Educational tooltips and explanations for each item
  - [x] Evidence upload and note-taking capabilities
  - [x] Comprehensive PDF/CSV reporting with checklist data
- [ ] Calculators suite (reference-based, no mock data)
- [x] Electrical inspection checklists (from reference material)
  - [x] PEC 2017-based electrical inspection items
  - [x] Category-based organization (General, Distribution Panels, Wiring, etc.)
  - [x] Progress tracking by category
  - [x] Filtering by completion status and category
  - [x] PDF/CSV export with completion data

### Phase 3: Learning & Reporting
- [ ] Learning Center (resources, tutorials, guides)
- [ ] Interactive data visualization
- [ ] Recommendation engine
- [ ] Audit history & comparison

### Phase 4: Advanced Features
- [ ] Building visualization (3D/2D)
- [ ] Mobile-friendly field data collection
- [ ] AI-assisted audit recommendations
- [ ] Integration with school facility management

---

## Progress Tracker

| Feature | Status | Notes |
|---------|--------|-------|
| User Authentication | ✅ Complete | Role-based access implemented |
| Energy Audit Wizard | ✅ Complete | Educational checklists with references |
| Findings Management | ✅ Complete | Create, track, and approve findings |
| Standards Reference | ✅ Complete | PEC 2017 and other standards |
| Electrical Inspection | ✅ Complete | PEC 2017-based checklist with categories |
| Calculators | 🔄 In Progress | Energy calculations with educational components |
| Learning Center | 📅 Planned | Educational resources |
| Reporting | ✅ Complete | PDF, CSV with checklist data |
| Admin Tools | ✅ Complete | User management, workflow config |

---

## Current Focus

**Implementing the Calculators Module**
- Energy load calculators
- ROI/payback period tools
- Electrical system calculators

---

## Technical Stack
- Frontend: React with Material-UI
- Backend: Node.js with Express
- Database: MongoDB
- Authentication: JWT
- Reporting: PDF/CSV generation

---

## Educational Components
The system emphasizes learning through:
- Reference-driven checklists with standards citations
- Educational tooltips and explanations
- Real-world calculation methods
- Standards compliance checking
- Guided audit workflows

---

## For Developers
See the documentation in `/docs` for setup instructions and contribution guidelines.

## Installation and Setup
```sh
npm install
npm run dev
```

## Usage
Navigate to the Energy Audit module in the application to access the various components and tools.

## Building Visualization Module

The Building Visualization module provides tools for displaying and analyzing floor plans with room detection capabilities.

### Features

- Automatic room detection using enhanced image processing
- Integration with Schedule of Loads (SOL) data
- Energy consumption analysis
- Lighting simulation with compliance checking
- Interactive room editing

### Advanced Room Detection Technology

The system now incorporates a multi-layered approach to room detection:

1. **Neural Network Detection**: State-of-the-art deep learning models identify rooms even in complex floor plans
2. **Traditional Computer Vision Processing**: Enhanced image segmentation as a reliable fallback
3. **Adaptive Learning System**: Improves accuracy by learning from corrections and prior successful detections

The neural network model uses semantic segmentation to detect:
- Room boundaries and walls
- Doors and windows
- Room types based on layout patterns
- Text elements to be excluded from detection

### Adaptive Learning for Room Detection

The system includes an adaptive learning mechanism that improves detection accuracy over time:

1. **Learning Process**: When users apply detected rooms, the system saves high-confidence detections as reference data
2. **Application**: Future detection attempts use previous successful detections to improve accuracy
3. **Pattern Recognition**: The system matches detected rooms to known room patterns based on position and characteristics
4. **Critical Thinking**: The system can identify when the current detection misses rooms that should be present
5. **Statistical Analysis**: Pattern consistency analysis determines which room patterns are most reliable
6. **Continuous Improvement**: Detection quality improves with each successful correction

### Using the Room Detection Feature

1. Select a floor from the dropdown
2. Choose either "Lighting" or "Power" view mode
3. Click "Detect" to run automatic room detection
4. Review detected rooms and make any manual adjustments
5. Click "Apply" to confirm room detection and train the model
6. Use the room editor to refine room properties

### Manual Editing Features

- Click on a room to select it
- Use the edit mode to move and resize rooms
- Add new rooms with the "Add Room" button
- Customize room properties in the Room Editor dialog
