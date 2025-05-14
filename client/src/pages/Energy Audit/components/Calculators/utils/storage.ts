/**
 * Utility functions for saving and loading calculator results to/from local storage
 */

// Storage utility for calculator results
export type CalculatorType = 'illumination' | 'roi' | 'powerfactor' | 'power-factor' | 'hvac' | 'equipment' | 'harmonic' | 'harmonic-distortion' | 'lighting' | 'schedule-of-loads' | 'voltage-regulation' | 'voltage-drop';

export interface StoredCalculation {
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
  try {
    // Create a more readable ID without underscores
    const formattedType = type.replace(/-/g, ''); // Remove hyphens for consistency
    const id = `calc_${formattedType}_${Date.now()}`;
    
    const calculation: StoredCalculation = {
      id,
      name: name || `${type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' ')} Calculation - ${new Date().toLocaleString()}`,
      timestamp: Date.now(),
      type,
      data
    };
    
    // Make sure we use the correct storage keys
    let TYPE_STORAGE_KEY = `${type}_calculations`;
    
    // For powerfactor, make sure key matches
    if (type === 'powerfactor') {
      TYPE_STORAGE_KEY = 'powerfactor_calculations';
    }
    
    // Get existing calculations from both storage locations
    let allCalculations: StoredCalculation[] = [];
    let typeCalculations: StoredCalculation[] = [];
    
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        allCalculations = JSON.parse(storedData);
      }
      
      const typeStoredData = localStorage.getItem(TYPE_STORAGE_KEY);
      if (typeStoredData) {
        typeCalculations = JSON.parse(typeStoredData);
      }
    } catch (e) {
      console.warn('Error parsing existing calculations:', e);
      // Continue with empty arrays if parsing fails
    }
    
    // Add new calculation
    allCalculations.push(calculation);
    typeCalculations.push(calculation);
    
    // Save to both storage locations
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allCalculations));
      localStorage.setItem(TYPE_STORAGE_KEY, JSON.stringify(typeCalculations));
      
      return id;
    } catch (storageError) {
      console.error('Error writing to localStorage:', storageError);
      return '';
    }
  } catch (error) {
    console.error('Error saving calculation to localStorage:', error);
    return '';
  }
};

/**
 * Create a user-friendly default name for a calculation
 * @param type The calculator type
 * @returns A user-friendly name
 */
const createDefaultName = (type: CalculatorType): string => {
  // Format the calculator type name to be more user-friendly
  const typeLabels: Record<CalculatorType, string> = {
    'illumination': 'Illumination',
    'lighting': 'Lighting',
    'hvac': 'HVAC',
    'equipment': 'Equipment',
    'power-factor': 'Power Factor',
    'powerfactor': 'Power Factor',
    'harmonic': 'Harmonic Distortion',
    'harmonic-distortion': 'Harmonic Distortion',
    'roi': 'ROI',
    'schedule-of-loads': 'Schedule of Loads',
    'voltage-regulation': 'Voltage Regulation',
    'voltage-drop': 'Voltage Drop'
  };
  
  const typeLabel = typeLabels[type] || type.charAt(0).toUpperCase() + type.slice(1);
  const date = new Date();
  const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  
  return `${typeLabel} Calculation - ${formattedDate}`;
};

/**
 * Load all saved calculations for a specific calculator type
 * @param type The calculator type to load
 * @returns Array of stored calculations
 */
