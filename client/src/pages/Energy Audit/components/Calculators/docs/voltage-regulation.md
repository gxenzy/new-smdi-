# Voltage Regulation Calculator Documentation

## Overview

The Voltage Regulation Calculator is a tool for analyzing voltage drop and regulation in electrical circuits. It follows the requirements set forth in the Philippine Electrical Code (PEC) 2017 Section 2.30, which specifies acceptable voltage drop limits for different parts of an electrical installation.

## Features

- Calculate voltage drop based on circuit parameters
- Determine compliance with PEC 2017 Section 2.30 requirements
- Calculate power losses in conductors
- Recommend conductor sizes based on voltage drop requirements
- Provide educational information on voltage regulation standards
- Interactive visualization of voltage drop along conductor length
- Comparative visualization of different conductor sizes

## Calculation Methodology

### Voltage Drop Calculation

The calculator determines voltage drop using the following methodology:

1. **Single-Phase Circuits:**
   - VD = 2 × I × (R × cos(θ) + X × sin(θ))

2. **Three-Phase Circuits:**
   - VD = √3 × I × (R × cos(θ) + X × sin(θ))

Where:
- VD = Voltage drop (volts)
- I = Current (amperes)
- R = Conductor resistance (ohms)
- X = Conductor reactance (ohms)
- cos(θ) = Power factor
- sin(θ) = Sine of power factor angle

### Resistance Calculation

Conductor resistance is calculated based on:
- Conductor material (copper or aluminum)
- Conductor size (AWG or MCM)
- Temperature effect
- Length of conductor

The formula used is:
- R = (ρ × L) / A × [1 + α(T - 75)]

Where:
- ρ = Resistivity of the conductor material (ohm-cmil/ft)
- L = Length of conductor (feet)
- A = Cross-sectional area (circular mils)
- α = Temperature coefficient
- T = Ambient temperature (°C)

### Compliance Checking

PEC 2017 Section 2.30 specifies the following voltage drop limits:
- Branch Circuits: Maximum 3% voltage drop
- Feeders: Maximum 2% voltage drop
- Total (Service to Farthest Outlet): Maximum 5% voltage drop

The calculator checks the calculated voltage drop against these limits and determines compliance.

## Using the Calculator

### Input Parameters

1. **System Parameters:**
   - System Voltage (V)
   - Phase Configuration (Single-phase or Three-phase)

2. **Load Parameters:**
   - Load Power (W)
   - Power Factor (0-1)

3. **Conductor Parameters:**
   - Conductor Length (m)
   - Conductor Size (AWG/MCM)
   - Conductor Material (Copper or Aluminum)
   - Conduit Material (PVC, Steel, or Aluminum)

4. **Environmental Parameters:**
   - Ambient Temperature (°C)

### Interpreting Results

The calculator provides the following results:

1. **Voltage Drop:**
   - Percentage voltage drop
   - Absolute voltage drop (volts)
   - Receiving end voltage

2. **Power Losses:**
   - Resistive loss (watts)
   - Reactive loss (VAR)
   - Total loss (VA)

3. **Compliance Status:**
   - Whether the circuit complies with PEC 2017 requirements

4. **Recommendations:**
   - Suggestions for improving non-compliant circuits
   - Minimum conductor size for compliance

### Interactive Visualizations

The calculator provides two interactive visualizations:

1. **Voltage Profile Visualization**:
   - Displays voltage levels along the conductor length
   - Shows PEC 2017 limit lines for feeders (2%) and branch circuits (3%)
   - Allows toggling of limit display
   - Supports different color schemes including high contrast for accessibility

2. **Conductor Comparison Visualization**:
   - Compares voltage drop percentages for different conductor sizes
   - Displays PEC 2017 limits as reference lines
   - Helps in selecting the optimal conductor size
   - Includes numerical values for precise comparison

Both visualizations support:
- Different color schemes (default, high contrast, print-friendly)
- Customization options for display preferences
- Tooltips showing precise values at each point

## Technical Details

### Resistivity Values

| Material | Resistivity (ohm-cmil/ft) |
|----------|---------------------------|
| Copper   | 10.371 at 75°C            |
| Aluminum | 17.020 at 75°C            |

### Temperature Coefficients

| Material | Temperature Coefficient (per °C) |
|----------|----------------------------------|
| Copper   | 0.00393                          |
| Aluminum | 0.00403                          |

### Reactance Values

| Conduit Material | Configuration | Reactance (ohms/1000ft) |
|------------------|---------------|-------------------------|
| PVC              | Single-phase  | 0.050                   |
| PVC              | Three-phase   | 0.043                   |
| Steel            | Single-phase  | 0.062                   |
| Steel            | Three-phase   | 0.054                   |
| Aluminum         | Single-phase  | 0.052                   |
| Aluminum         | Three-phase   | 0.045                   |

## References

1. Philippine Electrical Code (PEC) 2017, Section 2.30
2. National Electrical Code (NEC), Article 210.19(A) and 215.2(A)
3. IEEE Std 141, "IEEE Recommended Practice for Electric Power Distribution for Industrial Plants"
4. NFPA 70E, "Standard for Electrical Safety in the Workplace" 