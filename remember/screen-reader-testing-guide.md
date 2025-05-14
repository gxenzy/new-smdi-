# Screen Reader Testing Guide for Charts

## Overview

This document provides guidance on how to test chart components with screen readers to ensure they are accessible to users with visual impairments. Testing with screen readers is an essential part of the accessibility verification process.

## Recommended Screen Readers

We recommend testing with the following screen readers to ensure broad compatibility:

1. **NVDA** (NonVisual Desktop Access) - Free, open-source screen reader for Windows
   - Download from: [https://www.nvaccess.org/download/](https://www.nvaccess.org/download/)

2. **JAWS** (Job Access With Speech) - Commercial screen reader for Windows
   - A free demo is available from: [https://www.freedomscientific.com/products/software/jaws/](https://www.freedomscientific.com/products/software/jaws/)

3. **VoiceOver** - Built-in screen reader for macOS and iOS
   - Already included with macOS (activate with Cmd+F5)

4. **Narrator** - Built-in screen reader for Windows
   - Already included with Windows (activate with Windows+Ctrl+Enter)

## Testing Setup

### NVDA Setup

1. Install NVDA from the download link above
2. Start NVDA (it will announce itself when active)
3. Use NVDA+Space to enter/exit focus mode for forms
4. Use Tab key to navigate between elements
5. Use arrow keys to navigate within elements
6. Use NVDA+F7 to view a list of all elements

### VoiceOver Setup (macOS)

1. Turn on VoiceOver by pressing Cmd+F5
2. Use VO+Right Arrow (VO is Control+Option) to move through elements
3. Use VO+Space to activate an element
4. Use VO+U to access the rotor for additional navigation options

## Test Scenarios

Test the following scenarios with each screen reader:

### 1. Chart Navigation and Exploration

1. **Initial Focus:**
   - Tab to the chart component
   - Verify that the screen reader announces the chart title and type
   - Verify that it provides instructions on how to explore the chart

2. **Data Navigation:**
   - Use arrow keys to navigate between data points
   - Verify the screen reader announces each data point's value and label
   - Verify that data point focus is correctly announced

3. **Chart Summary:**
   - Press Alt+A to hear the chart summary
   - Verify that the summary accurately describes the main trends and insights

### 2. Data Table View

1. **Accessing Data Table:**
   - Press Alt+D to switch to data table view
   - Verify that the screen reader announces the switch to data table view

2. **Data Table Navigation:**
   - Tab to the data table
   - Navigate through the rows and columns
   - Verify that headers and data cells are properly announced

### 3. Keyboard Shortcuts Guide

1. **Accessing Keyboard Shortcuts:**
   - Press Alt+H to open the keyboard shortcuts guide
   - Verify that the dialog is announced when opened
   - Verify that the shortcuts are navigable and readable

2. **Closing Dialog:**
   - Close the shortcuts dialog
   - Verify focus returns to the previous location

## Testing Checklist

For each chart, verify:

- [ ] Chart has an appropriate ARIA label or title
- [ ] Chart type is announced
- [ ] Data points are navigable with keyboard
- [ ] Data values are announced when navigating
- [ ] Chart summary is available and accurate
- [ ] Data table view is accessible
- [ ] Keyboard shortcuts are functioning
- [ ] Focus management is working (focus is not lost after interactions)
- [ ] High contrast mode is effective and announced

## Common Issues and Solutions

### Issue: Screen reader doesn't announce chart type
**Solution:** Ensure the chart has an appropriate role and aria-label that includes the chart type.

### Issue: Screen reader doesn't announce data values
**Solution:** Verify that data points have appropriate aria-label attributes or that the chart is using accessible techniques to make data values available.

### Issue: Keyboard navigation doesn't work
**Solution:** Check that the chart container has tabindex="0" and appropriate keyboard event listeners.

### Issue: Focus is lost after interaction
**Solution:** Implement proper focus management to ensure focus returns to a logical location.

## Testing Report Template

Use the following template to report your findings:

```markdown
# Screen Reader Accessibility Test Report

## Chart Under Test: [Chart Name]
- **Chart Type:** [Bar/Line/Pie/etc.]
- **Screen Reader:** [NVDA/JAWS/VoiceOver/Narrator]
- **Browser:** [Chrome/Firefox/Safari/Edge]

## Test Results

### Chart Navigation
- [ ] Chart is announced when focused
- [ ] Chart type is identified
- [ ] Data points are announced with values
- [ ] Navigation instructions are provided

### Data Table View
- [ ] Table view is accessible
- [ ] Headers are properly announced
- [ ] Data cells are properly announced

### Keyboard Support
- [ ] All keyboard shortcuts work
- [ ] Focus is managed correctly

## Issues Found
1. [Issue description]
   - Severity: [Critical/High/Medium/Low]
   - Steps to reproduce: [Steps]
   - Expected behavior: [Description]
   - Actual behavior: [Description]

## Recommendations
- [Recommendation 1]
- [Recommendation 2]
```

## Conclusion

Screen reader testing is a crucial part of ensuring chart accessibility. By methodically testing charts with different screen readers, we can identify and fix issues that might prevent users with visual impairments from accessing and understanding our data visualizations.

Remember that screen reader behavior can vary significantly between different readers and browsers, so thorough testing across multiple combinations is essential for comprehensive accessibility. 