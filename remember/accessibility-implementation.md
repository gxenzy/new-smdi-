# Accessibility Implementation Guide

## Overview
This document outlines the accessibility improvements implemented in the Energy Audit Platform, focusing on keyboard navigation, focus management, screen reader compatibility, and chart accessibility. We've added a reusable `useFocusManagement` hook that helps manage focus within modals, dialogs, and other UI components, and implemented comprehensive chart accessibility features.

## Focus Management Hook

### Location
`client/src/hooks/useFocusManagement.ts`

### Purpose
The `useFocusManagement` hook provides a standardized way to handle focus management within modals, drawers, and other UI elements. It handles:

- Focus trapping within dialogs and menus
- Return focus when closing dialogs
- Initial focus management
- Keyboard navigation support
- ARIA compliance

### Usage

#### Basic Usage

```tsx
import { useFocusManagement } from '../hooks/useFocusManagement';

const MyDialog = ({ open, onClose }) => {
  const { containerRef, handleKeyDown } = useFocusManagement(open, {
    onEscapeKey: onClose
  });
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      onKeyDown={handleKeyDown}
      ref={containerRef as React.Ref<HTMLDivElement>}
    >
      {/* Dialog content */}
    </Dialog>
  );
};
```

#### Options

The hook accepts the following options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `autoFocus` | boolean | `true` | Whether to focus the first focusable element when the container is shown |
| `returnFocus` | boolean | `true` | Whether to return focus to the previously focused element when closed |
| `focusDelay` | number | `100` | Delay in milliseconds before focusing the first element |
| `focusableSelector` | string | (standard selector) | Custom selector for finding focusable elements |
| `onEscapeKey` | function | undefined | Callback function to run when Escape key is pressed |
| `trapFocus` | boolean | `true` | Whether to trap the focus inside the container |

#### Return Values

The hook returns an object with these properties:

| Property | Type | Description |
|----------|------|-------------|
| `containerRef` | React.RefObject | Ref to attach to the container element |
| `handleKeyDown` | function | Event handler for keyboard events |
| `getFocusableElements` | function | Returns all focusable elements in the container |
| `focusElementByIndex` | function | Focus a specific element by index |
| `focusFirstElement` | function | Focus the first focusable element |
| `focusLastElement` | function | Focus the last focusable element |

## Implementation Examples

### Modal Dialog (LoadCircuitDialog.tsx)

We've enhanced the `LoadCircuitDialog` component with:

1. Proper ARIA attributes and roles
2. Focus management using the `useFocusManagement` hook
3. Keyboard navigation support
4. Screen reader compatibility
5. Proper focus trapping

Key changes:

```tsx
const { containerRef, handleKeyDown } = useFocusManagement(open, {
  autoFocus: true,
  returnFocus: true,
  trapFocus: true,
  onEscapeKey: onClose
});

// Use in Dialog
<Dialog
  open={open}
  onClose={onClose}
  aria-labelledby="load-circuit-dialog-title"
  onKeyDown={handleKeyDown}
  ref={containerRef as React.Ref<HTMLDivElement>}
>
  <DialogTitle id="load-circuit-dialog-title">
    {/* Dialog title */}
  </DialogTitle>
  {/* Dialog content */}
</Dialog>
```

### Menu Component (MobileMenu.tsx)

We've enhanced the `MobileMenu` component with:

1. Proper ARIA attributes for menu semantics
2. Focus management using the `useFocusManagement` hook
3. Keyboard navigation support
4. Screen reader compatibility

Key changes:

```tsx
const { containerRef, handleKeyDown } = useFocusManagement(open, {
  autoFocus: true,
  returnFocus: true,
  trapFocus: true,
  onEscapeKey: onClose
});

// Use in SwipeableDrawer
<SwipeableDrawer
  open={open}
  onClose={onClose}
  onKeyDown={handleKeyDown}
  aria-label="Mobile menu"
>
  <Box
    role="menu"
    aria-orientation="vertical"
    ref={containerRef as React.Ref<HTMLDivElement>}
  >
    {/* Menu items */}
  </Box>
</SwipeableDrawer>
```

## Chart Accessibility Implementation

We've enhanced the chart components in the Energy Audit Platform to be fully accessible:

### Components Used

1. **AccessibleChartRenderer**
   - A wrapper component that renders accessible charts based on application settings
   - Automatically applies high contrast mode and data table views when enabled
   - Supports responsive sizing for different screen sizes and contexts

