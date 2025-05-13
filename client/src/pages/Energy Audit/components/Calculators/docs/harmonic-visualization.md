# Harmonic Visualization System

## Overview

The Harmonic Visualization System provides interactive visualizations for harmonic distortion data, helping users better understand and analyze power quality issues in electrical systems. This feature enhances the Harmonic Distortion Calculator by providing visual representations of harmonic components, total harmonic distortion (THD), and waveform analysis.

## Features

### 1. Harmonic Spectrum Analysis

The harmonic spectrum visualization displays the magnitude of each harmonic component as a percentage of the fundamental frequency. This bar chart helps users:

- Identify dominant harmonic orders
- Compare voltage and current harmonics side-by-side
- Visualize IEEE 519-2014 limits for each harmonic order
- Easily spot harmonics that exceed standard limits

### 2. THD Comparison Chart

The THD comparison visualization shows the total harmonic distortion for voltage and current compared to their respective limits. This chart helps users:

- Quickly assess overall system compliance
- Compare voltage THD and current THD in a single view
- Understand the relationship between measured distortion and standard limits
- Identify whether voltage or current harmonics are more problematic

### 3. Waveform Analysis

The waveform visualization shows how harmonics affect the actual voltage and current waveforms. This line chart helps users:

- Visualize the impact of harmonics on the sinusoidal waveform
- Identify waveform distortion patterns characteristic of specific equipment
- Understand the practical implications of harmonic distortion
- Compare distorted waveforms to ideal sinusoidal waveforms

## Technical Implementation

The visualization system is built using:

- **Chart.js**: For rendering responsive, interactive charts
- **React**: For component-based UI architecture and state management
- **TypeScript**: For type safety and improved developer experience

### Architecture

The system consists of:

1. **HarmonicVisualization.tsx**: Main React component that provides the UI for visualizations and manages chart state
2. **harmonicVisualization.ts**: Utility functions that create Chart.js configurations for different visualization types
3. Integration with the Harmonic Distortion Calculator component

### Visualization Options

Users can customize visualizations with the following options:

- **Show/Hide Voltage**: Toggle voltage harmonics display
- **Show/Hide Current**: Toggle current harmonics display
- **Show/Hide Limits**: Toggle display of IEEE 519-2014 limits
- **Color Schemes**:
  - Default: Standard color scheme with blue for voltage and red for current
  - High Contrast: Accessible color scheme for better visibility
  - Print: Grayscale color scheme optimized for printing

## Accessibility Features

The visualization system is designed with accessibility in mind:

- High contrast mode for users with visual impairments
- Keyboard navigation support
- Screen reader compatible element structure
- Clear color differentiation between data series
- Responsive sizing for different screen sizes

## Usage Guidelines

### Interpreting the Harmonic Spectrum

1. Examine which harmonic orders have the highest magnitudes
2. Compare harmonics against their respective limits (dashed lines)
3. Pay special attention to odd harmonics (3rd, 5th, 7th, etc.) which are typically most significant
4. Look for patterns that might indicate specific equipment issues:
   - 3rd harmonics: Single-phase loads, computer equipment
   - 5th and 7th harmonics: Six-pulse converters, variable frequency drives
   - 11th and 13th harmonics: Twelve-pulse converters

### Using the Waveform Analysis

1. A perfectly sinusoidal waveform indicates no harmonic distortion
2. Flat-topped waveforms often indicate capacitive loads
3. Pointed or peaked waveforms often indicate inductive loads
4. Notched waveforms typically indicate power electronic switching

## Future Enhancements

Planned enhancements for the visualization system include:

1. Export functionality for charts (PNG, PDF)
2. Advanced filtering options for harmonic orders
3. Time-based analysis for harmonic trends
4. Integration with real-time monitoring systems
5. Interactive 3D visualization of harmonic spectra

## Standards Compliance

The visualization system adheres to IEEE 519-2014 standards for harmonic distortion analysis and presents limits based on:

- System voltage level (for voltage harmonics)
- Short circuit ratio (for current harmonics)
- System type (general or special applications)

This ensures that visualizations accurately represent compliance status according to industry standards. 