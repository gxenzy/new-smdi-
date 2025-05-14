# Chart Accessibility Implementation

## Overview

We have implemented a comprehensive accessibility solution for all chart components in the Energy Audit Platform to ensure WCAG 2.1 AA compliance. This implementation provides keyboard navigation, screen reader support, high contrast options, data table alternatives, and responsive sizing for users with disabilities.

## Key Components Implemented

1. **AccessibleChart Component**
   - Wraps the existing InteractiveChart with accessibility features
   - Provides keyboard navigation for exploring data points
   - Adds screen reader announcements for data values
   - Offers high contrast mode for better visibility
   - Includes data table alternative view

2. **ChartAccessibilityProvider**
   - A context provider that enables application-wide accessibility settings
   - Manages centralized accessibility settings like high contrast mode and data table view
   - Allows toggling accessibility features on/off globally
   - Manages responsive sizing settings

3. **AccessibleChartRenderer**
   - A convenient component to render accessible charts
   - Automatically applies the application's accessibility settings
   - Seamlessly integrates with existing chart implementations
   - Handles responsive sizing configuration

4. **ResponsiveChartWrapper**
   - Provides container-aware sizing for charts
   - Uses ResizeObserver to detect size changes
   - Applies optimal sizing based on device type and container dimensions
   - Maintains aspect ratio while allowing min/max height constraints

5. **ResponsiveAccessibleChart**
   - Combines accessibility features with responsive sizing
   - Offers preset size configurations for common use cases
   - Automatically adjusts chart dimensions based on container size
   - Provides responsive behavior for different viewport sizes

## Keyboard Navigation Implementation

We've enhanced chart keyboard navigation to allow users to navigate through chart data points using keyboard controls. This is important for users with motor disabilities who rely on keyboard navigation and for screen reader users.

### Key Components

1. **useChartKeyboardNavigation Hook**
   - Central hook for managing keyboard navigation state
   - Extracts data points from chart configurations
   - Manages focus state and announcements
   - Handles keyboard events and focus indicators

2. **ChartDataTable Component**
   - Provides tabular representation of chart data
   - Accessible for screen readers with proper semantic markup
   - Includes calculated values like percentages for pie charts
   - Hidden by default but available as an alternative view

3. **EnhancedAccessibleChart Component**
   - Uses keyboard navigation hook for data point exploration
   - Visually indicates focused data points
   - Includes toggle controls for table view
   - Provides ARIA-live announcements for screen readers

### Keyboard Controls

| Key | Function |
|-----|----------|
| Tab | Focus on chart |
| Arrow keys | Move between data points |
| Enter/Space | Select data point for details |
| Escape | Clear selection |
| Home | Jump to first data point |
| End | Jump to last data point |

### Implementation Example

```tsx
const {
  containerRef,
  handleKeyDown,
  accessibleDataPoints,
  activeDataPointIndex,
  announcementText
} = useChartKeyboardNavigation(chartConfig, {
  enabled: true,
  announcements: true,
  ariaLabel: "Energy consumption chart",
  title: "Monthly Energy Use"
});

// Use in component
<Box
  ref={containerRef}
  tabIndex={0}
  onKeyDown={handleKeyDown}
  role="group"
  aria-label="Energy consumption chart. Use arrow keys to navigate"
>
  {/* Chart content */}
  
  {/* Screen reader announcement */}
  <div aria-live="polite" className="visually-hidden">
    {announcementText}
  </div>
</Box>
```

### Data Table Alternative

The ChartDataTable component provides an accessible alternative to the visual chart:

```tsx
// Hidden data table for screen readers
<ChartDataTable
  configuration={chartConfig}
  title="Energy Consumption"
  visuallyHidden={true}
/>

// Visible data table alternative (toggled by user)
{showDataTable && (
  <ChartDataTable
    configuration={chartConfig}
    title="Energy Consumption"
    visuallyHidden={false}
    highContrast={highContrastMode}
  />
)}
```

