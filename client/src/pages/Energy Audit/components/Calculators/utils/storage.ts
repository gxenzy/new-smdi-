/**
 * Utility functions for saving and loading calculator results to/from local storage
 */

// Storage utility for calculator results
type CalculatorType = 'illumination' | 'roi' | 'powerfactor' | 'hvac' | 'equipment' | 'harmonic';

interface StoredCalculation {
  id: string;
  name: string;
  timestamp: number;
  type: CalculatorType;
  data: any;
}

const STORAGE_KEY = 'energy-audit-calculations';

/**
 * Save a calculation result to localStorage
 * @param type The type of calculator
 * @param name Display name for the saved calculation
 * @param data The calculation data to store
 * @returns The ID of the saved calculation
 */
export const saveCalculation = (type: CalculatorType, name: string, data: any): string => {
  const id = `calc_${type}_${Date.now()}`;
  const savedCalculations = loadSavedCalculations(type);
  
  const calculation: StoredCalculation = {
    id,
    name,
    timestamp: Date.now(),
    type,
    data
  };
  
  savedCalculations.push(calculation);
  
  // Save to localStorage
  localStorage.setItem(`${type}_calculations`, JSON.stringify(savedCalculations));
  
  return id;
};

/**
 * Load all saved calculations for a specific calculator type
 * @param type The calculator type to load
 * @returns Array of stored calculations
 */
export const loadSavedCalculations = (type: CalculatorType): StoredCalculation[] => {
  const savedData = localStorage.getItem(`${type}_calculations`);
  
  if (!savedData) {
    return [];
  }
  
  try {
    return JSON.parse(savedData);
  } catch (error) {
    console.error('Error parsing saved calculations:', error);
    return [];
  }
};

/**
 * Get all stored calculations from local storage
 * 
 * @returns Array of stored calculations
 */
export const getStoredCalculations = (): StoredCalculation[] => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    
    if (!storedData) {
      return [];
    }
    
    return JSON.parse(storedData);
  } catch (error) {
    console.error('Error loading calculations from local storage:', error);
    return [];
  }
};

/**
 * Get calculations of a specific type from local storage
 * 
 * @param type The type of calculations to retrieve
 * @returns Array of stored calculations of the specified type
 */
export const getCalculationsByType = (type: StoredCalculation['type']): StoredCalculation[] => {
  const allCalculations = getStoredCalculations();
  return allCalculations.filter(calc => calc.type === type);
};

/**
 * Get a specific calculation by ID
 * 
 * @param id The ID of the calculation to retrieve
 * @returns The stored calculation or null if not found
 */
export const getCalculationById = (id: string): StoredCalculation | null => {
  const allCalculations = getStoredCalculations();
  const calculation = allCalculations.find(calc => calc.id === id);
  
  return calculation || null;
};

/**
 * Delete a saved calculation
 * @param type Calculator type
 * @param id ID of the calculation to delete
 * @returns true if successful, false otherwise
 */
export const deleteCalculation = (type: CalculatorType, id: string): boolean => {
  const savedCalculations = loadSavedCalculations(type);
  const updatedCalculations = savedCalculations.filter(calc => calc.id !== id);
  
  if (updatedCalculations.length === savedCalculations.length) {
    return false; // Nothing was removed
  }
  
  localStorage.setItem(`${type}_calculations`, JSON.stringify(updatedCalculations));
  return true;
};

/**
 * Delete all calculations of a specific type
 * 
 * @param type The type of calculations to delete
 * @returns True if successful, false otherwise
 */
export const deleteCalculationsByType = (type: StoredCalculation['type']): boolean => {
  try {
    const allCalculations = getStoredCalculations();
    const filteredCalculations = allCalculations.filter(calc => calc.type !== type);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCalculations));
    
    return true;
  } catch (error) {
    console.error('Error deleting calculations from local storage:', error);
    return false;
  }
};

/**
 * Clear all stored calculations
 * 
 * @returns True if successful, false otherwise
 */
export const clearAllCalculations = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing calculations from local storage:', error);
    return false;
  }
}; 