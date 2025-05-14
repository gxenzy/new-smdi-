# Accessibility Testing Documentation

## Overview

This document explains how to use the accessibility testing tools in the Energy Audit Platform to ensure WCAG 2.1 AA compliance.

## Tools Available

### 1. Accessibility Tester Component

The `AccessibilityTester` component provides automated testing for any chart or component:

- Runs axe-core tests on the component
- Shows detailed accessibility violations
- Provides severity indicators and recommendations
- Offers links to learn more about each issue

### 2. Chart Type Selector

The `ChartTypeSelector` component allows testing of different chart types:

- Bar charts
- Line charts
- Pie charts 
- Doughnut charts
- Bubble charts
- Radar charts

### 3. Accessibility Chart Example

The `AccessibilityChartExample` component demonstrates accessible charts with:

- High contrast mode toggle
- Pattern fills for color-blind users
- Proper ARIA labels and keyboard navigation

## How to Use

### Automated Accessibility Testing

1. Navigate to `/settings/accessibility/testing` in the application
2. Select the chart type you want to test from the tabs
3. Click "Run Accessibility Test" to analyze the chart
4. Review any violations that are found
5. Expand violations to see detailed information and recommendations

### Testing Charts During Development

To test a chart during development:

```tsx
import { AccessibilityTester } from '../components/UI/AccessibilityTester';

// Within your component
<AccessibilityTester
  title="My Chart Test"
  chartConfig={myChartConfig}
  themeName="energy"
/>
```

### Testing Other Components

To test any component, wrap it with the `AccessibilityTester`:

```tsx
import { runAccessibilityTests } from '../utils/accessibility/axeUtils';

// Testing a specific component by ID
const testResults = await runAccessibilityTests({
  context: document.getElementById('my-component')
});

// Log the results
console.log(testResults);
```

## Common Accessibility Issues

### Charts

1. **Missing Text Alternatives**
   - All charts must have appropriate `aria-label` attributes
   - Data tables should be provided as alternatives to charts

2. **Insufficient Color Contrast**
   - Chart elements must have sufficient contrast ratios
   - Use high contrast mode and patterns for better visibility

3. **Keyboard Navigation**
   - All chart elements should be navigable with keyboard
   - Focus indicators should be visible

### Forms and Controls

1. **Missing Labels**
   - All form elements must have proper labels
   - Use `aria-label` or `aria-labelledby` when necessary

2. **Focus Management**
   - Focus order should be logical and intuitive
   - Focus should be trapped within modals

## Fixing Accessibility Issues

1. **Missing Text Alternatives**
   - Add `ariaLabel` prop to `AccessibleChartRenderer`
   - Provide data tables with `ChartDataTable` component

2. **Color Contrast Issues**
   - Enable high contrast mode with `useAccessibilitySettings` hook
   - Use pattern fills with the pattern generator utility

3. **Keyboard Navigation Issues**
   - Use the `useChartKeyboardNavigation` hook
   - Add keyboard event handlers for Enter/Space/Arrow keys

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [axe-core Rule Descriptions](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [Chart.js Accessibility](https://www.chartjs.org/docs/latest/general/accessibility.html)
- [Material UI Accessibility](https://mui.com/material-ui/guides/accessibility/) 