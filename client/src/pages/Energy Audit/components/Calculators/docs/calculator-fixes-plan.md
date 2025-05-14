# Calculator Fixes Implementation Plan

This document outlines the technical implementation plan for fixing critical issues in the Energy Audit Platform's calculators.

## 1. Duplicate "Save Calculation" Buttons Fix

### Implementation Details
1. **Current State**: Two "Save Calculation" buttons exist - one in the panel summary toolbar and one in the bottom toolbar.
2. **Fix**: Remove the button from the bottom toolbar and enhance the one in the panel summary.
3. **Technical Changes**:
   - Remove button from the bottom toolbar in `ScheduleOfLoadsCalculator.tsx`
   - Add a descriptive tooltip to the remaining button
   - Ensure the button is properly visible and accessible

### Code Changes
```tsx
// Remove from bottom toolbar:
<Button
  variant="outlined"
  startIcon={<SaveIcon />}
  onClick={() => setSaveDialogOpen(true)}
  size="small"
>
  Save Calculation
</Button>

// Enhance remaining button:
<Tooltip title="Save current calculation with custom name">
  <Button
    variant="outlined"
    color="primary"
    startIcon={<SaveIcon />}
    onClick={() => setSaveDialogOpen(true)}
    size="small"
    sx={{ mr: 1 }}
  >
    Save Calculation
  </Button>
</Tooltip>
```

## 2. Canvas Reuse Errors Fix

### Implementation Details
1. **Current State**: Charts are being created without proper cleanup of previous instances, leading to "Canvas is already in use" errors.
2. **Fix**: Implement a ChartManager utility to handle the chart lifecycle and add React hooks for chart management.
3. **Technical Changes**:
   - Create a `chartManager.ts` utility to track and manage chart instances
   - Implement proper cleanup methods
   - Add React hooks for easy integration

### Code Example
```typescript
// chartManager.ts
class ChartManager {
  private instances: Map<string, Chart>;
  
  constructor() {
    this.instances = new Map();
  }
  
  create(canvasId: string, config: ChartConfiguration): Chart | null {
    this.destroy(canvasId); // Clean up existing chart
    // Create new chart...
    return chart;
  }
  
  destroy(canvasId: string): boolean {
    // Destroy chart and clean up...
  }
}

export const chartManager = new ChartManager();

// React hook for chart management
export function useChartEffect(
  createConfig: () => ChartConfiguration | null,
  canvasId: string,
  dependencies: React.DependencyList = []
): void {
  React.useEffect(() => {
    const config = createConfig();
    if (!config) return;
    
    const chart = chartManager.create(canvasId, config);
    
    // Return cleanup function
    return () => {
      chartManager.destroy(canvasId);
    };
  }, dependencies);
}
```

## 3. Data Persistence Implementation

### Implementation Details
1. **Current State**: Calculator states are lost when refreshing or navigating away.
2. **Fix**: Implement localStorage-based persistence with auto-save functionality.
3. **Technical Changes**:
   - Create a `calculatorStateStorage.ts` utility for managing persistence
   - Implement auto-save with throttling to prevent performance issues
   - Add draft recovery mechanism
   - Create a recovery dialog component

### Code Structure
```typescript
// calculatorStateStorage.ts
export class CalculatorStateStorage<T> {
  private storageKey: string;
  private throttleMs: number;
  private throttleTimer: NodeJS.Timeout | null = null;
  
  constructor(calculatorType: string, throttleMs = 2000) {
    this.storageKey = `energy-audit-${calculatorType}-state`;
    this.throttleMs = throttleMs;
  }
  
  saveState(state: T): void {
    // Throttled save implementation
  }
  
  loadState(): T | null {
    // Load state from localStorage
  }
  
  clearState(): void {
    // Clear saved state
  }
  
  hasSavedState(): boolean {
    // Check if state exists
  }
}

// React hook for auto-save
export function useAutoSave<T>(
  state: T,
  calculatorType: string,
  throttleMs = 2000
): CalculatorStateStorage<T> {
  const storage = React.useMemo(
    () => new CalculatorStateStorage<T>(calculatorType, throttleMs),
    [calculatorType, throttleMs]
  );
  
  React.useEffect(() => {
    storage.saveState(state);
  }, [state, storage]);
  
  return storage;
}
```

## 4. Energy Calculator Fixes

### Implementation Details
1. **Current State**: Energy calculators have non-functional features and calculation errors.
2. **Fix**: Refactor calculation logic and add proper validation.
3. **Technical Changes**:
   - Review and fix calculation formulas
   - Add input validation with clear error messages
   - Implement unit tests for calculation functions
   - Add comprehensive error handling

### Validation Example
```typescript
function validateEnergyInput(input: EnergyInput): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!input.powerRating || input.powerRating <= 0) {
    errors.powerRating = 'Power rating must be greater than 0';
  }
  
  if (!input.hoursPerDay || input.hoursPerDay <= 0 || input.hoursPerDay > 24) {
    errors.hoursPerDay = 'Hours per day must be between 1 and 24';
  }
  
  // More validations...
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
```

## 5. Standardization of Calculator Interfaces

### Implementation Details
1. **Current State**: Inconsistent interfaces across different calculators.
2. **Fix**: Implement standardized components and layouts.
3. **Technical Changes**:
   - Create reusable calculator layout components
   - Standardize button placement and styling
   - Implement consistent form layouts
   - Create reusable dialog components

### Component Structure
```tsx
// StandardCalculatorLayout.tsx
interface StandardCalculatorLayoutProps {
  title: string;
  onSave: () => void;
  onCalculate: () => void;
  onExport?: () => void;
  isCalculating?: boolean;
  hasResults?: boolean;
  children: React.ReactNode;
}

const StandardCalculatorLayout: React.FC<StandardCalculatorLayoutProps> = ({
  title,
  onSave,
  onCalculate,
  onExport,
  isCalculating = false,
  hasResults = false,
  children
}) => {
  return (
    <Paper>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">{title}</Typography>
          <Box>
            {/* Standardized button layout */}
          </Box>
        </Box>
        
        {children}
        
        <Box mt={3} display="flex" justifyContent="space-between">
          {/* Standardized footer actions */}
        </Box>
      </Box>
    </Paper>
  );
};
```

## Implementation Timeline

### Phase 1: Critical Fixes (1-2 weeks)
- [x] Fix duplicate "Save Calculation" buttons
- [x] Implement ChartManager for Canvas reuse errors
- [ ] Create data persistence framework
- [ ] Fix critical calculation errors in Energy Calculator

### Phase 2: Standardization (2-3 weeks)
- [ ] Create standardized UI components
- [ ] Implement consistent form validation
- [ ] Create reusable dialog components
- [ ] Standardize calculator layouts

### Phase 3: Enhancements (3-4 weeks)
- [ ] Implement auto-save functionality
- [ ] Create comprehensive documentation
- [ ] Add advanced features like batch processing
- [ ] Implement cross-calculator integration 