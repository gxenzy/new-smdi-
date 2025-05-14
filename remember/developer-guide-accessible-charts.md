# Developer Guide: Creating Accessible Charts

This guide provides step-by-step instructions for implementing accessible charts in the Energy Audit Platform. By following these practices, you'll create data visualizations that are accessible to all users, including those with disabilities.

## Quick Reference

### Components to Use
- `AccessibleChartRenderer` - For Chart.js implementations
- `ResponsiveAccessibleChart` - For responsive Chart.js implementations
- `ChartScreenReaderPanel` - For enhanced screen reader support
- `AccessibilitySettingsProvider` - For global accessibility settings

### Utilities to Import
- `createChartDescription` - For generating descriptive text
- `generateChartScreenReaderText` - For screen reader announcements
- `createAccessibleDataTable` - For tabular alternatives
- `applyPatternFillsToDatasets` - For pattern fill support
- `runAccessibilityTests` - For testing accessibility compliance

## Implementing an Accessible Chart

### Step 1: Import Required Components and Utilities

```tsx
import { AccessibleChartRenderer } from '../../utils/reportGenerator/ChartAccessibilityProvider';
import { createChartDescription, generateChartScreenReaderText } from '../../utils/accessibility/chartScreenReaderUtils';
import { useAccessibilitySettings } from '../../contexts/AccessibilitySettingsContext';
```

### Step 2: Set Up Chart Configuration

```tsx
// Define chart configuration with WCAG-compliant options
const chartConfig: ChartConfiguration = {
  type: 'bar', // or 'line', 'pie', etc.
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Energy Consumption',
      data: [65, 59, 80, 81, 56, 55],
      backgroundColor: '#4e79a7', // Use WCAG-compliant colors
      // Add borderColor and borderWidth for better contrast
      borderColor: '#ffffff',
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      // Enable and configure tooltip
      tooltip: {
        enabled: true,
        // Make tooltips accessible
        cornerRadius: 5,
        padding: 10,
        // Increase font size for better readability
        titleFont: { size: 16 },
        bodyFont: { size: 14 }
      },
      // Add descriptive title
      title: {
        display: true,
        text: 'Monthly Energy Consumption',
        font: { size: 18 }
      },
      // Enable legend with accessible options
      legend: {
        display: true,
        position: 'top',
        labels: {
          // Increase padding for touch targets
          padding: 20,
          // Increase font size for readability
          font: { size: 14 }
        }
      }
    },
    // Configure axes for accessible rendering
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month',
          font: { size: 14 }
        },
        ticks: {
          font: { size: 14 }
        },
        grid: {
          display: true
        }
      },
      y: {
        title: {
          display: true,
          text: 'Energy Consumption (kWh)',
          font: { size: 14 }
        },
        ticks: {
          font: { size: 14 }
        },
        grid: {
          display: true
        }
      }
    },
    // Important for keyboard navigation
    interaction: {
      intersect: false,
      mode: 'index'
    }
  }
};
```

### Step 3: Implement the Chart Component

```tsx
// In your component
const MyAccessibleChart: React.FC = () => {
  // Get accessibility settings
  const { highContrastMode, usePatternFills } = useAccessibilitySettings();
  const [screenReaderText, setScreenReaderText] = useState<string>('');
  
  // Generate screen reader text when chart config changes
  useEffect(() => {
    const srText = generateChartScreenReaderText(chartConfig);
    setScreenReaderText(srText);
  }, [chartConfig]);
  
  return (
    <div className="chart-container">
      {/* Provide an accessible title with appropriate heading level */}
      <h2 id="chart-title">Monthly Energy Consumption</h2>
      
      {/* Container for the chart with appropriate ARIA attributes */}
      <div 
        aria-labelledby="chart-title"
        aria-describedby="chart-description"
        role="img"
      >
        <AccessibleChartRenderer
          configuration={chartConfig}
          // Use theme based on accessibility settings
          themeName={highContrastMode ? 'highContrast' : 'default'}
          height={300}
          // Enable pattern fills for color blindness support
          usePatternFills={usePatternFills}
          sizePreset="standard"
        />
      </div>
      
      {/* Hidden element with chart description for screen readers */}
      <div id="chart-description" className="visually-hidden">
        {screenReaderText}
      </div>
      
      {/* Include data table for screen readers */}
      <div className="visually-hidden">
        {createAccessibleDataTable(chartConfig)}
      </div>
      
      {/* Optional: Add visible screen reader panel for all users */}
      <ChartScreenReaderPanel
        chartConfig={chartConfig}
        showDataTable={true}
        showTrendSummary={true}
      />
    </div>
  );
};
```

### Step 4: Add CSS for Accessibility

```css
/* Add to your CSS/SCSS file */

/* Style for visually hidden elements (accessible to screen readers) */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Ensure focus indicators are clearly visible */
.chart-container:focus,
.chart-container button:focus,
.chart-container a:focus {
  outline: 2px solid #4299e1;
  outline-offset: 2px;
}

/* High contrast mode styles will be applied automatically by AccessibleChartRenderer */
```

### Step 5: Test Accessibility

```tsx
// In a test file or development environment
import { runAccessibilityTests } from '../../utils/accessibility/axeUtils';

// Test your component
const testChartAccessibility = async () => {
  const chartElement = document.querySelector('.chart-container');
  if (chartElement) {
    const results = await runAccessibilityTests({
      context: chartElement
    });
    
    console.log('Accessibility test results:', results);
    
    // Check for violations
    if (results.violations.length > 0) {
      console.error('Accessibility violations found:', results.violations);
    } else {
      console.log('No accessibility violations found!');
    }
  }
};

// Run the test after component renders
useEffect(() => {
  testChartAccessibility();
}, []);
```

