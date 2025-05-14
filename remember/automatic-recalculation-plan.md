# Automatic Voltage Drop Recalculation Plan

## Overview
The goal of this enhancement is to implement automatic recalculation of voltage drop when circuit properties change, reducing the need for manual recalculation and ensuring that voltage drop information stays current with circuit modifications.

## Current Implementation
Currently, the voltage drop calculation is triggered manually:
- The user needs to explicitly click the "Calculate Voltage Drop" button in the VoltageDropAnalysisDialog
- Changes to circuit properties in the Circuit Details Dialog don't trigger voltage drop recalculation
- There's no persistent link between circuit properties and voltage drop results

## Enhancement Areas

### 1. Change Detection System
- Implement event listeners for property changes that affect voltage drop
- Create a change detection system to track circuit property modifications
- Develop a notification system to inform users about changes affecting voltage drop

### 2. Efficient Recalculation
- Implement selective recalculation for only affected circuits
- Create a caching system to avoid redundant calculations
- Add computation throttling to prevent performance issues during rapid changes

### 3. Batch Recalculation
- Develop batch recalculation capabilities for multiple circuits
- Implement prioritized recalculation for critical circuits
- Add progress tracking for large panel recalculations

### 4. User Experience
- Create non-intrusive UI indicators for recalculation status
- Implement options to enable/disable automatic recalculation
- Add abort mechanism for long-running calculations

## Implementation Steps

### Step 1: Enhance VoltageDropCaching
```typescript
// Extend the existing memoizeCalculation to include invalidation
export function memoizeCalculationWithInvalidation<T, R>(
  fn: (arg: T) => R,
  keyGenerator: (arg: T) => string
): {
  compute: (arg: T) => R;
  invalidate: (key?: string) => void;
  invalidateAll: () => void;
} {
  const cache = new Map<string, R>();
  
  return {
    compute: (arg: T): R => {
      const key = keyGenerator(arg);
      if (cache.has(key)) {
        return cache.get(key)!;
      }
      const result = fn(arg);
      cache.set(key, result);
      return result;
    },
    invalidate: (key?: string): void => {
      if (key) {
        cache.delete(key);
      }
    },
    invalidateAll: (): void => {
      cache.clear();
    }
  };
}
```

### Step 2: Create a CircuitChangeTracker
```typescript
// Add a circuit change tracking system
interface CircuitChanges {
  id: string;
  changedProperties: string[];
  previousValues: Record<string, any>;
  newValues: Record<string, any>;
  timestamp: number;
}

class CircuitChangeTracker {
  private changes: Map<string, CircuitChanges> = new Map();
  private listeners: Set<(changes: CircuitChanges) => void> = new Set();
  
  // Track a circuit property change
  trackChange(
    circuitId: string,
    property: string,
    previousValue: any,
    newValue: any
  ): void {
    // Record the change
    let circuitChanges = this.changes.get(circuitId);
    if (!circuitChanges) {
      circuitChanges = {
        id: circuitId,
        changedProperties: [],
        previousValues: {},
        newValues: {},
        timestamp: Date.now()
      };
      this.changes.set(circuitId, circuitChanges);
    }
    
    circuitChanges.changedProperties.push(property);
    circuitChanges.previousValues[property] = previousValue;
    circuitChanges.newValues[property] = newValue;
    
    // Notify listeners
    this.notifyListeners(circuitChanges);
  }
  
  // Add a listener for changes
  addChangeListener(listener: (changes: CircuitChanges) => void): () => void {
    this.listeners.add(listener);
    // Return a function to remove the listener
    return () => this.listeners.delete(listener);
  }
  
  // Notify all listeners of a change
  private notifyListeners(changes: CircuitChanges): void {
    this.listeners.forEach(listener => listener(changes));
  }
  
  // Clear all tracked changes
  clearChanges(): void {
    this.changes.clear();
  }
}

// Create singleton instance
export const circuitChangeTracker = new CircuitChangeTracker();
```

