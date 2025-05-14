import { ChartConfiguration } from 'chart.js';
import axe, { AxeResults, Result } from 'axe-core';

/**
 * Interface for chart accessibility test options
 */
export interface ChartAccessibilityTestOptions {
  /**
   * Container element ID to run tests against
   */
  containerId: string;
  
  /**
   * Whether to test keyboard accessibility features
   */
  testKeyboardAccessibility?: boolean;
  
  /**
   * Whether to test screen reader accessibility
   */
  testScreenReaderAccessibility?: boolean;
  
  /**
   * Whether to test high contrast mode
   */
  testHighContrastMode?: boolean;
  
  /**
   * Whether to test data table view
   */
  testDataTableView?: boolean;
}

/**
 * Interface for chart accessibility test results
 */
export interface ChartAccessibilityTestResult {
  /**
   * Overall pass/fail status
   */
  passed: boolean;
  
  /**
   * List of accessibility violations
   */
  violations: Result[];
  
  /**
   * List of accessibility passes
   */
  passes: Result[];
  
  /**
   * Keyboard accessibility test results
   */
  keyboardAccessibility?: {
    /**
     * Whether the chart is keyboard navigable
     */
    isNavigable: boolean;
    
    /**
     * Whether the chart has appropriate focus indicators
     */
    hasFocusIndicators: boolean;
    
    /**
     * Whether the chart supports keyboard shortcuts
     */
    hasKeyboardShortcuts: boolean;
  };
  
  /**
   * Screen reader accessibility test results
   */
  screenReaderAccessibility?: {
    /**
     * Whether the chart has appropriate ARIA attributes
     */
    hasAriaAttributes: boolean;
    
    /**
     * Whether the chart has appropriate alternative text
     */
    hasAlternativeText: boolean;
    
    /**
     * Whether the chart has a data table available
     */
    hasDataTable: boolean;
  };
}

/**
 * Runs accessibility tests on a chart component
 * 
 * @param options Test options
 * @returns Promise resolving to test results
 */
