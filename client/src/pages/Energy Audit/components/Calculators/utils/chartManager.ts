/**
 * Chart Manager Utility
 * 
 * This utility provides centralized management for Chart.js instances
 * to prevent common issues like "Canvas is already in use" errors.
 * It tracks chart instances and ensures proper cleanup when components unmount.
 */

import { Chart, ChartConfiguration, ChartType } from 'chart.js';

// Interface for tracking chart instances
interface ChartInstance {
  id: string;
  chart: Chart;
  canvasId: string;
  lastUpdated: Date;
}

class ChartManager {
  // Store all active chart instances
  private chartInstances: Map<string, ChartInstance> = new Map();
  
  /**
   * Create a new chart instance with proper tracking
   * 
   * @param canvasId The ID of the canvas element
   * @param chartId A unique ID for this chart (defaults to canvas ID if not provided)
   * @param config Chart.js configuration
   * @returns The created Chart instance
   */
  createChart(
    canvasId: string,
    chartId: string | undefined,
    config: ChartConfiguration
  ): Chart | null {
    // Use canvas ID as chart ID if not provided
    const id = chartId || canvasId;
    
    try {
      // Check if a chart with this ID already exists
      if (this.chartInstances.has(id)) {
        // Destroy the existing chart before creating a new one
        this.destroyChart(id);
      }
      
      // Check if canvas exists
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      if (!canvas) {
        console.error(`Canvas with ID '${canvasId}' not found`);
        return null;
      }
      
      // Create new chart
      const chart = new Chart(canvas, config);
      
      // Store the chart instance
      this.chartInstances.set(id, {
        id,
        chart,
        canvasId,
        lastUpdated: new Date()
      });
      
      return chart;
    } catch (error) {
      console.error('Error creating chart:', error);
      
      // Handle the common "Canvas is already in use" error
      if (error instanceof Error && error.message.includes('Canvas is already in use')) {
        // Find and destroy any chart using this canvas
        this.destroyChartByCanvasId(canvasId);
        
        // Retry chart creation after cleanup
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvas) {
          console.error(`Canvas with ID '${canvasId}' not found on retry`);
          return null;
        }
        
        // Create new chart after cleanup
        const chart = new Chart(canvas, config);
        
        // Store the chart instance
        this.chartInstances.set(id, {
          id,
          chart,
          canvasId,
          lastUpdated: new Date()
        });
        
        return chart;
      }
      
      return null;
    }
  }
  
  /**
   * Get an existing chart instance by ID
   * 
   * @param chartId The ID of the chart to retrieve
   * @returns The Chart instance or null if not found
   */
  getChart(chartId: string): Chart | null {
    const instance = this.chartInstances.get(chartId);
    return instance ? instance.chart : null;
  }
  
  /**
   * Update an existing chart with new data or configuration
   * 
   * @param chartId The ID of the chart to update
   * @param updateFn Function to update the chart
   * @returns The updated Chart instance or null if not found
   */
  updateChart(chartId: string, updateFn: (chart: Chart) => void): Chart | null {
    const instance = this.chartInstances.get(chartId);
    
    if (instance) {
      updateFn(instance.chart);
      instance.lastUpdated = new Date();
      instance.chart.update();
      return instance.chart;
    }
    
    return null;
  }
  
  /**
   * Destroy a chart instance by ID
   * 
   * @param chartId The ID of the chart to destroy
   * @returns True if destroyed, false if not found
   */
  destroyChart(chartId: string): boolean {
    const instance = this.chartInstances.get(chartId);
    
    if (instance) {
      try {
        instance.chart.destroy();
        this.chartInstances.delete(chartId);
        return true;
      } catch (error) {
        console.error(`Error destroying chart with ID '${chartId}':`, error);
        // Still remove from tracking even if there was an error
        this.chartInstances.delete(chartId);
      }
    }
    
    return false;
  }
  
  /**
   * Destroy a chart instance by canvas ID
   * 
   * @param canvasId The ID of the canvas element
   * @returns True if any chart was destroyed
   */
  destroyChartByCanvasId(canvasId: string): boolean {
    let destroyed = false;
    
    // Find all charts using this canvas
    const entries = Array.from(this.chartInstances.entries());
    for (const [id, instance] of entries) {
      if (instance.canvasId === canvasId) {
        try {
          instance.chart.destroy();
          this.chartInstances.delete(id);
          destroyed = true;
        } catch (error) {
          console.error(`Error destroying chart with canvas ID '${canvasId}':`, error);
          // Still remove from tracking even if there was an error
          this.chartInstances.delete(id);
          destroyed = true;
        }
      }
    }
    
    return destroyed;
  }
  
  /**
   * Destroy all chart instances
   * Useful for cleanup on app unmount
   */
  destroyAllCharts(): void {
    const entries = Array.from(this.chartInstances.entries());
    for (const [id, instance] of entries) {
      try {
        instance.chart.destroy();
      } catch (error) {
        console.error(`Error destroying chart with ID '${id}':`, error);
      }
    }
    
    this.chartInstances.clear();
  }
  
  /**
   * Check if a chart with the given ID exists
   * 
   * @param chartId The ID of the chart to check
   * @returns True if the chart exists
   */
  hasChart(chartId: string): boolean {
    return this.chartInstances.has(chartId);
  }
  
  /**
   * Get the count of active chart instances
   * 
   * @returns The number of active charts
   */
  getChartCount(): number {
    return this.chartInstances.size;
  }
  
  /**
   * Get information about all active charts
   * Useful for debugging
   */
  getChartInfo(): Array<{
    id: string;
    canvasId: string;
    lastUpdated: Date;
    type: string;
  }> {
    return Array.from(this.chartInstances.values()).map(instance => {
      // Safely access chart type - it could be in different locations depending on Chart.js version
      let chartType = 'unknown';
      try {
        // Try different ways to access the chart type
        if (instance.chart.config && typeof instance.chart.config === 'object') {
          // Modern Chart.js (v3+)
          const config = instance.chart.config as any;
          if (config.type) {
            chartType = config.type;
          } 
          // For older Chart.js or alternative structures
          else if (config.data && config.data.type) {
            chartType = config.data.type;
          }
        }
      } catch (e) {
        // Fallback if any error occurs
        console.error('Error getting chart type:', e);
      }
      
      return {
        id: instance.id,
        canvasId: instance.canvasId,
        lastUpdated: instance.lastUpdated,
        type: chartType
      };
    });
  }
}

// Create a singleton instance for the entire application
const chartManager = new ChartManager();

export default chartManager; 