# Lighting Power Density (LPD) Calculator User Guide

## Introduction

The Lighting Power Density (LPD) Calculator is a powerful tool in the Energy Audit Platform that helps evaluate the energy efficiency of lighting systems in buildings. This guide explains how to use all features of the calculator to optimize your lighting designs and ensure compliance with energy efficiency standards.

## Getting Started

### Accessing the Calculator

1. Log in to the Energy Audit Platform
2. Navigate to the Energy Audit section
3. Select "Calculators" from the sidebar
4. Choose "Lighting Power Density Calculator"

### Basic Interface

The calculator is organized into several sections:
- Room Information
- Add Fixtures
- Fixtures List
- Calculation Results (appears after calculation)

## Room Configuration

### Manual Room Setup

1. Enter the **Room Name** in the text field
2. Specify the **Room Area** in square meters
3. Select the appropriate **Building Type** from the dropdown menu
4. Note the displayed PEC Standard for the selected building type

### Using Building Presets

For quick setup, you can use predefined building configurations:

1. Click the **Load Preset Configuration** button
2. Select a building type (Office, Educational, Retail, etc.)
3. Choose a specific room type from the selected building
4. Review the preset description and fixture information
5. Click **Apply Preset** to load the configuration

## Managing Fixtures

### Adding Fixtures

1. Select a **Fixture Type** from the dropdown or choose "Custom Fixture"
2. For custom fixtures, enter a descriptive name
3. Specify the **Wattage** in watts
4. Enter the **Ballast Factor** (typically 0.8-1.2)
5. Set the **Quantity** of fixtures
6. Click **Add Fixture** to add to the list

### Editing and Removing Fixtures

- To remove a fixture, click the delete icon in the Fixtures List
- To modify a fixture, remove it and add a new one with updated parameters

## Calculation Options

### Basic Calculation

1. Add all fixtures for the room
2. Click the **Calculate LPD** button

### Energy Savings Calculation

To analyze potential energy savings:

1. Enable the **Calculate Energy Savings** toggle
2. Click **Configure Parameters** to customize:
   - Hours of operation per day
   - Days of operation per year
   - Electricity rate ($ per kWh)
   - Estimated upgrade cost for fixtures
3. Click **Calculate LPD** to include savings analysis

## Interpreting Results

### Compliance Status

After calculation, the system shows:
- Total Lighting Power (watts)
- Lighting Power Density (W/m²)
- Compliance status with PEC 2017 standards
- Percentage above/below the limit

### Recommendations

The system provides tailored recommendations based on your results:
- For compliant designs: optimization suggestions
- For non-compliant designs: specific improvements to meet standards

### Energy Savings Analysis

When enabled, the system shows:
- Power savings (watts and percentage)
- Annual energy savings (kWh/year)
- Annual cost savings ($/year)
- Estimated payback period (years)

## Working with Calculation Results

### Saving Results

1. Click **Save Results** to store your calculation
2. Access saved calculations later from the Saved Calculations page

### PDF Export and Preview

To create documentation of your calculations:

1. Click **Preview PDF** to see the report before downloading
2. In the preview dialog, review all sections:
   - Room information
   - Fixture details
   - Calculation results
   - Compliance status
   - Recommendations
   - Energy savings (if calculated)
3. Click **Download PDF** to save the report to your device
4. Or close the preview and click **Export PDF** directly

## Advanced Features

### Comparative Analysis

For the best results, consider:
1. Running multiple calculations with different fixture configurations
2. Comparing LPD values and energy savings between scenarios
3. Saving each calculation for future reference

### Integration with Energy Audit Workflow

The LPD Calculator can be used as part of a comprehensive energy audit:
1. Calculate LPD for each room in a building
2. Incorporate results into the overall audit report
3. Reference the calculations when making energy efficiency recommendations

## Tips for Effective Use

1. **Fixture Selection**: Use the most accurate fixture wattage and ballast factor values available
2. **Room Area**: Ensure accurate measurements of the room area for precise LPD calculations
3. **Building Type**: Select the correct building type to apply the appropriate standards
4. **Energy Parameters**: Use realistic values for hours of operation and energy costs
5. **Presets**: Use presets as starting points and customize as needed for your specific project

## Troubleshooting

### Common Issues

1. **Calculation Errors**:
   - Ensure room area is greater than zero
   - Add at least one fixture before calculating
   - Verify all numerical inputs are valid

2. **PDF Export Issues**:
   - Ensure calculation is complete before attempting export
   - Wait for export process to complete before closing dialogs

3. **Preset Loading Issues**:
   - If presets don't load correctly, try entering data manually
   - Verify you've selected both building type and room type

### Getting Help

If you encounter problems with the calculator:
1. Check this user guide first
2. Consult the technical documentation
3. Contact support through the platform's help system

## Reference

### Philippine Green Building Code LPD Requirements

| Building Type | Maximum LPD (W/m²) |
|---------------|-------------------|
| Office        | 10.5              |
| Classroom     | 10.5              |
| Hospital      | 11.2              |
| Retail        | 14.5              |
| Industrial    | 12.8              |
| Residential   | 8.0               |
| Warehouse     | 8.0               |
| Restaurant    | 12.0              |
| Hotel         | 10.0              |
| Laboratory    | 14.0              |

### Calculation Formulas

- **LPD** = Total Lighting Power / Room Area (W/m²)
- **Total Lighting Power** = Sum of (Fixture Wattage × Ballast Factor × Quantity) for all fixtures
- **Annual Energy Consumption** = Total Power (kW) × Hours per Day × Days per Year
- **Annual Energy Cost** = Annual Energy Consumption (kWh) × Electricity Rate ($/kWh)
- **Payback Period** = Upgrade Cost / Annual Cost Savings (years) 