export const testChartAccessibility = async (
  options: ChartAccessibilityTestOptions
): Promise<ChartAccessibilityTestResult> => {
  const { containerId, testKeyboardAccessibility, testScreenReaderAccessibility } = options;
  
  // Get the container element
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container element with ID "${containerId}" not found`);
  }
  
  // Run axe-core tests
  const axeResults: AxeResults = await axe.run(container);
  
  // Initialize test results
  const results: ChartAccessibilityTestResult = {
    passed: axeResults.violations.length === 0,
    violations: axeResults.violations,
    passes: axeResults.passes
  };
  
  // Test keyboard accessibility if requested
  if (testKeyboardAccessibility) {
    results.keyboardAccessibility = {
      isNavigable: checkKeyboardNavigability(container),
      hasFocusIndicators: checkFocusIndicators(container),
      hasKeyboardShortcuts: checkKeyboardShortcuts(container)
    };
  }
  
  // Test screen reader accessibility if requested
  if (testScreenReaderAccessibility) {
    results.screenReaderAccessibility = {
      hasAriaAttributes: checkAriaAttributes(container),
      hasAlternativeText: checkAlternativeText(container),
      hasDataTable: checkDataTable(container)
    };
  }
  
  return results;
};

/**
 * Checks if a chart component is keyboard navigable
 * 
 * @param container Container element
 * @returns Whether the chart is keyboard navigable
 */
const checkKeyboardNavigability = (container: HTMLElement): boolean => {
  // Check if the chart container has tabindex
  const hasTabindex = container.querySelector('[tabindex]') !== null;
  
  // Check if the chart has event listeners for keyboard navigation
  const chartElement = container.querySelector('canvas');
  if (!chartElement) return false;
  
  // In a real implementation, we would check for event listeners,
  // but since that's not directly possible, we check for related attributes
  return hasTabindex;
};

/**
 * Checks if a chart component has focus indicators
 * 
 * @param container Container element
 * @returns Whether the chart has focus indicators
 */
const checkFocusIndicators = (container: HTMLElement): boolean => {
  // In a real implementation, this would be more sophisticated
  // For now, we just check if there are styles that could indicate focus handling
  const hasOutlineStyles = container.querySelector('[style*="outline"]') !== null;
  const hasBorderStyles = container.querySelector('[style*="border"]') !== null;
  
  return hasOutlineStyles || hasBorderStyles;
};

/**
 * Checks if a chart component supports keyboard shortcuts
 * 
 * @param container Container element
 * @returns Whether the chart supports keyboard shortcuts
 */
const checkKeyboardShortcuts = (container: HTMLElement): boolean => {
  // Look for elements that might indicate keyboard shortcut support
  const hasKeyboardIcon = container.querySelector('[aria-label*="keyboard"]') !== null;
  const hasShortcutText = container.textContent?.toLowerCase().includes('keyboard') || false;
  
  return hasKeyboardIcon || hasShortcutText;
};

/**
 * Checks if a chart component has appropriate ARIA attributes
 * 
 * @param container Container element
 * @returns Whether the chart has appropriate ARIA attributes
 */
const checkAriaAttributes = (container: HTMLElement): boolean => {
  // Check for key ARIA attributes
  const hasAriaLabel = container.querySelector('[aria-label]') !== null;
  const hasAriaLabelledby = container.querySelector('[aria-labelledby]') !== null;
  const hasAriaDescribedby = container.querySelector('[aria-describedby]') !== null;
  const hasRole = container.querySelector('[role]') !== null;
  
  return hasAriaLabel || hasAriaLabelledby || hasAriaDescribedby || hasRole;
};

/**
 * Checks if a chart component has appropriate alternative text
 * 
 * @param container Container element
 * @returns Whether the chart has appropriate alternative text
 */
const checkAlternativeText = (container: HTMLElement): boolean => {
  // Check for alternative text in various forms
  const hasAltText = container.querySelector('[alt]') !== null;
  const hasAriaLabel = container.querySelector('[aria-label]') !== null;
  const hasAriaLabelledby = container.querySelector('[aria-labelledby]') !== null;
  
  return hasAltText || hasAriaLabel || hasAriaLabelledby;
};

/**
 * Checks if a chart component has a data table available
 * 
 * @param container Container element
 * @returns Whether the chart has a data table available
 */
const checkDataTable = (container: HTMLElement): boolean => {
  // Check for the presence of a table element or related attributes
  const hasTable = container.querySelector('table') !== null;
  const hasTableRole = container.querySelector('[role="table"]') !== null;
  const hasTableText = container.textContent?.toLowerCase().includes('data table') || false;
  
  return hasTable || hasTableRole || hasTableText;
};

/**
 * Formats chart accessibility test results as a report
 * 
 * @param results Test results
 * @param chartConfig Optional chart configuration to include in the report
 * @returns Formatted report
 */
export const formatTestResults = (
  results: ChartAccessibilityTestResult, 
  chartConfig?: ChartConfiguration
): string => {
  let report = '# Chart Accessibility Test Report\n\n';
  
  // Add timestamp
  report += `**Test Date:** ${new Date().toLocaleString()}\n\n`;
  
  // Add chart configuration details if provided
  if (chartConfig) {
    report += '## Chart Configuration\n\n';
    report += `- **Chart Type:** ${chartConfig.type || 'Unknown'}\n`;
    report += `- **Number of Datasets:** ${chartConfig.data?.datasets?.length || 0}\n`;
    report += `- **Number of Data Points:** ${chartConfig.data?.datasets?.[0]?.data?.length || 0}\n`;
    
    // Add title if available
    if (chartConfig.options?.plugins?.title?.text) {
      report += `- **Chart Title:** ${chartConfig.options.plugins.title.text}\n`;
    }
    
    report += '\n';
  }
  
  // Overall status
  report += `## Overall Status: ${results.passed ? 'PASSED' : 'FAILED'}\n\n`;
  
  // Violations
  report += `## Violations (${results.violations.length})\n\n`;
  if (results.violations.length > 0) {
    results.violations.forEach((violation, index) => {
      report += `### ${index + 1}. ${violation.id} - ${violation.impact} impact\n`;
      report += `**Description:** ${violation.description}\n`;
      report += `**Help:** ${violation.help}\n`;
      report += `**Help URL:** ${violation.helpUrl}\n\n`;
      
      // Add affected nodes if available
      if (violation.nodes && violation.nodes.length > 0) {
        report += `**Affected Elements:** ${violation.nodes.length}\n\n`;
        
        // List the first 5 nodes with their HTML and target
        report += '```\n';
        violation.nodes.slice(0, 5).forEach((node, nodeIndex) => {
          report += `Element ${nodeIndex + 1}: ${node.html || 'No HTML'}\n`;
          report += `Target: ${node.target || 'No target'}\n\n`;
        });
        report += '```\n\n';
      }
    });
  } else {
    report += 'No violations found.\n\n';
  }
  
  // Keyboard accessibility
  if (results.keyboardAccessibility) {
    report += '## Keyboard Accessibility\n\n';
    report += `- **Navigable:** ${results.keyboardAccessibility.isNavigable ? 'Yes' : 'No'}\n`;
    report += `- **Focus Indicators:** ${results.keyboardAccessibility.hasFocusIndicators ? 'Yes' : 'No'}\n`;
    report += `- **Keyboard Shortcuts:** ${results.keyboardAccessibility.hasKeyboardShortcuts ? 'Yes' : 'No'}\n\n`;
  }
  
  // Screen reader accessibility
  if (results.screenReaderAccessibility) {
    report += '## Screen Reader Accessibility\n\n';
    report += `- **ARIA Attributes:** ${results.screenReaderAccessibility.hasAriaAttributes ? 'Yes' : 'No'}\n`;
    report += `- **Alternative Text:** ${results.screenReaderAccessibility.hasAlternativeText ? 'Yes' : 'No'}\n`;
    report += `- **Data Table:** ${results.screenReaderAccessibility.hasDataTable ? 'Yes' : 'No'}\n\n`;
  }
  
  // Recommendations
  report += '## Recommendations\n\n';
  
  if (results.violations.length > 0) {
    report += '### Accessibility Issues to Fix\n\n';
    
    let criticalIssues = results.violations.filter(v => v.impact === 'critical');
    let seriousIssues = results.violations.filter(v => v.impact === 'serious');
    let moderateIssues = results.violations.filter(v => v.impact === 'moderate');
    
    if (criticalIssues.length > 0) {
      report += '#### Critical Issues\n\n';
      criticalIssues.forEach(issue => {
        report += `- Fix ${issue.id}: ${issue.help}. [More info](${issue.helpUrl})\n`;
      });
      report += '\n';
    }
    
    if (seriousIssues.length > 0) {
      report += '#### Serious Issues\n\n';
      seriousIssues.forEach(issue => {
        report += `- Fix ${issue.id}: ${issue.help}. [More info](${issue.helpUrl})\n`;
      });
      report += '\n';
    }
    
    if (moderateIssues.length > 0) {
      report += '#### Moderate Issues\n\n';
      moderateIssues.forEach(issue => {
        report += `- Fix ${issue.id}: ${issue.help}. [More info](${issue.helpUrl})\n`;
      });
      report += '\n';
    }
  } else {
    report += 'No accessibility issues detected. Continue to monitor with real assistive technology testing.\n\n';
  }
  
  // General recommendations based on test results
  report += '### General Improvements\n\n';
  
  if (results.keyboardAccessibility) {
    if (!results.keyboardAccessibility.isNavigable) {
      report += '- Implement keyboard navigation for the chart\n';
    }
    if (!results.keyboardAccessibility.hasFocusIndicators) {
      report += '- Add visible focus indicators to chart elements\n';
    }
    if (!results.keyboardAccessibility.hasKeyboardShortcuts) {
      report += '- Add keyboard shortcuts for common chart actions\n';
    }
  }
  
  if (results.screenReaderAccessibility) {
    if (!results.screenReaderAccessibility.hasAriaAttributes) {
      report += '- Add appropriate ARIA attributes to chart elements\n';
    }
    if (!results.screenReaderAccessibility.hasAlternativeText) {
      report += '- Add alternative text for chart elements\n';
    }
    if (!results.screenReaderAccessibility.hasDataTable) {
      report += '- Provide a data table alternative for the chart\n';
    }
  }
  
  return report;
};

/**
 * Checks if a chart configuration meets accessibility criteria
 * 
 * @param config Chart configuration
 * @returns Whether the chart configuration is accessible
 */
export const isChartConfigurationAccessible = (config: ChartConfiguration): boolean => {
  // Check for basic accessibility requirements in chart configuration
  
  // 1. Check title
  const hasTitle = config.options?.plugins?.title?.text !== undefined;
  
  // 2. Check for appropriate colors (simplified check)
  let hasAccessibleColors = true;
  if (config.data.datasets) {
    for (const dataset of config.data.datasets) {
      // This is a simplified check; a real implementation would check color contrast
      if (!dataset.backgroundColor && !dataset.borderColor) {
        hasAccessibleColors = false;
        break;
      }
    }
  }
  
  // 3. Check for labels
  const hasLabels = config.data.labels !== undefined || 
    (config.data.datasets && config.data.datasets.every(dataset => dataset.label !== undefined));
  
  return hasTitle && hasAccessibleColors && hasLabels;
}; 