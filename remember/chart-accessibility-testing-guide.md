# Chart Accessibility Testing Guide

This guide provides step-by-step instructions for testing chart accessibility using the ChartAccessibilityTest component and real-world assistive technologies.

## Using the ChartAccessibilityTest Component

The ChartAccessibilityTest component provides automated testing capabilities for chart accessibility:

1. **Select Chart Type**: Choose from bar, line, pie, doughnut, radar, or scatter charts
2. **Configure Test Options**: Select which aspects to test:
   - Keyboard Accessibility
   - Screen Reader Accessibility
   - High Contrast Mode
   - Data Table View
3. **Run Tests**: Click "Run Accessibility Tests" to execute automated tests
4. **Review Results**: Examine the test results panel for violations and recommendations
5. **Download Report**: Generate and download a comprehensive test report in Markdown format

## Testing with Screen Readers

### NVDA (Windows)

1. **Setup**:
   - Download and install NVDA from [nvaccess.org](https://www.nvaccess.org/download/)
   - Start NVDA (Ctrl+Alt+N)
   - Use NVDA+Space to toggle focus mode

2. **Chart Testing Procedure**:
   - Navigate to the chart using Tab key
   - Listen for chart title and type announcement
   - Use arrow keys to navigate between data points
   - Press Alt+D to toggle data table view
   - Press Alt+H to open keyboard shortcuts dialog
   - Press Alt+A to hear chart summary

3. **Evaluation Criteria**:
   - Chart should be announced with title and chart type
   - Data points should be announced with values when navigating
   - Keyboard shortcuts should be properly announced
   - Data table should be navigable and readable

### JAWS (Windows)

1. **Setup**:
   - Install JAWS trial or licensed version
   - Start JAWS
   - Use JAWS key+Z to toggle focus mode

2. **Chart Testing Procedure**:
   - Same procedure as with NVDA
   - Use JAWS key+F9 to create a frame list
   - Use JAWS key+F7 to list form elements

3. **Evaluation Criteria**:
   - Same criteria as NVDA
   - Verify proper region/landmark announcements
   - Check for consistent behavior with form controls

### VoiceOver (macOS)

1. **Setup**:
   - Enable VoiceOver with Command+F5
   - Use VO+A to start reading automatically
   - Use VO+Shift+Down to interact with elements

2. **Chart Testing Procedure**:
   - Use VO+Right/Left to move through elements
   - Use VO+Space to activate the current element
   - Test keyboard shortcuts (Alt+A, Alt+D, Alt+H)

3. **Evaluation Criteria**:
   - Chart should be recognized and properly announced
   - Navigation should allow exploring data points
   - Chart summary should be comprehensive

## Testing High Contrast Mode

1. **Windows High Contrast Mode**:
   - Enable Windows High Contrast Mode (Alt+Left Shift+Print Screen)
   - Verify chart elements remain distinguishable
   - Check focus indicators visibility

2. **Browser High Contrast Extensions**:
   - Install high contrast browser extensions
   - Enable extension and test chart visibility
   - Verify color differentiation between data points

3. **Application High Contrast Setting**:
   - Enable high contrast setting in the application
   - Test with different chart types
   - Verify pattern fills work correctly when colors aren't sufficient

## Testing Keyboard-Only Navigation

1. **Focus Management Testing**:
   - Navigate using only the Tab key
   - Verify focus order is logical
   - Check that focus doesn't get trapped
   - Ensure focus indicators are visible

2. **Chart Navigation Testing**:
   - Tab to chart element
   - Use arrow keys to navigate data points
   - Use Home/End to jump to first/last data points
   - Test keyboard shortcuts functionality

## Documenting Test Results

Use the screen reader test template to document your findings:

1. **Test Configuration**:
   - Chart type
   - Screen reader/assistive technology
   - Browser and OS version

2. **Test Results**:
   - Chart navigation
   - Data table accessibility
   - Keyboard shortcuts functionality
   - Focus management
   - High contrast mode

3. **Issues Found**:
   - Document each issue with:
     - Description
     - Severity
     - Steps to reproduce
     - Expected vs. actual behavior

4. **Recommendations**:
   - Provide clear, prioritized recommendations for fixing issues

## Automated Testing

The ChartAccessibilityTest component uses axe-core to perform automated testing, which checks for:

1. **ARIA Attributes**: Proper role, label, and description attributes
2. **Keyboard Accessibility**: Focusable elements and keyboard interaction
3. **Color Contrast**: Sufficient contrast for text and graphical objects
4. **Alternative Content**: Text alternatives for non-text content

Remember that automated testing cannot catch all accessibility issues, which is why manual testing with real assistive technologies is crucial.

## Common Issues and Solutions

### Focus Management Issues

**Problem**: Focus gets lost or isn't visible when navigating charts.
**Solution**: Implement proper focus handling in useChartKeyboardNavigation hook and ensure visual focus indicators are displayed using chartFocusIndicators utility.

### Screen Reader Announcement Issues

**Problem**: Charts aren't properly announced or lack descriptive content.
**Solution**: Add appropriate ARIA attributes and implement chart summaries that describe the data patterns.

### Keyboard Navigation Issues

**Problem**: Chart data points aren't navigable with keyboard.
**Solution**: Ensure useChartKeyboardNavigation is properly integrated and test with KeyboardShortcutHelp component to verify shortcuts work.

### Data Table Alternative Issues

**Problem**: Data table view isn't accessible to screen readers.
**Solution**: Ensure table has proper markup with headers and data cells correctly associated.

## Testing Checklist

- [ ] Tested with NVDA screen reader
- [ ] Tested with JAWS screen reader
- [ ] Tested with VoiceOver (if on macOS)
- [ ] Tested with high contrast mode
- [ ] Tested with keyboard-only navigation
- [ ] Ran automated tests with ChartAccessibilityTest
- [ ] Verified all focus indicators are visible
- [ ] Checked that all keyboard shortcuts work
- [ ] Verified that chart summary is informative
- [ ] Ensured data table alternative is properly formatted 