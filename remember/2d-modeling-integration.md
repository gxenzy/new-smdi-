# 2D Interactive Modeling Integration

This document outlines the implementation approach for integrating 2D interactive modeling capabilities with AutoCAD files into the energy audit platform.

## 1. Overview

The 2D interactive modeling component will enable users to visualize building layouts, map equipment locations, analyze illumination levels, and evaluate power distribution systems through an intuitive web interface. This integration bridges the gap between traditional CAD drawings and energy audit data, providing contextual visualization of findings and recommendations.

## 2. Core Features

### 2.1 AutoCAD File Import

#### Technical Implementation
- **File Format Support**: 
  - DWG (native AutoCAD format)
  - DXF (Drawing Exchange Format)
  - SVG (for simplified layouts)
  
- **Parsing Libraries**:
  - [AutoCAD.js](https://github.com/ognjen-petrovic/js-autocad) for DXF parsing
  - Custom converter for DWG to web-compatible format
  - SVG.js for rendering vector graphics

- **Implementation Approach**:
  ```javascript
  // Example parsing implementation
  async function parseAutoCADFile(file) {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (fileExtension === 'dxf') {
      return await parseDXFFile(file);
    } else if (fileExtension === 'dwg') {
      // Convert DWG to DXF first using server-side processing
      const dxfFile = await convertDWGtoDXF(file);
      return await parseDXFFile(dxfFile);
    } else if (fileExtension === 'svg') {
      return await parseSVGFile(file);
    }
    
    throw new Error('Unsupported file format');
  }
  ```

#### Layer Management
- **Layer Filtering**: Enable selective display of layers (electrical, architectural, mechanical)
- **Layer Grouping**: Logical grouping of related layers
- **Custom Layer Creation**: Allow users to create annotation layers for audit findings

#### Coordinate System
- **Scale Management**: Automatic detection and adjustment of drawing scale
- **Unit Conversion**: Support for different measurement units (metric/imperial)
- **Reference Point Setting**: Establish origin and orientation for measurements

### 2.2 Interactive Visualization

#### Canvas Implementation
- **Rendering Technology**: 
  - Canvas-based rendering for performance with large drawings
  - WebGL acceleration for complex visualizations
  - SVG for interactive elements and annotations

- **User Interactions**:
  - Pan/Zoom controls with mouse and touch support
  - Selection of elements for detailed information
  - Measurement tools for distances and areas
  - Layer visibility toggles

- **Implementation Approach**:
  ```javascript
  // Example visualization component
  function FloorplanViewer({ drawingData, options }) {
    const canvasRef = useRef(null);
    const [viewState, setViewState] = useState({
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      activeLayers: options.defaultLayers || []
    });
    
    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Set up the canvas
      setupCanvas(canvas, ctx);
      
      // Render the drawing with current view state
      renderDrawing(ctx, drawingData, viewState);
      
      // Set up event listeners
      setupEventListeners(canvas, viewState, setViewState);
      
      return () => {
        // Clean up event listeners
        cleanupEventListeners(canvas);
      };
    }, [drawingData, viewState]);
    
    return (
      <div className="floorplan-viewer-container">
        <canvas ref={canvasRef} className="floorplan-canvas" />
        <LayerControls 
          layers={drawingData.layers} 
          activeLayers={viewState.activeLayers}
          onLayerToggle={(layer) => toggleLayer(layer, viewState, setViewState)}
        />
        <ViewControls 
          viewState={viewState}
          onZoomIn={() => zoomIn(viewState, setViewState)}
          onZoomOut={() => zoomOut(viewState, setViewState)}
          onResetView={() => resetView(setViewState)}
        />
      </div>
    );
  }
  ```

#### Performance Optimization
- **Drawing Simplification**: Automatic simplification of complex geometries for web rendering
- **Progressive Loading**: Load details progressively based on zoom level
- **Caching**: Cache rendered views for rapid navigation
- **Worker Threads**: Use Web Workers for processing complex calculations

### 2.3 Equipment Mapping

#### Tagging System
- **Equipment Symbols**: Standard symbols for electrical equipment (panels, fixtures, outlets)
- **Custom Markers**: User-defined markers for audit findings
- **QR Code Integration**: Link physical equipment to digital records via QR codes

#### Data Association
- **Equipment Database**: Link CAD elements to equipment database records
- **Attribute Display**: Show equipment specifications on hover/click
- **Historical Data**: Access to maintenance history and previous audit findings

#### Implementation Example
```javascript
// Equipment tagging implementation
function tagEquipment(drawingId, position, equipmentData) {
  return {
    type: 'ADD_EQUIPMENT_TAG',
    payload: {
      drawingId,
      tagId: generateUniqueId(),
      position: { x: position.x, y: position.y },
      equipmentType: equipmentData.type,
      equipmentId: equipmentData.id,
      properties: equipmentData.properties,
      createdAt: new Date().toISOString(),
      createdBy: getCurrentUser().id
    }
  };
}

// QR code generation
function generateEquipmentQRCode(equipmentId, tagId) {
  const data = JSON.stringify({
    e: equipmentId,
    t: tagId,
    u: `${window.location.origin}/equipment/${equipmentId}`
  });
  
  return QRCode.toDataURL(data, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 128
  });
}
```

## 3. Lighting Analysis Integration

### 3.1 Illumination Visualization

#### Heat Map Generation
- **Calculation Grid**: Generate a grid of calculation points across the floor plan
- **Illumination Calculation**: Apply lighting calculation formulas at each grid point
- **Color Mapping**: Visualize illumination levels with color gradients
- **Standards Overlay**: Show minimum required illumination levels by space type

#### Implementation Approach
```javascript
// Illumination calculation grid
function generateCalculationGrid(floorplan, gridSpacing) {
  const grid = [];
  const bounds = calculateBounds(floorplan);
  
  for (let x = bounds.minX; x <= bounds.maxX; x += gridSpacing) {
    for (let y = bounds.minY; y <= bounds.maxY; y += gridSpacing) {
      // Check if point is within a room/space
      if (isPointInAnySpace(floorplan, x, y)) {
        grid.push({ x, y });
      }
    }
  }
  
  return grid;
}

// Calculate illumination at each point
function calculateIlluminationLevels(grid, fixtures, reflectances) {
  return grid.map(point => {
    let totalIllumination = 0;
    
    // Calculate contribution from each fixture
    fixtures.forEach(fixture => {
      const contribution = calculateFixtureContribution(
        fixture,
        point,
        reflectances
      );
      totalIllumination += contribution;
    });
    
    return {
      ...point,
      illumination: totalIllumination
    };
  });
}

// Render heat map
function renderIlluminationHeatMap(ctx, illuminationData, colorScale) {
  // Clear canvas or prepare overlay
  
  // For each point, render a colored dot based on illumination level
  illuminationData.forEach(point => {
    const color = colorScale(point.illumination);
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
    ctx.fill();
  });
}
```

### 3.2 Fixture Placement and Analysis

#### Interactive Fixture Placement
- **Fixture Library**: Catalog of lighting fixtures with photometric data
- **Drag-and-Drop Interface**: Place fixtures on the floor plan
- **Parameter Adjustment**: Modify fixture height, orientation, and output
- **Real-time Calculation**: Update illumination visualization as fixtures are adjusted

#### Optimization Tools
- **Automatic Placement**: Algorithm to suggest optimal fixture placement
- **Energy Efficiency Analysis**: Compare different fixture arrangements for efficiency
- **Uniformity Calculation**: Evaluate lighting uniformity across spaces

## 4. Power Distribution Visualization

### 4.1 Circuit Mapping

#### Panel Schedule Integration
- **Panel Representation**: Visual representation of panel boards on floor plan
- **Circuit Tracing**: Highlight connected loads for selected circuits
- **Load Balancing**: Visualize phase balancing across panels

#### Implementation Example
```javascript
// Circuit tracing implementation
function traceCircuit(panelId, circuitNumber, drawingData) {
  // Find the panel in the drawing
  const panel = findElementById(drawingData, panelId);
  
  // Find all connected loads for this circuit
  const connectedLoads = drawingData.elements.filter(element => 
    element.type === 'load' && 
    element.circuitData && 
    element.circuitData.panelId === panelId &&
    element.circuitData.circuitNumber === circuitNumber
  );
  
  // Find all wiring connected to this circuit
  const connectedWiring = drawingData.elements.filter(element =>
    element.type === 'wiring' &&
    element.circuitData &&
    element.circuitData.panelId === panelId &&
    element.circuitData.circuitNumber === circuitNumber
  );
  
  return {
    panel,
    connectedLoads,
    connectedWiring
  };
}
```

### 4.2 Load Analysis Visualization

#### Load Density Visualization
- **Heat Maps**: Visualize power density across different areas
- **Critical Areas**: Highlight areas with high load concentration
- **Time-based Visualization**: Show load patterns throughout the day

#### Implementation Approach
```javascript
// Load density calculation
function calculateLoadDensity(floorplan, equipment) {
  const grid = generateCalculationGrid(floorplan, 0.5); // 0.5m grid
  
  return grid.map(point => {
    let totalLoad = 0;
    
    // Calculate load contribution at this point
    equipment.forEach(item => {
      if (item.power) {
        // Calculate influence based on distance
        const distance = calculateDistance(point, item.position);
        const influence = calculateLoadInfluence(item.power, distance);
        totalLoad += influence;
      }
    });
    
    return {
      ...point,
      loadDensity: totalLoad
    };
  });
}
```

## 5. Integration with Calculation Modules

### 5.1 Bidirectional Data Flow

#### From Drawing to Calculations
- **Space Information**: Extract room dimensions for lighting calculations
- **Equipment Locations**: Use equipment data for load calculations
- **Measurement Tools**: Direct input of measured distances into calculators

#### From Calculations to Drawing
- **Results Visualization**: Display calculation results directly on the floor plan
- **Recommendation Markers**: Place improvement recommendations at relevant locations
- **Compliance Indicators**: Visual indicators for code compliance issues

### 5.2 Implementation Architecture

```
┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │
│  2D Modeling    │◄────►│  Calculation    │
│  Component      │      │  Modules        │
│                 │      │                 │
└────────┬────────┘      └────────┬────────┘
         │                        │
         │                        │
         ▼                        ▼
┌─────────────────────────────────────────┐
│                                         │
│           Shared Data Store             │
│                                         │
└─────────────────────────────────────────┘
```

#### Data Exchange Format
```javascript
// Example shared data structure
const sharedProjectData = {
  // Building information
  building: {
    name: "School Building A",
    location: {
      latitude: 14.5995,
      longitude: 120.9842
    },
    floors: [
      {
        id: "floor-1",
        name: "First Floor",
        elevation: 0,
        drawingId: "drawing-floor1"
      }
      // ...more floors
    ]
  },
  
  // Drawings data
  drawings: {
    "drawing-floor1": {
      id: "drawing-floor1",
      type: "floorplan",
      fileName: "first-floor.dxf",
      processedData: {/* Processed CAD data */},
      spaces: [
        {
          id: "space-101",
          name: "Classroom 101",
          type: "classroom",
          area: 64, // m²
          boundaries: [/* Coordinate points */],
          requiredIllumination: 300 // lux
        }
        // ...more spaces
      ]
    }
  },
  
  // Equipment data
  equipment: {
    "equip-light-101": {
      id: "equip-light-101",
      type: "lighting-fixture",
      model: "LED Panel 2x4",
      power: 45, // watts
      lumens: 4500,
      position: {
        drawingId: "drawing-floor1",
        x: 120.5,
        y: 85.2,
        z: 2.8
      }
    }
    // ...more equipment
  },
  
  // Calculation results
  calculationResults: {
    "calc-illum-room101": {
      id: "calc-illum-room101",
      type: "illumination",
      spaceId: "space-101",
      averageIllumination: 325, // lux
      uniformityRatio: 0.7,
      complianceStatus: "compliant",
      gridPoints: [/* Calculation grid with results */]
    },
    "calc-load-panel-a": {
      id: "calc-load-panel-a",
      type: "load-analysis",
      panelId: "panel-a",
      connectedLoad: 12.5, // kVA
      demandLoad: 10.2, // kVA
      powerFactor: 0.92
    }
    // ...more calculation results
  }
};
```

## 6. Technical Implementation

### 6.1 Technology Stack

#### Frontend Technologies
- **Rendering Engine**: Three.js or Fabric.js for 2D rendering
- **State Management**: Redux for application state
- **UI Framework**: React components for controls and interfaces
- **Data Processing**: Web Workers for heavy calculations

#### Backend Support
- **File Conversion**: Server-side processing for DWG to DXF/SVG conversion
- **Data Storage**: Efficient storage of processed CAD data
- **Authentication**: Secure access to building drawings

### 6.2 Development Phases

#### Phase 1: Basic Viewing Capabilities
- File import and basic rendering
- Pan/zoom navigation
- Layer management
- Basic measurements

#### Phase 2: Interactive Elements
- Equipment tagging system
- QR code integration
- Annotation capabilities
- Data association with equipment

#### Phase 3: Analysis Visualization
- Illumination heat maps
- Circuit tracing
- Load density visualization
- Integration with calculation modules

#### Phase 4: Advanced Features
- Optimization tools
- Automatic recommendations
- Reporting integration
- Mobile support for field use

### 6.3 Performance Considerations

- **Drawing Simplification**: Simplify complex geometries for web rendering
- **Lazy Loading**: Load only visible portions of large drawings
- **Level of Detail**: Adjust detail based on zoom level
- **Caching**: Cache processed drawings for quick access
- **Offline Support**: Enable basic functionality without internet connection

## 7. User Experience Design

### 7.1 Interface Components

#### Main Viewer
- Central canvas for drawing display
- Toolbar with common actions
- Status bar with coordinates and scale information

#### Control Panels
- Layer management panel
- Properties panel for selected elements
- Calculation results panel
- Equipment database browser

#### Tool Palettes
- Navigation tools (pan, zoom, rotate)
- Measurement tools (distance, area, angle)
- Annotation tools (text, markers, highlights)
- Analysis tools (illumination, load, circuits)

### 7.2 Workflow Integration

#### Audit Process Support
- Guided workflow for systematic auditing
- Checklist integration with spatial context
- Finding documentation with location references
- Before/after comparison views

#### Reporting Integration
- Screenshot capture for reports
- Automatic floor plan inclusion in reports
- Visual highlighting of findings
- Export options for presentations

## 8. Implementation Roadmap

### 8.1 Sprint 1: Foundation (2 weeks)
- Set up basic viewer component
- Implement DXF parsing
- Create basic navigation controls
- Develop layer management system

### 8.2 Sprint 2: Interactive Elements (2 weeks)
- Add selection and measurement tools
- Implement equipment tagging system
- Create data association mechanism
- Develop annotation capabilities

### 8.3 Sprint 3: Analysis Integration (3 weeks)
- Implement illumination calculation grid
- Create heat map visualization
- Develop circuit tracing functionality
- Integrate with calculation modules

### 8.4 Sprint 4: Advanced Features (3 weeks)
- Add fixture placement tools
- Implement load density visualization
- Create optimization algorithms
- Develop reporting integration

### 8.5 Sprint 5: Testing & Refinement (2 weeks)
- Performance optimization
- Cross-browser testing
- Mobile responsiveness
- User acceptance testing 