# Voltage Drop Calculator - Next Implementation Steps

## 1. Integration with SavedCalculationsViewer

The Voltage Drop Calculator already has basic save functionality implemented through the `saveCalculation` utility. The next step is to properly integrate it with the SavedCalculationsViewer component to enable loading saved calculations.

### Implementation Tasks

1. **Update SavedCalculationsViewer Component**:
   - Add 'voltage-drop' to the CalculatorType type in SavedCalculationsViewer.tsx
   - Update the `calculatorTypeLabels` object to include 'voltage-drop': 'Voltage Drop'
   - Add support for voltage drop in the tab interface and filter logic

2. **Implement Load Functionality in VoltageDropCalculator**:
   - Create method to handle loading saved calculations
   - Update form state with loaded calculation data
   - Add LoadCalculation button next to SaveCalculation

3. **Add Saved Calculations Dialog**:
   - Add a button to open saved calculations viewer
   - Implement dialog with SavedCalculationsViewer component
   - Pass appropriate props for calculator type and load handler

### Example Implementation for Loading Functionality

```tsx
// In VoltageDropCalculator.tsx

// Add state for save/load dialog
const [isSavedCalcsDialogOpen, setSavedCalcsDialogOpen] = useState(false);

// Add load calculation handler
const handleLoadCalculation = (calculationData: any) => {
  if (calculationData) {
    const { inputs, results } = calculationData;
    
    // Set inputs state
    if (inputs) {
      // Set circuit configuration
      if (inputs.circuitConfiguration) {
        setCircuitConfig(inputs.circuitConfiguration);
      }
      
      // Set other inputs
      setInputs({
        systemVoltage: inputs.systemVoltage || 230,
        loadCurrent: inputs.loadCurrent || 20,
        conductorLength: inputs.conductorLength || 50,
        conductorSize: inputs.conductorSize || '12 AWG',
        conductorMaterial: inputs.conductorMaterial || 'copper',
        conduitMaterial: inputs.conduitMaterial || 'PVC',
        phaseConfiguration: inputs.phaseConfiguration || 'single-phase',
        temperature: inputs.temperature || 30,
        powerFactor: inputs.powerFactor || 0.85
      });
    }
    
    // Set results
    if (results) {
      setResults(results);
      setIsCalculated(true);
    }
    
    setSavedCalcsDialogOpen(false);
    showNotification('Calculation loaded successfully', 'success');
  }
};

// Add dialog to the component JSX
<Dialog
  open={isSavedCalcsDialogOpen}
  onClose={() => setSavedCalcsDialogOpen(false)}
  fullWidth
  maxWidth="md"
>
  <DialogTitle>Saved Voltage Drop Calculations</DialogTitle>
  <DialogContent>
    <SavedCalculationsViewer
      calculationType="voltage-drop"
      onLoadCalculation={handleLoadCalculation}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setSavedCalcsDialogOpen(false)}>Close</Button>
  </DialogActions>
</Dialog>

// Add button to toolbar
<Button
  variant="outlined"
  startIcon={<FolderOpenIcon />}
  onClick={() => setSavedCalcsDialogOpen(true)}
>
  Saved Calculations
</Button>
```

## 2. PDF Export Functionality

The PDF export functionality will allow users to generate comprehensive reports from the Voltage Drop Calculator results. This should follow the pattern established by other calculators in the system.

### Implementation Tasks

1. **Create VoltageDropPdfExport Utility**:
   - Create new file: `utils/voltageDropPdfExport.ts`
   - Implement exportToPdf function that takes VoltageDropResult and VoltageDropInputs
   - Generate formatted PDF with jsPDF

2. **Add Export Button and Dialog**:
   - Add export button to results section
   - Create dialog for export options (quality, paper size, etc.)
   - Implement export progress indicator

3. **Create PDF Content Sections**:
   - Title and calculation info section
   - Input parameters section
   - Results summary section with compliance status
   - Detailed results section with power losses and receiving end voltage
   - Visualization export (using Chart.js toBase64Image)
   - Recommendations section

### Example Implementation for PDF Export