export const loadSavedCalculations = (type: CalculatorType): StoredCalculation[] => {
  try {
    // Ensure we use the correct storage key for each type
    let TYPE_STORAGE_KEY = `${type}_calculations`;
    
    // Handle special case for power-factor (backward compatibility)
    const legacyType = type === 'power-factor' ? 'powerfactor' : null;
    const LEGACY_STORAGE_KEY = legacyType ? `${legacyType}_calculations` : null;
    
    // First try to get from unified storage
    const allCalculations = getStoredCalculations();
    
    // Include both current type and legacy type if applicable
    const unifiedCalcs = allCalculations.filter(calc => 
      calc.type === type || (legacyType && calc.type === legacyType)
    );
    
    // Try to get from type-specific storage
    let typeSpecificCalcs: StoredCalculation[] = [];
    
    try {
      const typeSpecificData = localStorage.getItem(TYPE_STORAGE_KEY);
      if (typeSpecificData) {
        const parsedData = JSON.parse(typeSpecificData);
        if (Array.isArray(parsedData)) {
          typeSpecificCalcs = parsedData;
        }
      }
    } catch (parseError) {
      console.error(`Error parsing data from ${TYPE_STORAGE_KEY}:`, parseError);
    }
    
    // Also check legacy storage if applicable
    let legacyTypeCalcs: StoredCalculation[] = [];
    if (legacyType && LEGACY_STORAGE_KEY) {
      try {
        const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacyData) {
          const parsedData = JSON.parse(legacyData);
          if (Array.isArray(parsedData)) {
            // Convert legacy type to current type
            legacyTypeCalcs = parsedData.map(calc => ({
              ...calc,
              type: type as CalculatorType // Convert from legacy to current
            }));
          }
        }
      } catch (parseError) {
        console.error(`Error parsing data from ${LEGACY_STORAGE_KEY}:`, parseError);
      }
    }
    
    // Combine all sources and remove duplicates
    const combinedCalculations = [...unifiedCalcs];
    
    // Add unique items from type-specific storage
    typeSpecificCalcs.forEach(typeCalc => {
      if (!combinedCalculations.some(unifiedCalc => unifiedCalc.id === typeCalc.id)) {
        combinedCalculations.push(typeCalc);
      }
    });
    
    // Add unique items from legacy storage
    legacyTypeCalcs.forEach(legacyCalc => {
      if (!combinedCalculations.some(unifiedCalc => unifiedCalc.id === legacyCalc.id)) {
        combinedCalculations.push(legacyCalc);
      }
    });
    
    // Sort by timestamp (newest first)
    combinedCalculations.sort((a, b) => b.timestamp - a.timestamp);
    
    return combinedCalculations;
  } catch (error) {
    console.error(`Error loading calculations of type '${type}':`, error);
    return [];
  }
};

/**
 * Get all stored calculations from unified storage
 * @returns Array of all stored calculations
 */
export const getStoredCalculations = (): StoredCalculation[] => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) return [];
    
    const parsedData = JSON.parse(storedData);
    if (!Array.isArray(parsedData)) return [];
    
    return parsedData;
  } catch (error) {
    console.error('Error retrieving stored calculations:', error);
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
  try {
    const allCalculations = getStoredCalculations();
    const typeCalculations = allCalculations.filter(calc => calc.type === type);
    console.log(`Retrieved ${typeCalculations.length} calculations of type '${type}'`);
    return typeCalculations;
  } catch (error) {
    console.error(`Error retrieving calculations of type '${type}':`, error);
    return [];
  }
};

/**
 * Get a specific calculation by ID
 * @param id The ID of the calculation to retrieve
 * @returns The calculation or null if not found
 */
export const getCalculationById = (id: string): StoredCalculation | null => {
  try {
    const allCalculations = getStoredCalculations();
    return allCalculations.find(calc => calc.id === id) || null;
  } catch (error) {
    console.error(`Error retrieving calculation with ID ${id}:`, error);
    return null;
  }
};

/**
 * Delete a specific calculation
 * @param type The calculator type
 * @param id The ID of the calculation to delete
 * @returns true if successful, false otherwise
 */
export const deleteCalculation = (type: CalculatorType, id: string): boolean => {
  try {
    // Get existing calculations from both storage locations
    const allCalculations = getStoredCalculations().filter(calc => calc.id !== id);
    const TYPE_STORAGE_KEY = `${type}_calculations`;
    
    // Update unified storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allCalculations));
    
    // Update type-specific storage
    try {
      const typeStoredData = localStorage.getItem(TYPE_STORAGE_KEY);
      if (typeStoredData) {
        const typeCalculations = JSON.parse(typeStoredData);
        if (Array.isArray(typeCalculations)) {
          const updatedTypeCalculations = typeCalculations.filter(calc => calc.id !== id);
          localStorage.setItem(TYPE_STORAGE_KEY, JSON.stringify(updatedTypeCalculations));
        }
      }
    } catch (e) {
      console.warn(`Error updating type-specific storage for ${type}:`, e);
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting calculation with ID ${id}:`, error);
    return false;
  }
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
 * @returns true if successful, false otherwise
 */
export const clearAllCalculations = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing all calculations:', error);
    return false;
  }
}; 