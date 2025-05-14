# Unified Saved Calculations System - Implementation Plan

## Overview

The unified saved calculations system will allow users to save, load, and manage calculation data from all calculator modules in a consistent manner. It will provide cross-calculator visibility and proper filtering/categorization to improve the user experience.

## Current Status (20% Complete)

- [x] Basic saved calculation functionality in some calculators (Lighting, HVAC, Equipment)
- [x] Local storage implementation for persistence
- [ ] Cross-calculator visibility
- [ ] Proper error handling
- [ ] Consistent UI across all calculators
- [ ] Server-side storage option

## Architecture

### Data Structure

```typescript
interface SavedCalculation {
  id: string;                 // Unique identifier
  name: string;               // User-provided name
  calculatorType: string;     // e.g., 'lighting', 'hvac', 'schedule-of-loads'
  data: any;                  // Calculator-specific data
  timestamp: number;          // When it was saved
  metadata: {                 // Additional information
    version: string;          // Schema version for backward compatibility
    projectId?: string;       // Optional project association
    tags?: string[];          // Optional tags for categorization
    summary?: {               // Quick access to key metrics
      [key: string]: any;     // Depends on calculator type
    };
  };
}

interface SavedCalculationsState {
  calculations: {
    [id: string]: SavedCalculation;
  };
  recentlyUsed: string[];     // IDs of recently used calculations
  activeCalculation?: string; // ID of currently active calculation
}
```

### Storage Options

1. **LocalStorage**
   - For offline usage and quick access
   - Limited storage space (5-10MB)
   - Already implemented in basic form

2. **IndexedDB**
   - For larger storage needs
   - Better performance for large datasets
   - More complex implementation

3. **Server-side Storage** (Future)
   - For cross-device access
   - Unlimited storage (with quotas)
   - Requires user authentication

## Implementation Steps

### Phase 1: Refactor Current Implementation (1 week)

1. Create a unified `SavedCalculationsContext` React context
   - Implement state management for all calculators
   - Provide consistent methods for save/load/delete
   - Handle serialization/deserialization

2. Update storage utilities
   - Create a common storage adapter interface
   - Implement localStorage adapter
   - Add versioning for backward compatibility

3. Create reusable UI components
   - `SavedCalculationsList` component
   - `SaveCalculationDialog` component
   - `LoadCalculationButton` component

### Phase 2: Calculator Integration (2 weeks)

1. Update each calculator to use the unified system
   - Start with Schedule of Loads calculator
   - Then update Lighting, HVAC, and Equipment calculators
   - Finally update remaining calculators

2. Standardize the data format for each calculator
   - Define required fields for each calculator type
   - Create adapters for old data formats
   - Implement validation functions

3. Add metadata extraction for improved filtering
   - Extract key metrics for summaries
   - Generate tags automatically based on content
   - Create search index for text-based searching

### Phase 3: Enhanced UI and Error Handling (1 week)

1. Create a unified Saved Calculations Manager
   - List view with filtering options
   - Detail view for each saved calculation
   - Bulk operations (delete, export, etc.)

2. Implement robust error handling
   - Validation of loaded data
   - Graceful handling of incompatible calculations
   - User-friendly error messages

3. Add import/export functionality
   - Export as JSON files
   - Import validation
   - Batch import/export

### Phase 4: Server Integration (Future)

1. Create server-side API endpoints
   - CRUD operations for saved calculations
   - User authentication integration
   - Quota management

2. Implement offline-first approach
   - Local caching of server data
   - Background synchronization
   - Conflict resolution

3. Add sharing capabilities
   - Share calculations between users
   - Access control (read-only, edit)
   - Collaborative editing

## Technical Implementation Details

### Context Provider Implementation