## Advanced Techniques

### Making Interactive Charts Accessible

For charts with interactive elements:

1. **Ensure keyboard navigability**:
```tsx
// Add keyboard event listeners
const handleKeyDown = (e: React.KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowRight':
      // Move to next data point
      nextDataPoint();
      break;
    case 'ArrowLeft':
      // Move to previous data point
      previousDataPoint();
      break;
    case 'Enter':
      // Activate current data point
      activateDataPoint();
      break;
    // Add other key handlers as needed
  }
};

// Apply to chart container
<div 
  role="application" 
  aria-label="Interactive Energy Consumption Chart"
  tabIndex={0}
  onKeyDown={handleKeyDown}
>
  {/* Chart component */}
</div>
```

2. **Add focus management**:
```tsx
// Track focus state
const [focusedPoint, setFocusedPoint] = useState<number | null>(null);

// Update visual indication of focus
useEffect(() => {
  if (focusedPoint !== null) {
    // Highlight the focused point
    highlightDataPoint(focusedPoint);
    
    // Announce to screen readers
    announceToScreenReader(`Selected data point: ${data[focusedPoint]} kWh in ${labels[focusedPoint]}`);
  }
}, [focusedPoint]);
```

3. **Announce changes to screen readers**:
```tsx
// Create a live region for announcements
const [announcement, setAnnouncement] = useState<string>('');

const announceToScreenReader = (message: string) => {
  setAnnouncement(message);
};

// Include in component JSX
<div aria-live="polite" className="visually-hidden">
  {announcement}
</div>
```

### Supporting Multiple Themes and Color Schemes

```tsx
// Define theme options based on accessibility needs
const getThemeOptions = (
  highContrast: boolean,
  colorBlindnessType: string | null
) => {
  if (highContrast) {
    return {
      backgroundColor: '#000000',
      borderColor: '#ffffff',
      colors: ['#ffffff', '#ffff00', '#00ffff', '#ff00ff', '#00ff00']
    };
  }
  
  if (colorBlindnessType === 'protanopia') {
    return {
      colors: ['#0072B2', '#E69F00', '#56B4E9', '#009E73', '#F0E442']
    };
  }
  
  // Default theme
  return {
    colors: ['#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f']
  };
};

// Use in component
const { highContrastMode, colorBlindnessType } = useAccessibilitySettings();
const themeOptions = getThemeOptions(highContrastMode, colorBlindnessType);

// Apply to chart config
const chartConfig = {
  // ...other config
  data: {
    datasets: [{
      // ...other dataset properties
      backgroundColor: themeOptions.colors[0],
      borderColor: themeOptions.borderColor || themeOptions.colors[0]
    }]
  }
};
```

## Troubleshooting Common Issues

### Chart Not Rendering Accessibly

**Issue**: Chart renders but fails accessibility tests.

**Solution**:
1. Check that all text has sufficient size (14px minimum)
2. Verify color contrast ratios meet WCAG AA (4.5:1)
3. Ensure all interactive elements are keyboard accessible
4. Add proper ARIA attributes to chart container
5. Include alternative text or data table

### Pattern Fills Not Displaying

**Issue**: Pattern fills aren't appearing when enabled.

**Solution**:
```tsx
// Ensure pattern fills are properly applied
import { applyPatternFillsToDatasets } from '../../utils/accessibility/enhancedPatternFills';

// Deep clone the configuration to avoid modifying the original
const configWithPatterns = JSON.parse(JSON.stringify(chartConfig));

// Apply pattern fills before rendering
if (usePatternFills) {
  applyPatternFillsToDatasets(configWithPatterns);
}

// Use the modified config
<AccessibleChartRenderer
  configuration={configWithPatterns}
  // other props...
/>
```

### Screen Reader Announcements Not Working

**Issue**: Screen readers don't announce chart data.

**Solution**:
1. Verify the chart has proper ARIA attributes
2. Check that screen reader text is correctly generated
3. Ensure the text is not hidden in a way that screen readers can't access
4. Consider adding explicit live regions for dynamic updates

```tsx
// Add proper ARIA attributes
<div 
  role="img" 
  aria-label="Chart showing energy consumption trends"
  aria-describedby="chart-description"
>
  {/* Chart component */}
</div>

// Add accessible description
<div id="chart-description" className="visually-hidden">
  Energy consumption trends show a peak in April with 81 kWh and lowest 
  consumption in June with 55 kWh. The overall trend shows a 15% decrease 
  from January to June.
</div>
```

## Best Practices Summary

1. **Always include a clear title and description** for each chart
2. **Use the AccessibleChartRenderer component** for all Chart.js charts
3. **Include a data table alternative** for complex visualizations
4. **Test with the Chart Accessibility Test Suite** before deployment
5. **Support keyboard navigation** for interactive charts
6. **Enable pattern fills** for users with color vision deficiencies
7. **Support high contrast mode** for users with low vision
8. **Include screen reader announcements** for important data insights
9. **Follow WCAG 2.1 AA guidelines** for all chart components
10. **Document accessibility features** for end users

By following this guide, you'll create chart components that are accessible to users with a wide range of abilities and disabilities. 