# Circuit Synchronization System Implementation

## Overview

The Circuit Synchronization System enables real-time data synchronization between the Voltage Drop Calculator and Schedule of Loads Calculator. It allows engineers to maintain consistency between circuit data across different calculations, ensuring that design decisions made in one calculator are reflected in the other.

## Components Implemented

### 1. CircuitSynchronizationContext

The core state management system for circuit data synchronization. It provides:

- Shared state for circuits and load schedules
- Event-based notification system
- Bidirectional data conversion
- Conflict detection and resolution
- Auto-sync capabilities

**Key Features:**
- Maintains a centralized store of circuit data
- Tracks original data to detect changes
- Provides methods for updating circuit and load schedule data
- Handles synchronization events with proper error handling
- Offers both automatic and manual synchronization options
- Maintains synchronization statistics and status

### 2. SynchronizationPanel

A reusable UI component that displays synchronization status and provides controls for managing synchronization between calculators.

**Key Features:**
- Displays current synchronization status (enabled/disabled)
- Shows auto-sync status
- Provides controls for manual synchronization
- Displays conflict information with resolution options
- Includes settings dialog for configuring sync behavior
- Shows statistics about synchronized circuits and schedules
- Visual indicators for sync status and events

## Integration Points

### 1. Voltage Drop Calculator

- SynchronizationPanel added to the main UI
- Circuit data automatically saved to sync context after calculation
- Sync button added to actions bar
- Integration with "Load from SOL" functionality

### 2. Schedule of Loads Calculator (Pending)

- Add SynchronizationPanel to the Schedule of Loads UI
- Implement auto-updating of load schedules when circuit data changes
- Add "Analyze with Voltage Drop" button for each circuit
- Implement visual indicators for synchronized circuits

## Technical Implementation Details

### Data Structures

1. **UnifiedCircuitData**: Common data format representing circuits from either calculator
   ```typescript
   interface UnifiedCircuitData {
     id: string;
     name: string;
     description?: string;
     voltage: number;
     current: number;
     conductorLength: number;
     conductorSize: string;
     conductorMaterial: string;
     conduitMaterial: string;
     phaseConfiguration: string;
     temperature: number;
     powerFactor: number;
     circuitType: string;
     connectedLoad?: number;
     demandLoad?: number;
     circuitBreaker?: string;
     voltageDropPercent?: number;
     voltageDrop?: number;
     source: 'voltage-drop' | 'schedule-of-loads' | 'manual';
     sourceId?: string;
   }
   ```

2. **SyncEvent**: Represents synchronization events between calculators
   ```typescript
   interface SyncEvent {
     type: 'circuit-updated' | 'circuit-created' | 'circuit-deleted' | 'load-schedule-updated' | 'load-item-updated' | 'sync-requested' | 'sync-completed';
     source: 'voltage-drop' | 'schedule-of-loads' | 'system';
     timestamp: number;
     data: any;
     metadata?: {
       originId?: string;
       sessionId?: string;
       userId?: string;
     };
   }
   ```

3. **SyncStatus**: Tracks the state of synchronization
   ```typescript
   interface SyncStatus {
     lastSyncTime: number | null;
     isSyncing: boolean;
     isEnabled: boolean;
     autoSync: boolean;
     syncError: string | null;
     dataSource: 'voltage-drop' | 'schedule-of-loads' | 'manual' | null;
   }
   ```

### Event Flow

1. Circuit data is updated in either calculator
2. CircuitSynchronizationContext receives the update
3. If auto-sync is enabled, changes are propagated to the other calculator
4. Events are dispatched to notify subscribers
5. UI components are updated to reflect changes
6. Conflicts are detected and presented to the user for resolution

### Conversion Logic

The system includes bidirectional conversion logic between:
- Voltage Drop inputs/results → UnifiedCircuitData
- Schedule of Loads data → UnifiedCircuitData
- UnifiedCircuitData → Voltage Drop inputs
- UnifiedCircuitData → Schedule of Loads data

## Future Improvements

### 1. Enhanced Conflict Resolution

- Implement more sophisticated conflict detection algorithms
- Add visual diff view for comparing conflicting values
- Support batch conflict resolution for multiple circuits
- Add conflict resolution history

### 2. Synchronization History

- Implement a detailed sync history log
- Add filtering and search capabilities for sync events
- Support exporting sync history for debugging
- Create visualizations of sync activity over time

### 3. Multi-user Synchronization

- Add support for collaborative editing with multiple users
- Implement locking mechanisms to prevent conflicting edits
- Add real-time notifications for changes made by other users
- Support chat/comments for discussing circuit changes

### 4. Persistent Synchronization

- Store synchronization state in database
- Support resuming synchronization across sessions
- Implement version history for circuit changes
- Add branching and merging capabilities for different design scenarios

### 5. Advanced Analytics

- Track optimization opportunities across synchronized circuits
- Generate reports on common circuit issues
- Create dashboards for circuit health metrics
- Implement predictive analytics for identifying potential problems

## Implementation Plan for Pending Features

### 1. Complete Schedule of Loads Integration (1-2 days)

- Add SynchronizationPanel component to Schedule of Loads
- Implement automatic update of Schedule of Loads when circuit data changes
- Add visual indicators for synchronized circuits in the Schedule of Loads table
- Test bidirectional synchronization with real data

### 2. Add Sync History Features (2-3 days)

- Create SyncHistoryDialog component
- Implement event logging system
- Add filtering and search capabilities
- Create visualization of sync activity

### 3. Enhanced Conflict Resolution (3-4 days)

- Implement visual diff component for comparing conflicting values
- Add batch conflict resolution
- Create more sophisticated conflict detection algorithms
- Support conflict resolution strategies (e.g., always use newest, always prefer specific calculator)

### 4. Documentation and Testing (2-3 days)

- Create comprehensive documentation for the synchronization system
- Add tooltips and help text to explain synchronization features
- Implement unit tests for CircuitSynchronizationContext
- Add integration tests for bidirectional synchronization
- Create end-to-end tests for conflict resolution

## Conclusion

The Circuit Synchronization System provides a robust foundation for maintaining consistency between the Voltage Drop Calculator and Schedule of Loads Calculator. The current implementation offers essential functionality for synchronizing circuit data, with a clear path for future enhancements to add more sophisticated features like history tracking, advanced conflict resolution, and multi-user support.

With the SynchronizationPanel component now implemented and integrated with the Voltage Drop Calculator, the next steps are to complete the integration with the Schedule of Loads Calculator and implement the sync history features for a more comprehensive synchronization system. 