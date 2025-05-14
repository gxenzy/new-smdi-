# Batch Analysis Implementation Plan

## Overview

The batch analysis feature will allow users to automatically analyze all circuits in a panel (or multiple panels) for voltage drop issues. This will provide a comprehensive view of the electrical system's health and identify potential compliance issues according to PEC 2017 standards.

## Current Status (60% Complete)

- [x] UI components for batch analysis created
- [x] Progress tracking and visualization implemented
- [x] Integration with Circuit Insights Dashboard
- [x] Mock implementation with simulated progress
- [ ] Actual batch calculation engine
- [ ] Results aggregation and display
- [ ] Optimization recommendations

## Detailed Implementation Steps

### 1. Batch Calculation Engine (Priority: High)

```typescript
// Implementation in enhancedVoltageDropUtils.ts

export interface BatchAnalysisOptions {
  includeAllCircuits: boolean;
  includeBranchCircuits: boolean;
  includeFeederCircuits: boolean;
  applyTemperatureDerating: boolean;
  includeHarmonicFactors: boolean;
  parallelConductorAdjustment: boolean;
}

export interface BatchAnalysisProgress {
  totalCircuits: number;
  completedCircuits: number;
  currentCircuitId: string;
  currentCircuitName: string;
  processingStage: 'preparing' | 'analyzing' | 'finalizing';
  percentComplete: number;
}

export interface BatchAnalysisResults {
  analyzedCircuits: {
    [circuitId: string]: {
      inputs: EnhancedVoltageDropInputs;
      results: EnhancedVoltageDropResults;
    }
  };
  summary: {
    totalCircuits: number;
    compliantCircuits: number;
    nonCompliantCircuits: number;
    criticalCircuits: number;
    averageVoltageDrop: number;
    maxVoltageDrop: number;
  };
  optimizationOpportunities: OptimizationOpportunity[];
}

/**
 * Performs batch analysis of all circuits in a panel
 */
export async function performBatchAnalysis(
  loadSchedule: LoadSchedule,
  options: BatchAnalysisOptions,
  progressCallback: (progress: BatchAnalysisProgress) => void
): Promise<BatchAnalysisResults> {
  // Implementation steps:
  // 1. Filter circuits based on options
  // 2. Initialize progress tracking
  // 3. Process each circuit with throttling to prevent UI freezing
  // 4. Aggregate results
  // 5. Generate optimization recommendations
}
```

### 2. Integration with CircuitInsightsDashboardDialog

This involves updating the onBatchAnalysis prop to call the actual implementation:

```typescript
// In CircuitInsightsDashboardDialog.tsx

const handleAnalyzeAllCircuits = async () => {
  // ...existing setup code...
  
  try {
    const targetPanel = loadSchedules.find(panel => panel.id === selectedPanelId);
    if (!targetPanel) throw new Error("Selected panel not found");
    
    setActivePanel(targetPanel.panelName);
    
    const options: BatchAnalysisOptions = {
      includeAllCircuits: true,
      includeBranchCircuits: true,
      includeFeederCircuits: true,
      applyTemperatureDerating: true,
      includeHarmonicFactors: true,
      parallelConductorAdjustment: true
    };
    
    // Call the actual batch analysis implementation
    const results = await performBatchAnalysis(
      targetPanel,
      options,
      (progress) => {
        setBatchProgress(progress.percentComplete);
      }
    );
    
    // Update dashboard with results
    updateCircuitSummary(results.summary);
    
    setSnackbarMessage(`Successfully analyzed all circuits in ${targetPanel.panelName}`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  } catch (error) {
    // ...error handling...
  }
};
```

### 3. Results Processing and Visualization

After the batch analysis completes, we need to update the dashboard visualizations:

```typescript
// In CircuitInsightsDashboard.tsx

// Add new state for batch results
const [batchAnalysisResults, setBatchAnalysisResults] = useState<BatchAnalysisResults | null>(null);

// Add method to update the dashboard with batch results
const updateFromBatchResults = (results: BatchAnalysisResults) => {
  setCircuitAnalysisSummary({
    totalCircuits: results.summary.totalCircuits,
    compliantCircuits: results.summary.compliantCircuits,
    nonCompliantCircuits: results.summary.nonCompliantCircuits,
    highestVoltageDrop: {
      value: results.summary.maxVoltageDrop,
      circuitId: findCircuitWithMaxVD(results),
      circuitName: findCircuitNameWithMaxVD(results),
      panelId: panelId
    },
    averageVoltageDrop: results.summary.averageVoltageDrop,
    criticalCircuits: results.optimizationOpportunities.map(op => ({
      id: op.circuitId,
      name: op.circuitName,
      panelId: op.panelId,
      panelName: op.panelName,
      voltageDrop: op.voltageDrop.current,
      conductorSize: op.currentSize,
      optimalSize: op.recommendedSize
    }))
  });
  
  setBatchAnalysisResults(results);
  createVoltageDropChart();
  createComplianceChart();
}
```

### 4. Performance Optimization for Large Panels

To handle large panels with many circuits:

1. Implement a throttling mechanism in the batch calculation engine to prevent UI freezing:

```typescript
/**
 * Process circuits with throttling to prevent UI freezing
 */
function processCircuitsWithThrottling(
  circuits: CircuitData[],
  processFn: (circuit: CircuitData) => Promise<any>,
  progressCallback: (progress: BatchAnalysisProgress) => void
): Promise<any[]> {
  return new Promise((resolve) => {
    const results: any[] = [];
    let index = 0;
    
    const process = async () => {
      if (index >= circuits.length) {
        resolve(results);
        return;
      }
      
      const circuit = circuits[index];
      const result = await processFn(circuit);
      results.push(result);
      
      progressCallback({
        totalCircuits: circuits.length,
        completedCircuits: index + 1,
        currentCircuitId: circuit.id,
        currentCircuitName: circuit.name,
        processingStage: 'analyzing',
        percentComplete: ((index + 1) / circuits.length) * 100
      });
      
      index++;
      
      // Use setTimeout to give the UI a chance to update
      setTimeout(process, 0);
    };
    
    process();
  });
}
```

2. Implement circuit batching for very large panels:

```typescript
/**
 * Split circuits into batches for processing
 */
function batchCircuits(circuits: CircuitData[], batchSize: number): CircuitData[][] {
  const batches: CircuitData[][] = [];
  for (let i = 0; i < circuits.length; i += batchSize) {
    batches.push(circuits.slice(i, i + batchSize));
  }
  return batches;
}
```

## Integration Testing

To ensure the batch analysis feature works correctly:

1. Create test cases with different panel configurations
2. Verify results against manual calculations
3. Test performance with large panels (100+ circuits)
4. Validate PEC 2017 compliance results

## Timeline

1. **Week 1**
   - Implement the core batch calculation engine
   - Create the basic results aggregation

2. **Week 2**
   - Integrate with CircuitInsightsDashboardDialog
   - Implement performance optimizations
   - Create visualization updates

3. **Week 3**
   - Implement optimization recommendations
   - Create detailed PDF reports for batch analysis
   - Complete testing and validation

## Success Criteria

1. Batch analysis should complete for a panel with 50+ circuits in under 10 seconds
2. UI should remain responsive during analysis
3. Results should accurately identify all voltage drop issues
4. Recommendations should provide actionable insights
5. PDF export should produce comprehensive reports 