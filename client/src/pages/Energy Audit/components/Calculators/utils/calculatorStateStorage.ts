/**
 * Calculator State Storage Utility
 * 
 * This utility provides persistence for calculator states using localStorage.
 * Features:
 * - Auto-save with throttling to prevent excessive writes
 * - Draft recovery after page refresh/navigation
 * - Separate storage for each calculator type
 * - Type-safe interfaces for calculator state management
 */

import { debounce } from 'lodash';

// Define calculator types supported by the system
export type CalculatorType = 
  | 'schedule-of-loads'
  | 'voltage-drop'
  | 'lighting'
  | 'power-factor'
  | 'harmonic-distortion'
  | 'economic-analysis'
  | 'roi'
  | 'energy';

// Interface for stored calculator data with metadata
export interface StoredCalculatorState<T> {
  calculatorType: CalculatorType;
  lastModified: string;
  state: T;
  isAutoSaved: boolean;
  version: string;
}

// Default storage keys
const STORAGE_PREFIX = 'energy-audit-calculator';
const DRAFT_SUFFIX = '-draft';
const CURRENT_VERSION = '1.0.0';

/**
 * Save calculator state to localStorage
 * 
 * @param calculatorType The type of calculator
 * @param state The calculator state to save
 * @param isDraft Whether this is a draft (auto-saved) state or user-saved state
 */
export function saveCalculatorState<T>(
  calculatorType: CalculatorType,
  state: T,
  isDraft = false
): void {
  try {
    const key = getStorageKey(calculatorType, isDraft);
    
    const storedData: StoredCalculatorState<T> = {
      calculatorType,
      lastModified: new Date().toISOString(),
      state,
      isAutoSaved: isDraft,
      version: CURRENT_VERSION
    };
    
    localStorage.setItem(key, JSON.stringify(storedData));
  } catch (error) {
    console.error('Failed to save calculator state:', error);
  }
}

/**
 * Load calculator state from localStorage
 * 
 * @param calculatorType The type of calculator
 * @param preferDraft Whether to prefer draft state over saved state if both exist
 * @returns The stored calculator state or null if not found
 */
export function loadCalculatorState<T>(
  calculatorType: CalculatorType,
  preferDraft = true
): T | null {
  try {
    // Check for draft state first if preferDraft is true
    if (preferDraft) {
      const draftKey = getStorageKey(calculatorType, true);
      const draftData = localStorage.getItem(draftKey);
      
      if (draftData) {
        const parsedDraft = JSON.parse(draftData) as StoredCalculatorState<T>;
        return parsedDraft.state;
      }
    }
    
    // Check for saved state
    const savedKey = getStorageKey(calculatorType, false);
    const savedData = localStorage.getItem(savedKey);
    
    if (savedData) {
      const parsedSaved = JSON.parse(savedData) as StoredCalculatorState<T>;
      return parsedSaved.state;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to load calculator state:', error);
    return null;
  }
}

/**
 * Check if a draft state exists for a calculator
 * 
 * @param calculatorType The type of calculator
 * @returns True if a draft exists, false otherwise
 */
export function hasDraftState(calculatorType: CalculatorType): boolean {
  try {
    const draftKey = getStorageKey(calculatorType, true);
    return localStorage.getItem(draftKey) !== null;
  } catch (error) {
    console.error('Failed to check for draft state:', error);
    return false;
  }
}

/**
 * Clear a draft state for a calculator
 * 
 * @param calculatorType The type of calculator
 */
export function clearDraftState(calculatorType: CalculatorType): void {
  try {
    const draftKey = getStorageKey(calculatorType, true);
    localStorage.removeItem(draftKey);
  } catch (error) {
    console.error('Failed to clear draft state:', error);
  }
}

/**
 * Get metadata about stored calculator state
 * 
 * @param calculatorType The type of calculator
 * @param isDraft Whether to check draft or saved state
 * @returns Metadata about the stored state or null if not found
 */
export function getStateMetadata(
  calculatorType: CalculatorType,
  isDraft = false
): Pick<StoredCalculatorState<any>, 'lastModified' | 'version'> | null {
  try {
    const key = getStorageKey(calculatorType, isDraft);
    const data = localStorage.getItem(key);
    
    if (data) {
      const parsed = JSON.parse(data) as StoredCalculatorState<any>;
      return {
        lastModified: parsed.lastModified,
        version: parsed.version
      };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get state metadata:', error);
    return null;
  }
}

/**
 * Create an auto-save function with debounce to prevent frequent writes
 * 
 * @param calculatorType The type of calculator
 * @param delay Debounce delay in milliseconds
 * @returns A debounced function that saves state as draft
 */
export function createAutoSave<T>(
  calculatorType: CalculatorType,
  delay = 2000
): (state: T) => void {
  return debounce((state: T) => {
    saveCalculatorState(calculatorType, state, true);
  }, delay);
}

/**
 * Get the storage key for a calculator type
 * 
 * @param calculatorType The type of calculator
 * @param isDraft Whether this is for a draft state
 * @returns The storage key
 */
function getStorageKey(calculatorType: CalculatorType, isDraft: boolean): string {
  return `${STORAGE_PREFIX}-${calculatorType}${isDraft ? DRAFT_SUFFIX : ''}`;
}

/**
 * Clear all calculator state data from localStorage
 */
export function clearAllCalculatorState(): void {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear all calculator state:', error);
  }
}

export default {
  saveCalculatorState,
  loadCalculatorState,
  hasDraftState,
  clearDraftState,
  getStateMetadata,
  createAutoSave,
  clearAllCalculatorState
}; 