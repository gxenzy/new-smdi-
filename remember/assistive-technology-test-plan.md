# Assistive Technology Testing Plan for Charts

## Goals

The primary goals of this testing plan are to:

1. Verify that chart components are accessible to users of assistive technologies
2. Identify and document any barriers to accessibility
3. Ensure compliance with WCAG 2.1 AA standards
4. Validate the efficacy of our keyboard navigation and screen reader support

## Technologies to Test

### Screen Readers

- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)
- Narrator (Windows)
- TalkBack (Android)

### Keyboard-Only Navigation

- Standard keyboard
- Keyboard with specialized accessibility features

### Other Assistive Technologies

- Dragon NaturallySpeaking (voice control)
- Switch control devices
- Screen magnifiers (Windows Magnifier, ZoomText)
- High contrast mode

## Test Environment

For each assistive technology, test with the following browsers:

- Chrome (latest version)
- Firefox (latest version)
- Safari (latest version, for macOS/iOS)
- Edge (latest version)

## Chart Types to Test

1. Bar charts (single and multi-series)
2. Line charts (single and multi-series)
3. Pie/doughnut charts
4. Radar charts
5. Scatter plots

## Test Scenarios

### Basic Chart Accessibility

1. **Chart Initialization:**
   - Load page containing chart
   - Verify chart container has appropriate ARIA role and label
   - Verify chart title and description are accessible

2. **Chart Container Focus:**
   - Tab to chart component
   - Verify focus indicator is visible
   - Verify screen reader announces the chart type and title

### Keyboard Navigation

1. **Within-Chart Navigation:**
   - Tab to chart
   - Use arrow keys to navigate between data points
   - Verify each data point is announced
   - Use Home/End keys to navigate to first/last data points

2. **Multi-Dataset Navigation:**
   - For charts with multiple datasets, verify up/down arrows navigate between datasets
   - Verify correct dataset and data point are announced

3. **Keyboard Shortcuts:**
   - Test Alt+H to open keyboard shortcuts help
   - Test Alt+D to toggle data table view
   - Test Alt+A to hear chart summary
   - Test Escape to exit chart navigation

### Data Table Accessibility

1. **Data Table View:**
   - Toggle data table view
   - Verify table has appropriate ARIA role, headers, and labels
   - Navigate table with keyboard
   - Verify screen reader announces headers and data cells correctly

### High Contrast Mode

1. **Visual Discrimination:**
   - Enable high contrast mode
   - Verify chart elements are distinguishable
   - Verify data points are identifiable
   - Verify focus indicators are visible

2. **Pattern Differentiation:**
   - For charts using patterns (instead of colors), verify patterns are distinguishable
   - Verify legend clearly indicates pattern meanings

## Detailed Test Cases

### Screen Reader Test Cases

| ID | Test Description | Expected Outcome | Screen Readers |
|----|------------------|------------------|----------------|
| SR1 | Tab to chart component | Chart title and type announced | All |
| SR2 | Navigate to first data point | Data point value and label announced | All |
| SR3 | Navigate between data points | Each data point announced as focused | All |
| SR4 | Access data table view | Table presence announced, headers read | All |
| SR5 | Use Alt+A for chart summary | Chart summary announced | All |
| SR6 | Open keyboard shortcuts dialog | Dialog announced, content accessible | All |

### Keyboard Navigation Test Cases

| ID | Test Description | Expected Outcome | Browsers |
|----|------------------|------------------|----------|
| KN1 | Tab to chart | Focus indicator visible on chart | All |
| KN2 | Arrow key navigation | Focus moves between data points | All |
| KN3 | Home/End navigation | Focus moves to first/last data point | All |
| KN4 | Escape key | Exit chart navigation mode | All |
| KN5 | Enter/Space on data point | Data point selected/activated | All |
| KN6 | Alt+D shortcut | Toggle data table view | All |

### High Contrast Mode Test Cases

| ID | Test Description | Expected Outcome | Browsers |
|----|------------------|------------------|----------|
| HC1 | Enable high contrast mode | Chart colors adapt for contrast | All |
| HC2 | Focus indicators in high contrast | Focus indicators visible with sufficient contrast | All |
| HC3 | Legends in high contrast | Legend text and symbols distinguishable | All |
| HC4 | Data point selection in high contrast | Selected data point clearly highlighted | All |

## Testing Process

For each chart type and assistive technology combination:

1. Open the test page containing the chart
2. Activate the assistive technology
3. Complete each test case in sequence
4. Document any issues or barriers encountered
5. Capture screenshots/recordings where appropriate
6. Complete the test report

## Test Report Template

Use the following format for documenting test results:

```markdown
# Assistive Technology Test Report

## Test Configuration
- **Chart Type:** [Bar/Line/Pie/etc.]
- **Assistive Technology:** [NVDA/JAWS/VoiceOver/etc.]
- **Browser:** [Chrome/Firefox/Safari/Edge]
- **OS:** [Windows/macOS/iOS/Android]
- **Test Date:** [YYYY-MM-DD]
- **Tester:** [Name]

## Test Results

| ID | Test Case | Result | Notes |
|----|-----------|--------|-------|
| SR1 | Chart announcement | Pass/Fail | [Observations] |
| SR2 | Data point navigation | Pass/Fail | [Observations] |
| ... | ... | ... | ... |

## Issues Found

### Issue 1: [Brief Description]
- **Severity:** [Critical/High/Medium/Low]
- **Test Case:** [ID]
- **Steps to Reproduce:**
  1. [Step 1]
  2. [Step 2]
  3. [Step 3]
- **Expected Behavior:** [Description]
- **Actual Behavior:** [Description]
- **Screen Recording/Screenshot:** [Link/Attachment]

## Recommendations
- [Recommendation 1]
- [Recommendation 2]
```

## Test Prioritization

Prioritize testing as follows:

1. **High Priority:**
   - NVDA with Chrome (Windows)
   - VoiceOver with Safari (macOS)
   - Keyboard-only navigation on all browsers

2. **Medium Priority:**
   - JAWS with Edge (Windows)
   - TalkBack with Chrome (Android)
   - High Contrast Mode on Windows

3. **Lower Priority:**
   - Narrator with Edge (Windows)
   - Dragon NaturallySpeaking
   - Switch control devices

## Success Criteria

Testing is considered successful if:

1. All charts are navigable with keyboard alone
2. Screen readers correctly announce chart information and data points
3. Data table view is fully accessible
4. High contrast mode is functional and effective
5. All keyboard shortcuts work as expected
6. Focus management prevents focus traps or lost focus
7. No critical or high-severity issues are found

## Follow-up Actions

After testing is complete:

1. Document all issues in the issue tracker
2. Prioritize issues based on severity
3. Create tickets for necessary fixes
4. Schedule follow-up testing for implemented fixes
5. Update accessibility documentation based on findings 