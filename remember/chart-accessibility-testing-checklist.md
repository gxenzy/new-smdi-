# Chart Accessibility Testing Checklist

Use this checklist to verify that chart components meet accessibility requirements before deployment.

## Initial Setup and Visual Design

- [ ] Chart has a clear, descriptive title that explains its purpose
- [ ] All axes have clearly labeled titles (for applicable chart types)
- [ ] Legend is provided for charts with multiple data series
- [ ] Font size is sufficient (minimum 14px for most text, 12px for secondary text)
- [ ] Chart dimensions allow adequate space for all elements without crowding
- [ ] Chart layout adapts appropriately to different screen sizes

## Color and Contrast

- [ ] Chart uses a color palette with sufficient contrast ratio (minimum 4.5:1)
- [ ] Data visualization does not rely solely on color to convey information
- [ ] Pattern fills or texture markers supplement color coding
- [ ] Key data points have additional visual emphasis (e.g., bold, larger size)
- [ ] Chart functions correctly with high contrast mode enabled
- [ ] Chart remains legible with simulated color blindness

## Keyboard Navigation

- [ ] All interactive chart elements can be reached via keyboard
- [ ] Focus indicators are clearly visible on interactive elements
- [ ] Logical tab order follows a predictable sequence
- [ ] Keyboard shortcuts (if provided) are documented and do not conflict with browser/screen reader shortcuts
- [ ] Focus is appropriately managed (e.g., focus is moved to relevant element after user actions)

## Screen Reader Support

- [ ] Chart container has an appropriate aria-label or aria-labelledby attribute
- [ ] SVG elements include appropriate role and aria attributes
- [ ] Complex charts include aria-describedby pointing to a detailed description
- [ ] Alternative text representation (data table) is available
- [ ] Screen reader announcements include relevant trend information or insights
- [ ] Dynamically updating charts announce relevant changes to screen readers

## Data Tables and Alternatives

- [ ] Data table accurately represents all information shown in the chart
- [ ] Table includes appropriate headers for rows and columns
- [ ] Table structure makes logical sense when navigated with a screen reader
- [ ] Data values include appropriate units of measurement
- [ ] Table includes a caption that describes the data

## Testing with the Accessibility Test Suite

- [ ] Run Chart Accessibility Test Suite on the component
- [ ] Verify chart passes all critical and serious accessibility checks
- [ ] Address (or document exceptions for) all violations
- [ ] Test chart with all supported chart types that apply to this data
- [ ] Test with pattern fills enabled and disabled
- [ ] Test with high contrast mode enabled and disabled

## Cross-Browser and Assistive Technology Testing

- [ ] Verify chart functions as expected in Chrome, Firefox, Safari, and Edge
- [ ] Test chart with NVDA screen reader (Windows)
- [ ] Test chart with VoiceOver screen reader (macOS/iOS if applicable)
- [ ] Test chart with screen magnification
- [ ] Verify chart is usable with voice recognition software (if applicable)

## Documentation

- [ ] Chart accessibility features are documented for developers
- [ ] User-facing documentation explains how to access alternative views
- [ ] Keyboard shortcuts or special interactions are documented
- [ ] Known limitations are documented with workarounds

## Final Verification

- [ ] Chart passes the complete Chart Accessibility Test Suite without critical or serious violations
- [ ] All test results are documented and archived
- [ ] Any exceptions to accessibility guidelines are justified and approved
- [ ] Remediation plan exists for any deferred accessibility issues

## Common Issues to Watch For

- Insufficient contrast between data series
- Missing or incomplete alternative text
- Keyboard traps or navigation issues
- Missing aria attributes or improper semantic structure
- Animation that cannot be paused or stopped
- Charts that are too small or crowded on mobile devices
- Tooltips or popups that are not accessible to keyboard or screen readers

---

By completing this checklist for each chart component, you help ensure that data visualizations are accessible to all users, including those with disabilities. 