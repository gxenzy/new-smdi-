# Energy Audit Platform - Calculator Template Standardization

## Overview
This document outlines the standard components and structure that should be implemented across all calculators in the Energy Audit Platform to ensure consistency, user-friendliness, and comprehensive documentation.

## Standard Calculator Components

### 1. Calculator Header
- **Title and Description**
  - Clear, descriptive title
  - 1-2 sentence description of calculator purpose
  - Reference to applicable regulatory standards (e.g., "Based on PEC 2017 Section XX")
  
- **Action Buttons**
  - Quick Start Guide button with `<HelpOutlineIcon />`
  - Info Panel button with `<InfoIcon />`
  - Consistent placement in top-right corner

### 2. Quick Start Guide Dialog
- **Purpose**: Step-by-step instructions for new users
- **Content Sections**:
  1. **Overview**: What this calculator does and when to use it
  2. **Step-by-Step Instructions**: Numbered list of basic operations
  3. **Example Calculation**: Simple worked example
  4. **Tips and Best Practices**: Practical advice
  5. **Next Steps**: What to do with results (export, save, etc.)

- **Example Implementation**:
```jsx
<QuickStartDialog
  open={quickStartOpen}
  onClose={() => setQuickStartOpen(false)}
  title="Schedule of Loads Calculator Quick Start"
  steps={[
    { title: "Add Load Items", description: "Fill in load details and click 'Add Item'" },
    { title: "Configure Circuit Details", description: "Set circuit breaker and conductor sizes for each load" },
    { title: "Calculate Power", description: "Click 'Calculate Power' to process all loads" },
    { title: "View Results", description: "Check the Results tab for power consumption estimates" },
    { title: "Export or Save", description: "Export to PDF or save your calculation for future reference" }
  ]}
  example={{
    title: "Example: Calculating a small office loads",
    description: "For a small office with lighting, computers, and AC units...",
    steps: ["Enter 10 LED lights at 18W each", "Add 5 computers at 250W each", "Enter 1 AC unit at 2200W"]
  }}
/>
```

### 3. Info Panel Dialog
- **Purpose**: Technical details, regulatory information, and educational content
- **Content Sections**:
  1. **Regulatory References**: Relevant codes and standards with section numbers
  2. **Formula Explanations**: Technical details on calculation methods
  3. **Definitions**: Key terms and concepts
  4. **Limitations**: Boundary conditions and caveats
  5. **Further Reading**: Links to additional resources

- **Example Implementation**:
```jsx
<InfoDialog
  open={infoOpen}
  onClose={() => setInfoOpen(false)}
  title="Schedule of Loads Information"
  sections={[
    {
      title: "Regulatory References",
      content: (
        <>
          <Typography variant="body1">
            This calculator implements requirements from:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><MenuBookIcon /></ListItemIcon>
              <ListItemText 
                primary="Philippine Electrical Code (PEC) 2017" 
                secondary="Article 2.20 - Branch-Circuit, Feeder, and Service Calculations" 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><MenuBookIcon /></ListItemIcon>
              <ListItemText 
                primary="PEC 2017 Section 2.50" 
                secondary="Motors, Motor Circuits, and Controllers" 
              />
            </ListItem>
          </List>
        </>
      )
    },
    {
      title: "Formulas Used",
      content: (
        <>
          <Typography variant="subtitle1">Connected Load</Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            Connected Load (W) = Quantity × Rating (W)
          </Typography>
          
          <Typography variant="subtitle1" sx={{ mt: 2 }}>Demand Load</Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            Demand Load (W) = Connected Load (W) × Demand Factor
          </Typography>
          
          <Typography variant="subtitle1" sx={{ mt: 2 }}>Current</Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            Current (A) = Demand Load (W) ÷ Voltage (V)
          </Typography>
        </>
      )
    }
  ]}
/>
```

### 4. Save and Load Functionality
- **Standard Save Button**: Placement in main toolbar with tooltip
- **Saved Calculations Button**: Access to previously saved calculations
- **Save Dialog**: Standardized modal for naming and saving calculations
- **Load Dialog**: Consistent calculation viewer with proper formatting

### 5. Results Section
- **Summary Cards**: Key metrics with proper formatting and units
- **Results Tables**: Consistent table layouts with sortable columns
- **Visualizations**: Standard chart types with proper legends and labels
- **Compliance Information**: Clear indicators of regulatory compliance status

### 6. Data Persistence
- LocalStorage backup of current calculator state
- Recovery option on page reload
- Draft auto-save functionality
- Visual indicator of save status

## Implementation Checklist for Each Calculator

1. ☐ Add standardized header with title and reference to regulations
2. ☐ Implement Quick Start guide with step-by-step instructions
3. ☐ Create Info panel with regulatory references and formulas
4. ☐ Standardize save/load functionality  
5. ☐ Add Calculator-specific visualizations following design guidelines
6. ☐ Implement state persistence with auto-save feature
7. ☐ Add compliance verification with regulatory standards
8. ☐ Ensure proper error handling and validation
9. ☐ Implement PDF export with comprehensive analysis

## Migration Plan

### Phase 1: Component Creation
- Create reusable `QuickStartDialog` component
- Create reusable `InfoDialog` component
- Implement standardized toolbar layout
- Develop unified save/load dialog components

### Phase 2: Calculator Updates
1. **Schedule of Loads Calculator** - Already implemented ✓
2. **Lighting Calculator** - Priority 1
3. **HVAC Calculator** - Priority 2
4. **Power Factor Calculator** - Priority 3
5. **Voltage Drop Calculator** - Priority 4
6. **Harmonic Distortion Calculator** - Priority 5
7. **Equipment Calculator** - Priority 6

### Phase 3: Testing and Refinement
- User testing of standardized interfaces
- Gather feedback on Quick Start guides and Info panels
- Refine components based on feedback
- Documentation of best practices for future calculator implementations 