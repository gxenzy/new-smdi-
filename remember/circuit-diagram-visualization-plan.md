# Circuit Diagram Visualization Implementation Plan

## Overview

The Circuit Diagram Visualization is the next component to be implemented in our voltage drop visualization enhancement. This component will provide a visual representation of an electrical circuit with voltage drop indicators at key points, enabling users to visualize how voltage drop affects different parts of their electrical system.

## Key Features

1. **Basic Circuit Schematic Representation**
   - Render a schematic view of electrical circuits based on circuit data
   - Support for different circuit types (branch, feeder, service, motor)
   - Visualization of key components (source, conductors, loads)
   - Dynamic scaling based on circuit complexity and available space

2. **Color-coded Voltage Indicators**
   - Display voltage levels at key points in the circuit
   - Color-code voltage levels based on compliance status
   - Highlight critical points where voltage drop is most significant
   - Visual indicators for voltage gradient along conductors

3. **Animated Current Flow and Voltage Drop**
   - Animate current flow through the circuit
   - Visualize voltage drop propagation in real-time
   - Speed controls for animation
   - Pause/play functionality for detailed inspection

4. **Interactive Component Inspection**
   - Detailed tooltips for circuit components
   - Component-specific information on hover
   - Click interaction to select components for detailed view
   - Highlight related components when one is selected

5. **Critical Area Highlighting**
   - Automatic identification of areas with significant voltage drop
   - Visual emphasis on problematic sections
   - Recommendation indicators for critical areas
   - Integration with optimization suggestions

## Technical Architecture

### 1. Circuit Diagram Component

```typescript
export interface CircuitDiagramProps {
  circuitData: UnifiedCircuitData;
  voltageDropResult: VoltageDropCalculationResult;
  highlightMode?: 'voltage' | 'current' | 'power';
  showAnimation?: boolean;
  animationSpeed?: number;
  showLabels?: boolean;
  interactive?: boolean;
  onComponentClick?: (componentId: string) => void;
}

export interface CircuitComponent {
  id: string;
  type: 'source' | 'conductor' | 'load' | 'junction' | 'device';
  position: { x: number; y: number };
  size: { width: number; height: number };
  properties: Record<string, any>;
  voltage?: number;
  current?: number;
  powerLoss?: number;
  isCompliant?: boolean;
}

export interface CircuitDiagramData {
  components: CircuitComponent[];
  connections: {
    from: string;
    to: string;
    path?: { x: number; y: number }[];
  }[];
}
```

### 2. Diagram Generation Utilities

```typescript
/**
 * Generate a circuit diagram representation from circuit data
 */
export function generateCircuitDiagram(
  circuitData: UnifiedCircuitData,
  voltageDropResult: VoltageDropCalculationResult
): CircuitDiagramData {
  // Convert circuit data to diagram representation
  // Calculate component positions
  // Determine connections between components
  // Calculate voltage at each point
  // Return structured diagram data
}

/**
 * Calculate voltage at specific points in the circuit
 */
export function calculateVoltageAtPoints(
  circuitData: UnifiedCircuitData,
  voltageDropResult: VoltageDropCalculationResult,
  numberOfPoints: number
): { distance: number; voltage: number; isCompliant: boolean }[] {
  // Similar to voltage profile calculation but focused on discrete components
}
```

### 3. Animation and Interaction Utilities

```typescript
/**
 * Generate animation frames for current flow
 */
export function generateCurrentFlowAnimation(
  circuitDiagramData: CircuitDiagramData,
  framesPerSecond: number = 30,
  duration: number = 3
): CircuitDiagramData[] {
  // Create animation frames showing current flow
  // Return array of diagram data for each frame
}

/**
 * Find components by type or property
 */
export function findComponents(
  circuitDiagramData: CircuitDiagramData,
  criteria: { type?: string; propertyName?: string; propertyValue?: any }
): CircuitComponent[] {
  // Search for components matching criteria
  // Return filtered components
}
```

## Implementation Steps

### Phase 1: Basic Circuit Diagram Component (3 days)

1. Create CircuitDiagramComponent with SVG rendering
2. Implement basic component rendering (source, conductors, load)
3. Add layout algorithm for component positioning
4. Create styles for different component types
5. Add integration with circuit data

### Phase 2: Voltage Visualization (2 days)

1. Implement voltage calculation at specific points
2. Add color-coding based on voltage levels
3. Create voltage gradient visualization along conductors
4. Add reference voltages and compliance indicators
5. Implement tooltips showing voltage information

### Phase 3: Animation and Interaction (2-3 days)

1. Create animation framework for current flow visualization
2. Implement play/pause and speed controls
3. Add interaction handlers for component selection
4. Create detailed component information display
5. Add zoom and pan capabilities for complex circuits

### Phase 4: Integration and Optimization (1-2 days)

1. Integrate with EnhancedVoltageDropAnalysisDialog
2. Add circuit diagram tab in the interface
3. Create controls for different visualization modes
4. Optimize rendering performance for complex circuits
5. Add responsive scaling for different screen sizes

## UI Design

The circuit diagram will use a clean, technical aesthetic with:

1. **Component Representation**
   - Source: Square or circle at left side
   - Conductors: Lines with width proportional to size
   - Loads: Rectangles or appropriate symbols
   - Junctions: Small circles
   - Devices: Symbols based on device type

2. **Color Scheme**
   - Compliant voltage: Green gradient
   - Non-compliant voltage: Red gradient
   - Current flow: Blue animated dots
   - Power loss: Orange/yellow highlights
   - Components: Neutral colors with good contrast
   - Selected components: Highlighted with accent color

3. **Layout**
   - Left-to-right flow (source to load)
   - Clear spacing between components
   - Minimalist design with focus on data visualization
   - Proper labeling of key elements

## Technical Considerations

1. **Performance Optimization**
   - Use React.memo for component memoization
   - Implement virtual rendering for complex circuits
   - Optimize SVG rendering with appropriate grouping
   - Use requestAnimationFrame for smooth animations

2. **Responsive Design**
   - Implement dynamic scaling based on container size
   - Create simplified view for smaller screens
   - Use relative positioning for component layout
   - Add touch interaction for mobile devices

3. **Accessibility**
   - Add keyboard navigation support
   - Implement ARIA attributes for screen readers
   - Create high-contrast mode for better visibility
   - Add text alternatives for visual information

## Integration Points

1. **EnhancedVoltageDropAnalysisDialog**
   - Add circuit diagram tab
   - Create controls for visualization options
   - Implement consistent data flow with other components
   - Ensure proper resizing within dialog container

2. **BatchVoltageDropAnalysisDialog**
   - Add circuit diagram preview in results section
   - Create comparison view for multiple circuits
   - Implement filtering for circuit diagrams
   - Add export functionality for diagram images

## Testing and Validation

1. **Unit Tests**
   - Test circuit diagram generation algorithm
   - Verify voltage calculation at specific points
   - Test component positioning logic
   - Validate animation frame generation

2. **Integration Tests**
   - Test integration with EnhancedVoltageDropAnalysisDialog
   - Verify data flow between components
   - Test interaction with other visualization components
   - Validate rendering with different circuit types

3. **User Testing**
   - Verify intuitive understanding of visualization
   - Test interaction on different devices
   - Validate animation effectiveness
   - Ensure clarity of information presentation

## Conclusion

The Circuit Diagram Visualization will provide users with an intuitive visual representation of their electrical circuits, highlighting voltage drop at different points and enabling them to better understand the impact of their design decisions. This component, combined with the already implemented VoltageProfileChart and ConductorComparisonChart, will create a comprehensive visualization toolkit for voltage drop analysis. 