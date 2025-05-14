# Schedule of Loads Calculator Implementation Plan

## Overview
The Schedule of Loads (SOL) Calculator is a critical component of the Energy Audit Platform that allows users to document, analyze, and optimize electrical loads within a facility. This calculator will integrate closely with the existing Voltage Drop Calculator and comply with the Philippine Electrical Code (PEC) 2017 requirements.

## Core Features

1. **Panel Management**
   - Create, edit, and delete electrical panels
   - Assign panel details (name, location, voltage, phases)
   - Configure panel properties (main breaker size, bus rating)
   - Support for sub-panels and feeders

2. **Circuit Management**
   - Add, edit, and delete circuits within panels
   - Assign circuit details (name, breaker size, wire size, conduit)
   - Support for single-phase and three-phase circuits
   - Configurable load types (continuous, non-continuous, motor, HVAC)

3. **Load Calculation**
   - Calculate total connected load per circuit
   - Apply diversity and demand factors based on load type
   - Calculate circuit ampacity requirements
   - Determine voltage drop per circuit
   - Calculate panel total loads and demand loads

4. **Compliance Checking**
   - Verify circuit breaker sizing compliance with PEC 2017
   - Check conductor sizing against load requirements
   - Validate voltage drop within allowable limits
   - Verify panel loading within bus rating

5. **Visualization & Reporting**
   - Display panel schedule in traditional format
   - Show load distribution charts
   - Generate comprehensive PDF reports
   - Create CSV export for data sharing

6. **Integration Features**
   - Bidirectional integration with Voltage Drop Calculator
   - Circuit synchronization for consistent data
   - Share circuit data with other calculation modules

## Implementation Phases

### Phase 1: Core Calculation Engine (Week 1)

1. **Data Structures** (Days 1-2)
   - Create Panel interface and model
   - Implement Circuit interface and model
   - Design Load interface with different load types
   - Create utility types for conductor, breaker, and conduit options

2. **Calculation Functions** (Days 3-4)
   - Implement connected load calculation
   - Create demand factor application logic
   - Develop circuit ampacity calculation
   - Implement basic voltage drop estimation
   - Add panel totalization functions

3. **Standards Integration** (Day 5)
   - Connect to PEC 2017 standards database
   - Implement allowable ampacity lookup
   - Create conductor sizing standards integration
   - Add breaker sizing validation logic

### Phase 2: User Interface (Week 2)

1. **Core Component Structure** (Days 1-2)
   - Create ScheduleOfLoadsCalculator main component
   - Implement PanelManager component
   - Design CircuitManager component
   - Create LoadEntryForm component

2. **Panel Management UI** (Days 3-4)
   - Implement panel creation dialog
   - Create panel listing interface
   - Add panel editing capabilities
   - Implement panel deletion with confirmation

3. **Circuit Management UI** (Day 5)
   - Create circuit entry form
   - Implement circuit listing table
   - Add circuit editing functionality
   - Design batch circuit operations

### Phase 3: Visualization & Advanced Features (Week 3)

1. **Traditional Panel Schedule View** (Days 1-2)
   - Implement tabular panel schedule layout
   - Create printable view of panel schedule
   - Add color coding for circuit status
   - Implement sorting and filtering options

2. **Load Distribution Visualization** (Day 3)
   - Create phase balance charts
   - Implement load type distribution charts
   - Add panel loading visualization
   - Create historical load comparison view

3. **Advanced Calculation Features** (Days 4-5)
   - Implement detailed voltage drop calculation
   - Add harmonic consideration for neutral sizing
   - Create economic conductor sizing optimization
   - Implement fault current estimation

### Phase 4: Integration & Export (Week 4)

1. **Voltage Drop Integration** (Days 1-2)
   - Implement circuit data conversion to Voltage Drop Calculator format
   - Create bidirectional synchronization
   - Add integration buttons and workflow
   - Implement conflict resolution for synchronized data

2. **PDF Report Generation** (Days 3-4)
   - Create report templates for panel schedules
   - Implement load summary report
   - Add compliance status report
   - Design combined report with Voltage Drop results

3. **Data Import/Export** (Day 5)
   - Implement CSV export functionality
   - Create data import from CSV
   - Add save/load capabilities
   - Implement batch operation functionality

## Technical Implementation Details

### Key Components

1. **ScheduleOfLoadsCalculator** (Main Component)
   - Container for the entire calculator interface
   - Manages overall state and calculator modes
   - Handles saving/loading functionality

2. **PanelManager**
   - Handles panel collection management
   - Provides panel CRUD operations
   - Displays panel summary information

3. **CircuitManager**
   - Manages circuits within a selected panel
   - Implements circuit CRUD operations
   - Shows circuit status and compliance

4. **LoadEntryForm**
   - Input form for load details
   - Handles validation and data formatting
   - Supports different load types

