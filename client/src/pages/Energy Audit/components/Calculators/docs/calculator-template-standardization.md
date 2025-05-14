# Calculator Template Standardization

This document defines the standard components, layouts, and interfaces that should be used across all calculators in the Energy Audit Platform to ensure consistency.

## Standard Calculator Layout

### Layout Components

1. **Header Section**
   - Title
   - Description (optional)
   - Quick Start button
   - Info button
   - Main action buttons (aligned right)

2. **Main Content Area**
   - Tab navigation (if needed)
   - Input forms
   - Results display
   - Visualization area

3. **Footer Section**
   - Secondary action buttons
   - Status indicators
   - Navigation controls

### Button Standardization

All calculators should follow these button placement rules:

1. **Primary Actions** (top right of calculator)
   - Calculate
   - Save
   - Export to PDF

2. **Secondary Actions** (in the toolbar below the calculator)
   - Reset
   - Load Saved
   - Help
   - Additional features

3. **Form Actions** (at the end of input forms)
   - Add
   - Remove
   - Clear

### Visual Hierarchy

Consistent visual hierarchy across calculators:

1. **Prominence Order**
   - Primary calculation functions
   - Input forms
   - Results and visualizations
   - Secondary features

2. **Color Usage**
   - Primary buttons: Main theme color
   - Secondary buttons: Outlined variant
   - Destructive actions: Error color
   - Status indicators: Success/Warning/Error colors

## Standard Form Components

### Input Groups

```tsx
<StandardFormGroup
  title="Basic Information"
  subtitle="Enter the basic circuit parameters"
>
  <Grid container spacing={2}>
    <Grid item xs={12} md={6}>
      <TextField 
        label="Description"
        value={values.description}
        onChange={onChange('description')}
        fullWidth
        error={!!errors.description}
        helperText={errors.description}
      />
    </Grid>
    {/* More fields */}
  </Grid>
</StandardFormGroup>
```

### Numeric Inputs

All numeric inputs should:
- Include proper validation
- Use InputAdornment for units
- Include min/max/step attributes
- Have standardized error messages

```tsx
<TextField
  label="Power Rating"
  type="number"
  value={value}
  onChange={onChange}
  InputProps={{
    endAdornment: <InputAdornment position="end">W</InputAdornment>,
    inputProps: { min: 0, step: 0.1 }
  }}
  error={!!error}
  helperText={error || 'Enter the rated power in watts'}
  fullWidth
/>
```

### Selection Controls

Standardized dropdowns with consistent styling:

```tsx
<FormControl fullWidth error={!!error}>
  <InputLabel id="conductor-size-label">Conductor Size</InputLabel>
  <Select
    labelId="conductor-size-label"
    value={value}
    onChange={onChange}
    label="Conductor Size"
  >
    <MenuItem value=""><em>Select</em></MenuItem>
    {options.map(option => (
      <MenuItem key={option.value} value={option.value}>
        {option.label}
      </MenuItem>
    ))}
  </Select>
  {error && <FormHelperText>{error}</FormHelperText>}
</FormControl>
```

## Standard Dialog Components

### Quick Start Dialog

A standardized quick start dialog for all calculators:

```tsx
<QuickStartDialog
  open={open}
  onClose={onClose}
  title="Schedule of Loads Calculator"
  steps={[
    {
      title: "Enter Panel Information",
      description: "Start by entering the panel name, voltage, and power factor."
    },
    {
      title: "Add Load Items",
      description: "Add each load with its rating, quantity, and demand factor."
    },
    // More steps...
  ]}
/>
```

### Information Dialog

Standard dialog for displaying calculator information:

```tsx
<InfoDialog
  open={open}
  onClose={onClose}
  title="About Voltage Drop Calculator"
  sections={[
    {
      title: "Purpose",
      content: "The Voltage Drop Calculator helps determine the voltage drop in electrical circuits..."
    },
    {
      title: "Methodology",
      content: "Calculations are based on the IEEE standards for voltage drop..."
    },
    // More sections...
  ]}
  references={[
    "Philippine Electrical Code (PEC) 2017, Article 2.10.4",
    "IEEE Standard 241-1990"
  ]}
/>
```

### Recovery Dialog

Standard dialog for recovering saved drafts:

```tsx
<CalculatorStateRecoveryDialog
  open={open}
  onClose={onClose}
  onRecover={handleRecover}
  onDiscard={handleDiscard}
  savedAt={savedDate}
  calculatorType="Schedule of Loads"
/>
```

## Standardized Results Display

### Results Card

```tsx
<ResultsCard
  title="Calculation Results"
  status="success" // or "warning", "error"
  timestamp={new Date()}
  metrics={[
    { label: "Total Connected Load", value: "1500", unit: "W" },
    { label: "Current", value: "6.52", unit: "A" },
    // More metrics...
  ]}
  actions={[
    { label: "Export", icon: <PictureAsPdfIcon />, onClick: handleExport },
    { label: "Save", icon: <SaveIcon />, onClick: handleSave }
  ]}
/>
```

### Visualization Components

Standardized chart components with consistent styling:

```tsx
<ChartContainer
  title="Voltage Drop Analysis"
  description="Voltage drop across different conductor sizes"
  type="bar" // or "line", "pie", etc.
  data={chartData}
  options={chartOptions}
  height={300}
  legend={true}
/>
```

## Data Management Standards

### State Management

```tsx
// Standard pattern for calculator state
const [values, setValues] = useState<CalculatorValues>(initialValues);
const [errors, setErrors] = useState<CalculatorErrors>({});
const [results, setResults] = useState<CalculatorResults | null>(null);
const [calculating, setCalculating] = useState<boolean>(false);
const [saved, setSaved] = useState<boolean>(false);
```

### Data Persistence

```tsx
// Use the standard storage hook
const storage = useAutoSave(values, 'schedule-of-loads');

// Standard recovery check on mount
useEffect(() => {
  if (storage.hasSavedState()) {
    setRecoveryDialogOpen(true);
  }
}, []);
```

## Implementation Notes

1. Create these standard components in a shared UI library
2. Update all calculators to use these standardized components
3. Implement consistent error handling and validation
4. Ensure all calculators have the same visual style and behavior
5. Add comprehensive documentation and help for all calculators 