```tsx
// In voltageDropPdfExport.ts

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { VoltageDropInputs, VoltageDropResult } from './voltageDropUtils';

export interface PdfExportOptions {
  title?: string;
  showVisualization?: boolean;
  paperSize?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  fileName?: string;
}

export const exportVoltageDropToPdf = (
  inputs: VoltageDropInputs,
  results: VoltageDropResult,
  visualizationImage?: string,
  options: PdfExportOptions = {}
) => {
  const {
    title = 'Voltage Drop Calculation Report',
    showVisualization = true,
    paperSize = 'a4',
    orientation = 'portrait',
    fileName = 'voltage-drop-report.pdf'
  } = options;
  
  // Initialize jsPDF
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: paperSize
  });
  
  // Add title
  pdf.setFontSize(18);
  pdf.text(title, 14, 15);
  
  // Add date and time
  pdf.setFontSize(10);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
  
  // Add circuit type
  const circuitTypeMap: Record<string, string> = {
    'branch': 'Branch Circuit',
    'feeder': 'Feeder',
    'service': 'Service',
    'motor': 'Motor Circuit'
  };
  
  pdf.setFontSize(14);
  pdf.text(`Circuit Type: ${circuitTypeMap[inputs.circuitConfiguration.circuitType] || 'Unknown'}`, 14, 30);
  
  // Add compliance status
  pdf.setFontSize(12);
  if (results.compliance === 'compliant') {
    pdf.setTextColor(0, 128, 0); // Green for compliant
    pdf.text('Status: Compliant with PEC 2017', 14, 38);
  } else {
    pdf.setTextColor(220, 0, 0); // Red for non-compliant
    pdf.text('Status: Non-Compliant with PEC 2017', 14, 38);
  }
  pdf.setTextColor(0, 0, 0); // Reset color
  
  // Add input parameters table
  pdf.setFontSize(12);
  pdf.text('Input Parameters', 14, 48);
  
  const inputParams = [
    ['Parameter', 'Value', 'Unit'],
    ['System Voltage', inputs.systemVoltage.toString(), 'V'],
    ['Load Current', inputs.loadCurrent.toString(), 'A'],
    ['Conductor Length', inputs.conductorLength.toString(), 'm'],
    ['Conductor Size', inputs.conductorSize, ''],
    ['Conductor Material', inputs.conductorMaterial, ''],
    ['Conduit Material', inputs.conduitMaterial, ''],
    ['Phase Configuration', inputs.phaseConfiguration, ''],
    ['Ambient Temperature', inputs.temperature.toString(), '°C'],
    ['Power Factor', inputs.powerFactor?.toString() || '0.85', '']
  ];
  
  (pdf as any).autoTable({
    startY: 50,
    head: [inputParams[0]],
    body: inputParams.slice(1),
    theme: 'striped',
    headStyles: { fillColor: [66, 66, 66] }
  });
  
  // Add results table
  const currentY = (pdf as any).lastAutoTable.finalY + 10;
  pdf.text('Calculation Results', 14, currentY);
  
  const resultParams = [
    ['Parameter', 'Value', 'Unit'],
    ['Voltage Drop', results.voltageDrop.toFixed(2), 'V'],
    ['Voltage Drop Percentage', results.voltageDropPercent.toFixed(2), '%'],
    ['Maximum Allowed Drop', results.maxAllowedDrop.toFixed(2), '%'],
    ['Receiving End Voltage', results.receivingEndVoltage.toFixed(2), 'V'],
    ['Resistive Loss', results.resistiveLoss.toFixed(2), 'W'],
    ['Reactive Loss', results.reactiveLoss.toFixed(2), 'VAR'],
    ['Total Loss', results.totalLoss.toFixed(2), 'VA'],
    ['Wire Ampacity', results.wireRating.ampacity.toString(), 'A'],
    ['Wire Adequacy', results.wireRating.isAdequate ? 'Adequate' : 'Not Adequate', '']
  ];
  
  (pdf as any).autoTable({
    startY: currentY + 2,
    head: [resultParams[0]],
    body: resultParams.slice(1),
    theme: 'striped',
    headStyles: { fillColor: [66, 66, 66] }
  });
  
  // Add visualization if available
  if (showVisualization && visualizationImage) {
    const vizY = (pdf as any).lastAutoTable.finalY + 10;
    pdf.text('Voltage Drop Visualization', 14, vizY);
    
    try {
      pdf.addImage(visualizationImage, 'PNG', 14, vizY + 2, 180, 90);
    } catch (error) {
      console.error('Error adding visualization to PDF:', error);
    }
  }
  
  // Add recommendations
  const recsY = showVisualization && visualizationImage 
    ? (pdf as any).lastAutoTable.finalY + 110
    : (pdf as any).lastAutoTable.finalY + 10;
  
  pdf.text('Recommendations', 14, recsY);
  
  // Create recommendations list
  const recommendations = results.recommendations.map((rec, index) => 
    [`${index + 1}.`, rec]
  );
  
  (pdf as any).autoTable({
    startY: recsY + 2,
    body: recommendations,
    theme: 'plain',
    tableWidth: 'auto',
    styles: { cellPadding: 1 },
    columnStyles: { 
      0: { cellWidth: 8 },
      1: { cellWidth: 'auto' }
    }
  });
  
  // Save PDF
  pdf.save(fileName);
  
  return pdf;
};
```