5. **VoltageDropIntegration**
   - Manages data synchronization with Voltage Drop Calculator
   - Handles conflict resolution
   - Provides bidirectional update capabilities

6. **ReportGenerator**
   - Creates PDF reports of panel schedules
   - Generates compliance status reports
   - Produces visualization exports

### Data Structures

```typescript
// Core data structures
interface Panel {
  id: string;
  name: string;
  location: string;
  voltage: number;
  phases: 1 | 3;
  mainBreakerSize: number;
  busRating: number;
  isSubPanel: boolean;
  parentPanelId?: string;
  circuits: Circuit[];
}

interface Circuit {
  id: string;
  panelId: string;
  name: string;
  description: string;
  poles: 1 | 2 | 3;
  breakerSize: number;
  wireSize: WireSize;
  wireType: WireType;
  conduitType: ConduitType;
  length: number;
  loadType: LoadType;
  connectedLoad: number;
  demandFactor: number;
  powerFactor: number;
  voltageDropPercentage?: number;
  isCompliant: boolean;
  complianceIssues: string[];
}

enum LoadType {
  CONTINUOUS = 'continuous',
  NON_CONTINUOUS = 'non_continuous',
  MOTOR = 'motor',
  HVAC = 'hvac',
  LIGHTING = 'lighting',
  RECEPTACLE = 'receptacle',
  SPECIAL = 'special'
}

interface PanelSummary {
  totalConnectedLoad: number;
  totalDemandLoad: number;
  phaseALoad: number;
  phaseBLoad: number;
  phaseCLoad: number;
  phaseImbalance: number;
  largestMotor?: number;
  voltageDropRange: {min: number, max: number};
  isCompliant: boolean;
  loadingPercentage: number;
}
```

### Calculation Functions

1. **calculateCircuitLoad(circuit: Circuit): number**
   - Calculates actual load based on connected load and demand factor
   - Applies PEC 2017 rules for different load types

2. **calculateRequiredAmpacity(circuit: Circuit): number**
   - Determines required conductor ampacity
   - Applies factors for continuous loads and temperature

3. **checkCircuitCompliance(circuit: Circuit): {isCompliant: boolean, issues: string[]}**
   - Verifies compliance with PEC 2017 standards
   - Checks breaker size, wire size, and voltage drop

4. **calculatePanelSummary(panel: Panel): PanelSummary**
   - Generates overall statistics for a panel
   - Checks phase balance and overall compliance

5. **estimateVoltageDrops(panel: Panel): Panel**
   - Estimates voltage drop for each circuit
   - Identifies circuits requiring detailed analysis

### API Integration

1. **Standards API Integration**
   - Connect to standards database for requirements
   - Implement allowable ampacity lookup by conductor size
   - Access PEC 2017 rules for load calculations

2. **Voltage Drop Calculator Integration**
   - Convert circuit data to voltage drop inputs
   - Update circuit data with voltage drop results
   - Handle synchronization and conflict resolution

## User Experience Flow

1. **Panel Creation**
   - User creates new panel with basic information
   - System initializes empty panel structure
   - User configures panel properties

2. **Circuit Addition**
   - User adds circuits to the panel
   - System calculates load requirements
   - User receives immediate compliance feedback

3. **Load Analysis**
   - User views panel summary statistics
   - System displays load distribution visualization
   - User can identify balance issues or overloading

4. **Voltage Drop Analysis**
   - User selects circuits for detailed analysis
   - System opens Voltage Drop Calculator with circuit data
   - Results synchronize back to Schedule of Loads

5. **Report Generation**
   - User configures report parameters
   - System generates comprehensive PDF report
   - User can export or share the report

## Testing Strategy

1. **Unit Testing**
   - Test calculation functions with various input scenarios
   - Verify compliance checking against PEC 2017 rules
   - Test data conversion functions for accuracy

2. **Integration Testing**
   - Test integration with Voltage Drop Calculator
   - Verify standards API integration
   - Test PDF generation functionality

3. **User Acceptance Testing**
   - Verify correct calculation results
   - Test usability of the interface
   - Validate report formatting and content

## Future Enhancements (Post V1)

1. **Advanced Features**
   - Short circuit calculation integration
   - Arc flash analysis capabilities
   - Harmonic analysis for specific load types
   - Time-based load profiling

2. **Additional Integrations**
   - Integration with Power Factor Calculator
   - Connection to Harmonic Distortion Calculator
   - Building visualization integration for spatial representation

3. **Collaborative Features**
   - Multi-user editing capabilities
   - Change tracking and version history
   - Comments and annotations on circuits

## Conclusion

The Schedule of Loads Calculator will be a comprehensive tool for electrical load management and analysis within the Energy Audit Platform. By implementing this calculator with proper standards integration and synchronization with the Voltage Drop Calculator, we will provide a valuable tool for energy auditors, electrical engineers, and facility managers to analyze, document, and optimize electrical systems. 