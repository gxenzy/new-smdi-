# Keyboard Navigation Guide for Chart Components

## Overview

This document provides guidance on how to use keyboard navigation for charts in the Energy Audit Platform. Our charts support comprehensive keyboard navigation to ensure they are accessible to all users, regardless of their abilities or input preferences.

## General Keyboard Shortcuts

The following keyboard shortcuts work across all chart types:

| Shortcut | Description |
|----------|-------------|
| `Tab` | Move focus to the chart |
| `Enter` / `Space` | Select the current data point |
| `Escape` | Exit chart navigation mode |
| `Alt + D` | Toggle data table view (accessible table representation of the chart) |
| `Alt + A` | Announce chart summary via screen reader |
| `Alt + H` | Open keyboard shortcut help dialog |
| `Home` | Move to the first data point |
| `End` | Move to the last data point |

## Chart-Specific Navigation

### Bar Charts

| Shortcut | Description |
|----------|-------------|
| `Left Arrow` / `Right Arrow` | Navigate between bars |
| `Up Arrow` / `Down Arrow` | Navigate between datasets (for multi-series bar charts) |

### Line Charts

| Shortcut | Description |
|----------|-------------|
| `Left Arrow` / `Right Arrow` | Navigate between data points along the x-axis |
| `Up Arrow` / `Down Arrow` | Navigate between different line series (for multi-series line charts) |

### Pie/Doughnut Charts

| Shortcut | Description |
|----------|-------------|
| `Left Arrow` / `Right Arrow` | Navigate between segments (clockwise/counter-clockwise) |

### Radar Charts

| Shortcut | Description |
|----------|-------------|
| `Left Arrow` / `Right Arrow` | Navigate between axes |
| `Up Arrow` / `Down Arrow` | Navigate between datasets (for multi-series radar charts) |

### Scatter Charts

| Shortcut | Description |
|----------|-------------|
| `Arrow Keys` | Navigate to the nearest point in the direction of the arrow |
| `+` | Zoom in |
| `-` | Zoom out |

## Focus Indicators

When navigating charts with a keyboard:

- A visual focus indicator highlights the current data point
- For bar charts, the selected bar is highlighted
- For line charts, the selected point is enlarged and highlighted
- For pie/doughnut charts, the selected segment is offset slightly
- For radar charts, the selected point is enlarged
- For scatter charts, the selected point is enlarged and highlighted

## Accessibility Features

Our charts include several accessibility features beyond keyboard navigation:

1. **Screen Reader Support**:
   - Automatic chart descriptions based on data patterns
   - Detailed announcements of data point values when navigating
   - Access to a summary of the chart via Alt+A

2. **Data Table View**:
   - Toggle a data table representation using Alt+D
   - The data table provides the exact numerical values in an accessible format

3. **High Contrast Mode**:
   - Toggle high contrast mode for better visibility
   - Improved color contrast for all chart elements

## Best Practices for Users

1. **Tab to the chart first** - Use the Tab key to place focus on the chart before attempting navigation
2. **Use the shortcut help** - Press Alt+H at any time to view available keyboard shortcuts
3. **Data table for precision** - Switch to the data table view (Alt+D) when you need exact values
4. **Screen reader announcements** - Use Alt+A to hear a summary of the chart's trends and patterns

## Implementation Notes for Developers

When implementing charts:

1. Always enable keyboard navigation for chart components
2. Use the `EnhancedAccessibleChart` component for consistent accessibility features
3. Ensure proper ARIA attributes are set
4. Test with keyboard-only navigation to verify accessibility

## Conclusion

Proper keyboard navigation is essential for creating accessible data visualizations. This guide should help both users and developers understand and utilize the keyboard navigation features available in our chart components. 