### Step 3: Implement VoltageDropRecalculator
```typescript
// Create a voltage drop recalculator service
class VoltageDropRecalculator {
  private isRecalculating: boolean = false;
  private pendingRecalculations: Set<string> = new Set();
  private throttleTimeout: NodeJS.Timeout | null = null;
  private throttleDelay: number = 500; // ms
  
  constructor() {
    // Listen for circuit changes
    circuitChangeTracker.addChangeListener(this.handleCircuitChange);
  }
  
  // Handle a circuit change
  private handleCircuitChange = (changes: CircuitChanges): void => {
    // Check if the change affects voltage drop
    if (this.doesChangeAffectVoltageDrop(changes)) {
      // Add to pending recalculations
      this.pendingRecalculations.add(changes.id);
      
      // Throttle recalculation
      this.scheduleRecalculation();
    }
  }
  
  // Check if a change affects voltage drop calculation
  private doesChangeAffectVoltageDrop(changes: CircuitChanges): boolean {
    // Properties that affect voltage drop
    const voltageDropProperties = [
      'conductorLength',
      'conductorSize',
      'conductorMaterial',
      'conduitMaterial',
      'circuitType',
      'phaseConfiguration',
      'current',
      'rating', // Load rating affects current
      'quantity', // Number of items affects total current
      'circuitBreaker' // Indirectly related to circuit sizing
    ];
    
    // Check if any of the changed properties affect voltage drop
    return changes.changedProperties.some(prop => 
      voltageDropProperties.includes(prop)
    );
  }
  
  // Schedule a throttled recalculation
  private scheduleRecalculation(): void {
    if (this.throttleTimeout) {
      clearTimeout(this.throttleTimeout);
    }
    
    this.throttleTimeout = setTimeout(() => {
      this.performRecalculation();
    }, this.throttleDelay);
  }
  
  // Perform actual recalculation
  private async performRecalculation(): Promise<void> {
    if (this.isRecalculating || this.pendingRecalculations.size === 0) {
      return;
    }
    
    this.isRecalculating = true;
    
    try {
      // Get circuits to recalculate
      const circuitIds = [...this.pendingRecalculations];
      this.pendingRecalculations.clear();
      
      // Recalculate each circuit (implementation will depend on integration)
      await this.recalculateCircuits(circuitIds);
      
    } finally {
      this.isRecalculating = false;
      
      // If more recalculations were requested during processing, schedule again
      if (this.pendingRecalculations.size > 0) {
        this.scheduleRecalculation();
      }
    }
  }
  
  // Recalculate specific circuits (to be implemented with actual integration)
  private async recalculateCircuits(circuitIds: string[]): Promise<void> {
    // This implementation will depend on how the recalculation is integrated
    // with the load schedule and circuit details
    console.log(`Recalculating voltage drop for circuits: ${circuitIds.join(', ')}`);
    
    // Example implementation
    // const loadSchedule = getLoadSchedule();
    // for (const circuitId of circuitIds) {
    //   const loadItem = loadSchedule.loads.find(load => load.id === circuitId);
    //   if (loadItem) {
    //     const updatedLoadItem = await recalculateVoltageDropForLoadItem(loadItem);
    //     updateLoadItemInSchedule(updatedLoadItem);
    //   }
    // }
  }
  
  // Manually trigger recalculation for specific circuits
  public triggerRecalculation(circuitIds: string[]): void {
    circuitIds.forEach(id => this.pendingRecalculations.add(id));
    this.scheduleRecalculation();
  }
  
  // Manually trigger recalculation for the entire panel
  public triggerPanelRecalculation(panelId: string): void {
    // Implementation will depend on how panels and circuits are related
    console.log(`Triggering recalculation for entire panel: ${panelId}`);
    
    // Example implementation
    // const loadSchedule = getLoadSchedule(panelId);
    // const circuitIds = loadSchedule.loads.map(load => load.id);
    // this.triggerRecalculation(circuitIds);
  }
}

// Create singleton instance
export const voltageDropRecalculator = new VoltageDropRecalculator();
```

### Step 4: Integrate with Circuit Details Dialog
```tsx
// Modify CircuitDetailsDialog.tsx to trigger changes
const handleSaveCircuitDetails = (updatedLoadItem: LoadItem) => {
  // Track changes for properties that affect voltage drop
  if (loadItem) {
    // Compare properties that affect voltage drop
    if (loadItem.conductorLength !== updatedLoadItem.conductorLength) {
      circuitChangeTracker.trackChange(
        loadItem.id,
        'conductorLength',
        loadItem.conductorLength,
        updatedLoadItem.conductorLength
      );
    }
    
    if (loadItem.conductorSize !== updatedLoadItem.conductorSize) {
      circuitChangeTracker.trackChange(
        loadItem.id,
        'conductorSize',
        loadItem.conductorSize,
        updatedLoadItem.conductorSize
      );
    }
    
    // Track other relevant property changes...
  }
  
  // Original save implementation...
  onSave(updatedLoadItem);
  setCircuitDetailsDialogOpen(false);
  
  // Trigger recalculation for this circuit
  voltageDropRecalculator.triggerRecalculation([updatedLoadItem.id]);
};
```

