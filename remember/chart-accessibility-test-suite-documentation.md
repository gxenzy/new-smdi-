# Chart Accessibility Test Suite Documentation

## Overview

The Chart Accessibility Test Suite is a comprehensive tool designed to help developers test, verify, and improve the accessibility of chart components in the Energy Audit Platform. It provides automated testing for WCAG 2.1 AA compliance, generates detailed reports about accessibility issues, and offers remediation recommendations.

## Features

### 1. Multi-Chart Type Testing

The test suite supports testing of multiple chart types:
- Bar charts
- Line charts
- Pie charts
- Doughnut charts
- Radar charts
- Scatter charts

Each chart type can be configured with different data sets, themes, and accessibility options to test various scenarios.

### 2. Accessibility Testing Tools

The test suite includes:
- Automated WCAG 2.1 AA compliance testing using axe-core
- Detailed violation reporting with severity classification
- Element-specific feedback for accessibility issues
- Links to relevant WCAG guidelines and documentation
- Remediation recommendations for each violation

### 3. Screen Reader Compatibility Testing

Features for testing screen reader experience:
- Preview of screen reader announcements
- Data table representation of chart data
- Verification of chart summaries and descriptions
- Assessment of semantic structure and ARIA attributes

### 4. Test History and Reporting

The test suite maintains a history of tests run and provides:
- Detailed test reports with complete results
- Downloadable test results in text format
- Configuration tracking for test comparison
- Historical analysis of accessibility improvements

## Usage Guide

### Accessing the Test Suite

1. Navigate to `/settings/accessibility/test-suite` in the application
2. The test suite will load with the default bar chart configuration

### Running a Basic Test

1. Select a chart type from the "Chart Type" dropdown
2. Choose a theme from the "Theme" dropdown
3. Configure accessibility options (Pattern Fills, High Contrast Mode)
4. Click "Run Accessibility Test"
5. Review the results in the "Test Results" tab

### Understanding Test Results

The test results page shows:
- A summary of passes, violations, and incomplete tests
- Detailed information about each violation
- The severity of each issue (critical, serious, moderate, minor)
- Code snippets of affected elements
- Failure summaries explaining why elements failed

### Using the Screen Reader Tab

The Screen Reader tab shows:
1. A preview of what screen readers will announce
2. A data table representation of the chart data
3. Both are automatically generated based on the current chart configuration

### Working with Test History

The Test History tab provides:
1. A chronological list of all tests run
2. Test configurations and results summaries
3. The ability to clear the history when needed

## Best Practices

### Testing Different Chart Types

Always test all chart types used in your application:
- Different chart types present different accessibility challenges
- Focus on chart types used for critical data visualization
- Test with real data samples representative of actual usage

### Testing Accessibility Options

Test charts with various accessibility features enabled:
- Pattern fills for color-blind users
- High contrast mode for low vision users
- Different themes to assess color contrast
- Various data configurations (single/multiple datasets)

### Analyzing Test Results

When reviewing test results:
1. Focus on critical and serious violations first
2. Look for patterns across different chart types
3. Verify fixes by running the test again after changes
4. Document recurring issues for future prevention

### Screen Reader Optimization

To improve screen reader experience:
1. Ensure chart titles and labels are descriptive
2. Provide data summaries that explain key insights
3. Test with keyboard navigation to verify tab order
4. Include alternative text that describes the chart's purpose

## Common Accessibility Issues and Solutions

### 1. Insufficient Color Contrast

**Issue**: Colors used in charts don't have sufficient contrast ratio (at least 4.5:1).

**Solution**:
- Enable high contrast mode
- Use darker/more saturated colors for important data
- Add borders to distinguish between similar colors
- Implement pattern fills to add texture distinction

### 2. Missing Alternative Text

**Issue**: Charts lack proper descriptions for screen reader users.

**Solution**:
- Add aria-label attributes to chart containers
- Include detailed descriptions using aria-describedby
- Provide data tables as alternatives to visual charts
- Use ChartScreenReaderPanel component for detailed explanations

### 3. Keyboard Navigation Issues

**Issue**: Chart elements can't be navigated or activated with keyboard.

**Solution**:
- Ensure all interactive elements are focusable
- Add keyboard shortcuts for common operations
- Provide visual focus indicators
- Implement arrow key navigation between data points

### 4. Complex Data Visualization

**Issue**: Charts with multiple data series are difficult to understand for assistive technology users.

**Solution**:
- Break complex charts into simpler components
- Provide text summaries highlighting key insights
- Use pattern fills and shape markers for data points
- Create interactive exploration mode for complex data

## Extending the Test Suite

Developers can extend the test suite by:

1. Adding new chart type support in `getDefaultChartConfig()`
2. Creating custom test configurations in `TestConfig` interface
3. Adding new accessibility checks in the `runAccessibilityTests()` function
4. Implementing additional report formats in `downloadTestReport()`

## Integration with Development Workflow

For optimal use of the Chart Accessibility Test Suite:

1. Run tests during development of new chart components
2. Include in CI/CD pipeline for automated testing
3. Use as part of code review process for chart-related changes
4. Document test results for accessibility compliance records

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/)
- [Data Visualization Accessibility](https://www.w3.org/WAI/tutorials/images/complex/)
- [axe-core Documentation](https://github.com/dequelabs/axe-core/blob/master/doc/API.md)
- [Chart.js Accessibility](https://www.chartjs.org/docs/latest/general/accessibility.html) 