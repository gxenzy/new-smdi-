/**
 * Circuit Insights Dashboard Types
 * 
 * This file defines TypeScript interfaces for the Circuit Insights Dashboard
 */

/**
 * Circuit compliance status
 */
export type CircuitComplianceStatus = 'compliant' | 'nonCompliant' | 'critical';

/**
 * Circuit information for analysis
 */
export interface CircuitInfo {
  id: string;
  name: string;
  panelId: string;
  panelName: string;
  voltageDrop: number;
  current?: number;
  conductorSize?: string;
  optimalSize?: string;
}

/**
 * Summary of circuit voltage drop analysis
 */
export interface CircuitAnalysisSummary {
  totalCircuits: number;
  compliantCircuits: number;
  nonCompliantCircuits: number;
  highestVoltageDrop: {
    value: number;
    circuitId: string;
    circuitName: string;
    panelId: string;
  };
  averageVoltageDrop: number;
  criticalCircuits: CircuitInfo[];
}

/**
 * Filter configuration for circuit insights
 */
export interface CircuitInsightFilters {
  panelId?: string;
  complianceStatus?: CircuitComplianceStatus;
  sortBy?: string;
  searchQuery?: string;
  showCriticalOnly?: boolean;
}

/**
 * Data structure for panel-level voltage drop summary
 */
export interface PanelVoltageSummary {
  panelId: string;
  panelName: string;
  averageVoltageDrop: number;
  maxVoltageDrop: number;
  compliantCount: number;
  nonCompliantCount: number;
  totalCircuits: number;
  criticalCircuitCount: number;
}

/**
 * Optimization opportunity data structure
 */
export interface OptimizationOpportunity {
  circuitId: string;
  circuitName: string;
  panelId: string;
  panelName: string;
  currentSize: string;
  recommendedSize: string;
  voltageDrop: {
    current: number;
    afterOptimization: number;
  };
  costSavings?: {
    materialCost: number;
    energySavings: number;
    paybackPeriod: number;
  };
  priority: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Recommendation type for circuit insights dashboard
 */
export interface CircuitInsightRecommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  relatedCircuits: string[];
  actionType: 'resize' | 'reconfigure' | 'redistribute' | 'review';
} 