### Future Keyboard Navigation Enhancements

1. **Custom Navigation Patterns**
   - Allow customization of keyboard shortcuts
   - Support for different navigation modes (grid, linear)
   - Multi-series navigation with series switching

2. **Advanced Focus Management**
   - Save and restore focus position between chart interactions
   - Focus history for forward/back navigation
   - Group navigation for related data points

3. **Advanced Announcements**
   - Context-aware announcements with trend information
   - Comparative announcements (higher/lower than previous)
   - Summary announcements for overall data patterns

## Using Accessibility Features

### For Developers

1. **Upgrading existing charts:**
   ```jsx
   // Before
   import { InteractiveChart } from './utils/reportGenerator';
   
   // Inside component
   <InteractiveChart
     configuration={chartConfig}
     title="My Chart"
   />
   
   // After
   import { AccessibleChartRenderer } from './utils/reportGenerator';
   
   // Inside component
   <AccessibleChartRenderer
     configuration={chartConfig}
     title="My Chart"
     ariaLabel="Description of chart for screen readers"
   />
   ```

2. **Accessing and modifying accessibility settings:**
   ```jsx
   import { useChartAccessibility } from './utils/reportGenerator';
   
   // In component
   const { settings, updateSettings } = useChartAccessibility();
   
   // Toggle high contrast mode
   updateSettings({ highContrastDefault: true });
   
   // Enable responsive sizing
   updateSettings({ responsiveSizingEnabled: true });
   ```

3. **Using responsive sizing with preset configurations:**
   ```jsx
   <AccessibleChartRenderer
     configuration={chartConfig}
     title="Energy Consumption"
     sizePreset="dashboard" // 'compact', 'standard', 'large', 'report', or 'dashboard'
   />
   ```

4. **Custom responsive configuration:**
   ```jsx
   <AccessibleChartRenderer
     configuration={chartConfig}
     title="Energy Consumption"
     minHeight={200}
     maxHeight={500}
     aspectRatio={16/9}
     allowSmallerOnMobile={true}
   />
   ```

### For Users

Accessible charts offer the following features:

1. **Keyboard Navigation:**
   - Tab to focus on a chart
   - Use arrow keys to navigate between data points
   - Press Enter to view details for a data point
   - Press Escape to hide details

2. **Screen Reader Support:**
   - Charts announce their type, title, and navigation instructions when focused
   - Data points are announced when navigated to
   - Alternative data tables are available for complex data

3. **High Contrast Mode:**
   - Toggle high contrast mode for better visibility
   - Increased contrast for chart elements
   - Thicker lines and larger points for better visibility

4. **Data Table Alternative:**
   - Switch to a tabular view of the data
   - Accessible table structure with proper headers
   - Compatible with all screen readers and keyboard navigation

5. **Responsive Sizing:**
   - Charts automatically adapt to container width
   - Charts maintain proper aspect ratios across devices
   - Size adjustments based on device type (mobile, tablet, desktop)
   - Consistent appearance across different viewport sizes

## Implementation Details

### WCAG 2.1 AA Compliance

The implementation satisfies the following WCAG 2.1 AA requirements:

1. **Keyboard Accessible (2.1):** 
   - All functionality is accessible via keyboard
   - No keyboard traps
   - Custom keyboard shortcuts for chart navigation

2. **Enough Time (2.2):**
   - No time limits on interactions
   - Persistent data tables and announcements

3. **Seizures and Physical Reactions (2.3):**
   - No flashing content
   - Static visualizations with controlled animations

4. **Navigable (2.4):**
   - Proper focus order
   - Descriptive page titles and aria labels
   - Focus visible indicators

5. **Input Modalities (2.5):**
   - Multiple interaction methods supported
   - Target size suitable for people with motor difficulties

6. **Readable (3.1):**
   - Clear language
   - Consistent terminology

7. **Predictable (3.2):**
   - Consistent navigation
   - Consistent identification