### Step 5: Create a Recalculation Status Indicator
```tsx
// Add a RecalculationStatusIndicator component
interface RecalculationStatusIndicatorProps {
  isRecalculating: boolean;
  affectedCircuits: string[];
}

const RecalculationStatusIndicator: React.FC<RecalculationStatusIndicatorProps> = ({
  isRecalculating,
  affectedCircuits
}) => {
  if (!isRecalculating || affectedCircuits.length === 0) {
    return null;
  }
  
  return (
    <Box position="fixed" bottom={16} right={16} zIndex={1000}>
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
        <Box display="flex" alignItems="center">
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography variant="body2">
            Recalculating voltage drop for {affectedCircuits.length} circuit(s)...
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
```

### Step 6: Implement Auto-Recalculation Toggle
```tsx
// Add a toggle in settings to enable/disable automatic recalculation
const [autoRecalculate, setAutoRecalculate] = useState<boolean>(true);

// Add to Settings Panel
<FormControlLabel
  control={
    <Switch
      checked={autoRecalculate}
      onChange={(e) => setAutoRecalculate(e.target.checked)}
    />
  }
  label="Automatically recalculate voltage drop when circuit properties change"
/>

// Conditionally register change listeners
useEffect(() => {
  let unregisterListener: (() => void) | null = null;
  
  if (autoRecalculate) {
    // Register listener when auto-recalculate is enabled
    unregisterListener = circuitChangeTracker.addChangeListener(
      handleCircuitChange
    );
  }
  
  return () => {
    // Clean up listener when component unmounts or setting changes
    if (unregisterListener) {
      unregisterListener();
    }
  };
}, [autoRecalculate]);
```

## Integration with ScheduleOfLoadsCalculator

Add hooks to integrate the automatic recalculation system:

```tsx
// In ScheduleOfLoadsCalculator.tsx
import { circuitChangeTracker, voltageDropRecalculator } from '../utils/voltageDropRecalculation';

// Add state for recalculation status
const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
const [recalculatingCircuits, setRecalculatingCircuits] = useState<string[]>([]);

// Setup listener for recalculation events
useEffect(() => {
  // Listen for recalculation start/end events
  const handleRecalculationStart = (circuitIds: string[]) => {
    setIsRecalculating(true);
    setRecalculatingCircuits(circuitIds);
  };
  
  const handleRecalculationEnd = () => {
    setIsRecalculating(false);
    setRecalculatingCircuits([]);
  };
  
  // Register listeners
  voltageDropRecalculator.onRecalculationStart(handleRecalculationStart);
  voltageDropRecalculator.onRecalculationEnd(handleRecalculationEnd);
  
  // Clean up
  return () => {
    voltageDropRecalculator.offRecalculationStart(handleRecalculationStart);
    voltageDropRecalculator.offRecalculationEnd(handleRecalculationEnd);
  };
}, []);
```

## User Experience Considerations

1. **Performance Impact**
   - Implement throttling to prevent excessive calculations during rapid changes
   - Add option to disable automatic recalculation for large panels
   - Use Web Workers for long-running calculations to prevent UI blocking

2. **Visual Feedback**
   - Show subtle indicators when recalculation is in progress
   - Highlight circuits with pending recalculations
   - Provide clear completion notification

3. **User Control**
   - Allow users to enable/disable automatic recalculation
   - Provide options to prioritize certain circuits
   - Add manual override option

## Testing Strategy

1. **Unit Tests**
   - Test change detection logic
   - Test throttling mechanism
   - Test caching invalidation logic

2. **Integration Tests**
   - Verify that property changes trigger recalculation
   - Test full cycle from property change to updated results
   - Test with a variety of circuit configurations

3. **Performance Tests**
   - Test with large panel schedules (50+ circuits)
   - Measure impact of rapid changes on performance
   - Test memory usage during batch recalculations

## Success Criteria

1. Voltage drop results automatically update when relevant circuit properties change
2. Performance remains responsive even with large panel schedules
3. Users receive clear feedback about recalculation status
4. Caching effectively prevents redundant calculations
5. The system gracefully handles concurrent changes to multiple circuits 