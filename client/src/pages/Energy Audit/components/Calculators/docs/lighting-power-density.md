# Lighting Power Density (LPD) Calculator Documentation

## Overview

The Lighting Power Density (LPD) Calculator is a tool for evaluating the energy efficiency of lighting systems in buildings. It calculates the power consumption per unit area (W/m²) and assesses compliance with the Philippine Green Building Code and PEC 2017 standards.

## Features

- Calculate lighting power density based on fixture specifications and room area
- Verify compliance with PEC 2017 standards for different building types
- Provide recommendations for improving energy efficiency
- Save calculation results for future reference
- Support for custom fixture types and building configurations

## Calculation Methodology

### Lighting Power Density Calculation

The calculator determines LPD using the following formula:

```
LPD = Total Lighting Power / Room Area

Where:
- LPD is measured in watts per square meter (W/m²)
- Total Lighting Power = Sum of (Fixture Wattage × Ballast Factor × Quantity) for all fixtures
- Room Area is measured in square meters (m²)
```

### Ballast Factor

The ballast factor represents the actual light output of a fixture compared to its rated output. It accounts for the efficiency of the ballast or driver used in the lighting system:

- Typical ballast factors range from 0.7 to 1.2
- High-efficiency electronic ballasts often have factors around 0.88
- LED drivers typically have a ballast factor of 1.0

## Standards and Compliance

### Philippine Green Building Code LPD Requirements

The calculator uses the maximum LPD values from the Philippine Green Building Code, which varies by building type:

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

### Compliance Assessment

A lighting system is considered compliant if its calculated LPD is less than or equal to the maximum allowed value for its building type. The calculator provides a clear indication of compliance status and offers specific recommendations for improvements.

## Using the Calculator

### Input Requirements

1. **Room Information**:
   - Room name (for reference)
   - Room area in square meters
   - Building type selection

2. **Fixture Information**:
   - Fixture type (from predefined list or custom)
   - Wattage (W)
   - Ballast factor
   - Quantity

### Interpreting Results

The calculator provides comprehensive results including:

1. **Total Lighting Power**: The sum of all fixture wattages adjusted by their ballast factors
2. **Lighting Power Density**: Power per unit area (W/m²)
3. **Compliance Status**: Whether the design meets the standard for the selected building type
4. **Recommendations**: Specific suggestions for improving efficiency

## Energy Efficiency Strategies

The calculator may recommend several strategies to improve lighting efficiency:

1. **Fixture Replacement**: Using more efficient technologies (e.g., LED instead of fluorescent)
2. **Fixture Quantity Reduction**: Optimizing the number of fixtures without compromising light levels
3. **Lighting Controls**: Adding occupancy sensors, daylight harvesting, or dimming controls
4. **Complete Redesign**: For significantly non-compliant systems, a full redesign may be necessary

## Relationship to Other Standards

While primarily based on Philippine standards, the LPD values are also consistent with international standards such as:

- ASHRAE 90.1 Energy Standard for Buildings
- International Energy Conservation Code (IECC)
- Leadership in Energy and Environmental Design (LEED) requirements

## Best Practices

For optimal energy efficiency in lighting design:

1. Consider both lighting power density and illumination requirements
2. Use task lighting where appropriate to reduce ambient lighting needs
3. Incorporate daylight harvesting where possible
4. Select fixtures with high efficacy (lumens per watt)
5. Use lighting controls to reduce operational hours

## References

- Philippine Green Building Code
- Philippine Electrical Code (PEC) 2017
- Department of Energy Guidelines for Energy Conserving Design of Buildings 