2. **AccessibleChart**
   - Wraps standard charts with accessibility features
   - Provides keyboard navigation for exploring data points
   - Adds screen reader announcements for data values
   - Includes data table alternative view for complex charts

3. **Custom Chart Accessibility**
   - Enhanced custom chart implementations like trend charts
   - Added keyboard navigation with arrow keys
   - Implemented hidden data tables for screen reader users
   - Added proper ARIA attributes and roles

### Usage Example

#### Replacing Standard Charts

```tsx
// Before
import InteractiveChart from './InteractiveChart';

<InteractiveChart 
  configuration={chartConfig} 
  themeName="default"
  showExportOptions
/>

// After
import { AccessibleChartRenderer } from '../../../../utils/reportGenerator/ChartAccessibilityProvider';

<AccessibleChartRenderer 
  configuration={chartConfig} 
  themeName="default"
  showExportOptions
  ariaLabel="Description of the chart for screen readers"
  sizePreset="dashboard"
/>
```

#### Enhancing Custom Charts

```tsx
// Add proper ARIA attributes
<Box 
  sx={{ height: 200, display: 'flex', alignItems: 'flex-end' }}
  role="img"
  aria-label="Chart description for screen readers"
>
  {/* Chart elements */}
</Box>

// Add keyboard navigation
const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
  switch (event.key) {
    case 'ArrowLeft':
      // Navigate to previous element
      break;
    case 'ArrowRight':
      // Navigate to next element
      break;
  }
};

// Add hidden data table for screen readers
<Box sx={{ /* visually hidden styles */ }}>
  <table aria-label="Data table alternative">
    <caption>Chart title</caption>
    <thead>
      <tr>
        <th scope="col">X-axis</th>
        <th scope="col">Y-axis</th>
      </tr>
    </thead>
    <tbody>
      {data.map((item, index) => (
        <tr key={index}>
          <th scope="row">{item.label}</th>
          <td>{item.value}</td>
        </tr>
      ))}
    </tbody>
  </table>
</Box>
```

## Best Practices

1. **Always use proper ARIA roles and attributes:**
   - Use appropriate roles (`dialog`, `menu`, `img`, etc.)
   - Add `aria-labelledby` or `aria-label` for all components
   - Use `aria-live` regions for dynamic content

2. **Ensure keyboard accessibility:**
   - Make sure all interactive elements are focusable
   - Add keyboard shortcuts for common actions
   - Support Tab, Space, Enter, and Escape keys

3. **Provide clear focus indicators:**
   - Never remove focus outlines without replacement
   - Use high-contrast focus indicators
   - Ensure focus is always visible

4. **Structure content semantically:**
   - Use proper heading levels
   - Use lists appropriately
   - Group related controls with fieldsets

5. **Test with screen readers:**
   - Test with NVDA, VoiceOver, or JAWS
   - Verify that all content is announced properly
   - Ensure interactive elements have proper roles

6. **Provide alternatives for visual content:**
   - Add data tables for charts and graphs
   - Use descriptive text for complex visualizations
   - Provide text alternatives for images

## WCAG Compliance Checklist

We're targeting WCAG 2.1 AA compliance. Key criteria addressed:

- ✅ 1.1.1 Non-text Content: Text alternatives for non-text content
- ✅ 1.3.1 Info and Relationships: Information, structure, and relationships can be programmatically determined
- ✅ 1.4.3 Contrast: Visual presentation of text and images has sufficient contrast
- ✅ 2.1.1 Keyboard: All functionality available from a keyboard
- ✅ 2.1.2 No Keyboard Trap: User can navigate away using keyboard
- ✅ 2.4.3 Focus Order: Focus order preserves meaning and operability
- ✅ 2.4.7 Focus Visible: Keyboard focus indicator is visible
- ✅ 3.2.1 On Focus: Elements don't change context on focus
- ✅ 4.1.2 Name, Role, Value: All components have proper name and role

## Next Steps

- [✅] Add screen reader support for data visualizations
- [ ] Implement high contrast mode and theme support
- [ ] Add keyboard shortcuts for common actions
- [ ] Create accessibility settings panel
- [ ] Create additional focus management patterns for other component types
- [ ] Implement comprehensive testing with screen readers and keyboard-only navigation 
- [ ] Add automated accessibility testing to CI/CD pipeline 