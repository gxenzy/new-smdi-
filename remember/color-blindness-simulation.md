# Color Blindness Simulation Implementation

## Overview

This document provides details on the implementation of color blindness simulation in the Energy Audit Platform, which helps create more accessible visualizations and better understand how data visualizations appear to people with color vision deficiencies.

## Features Implemented

1. **Color Blindness Simulation Utility**
   - Created `colorBlindnessSimulation.ts` utility with transformation matrices for different types of color blindness
   - Implemented color conversion functions for various color formats
   - Added support for 8 different types of color vision deficiencies
   - Created functions to simulate how charts would appear to users with color blindness

2. **AccessibilitySettingsContext Integration**
   - Added color blindness simulation type to global accessibility settings
   - Created UI controls in AccessibilitySettingsPanel for selecting simulation type
   - Ensured settings are persisted in local storage
   - Added CSS classes for different simulation types

3. **ChartAccessibilityProvider Integration**
   - Updated chart rendering to apply color blindness transformations
   - Integrated simulation with existing high contrast and pattern fill features
   - Optimized performance by using memoization for simulated configurations

4. **Visualization Components**
   - Created ColorBlindnessDemo component to showcase:
     - Original colors vs. simulated colors
     - Accessible color palettes for specific types of color blindness
     - Chart examples showing how standard vs. accessible colors appear
   - Integrated demo into AccessibilityChartExample page

## Technical Details

### Color Transformation Process

1. **Color Parsing**
   - Convert various color formats (hex, rgb, rgba) to a standard RGB object
   - Handle alpha channels appropriately

2. **Matrix Transformation**
   - Apply type-specific transformation matrices based on established research
   - Convert colors to the simulated spectrum using linear algebra

3. **Chart Processing**
   - Deep clone chart configurations to avoid modifying originals
   - Process all color properties in datasets (backgroundColor, borderColor, etc.)
   - Handle both array and string color values
   - Apply to all affected chart elements

### Accessible Color Palettes

Created specific color palettes optimized for different types of color blindness:

1. **General Purpose Palette**
   - Base colors distinguishable across most types of color blindness
   - High contrast between adjacent colors
   - Varying luminance to ensure distinction even in grayscale

2. **Specific Deficiency Palettes**
   - Type-specific palettes for severe deficiencies
   - Patterns for complete color blindness (achromatopsia)
   - Focus on bluish and yellowish colors for red-green color blindness

## Usage Guide

### In Components

```tsx
import { 
  simulateColorString, 
  ColorBlindnessType 
} from '../../utils/accessibility/colorBlindnessSimulation';

// Simulate a specific color
const simulatedColor = simulateColorString('#FF0000', ColorBlindnessType.PROTANOPIA);

// Or use the global context
import { useAccessibilitySettings } from '../../contexts/AccessibilitySettingsContext';

const { settings } = useAccessibilitySettings();
// settings.colorBlindnessSimulation contains the current simulation type
```

### For Chart Configurations

```tsx
import { 
  simulateChartColors, 
  ColorBlindnessType 
} from '../../utils/accessibility/colorBlindnessSimulation';

// Simulate all colors in a chart configuration
const simulatedConfig = simulateChartColors(chartConfig, ColorBlindnessType.DEUTERANOPIA);
```

### Getting Accessible Colors

```tsx
import { 
  getAccessibleColorSet, 
  ColorBlindnessType 
} from '../../utils/accessibility/colorBlindnessSimulation';

// Get 5 colors that work well for deuteranopia
const accessibleColors = getAccessibleColorSet(ColorBlindnessType.DEUTERANOPIA, 5);
```

## Future Improvements

1. **Enhanced Visual Simulation**
   - Add CSS filters for simulating color blindness throughout the entire UI
   - Create overlay mode for real-time simulation of any screen content

2. **Pattern Enhancement**
   - Add more pattern types for greater distinction
   - Implement pattern + color combinations for maximum accessibility

3. **Automated Recommendations**
   - Create a system that analyzes chart colors and suggests accessible alternatives
   - Implement warnings for problematic color combinations

4. **User Testing**
   - Conduct usability testing with users who have color vision deficiencies
   - Refine implementation based on feedback

5. **Documentation**
   - Create comprehensive guidelines for designing accessible visualizations
   - Add best practices for different types of data and chart types

## Resources

- [Color Blindness Simulation Algorithm](http://www.daltonize.org/2010/05/matrices-for-daltonization-in-daltonize.html)
- [Wong, B. (2011) Points of view: Color blindness. Nature Methods 8, 441](https://www.nature.com/articles/nmeth.1618)
- [Okabe & Ito's Color Universal Design](https://jfly.uni-koeln.de/color/)
- [Web Content Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/TR/WCAG21/) 