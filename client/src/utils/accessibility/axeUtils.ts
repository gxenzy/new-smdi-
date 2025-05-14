import { AxeResults, Result, NodeResult } from 'axe-core';

/**
 * Interface for the accessibility violation
 */
export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: {
    html: string;
    target: string[];
    failureSummary: string;
  }[];
}

/**
 * Interface for test results
 */
export interface AccessibilityTestResult {
  violations: AccessibilityViolation[];
  passes: number;
  incomplete: number;
  inapplicable: number;
  timestamp: string;
}

/**
 * Configuration for accessibility tests
 */
export interface AccessibilityTestConfig {
  /**
   * Rules to include in the analysis
   */
  include?: string[];
  
  /**
   * Rules to exclude from the analysis
   */
  exclude?: string[];
  
  /**
   * Element selector to analyze (defaults to document)
   */
  selector?: string;
  
  /**
   * Context object for the test (for testing specific components)
   */
  context?: Element | Document;
}

/**
 * Initialize axe-core in development environments
 * 
 * This should be called early in the application bootstrap process
 */
export const initializeAxe = async (): Promise<void> => {
  if (process.env.NODE_ENV !== 'production') {
    try {
      // Dynamically import axe-core only in non-production environments
      const axe = await import('axe-core');
      const React = await import('react');
      const ReactDOM = await import('react-dom');
      
      // Log initialization without @axe-core/react dependency
      // We'll use manual configuration instead
      console.log('axe-core initialized for accessibility testing');
      
      // Configure axe-core for the application
      // This is a manual alternative to @axe-core/react
      axe.configure({
        rules: [
          // Add any custom rule configurations here
        ]
      });
    } catch (error) {
      console.error('Failed to initialize axe-core:', error);
    }
  }
};

/**
 * Run accessibility tests on a DOM element
 * 
 * @param config Configuration options for the test
 * @returns Promise resolving to test results
 */
export const runAccessibilityTests = async (
  config: AccessibilityTestConfig = {}
): Promise<AccessibilityTestResult> => {
  // Only run in non-production environments
  if (process.env.NODE_ENV === 'production') {
    return {
      violations: [],
      passes: 0,
      incomplete: 0,
      inapplicable: 0,
      timestamp: new Date().toISOString()
    };
  }

  try {
    // Dynamically import axe-core
    const axe = await import('axe-core');
    
    // Configure axe
    const axeConfig: any = {
      runOnly: config.include ? { type: 'tag', values: config.include } : undefined,
      rules: config.exclude ? config.exclude.reduce((rules: any, ruleId) => {
        rules[ruleId] = { enabled: false };
        return rules;
      }, {}) : undefined
    };
    
    // Run axe analysis with proper type handling
    const results = await axe.run(
      config.context || document,
      { ...axeConfig }
    ) as unknown as AxeResults;
    
    // Format results with proper type conversions
    return {
      violations: results.violations.map(violation => ({
        id: violation.id,
        impact: violation.impact as 'minor' | 'moderate' | 'serious' | 'critical',
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        nodes: violation.nodes.map(node => ({
          html: node.html,
          target: Array.isArray(node.target) 
            ? node.target.map(t => String(t)) 
            : [String(node.target)],
          failureSummary: node.failureSummary || ''
        }))
      })),
      passes: results.passes.length,
      incomplete: results.incomplete.length,
      inapplicable: results.inapplicable.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Accessibility test failed:', error);
    throw error;
  }
};

/**
 * Utility to test a specific React component for accessibility issues
 * 
 * @param componentId HTML ID of the component to test
 * @param rules Optional array of specific rule IDs to test against
 * @returns Promise resolving to test results
 */
export const testComponentAccessibility = async (
  componentId: string,
  rules?: string[]
): Promise<AccessibilityTestResult> => {
  const element = document.getElementById(componentId);
  
  if (!element) {
    throw new Error(`Component with ID "${componentId}" not found`);
  }
  
  return runAccessibilityTests({
    context: element,
    include: rules
  });
};

/**
 * Format accessibility violations for logging or display
 * 
 * @param violations Array of accessibility violations
 * @returns Formatted string representation
 */
export const formatViolations = (violations: AccessibilityViolation[]): string => {
  if (violations.length === 0) {
    return 'No accessibility violations found.';
  }
  
  return violations.map(violation => {
    const nodeInfo = violation.nodes.map(node => 
      `- Element: ${node.target.join(', ')}\n  HTML: ${node.html}\n  Issue: ${node.failureSummary}`
    ).join('\n');
    
    return `
VIOLATION: ${violation.id} (${violation.impact})
Description: ${violation.description}
Help: ${violation.help}
More info: ${violation.helpUrl}
Affected elements:
${nodeInfo}
`;
  }).join('\n---\n');
};

/**
 * Log accessibility test results to the console
 * 
 * @param results Test results to log
 */
export const logAccessibilityResults = (results: AccessibilityTestResult): void => {
  console.group('Accessibility Test Results');
  console.log(`Timestamp: ${results.timestamp}`);
  console.log(`Passes: ${results.passes}`);
  console.log(`Violations: ${results.violations.length}`);
  console.log(`Incomplete: ${results.incomplete}`);
  console.log(`Inapplicable: ${results.inapplicable}`);
  
  if (results.violations.length > 0) {
    console.group('Violations');
    console.log(formatViolations(results.violations));
    console.groupEnd();
  }
  
  console.groupEnd();
};

/**
 * Check if a specific component is accessible
 * Throw an error if violations are found
 * 
 * @param componentId HTML ID of the component to test
 * @param rules Optional array of specific rule IDs to test against
 */
export const assertComponentAccessible = async (
  componentId: string,
  rules?: string[]
): Promise<void> => {
  const results = await testComponentAccessibility(componentId, rules);
  
  if (results.violations.length > 0) {
    throw new Error(`Accessibility violations found: ${formatViolations(results.violations)}`);
  }
}; 