/**
 * Chart Manager - Utility for managing Chart.js instances
 * 
 * This utility handles proper chart instance lifecycle management to prevent
 * canvas reuse errors and memory leaks with Chart.js.
 */

import React from 'react';
import Chart from 'chart.js/auto';
import { ChartConfiguration, ChartTypeRegistry } from 'chart.js';

/**
 * Chart instance manager - handles proper chart creation, storage, and cleanup
 * to prevent "Canvas is already in use" errors
 */
class ChartManager {
  private instances: Map<string, Chart>;
  
  constructor() {
    this.instances = new Map();
  }
  
  /**
   * Create a new chart instance, cleaning up any existing chart on the same canvas
   * 
   * @param canvasId The ID of the canvas element
   * @param config Chart configuration
   * @returns The created Chart instance
   */
  create<TType extends keyof ChartTypeRegistry>(
    canvasId: string, 
    config: ChartConfiguration<TType>
  ): Chart | null {
    try {
      // Destroy any existing chart on this canvas
      this.destroy(canvasId);
      
      // Get canvas element
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      if (!canvas) {
        console.error(`Canvas with ID ${canvasId} not found`);
        return null;
      }
      
      // Create and store new chart
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error(`Could not get 2D context for canvas ${canvasId}`);
        return null;
      }
      
      const chart = new Chart(ctx, config as any);
      this.instances.set(canvasId, chart);
      
      return chart;
    } catch (error) {
      console.error(`Error creating chart on canvas ${canvasId}:`, error);
      return null;
    }
  }
  
  /**
   * Destroy a chart instance by canvas ID
   * 
   * @param canvasId The ID of the canvas element
   * @returns True if a chart was destroyed, false otherwise
   */
  destroy(canvasId: string): boolean {
    try {
      if (this.instances.has(canvasId)) {
        const chart = this.instances.get(canvasId);
        if (chart) {
          chart.destroy();
          this.instances.delete(canvasId);
          return true;
        }
      }
      
      // Also check for any Chart.js instances that might exist on this canvas
      // but aren't tracked by our manager (belt and suspenders approach)
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      if (canvas && (canvas as any).__chartjs__) {
        // This is a Chart.js internal property
        const chartInstances = (canvas as any).__chartjs__.instances || [];
        for (const instanceId in chartInstances) {
          if (chartInstances[instanceId]) {
            chartInstances[instanceId].destroy();
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error(`Error destroying chart for canvas ${canvasId}:`, error);
      return false;
    }
  }
  
  /**
   * Destroy all chart instances managed by this ChartManager
   */
  destroyAll(): void {
    try {
      this.instances.forEach((chart, canvasId) => {
        this.destroy(canvasId);
      });
      this.instances.clear();
    } catch (error) {
      console.error('Error destroying all charts:', error);
    }
  }
  
  /**
   * Get a chart instance by canvas ID
   * 
   * @param canvasId The ID of the canvas element
   * @returns The Chart instance or null if not found
   */
  get(canvasId: string): Chart | null {
    return this.instances.get(canvasId) || null;
  }
  
  /**
   * Check if a chart exists for the given canvas ID
   * 
   * @param canvasId The ID of the canvas element
   * @returns True if a chart exists, false otherwise
   */
  exists(canvasId: string): boolean {
    return this.instances.has(canvasId);
  }
  
  /**
   * Get the number of chart instances being managed
   */
  get count(): number {
    return this.instances.size;
  }
}

// Create a singleton instance
export const chartManager = new ChartManager();

/**
 * React hook for creating charts with proper cleanup
 * Usage:
 * 
 * useChartEffect((canvasRef) => {
 *   // Create and return chart config
 *   return { type: 'bar', data: {...}, options: {...} };
 * }, [dependencies]);
 */
export function useChartEffect(
  createConfig: () => ChartConfiguration | null,
  canvasId: string,
  dependencies: React.DependencyList = []
): void {
  React.useEffect(() => {
    const config = createConfig();
    if (!config) return;
    
    const chart = chartManager.create(canvasId, config);
    
    // Return cleanup function
    return () => {
      chartManager.destroy(canvasId);
    };
  }, dependencies);
}

export default chartManager; 