## 3. Circuit Type Templates

To enhance usability, predefined templates for common circuit scenarios will be implemented. This will allow users to quickly start with reasonable defaults for different circuit types.

### Implementation Tasks

1. **Define Common Templates**:
   - Create templates for common branch circuit scenarios (lighting, receptacles)
   - Create templates for common feeder circuit types
   - Create templates for different motor types/sizes

2. **Add Template Selection UI**:
   - Create a template selection dialog or dropdown
   - Implement method to load template data into form

3. **Update Calculator to Support Templates**:
   - Add template loading functionality
   - Preserve custom inputs while applying templates

### Example Implementation for Templates

```tsx
// Define templates interface and common templates
interface VoltageDropTemplate {
  name: string;
  description: string;
  inputs: Partial<VoltageDropInputs>;
}

// In a new file: voltageDropTemplates.ts
export const VOLTAGE_DROP_TEMPLATES: Record<CircuitType, VoltageDropTemplate[]> = {
  'branch': [
    {
      name: 'Residential Lighting Circuit',
      description: '15A lighting branch circuit in residential setting',
      inputs: {
        systemVoltage: 230,
        loadCurrent: 12,
        conductorLength: 30,
        conductorSize: '14 AWG',
        conductorMaterial: 'copper',
        phaseConfiguration: 'single-phase',
        circuitConfiguration: {
          circuitType: 'branch',
          distanceToFurthestOutlet: 25,
          wireway: 'conduit'
        }
      }
    },
    {
      name: 'Receptacle Circuit',
      description: '20A receptacle branch circuit',
      inputs: {
        systemVoltage: 230,
        loadCurrent: 16,
        conductorLength: 35,
        conductorSize: '12 AWG',
        conductorMaterial: 'copper',
        phaseConfiguration: 'single-phase',
        circuitConfiguration: {
          circuitType: 'branch',
          distanceToFurthestOutlet: 30,
          wireway: 'conduit'
        }
      }
    }
  ],
  'feeder': [
    {
      name: 'Residential Panel Feeder',
      description: '100A residential panel feeder',
      inputs: {
        systemVoltage: 230,
        loadCurrent: 80,
        conductorLength: 15,
        conductorSize: '2 AWG',
        conductorMaterial: 'copper',
        phaseConfiguration: 'single-phase',
        circuitConfiguration: {
          circuitType: 'feeder',
          wireway: 'conduit'
        }
      }
    }
  ],
  // Add templates for other circuit types...
};
```

## Timeline and Priority

1. **Week 1: SavedCalculationsViewer Integration**
   - Update SavedCalculationsViewer types to include voltage-drop
   - Implement load functionality in VoltageDropCalculator
   - Add UI components for saved calculations access

2. **Week 2: PDF Export Implementation**
   - Create PDF export utility
   - Implement visualization export functionality
   - Add UI for export options and progress indication

3. **Week 3: Circuit Templates**
   - Define common templates for different circuit types
   - Implement template selection interface
   - Add template loading functionality to calculator

By following this implementation plan, the Voltage Drop Calculator will gain full integration with the platform's persistence and reporting capabilities, enhancing its value to users. 