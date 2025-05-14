/**
 * Utility for storing and retrieving accessibility test reports
 */

import { ChartType } from 'chart.js';

/**
 * Interface for test result item
 */
export interface TestResult {
  id: string;
  testId: string;
  testName: string;
  passed: boolean;
  notes: string;
}

/**
 * Interface for test issue item
 */
export interface TestIssue {
  id: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
}

/**
 * Interface for full test report
 */
export interface TestReport {
  id: string;
  chartType: ChartType;
  screenReader: 'NVDA' | 'JAWS' | 'VoiceOver' | 'Narrator' | 'TalkBack' | 'Other';
  browser: string;
  os: string;
  testDate: string;
  tester: string;
  results: TestResult[];
  issues: TestIssue[];
  recommendations: string[];
  additionalNotes: string;
}

// Local storage key
const STORAGE_KEY = 'chart_accessibility_test_reports';

/**
 * Save a test report to localStorage
 * 
 * @param report Test report to save
 * @returns The saved report with ID
 */
export const saveTestReport = (report: Omit<TestReport, 'id' | 'testDate'>): TestReport => {
  // Generate ID and add testDate if not provided
  const completeReport: TestReport = {
    ...report,
    id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    testDate: new Date().toISOString()
  };
  
  // Get existing reports
  const existingReports = getTestReports();
  
  // Add new report
  const updatedReports = [...existingReports, completeReport];
  
  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReports));
  
  return completeReport;
};

/**
 * Get all test reports from localStorage
 * 
 * @returns Array of test reports
 */
export const getTestReports = (): TestReport[] => {
  const storedReports = localStorage.getItem(STORAGE_KEY);
  
  if (!storedReports) {
    return [];
  }
  
  try {
    return JSON.parse(storedReports);
  } catch (error) {
    console.error('Error parsing test reports from localStorage:', error);
    return [];
  }
};

/**
 * Get a specific test report by ID
 * 
 * @param id Report ID
 * @returns Test report or null if not found
 */
export const getTestReportById = (id: string): TestReport | null => {
  const reports = getTestReports();
  const report = reports.find(r => r.id === id);
  
  return report || null;
};

/**
 * Delete a test report by ID
 * 
 * @param id Report ID
 * @returns true if deleted, false if not found
 */
export const deleteTestReport = (id: string): boolean => {
  const reports = getTestReports();
  const filteredReports = reports.filter(r => r.id !== id);
  
  if (filteredReports.length === reports.length) {
    // Report not found
    return false;
  }
  
  // Save updated reports
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredReports));
  
  return true;
};

/**
 * Update an existing test report
 * 
 * @param report Report to update
 * @returns Updated report or null if not found
 */
export const updateTestReport = (report: TestReport): TestReport | null => {
  const reports = getTestReports();
  const index = reports.findIndex(r => r.id === report.id);
  
  if (index === -1) {
    // Report not found
    return null;
  }
  
  // Update report
  reports[index] = report;
  
  // Save updated reports
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  
  return report;
};

/**
 * Export test reports to a downloadable file
 * 
 * @param reports Reports to export, or all reports if not specified
 * @returns void
 */
export const exportTestReports = (reports?: TestReport[]): void => {
  const dataToExport = reports || getTestReports();
  
  // Create JSON string
  const jsonString = JSON.stringify(dataToExport, null, 2);
  
  // Create blob
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chart-accessibility-test-reports-${new Date().toISOString().split('T')[0]}.json`;
  
  // Trigger download
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Import test reports from an uploaded file
 * 
 * @param file File to import
 * @param mode 'replace' to replace all reports, 'merge' to merge with existing
 * @returns Promise that resolves to the imported reports
 */
export const importTestReports = (file: File, mode: 'replace' | 'merge' = 'merge'): Promise<TestReport[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const reports = JSON.parse(event.target?.result as string) as TestReport[];
        
        if (!Array.isArray(reports)) {
          reject(new Error('Invalid file format. Expected an array of test reports.'));
          return;
        }
        
        if (mode === 'replace') {
          // Replace all reports
          localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
        } else {
          // Merge with existing reports
          const existingReports = getTestReports();
          
          // Filter out duplicates
          const existingIds = new Set(existingReports.map(r => r.id));
          const newReports = reports.filter(r => !existingIds.has(r.id));
          
          // Save merged reports
          localStorage.setItem(STORAGE_KEY, JSON.stringify([...existingReports, ...newReports]));
        }
        
        resolve(getTestReports());
      } catch (error) {
        reject(new Error('Error parsing file. Make sure it contains valid JSON.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file.'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Generate test report statistics
 * 
 * @returns Statistics about test reports
 */
export const getTestReportStats = () => {
  const reports = getTestReports();
  
  // Count reports by chart type
  const chartTypeCounts: Record<string, number> = {};
  
  // Count reports by screen reader
  const screenReaderCounts: Record<string, number> = {};
  
  // Count pass/fail results
  let totalTests = 0;
  let passedTests = 0;
  
  // Count issues by severity
  const issueSeverityCounts: Record<string, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  };
  
  // Process reports
  reports.forEach(report => {
    // Chart type counts
    chartTypeCounts[report.chartType] = (chartTypeCounts[report.chartType] || 0) + 1;
    
    // Screen reader counts
    screenReaderCounts[report.screenReader] = (screenReaderCounts[report.screenReader] || 0) + 1;
    
    // Test result counts
    report.results.forEach(result => {
      totalTests++;
      if (result.passed) {
        passedTests++;
      }
    });
    
    // Issue severity counts
    report.issues.forEach(issue => {
      issueSeverityCounts[issue.severity]++;
    });
  });
  
  return {
    totalReports: reports.length,
    chartTypeCounts,
    screenReaderCounts,
    testStats: {
      total: totalTests,
      passed: passedTests,
      failed: totalTests - passedTests,
      passRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0
    },
    issueCounts: {
      total: Object.values(issueSeverityCounts).reduce((a, b) => a + b, 0),
      critical: issueSeverityCounts.critical,
      high: issueSeverityCounts.high,
      medium: issueSeverityCounts.medium,
      low: issueSeverityCounts.low
    }
  };
}; 