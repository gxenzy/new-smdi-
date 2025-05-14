# Batch Calculation Feature

## Overview

The batch calculation feature allows users to run multiple calculations with different input parameters in parallel, making it easier to compare results and identify optimal solutions. This feature is particularly useful for analyzing different scenarios and determining the best approach for energy efficiency improvements.

## Implementation

The batch calculation feature has been implemented in the Harmonic Distortion Calculator and will be extended to other calculators. The implementation includes:

1. **Scenario Management**: Users can add current calculator configurations as scenarios to a batch processing list.
2. **Batch Processing**: All scenarios can be processed at once, with results stored for each scenario.
3. **Comparison View**: A dedicated dialog displays side-by-side comparison of results from all scenarios.
4. **Bulk Save**: All batch calculation results can be saved at once.

## Usage Guide

### Adding Scenarios to Batch

1. Configure the calculator with the desired parameters.
2. Click the "Add to Batch Scenarios" button to add the current configuration as a scenario.
3. Repeat steps 1-2 to add multiple scenarios with different parameters.

### Processing and Comparing Batch Scenarios

1. After adding scenarios, the batch panel will display with a list of all added scenarios.
2. Click "Process All" to calculate results for all scenarios at once.
3. After processing, click "Compare Results" to view a side-by-side comparison of all results.
4. Use the comparison view to analyze differences between scenarios and identify the optimal solution.

### Managing Batch Scenarios

- **Rename**: Click on the scenario name to edit it.
- **Load**: Click the load icon to load a scenario back into the calculator for modification.
- **Remove**: Click the delete icon to remove a scenario from the batch list.
- **Save All**: Click the "Save All Results" button to save all processed scenarios to the saved calculations storage.

## Technical Details

The batch calculation implementation uses React state management to track scenarios and their results. Calculations are performed asynchronously to prevent UI blocking during processing of multiple scenarios.

### Key Components

- `BatchScenario` interface: Defines the structure for batch scenarios, including inputs and results.
- State management: Uses `useState` hooks for tracking scenarios, processing state, and UI state.
- `calculateHarmonicDistortionFromInputs`: A pure function that calculates results from a given input set.
- `BatchComparisonDialog`: A modal component for displaying comparative results.

## Future Enhancements

Planned enhancements for the batch calculation feature include:

1. Extending the feature to all calculator types.
2. Adding export capabilities for batch results to CSV and Excel formats.
3. Implementing advanced filtering and sorting in the comparison view.
4. Adding visualization tools for comparing results graphically.
5. Implementing result difference highlighting to quickly identify key variations between scenarios.

## Standards Compliance

The batch calculation feature adheres to IEEE 519-2014 standards for harmonic distortion calculations, ensuring that all processed scenarios are evaluated against appropriate compliance criteria. 