```typescript
// SavedCalculationsContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getSavedCalculations, saveCalculations } from './storage';

type Action = 
  | { type: 'SAVE_CALCULATION', payload: { name: string, calculatorType: string, data: any } }
  | { type: 'DELETE_CALCULATION', payload: { id: string } }
  | { type: 'SET_ACTIVE_CALCULATION', payload: { id: string } };

const initialState: SavedCalculationsState = {
  calculations: {},
  recentlyUsed: [],
  activeCalculation: undefined
};

function reducer(state: SavedCalculationsState, action: Action): SavedCalculationsState {
  switch (action.type) {
    case 'SAVE_CALCULATION': {
      const { name, calculatorType, data } = action.payload;
      const id = uuidv4();
      const timestamp = Date.now();
      
      return {
        ...state,
        calculations: {
          ...state.calculations,
          [id]: {
            id,
            name,
            calculatorType,
            data,
            timestamp,
            metadata: {
              version: '1.0',
              summary: extractSummary(calculatorType, data)
            }
          }
        },
        recentlyUsed: [id, ...state.recentlyUsed.filter(i => i !== id).slice(0, 9)]
      };
    }
    
    case 'DELETE_CALCULATION': {
      const { id } = action.payload;
      const { [id]: _, ...remaining } = state.calculations;
      
      return {
        ...state,
        calculations: remaining,
        recentlyUsed: state.recentlyUsed.filter(i => i !== id),
        activeCalculation: state.activeCalculation === id ? undefined : state.activeCalculation
      };
    }
    
    case 'SET_ACTIVE_CALCULATION': {
      return {
        ...state,
        activeCalculation: action.payload.id
      };
    }
    
    default:
      return state;
  }
}

// Extract key metrics based on calculator type
function extractSummary(calculatorType: string, data: any) {
  switch (calculatorType) {
    case 'lighting':
      return {
        totalFixtures: data.fixtures?.length || 0,
        totalWattage: data.totalWattage || 0,
        annualConsumption: data.annualConsumption || 0
      };
      
    case 'schedule-of-loads':
      return {
        totalCircuits: data.loadSchedule?.loads?.length || 0,
        totalConnectedLoad: data.loadSchedule?.totalConnectedLoad || 0,
        totalDemandLoad: data.loadSchedule?.totalDemandLoad || 0,
        current: data.loadSchedule?.current || 0
      };
      
    // Add cases for other calculator types
      
    default:
      return {};
  }
}

// Create the context
const SavedCalculationsContext = createContext<{
  state: SavedCalculationsState;
  saveCalculation: (name: string, calculatorType: string, data: any) => string;
  deleteCalculation: (id: string) => void;
  loadCalculation: (id: string) => any;
  getCalculationsByType: (type: string) => SavedCalculation[];
  getAllCalculations: () => SavedCalculation[];
}>({
  state: initialState,
  saveCalculation: () => '',
  deleteCalculation: () => {},
  loadCalculation: () => null,
  getCalculationsByType: () => [],
  getAllCalculations: () => []
});

// Provider component
export const SavedCalculationsProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // Load saved calculations from storage on mount
  useEffect(() => {
    const savedState = getSavedCalculations();
    if (savedState) {
      // Initialize state with saved data
    }
  }, []);
  
  // Save to storage whenever state changes
  useEffect(() => {
    saveCalculations(state);
  }, [state]);
  
  // Helper functions
  const saveCalculation = (name: string, calculatorType: string, data: any): string => {
    const action = { 
      type: 'SAVE_CALCULATION' as const, 
      payload: { name, calculatorType, data } 
    };
    dispatch(action);
    return action.payload.id;
  };
  
  const deleteCalculation = (id: string) => {
    dispatch({ type: 'DELETE_CALCULATION', payload: { id } });
  };
  
  const loadCalculation = (id: string) => {
    if (id in state.calculations) {
      dispatch({ type: 'SET_ACTIVE_CALCULATION', payload: { id } });
      return state.calculations[id].data;
    }
    return null;
  };
  
  const getCalculationsByType = (type: string) => {
    return Object.values(state.calculations)
      .filter(calc => calc.calculatorType === type)
      .sort((a, b) => b.timestamp - a.timestamp);
  };
  
  const getAllCalculations = () => {
    return Object.values(state.calculations)
      .sort((a, b) => b.timestamp - a.timestamp);
  };
  
  return (
    <SavedCalculationsContext.Provider value={{
      state,
      saveCalculation,
      deleteCalculation,
      loadCalculation,
      getCalculationsByType,
      getAllCalculations
    }}>
      {children}
    </SavedCalculationsContext.Provider>
  );
};

// Custom hook for easy access
export const useSavedCalculations = () => useContext(SavedCalculationsContext);
```

## UI Components

1. **SavedCalculationsList**
   - Filterable list of saved calculations
   - "All" category plus calculator-specific filters
   - Search functionality
   - Sort options (name, date, etc.)

2. **SaveCalculationDialog**
   - Name input field
   - Optional tags input
   - Optional project association
   - Preview of key metrics

3. **UnifiedSavedCalculationsViewer**
   - Advanced management interface
   - Detailed view of calculation data
   - Import/export functionality
   - Batch operations

## Migration Plan

1. Create adapter functions for existing saved calculations
2. Implement migration on first load of new system
3. Preserve backward compatibility for at least two versions

## Testing Strategy

1. Unit tests for core storage and state management
2. Integration tests for calculator-specific adapters
3. UI tests for component functionality
4. End-to-end tests for complete workflows

## Timeline

- **Week 1:** Core context and storage implementation
- **Week 2-3:** Calculator integration
- **Week 4:** UI enhancements and error handling
- **Future:** Server-side integration

## Success Criteria

1. All calculators use the unified saved calculations system
2. Users can access all saved calculations from any calculator
3. Proper error handling prevents data loss or confusion
4. Performance is optimized for large numbers of saved calculations
5. UI is intuitive and consistent across all calculators 