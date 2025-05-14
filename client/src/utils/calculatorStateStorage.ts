/**
 * Calculator State Storage
 * 
 * A utility for managing persistence of calculator state to localStorage with
 * throttled auto-save functionality to prevent performance issues.
 */

import { useEffect, useMemo } from 'react';

export class CalculatorStateStorage<T> {
  private storageKey: string;
  private throttleMs: number;
  private throttleTimer: number | null = null;
  
  /**
   * Create a new calculator state storage manager
   * 
   * @param calculatorType The type of calculator (used in storage key)
   * @param throttleMs The throttle time for auto-save in milliseconds
   */
  constructor(calculatorType: string, throttleMs = 2000) {
    this.storageKey = `energy-audit-${calculatorType}-state`;
    this.throttleMs = throttleMs;
  }
  
  /**
   * Save state to localStorage with throttling
   * 
   * @param state The state to save
   */
  saveState(state: T): void {
    if (this.throttleTimer) {
      window.clearTimeout(this.throttleTimer);
    }
    
    this.throttleTimer = window.setTimeout(() => {
      try {
        const serializedState = JSON.stringify({
          state,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem(this.storageKey, serializedState);
      } catch (error) {
        console.error('Error saving calculator state:', error);
      }
    }, this.throttleMs);
  }
  
  /**
   * Load state from localStorage
   * 
   * @returns The saved state or null if none exists
   */
  loadState(): { state: T; timestamp: string } | null {
    try {
      const savedItem = localStorage.getItem(this.storageKey);
      if (!savedItem) return null;
      
      return JSON.parse(savedItem);
    } catch (error) {
      console.error('Error loading calculator state:', error);
      return null;
    }
  }
  
  /**
   * Clear saved state
   */
  clearState(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Error clearing calculator state:', error);
    }
  }
  
  /**
   * Check if there is a saved state
   * 
   * @returns True if there is a saved state, false otherwise
   */
  hasSavedState(): boolean {
    return localStorage.getItem(this.storageKey) !== null;
  }
  
  /**
   * Get the timestamp of the last save
   * 
   * @returns The timestamp or null if no saved state
   */
  getSavedTimestamp(): string | null {
    const savedData = this.loadState();
    return savedData ? savedData.timestamp : null;
  }
}

/**
 * React hook for auto-saving calculator state
 * 
 * @param state The state to auto-save
 * @param calculatorType The type of calculator
 * @param throttleMs The throttle time in milliseconds
 * @returns The storage manager instance
 */
export function useAutoSave<T>(
  state: T,
  calculatorType: string,
  throttleMs = 2000
): CalculatorStateStorage<T> {
  const storage = useMemo(
    () => new CalculatorStateStorage<T>(calculatorType, throttleMs),
    [calculatorType, throttleMs]
  );
  
  useEffect(() => {
    storage.saveState(state);
  }, [state, storage]);
  
  return storage;
}

/**
 * Calculate how long ago a timestamp was in a human-readable format
 * 
 * @param timestamp The ISO timestamp
 * @returns A human-readable string (e.g., "5 minutes ago")
 */
export function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const savedDate = new Date(timestamp);
  const diffMs = now.getTime() - savedDate.getTime();
  
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

export default CalculatorStateStorage; 