8. **Input Assistance (3.3):**
   - Error identification
   - Labels and instructions

9. **Compatible (4.1):**
   - Valid HTML
   - Name, role, value provided for all UI components

### Responsive Sizing Implementation

The responsive sizing implementation uses the following techniques:

1. **Container-Aware Resizing**
   - Uses ResizeObserver to detect container size changes
   - Dynamically adjusts chart dimensions based on container width
   - Maintains proper aspect ratio for better chart visualization

2. **Device-Responsive Behavior**
   - Adjusts chart size based on device type and screen size
   - Uses media queries through Material-UI's useMediaQuery hook
   - Applies different sizing rules for mobile, tablet, and desktop devices

3. **Size Presets**
   - Predefined size configurations for common use cases:
     - **Compact**: Smaller charts for dashboards and tight spaces (4:3 ratio)
     - **Standard**: Default sizing for general use (16:9 ratio)
     - **Large**: Expanded charts for detailed analysis (16:9 ratio)
     - **Report**: Optimized for PDF/print reports (3:2 ratio)
     - **Dashboard**: Designed for dashboard tiles (5:3 ratio)

4. **Configurable Constraints**
   - Minimum height ensures charts are never too small to read
   - Maximum height prevents charts from becoming unwieldy
   - Aspect ratio control maintains proper chart proportions
   - Optional property to allow smaller sizes on mobile for better fit

### Future Accessibility Improvements

1. **Advanced Screen Reader Features**
   - Add chart summary announcements
   - Implement pattern recognition to describe trends automatically
   - Enable navigation by data series in multi-series charts

2. **Enhanced Color Accessibility**
   - Add support for additional color blindness types
   - Implement pattern fills for better differentiation
   - Provide user-configurable color schemes

3. **Global Accessibility Controls**
   - Create a central accessibility panel in settings
   - Allow users to save their accessibility preferences
   - Implement system preference detection (prefers-reduced-motion, prefers-contrast)

4. **Advanced Responsive Features**
   - Implement automatic font size scaling for better readability
   - Add context-aware density adjustments for data points
   - Create optimized mobile-specific chart layouts

5. **Accessibility Testing**
   - Implement automated accessibility testing
   - Conduct user testing with assistive technology users
   - Create comprehensive accessibility documentation

## Examples

### Basic Usage
```jsx
import { AccessibleChartRenderer } from './utils/reportGenerator';

<AccessibleChartRenderer
  title="Energy Consumption"
  subtitle="Monthly trends"
  configuration={chartConfig}
  themeName="energy"
  showExportOptions={true}
/>
```

### With Advanced Accessibility Options
```jsx
<AccessibleChartRenderer
  title="Power Factor Analysis"
  subtitle="Comparison of equipment performance"
  configuration={chartConfig}
  themeName="energy"
  ariaLabel="Power factor comparison chart showing improvements after equipment upgrades"
  showExportOptions={true}
  highContrastDefault={true} // Override global settings
  dataTableView={true} // Show data table by default
/>
```

### With Responsive Sizing Options
```jsx
<AccessibleChartRenderer
  title="Energy Usage Distribution"
  configuration={chartConfig}
  sizePreset="dashboard"
  minHeight={200} // Override preset's default min height
  aspectRatio={1.5} // Override preset's default aspect ratio
  allowSmallerOnMobile={true}
/>
```

## Conclusion

The implemented chart accessibility features significantly improve the usability of the Energy Audit Platform for users with disabilities. By following the WCAG 2.1 AA standards, we've ensured that our charts are accessible to a wide range of users, including those who rely on keyboards, screen readers, and other assistive technologies.

The responsive sizing implementation further enhances the user experience by ensuring charts are properly sized and maintained across different devices and viewport sizes, improving readability and interaction on all platforms.

Future improvements will focus on enhancing the user experience further and adding more advanced accessibility features based on user feedback. 