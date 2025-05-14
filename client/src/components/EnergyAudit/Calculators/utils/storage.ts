/**
 * Utility functions for saving and loading calculator results to/from local storage
 */

// Storage utility for calculator results
type CalculatorType = 'illumination' | 'roi' | 'powerfactor' | 'power-factor' | 'hvac' | 'equipment' | 'harmonic' | 'harmonic-distortion' | 'lighting' | 'schedule-of-loads' | 'voltage-regulation';

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
    
    // Debug information
    console.log(`Attempting to save calculation: ${id}`);
    console.log(`Using storage keys: ${STORAGE_KEY} and ${TYPE_STORAGE_KEY}`);
    
    // Get existing calculations from both storage locations
    let allCalculations: StoredCalculation[] = [];
    let typeCalculations: StoredCalculation[] = [];
    
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        allCalculations = JSON.parse(storedData);
        console.log(`Found ${allCalculations.length} existing calculations in unified storage`);
      } else {
        console.log('No existing calculations found in unified storage');
      }
      
      const typeStoredData = localStorage.getItem(TYPE_STORAGE_KEY);
      if (typeStoredData) {
        typeCalculations = JSON.parse(typeStoredData);
        console.log(`Found ${typeCalculations.length} existing ${type} calculations`);
      } else {
        console.log(`No existing ${type} calculations found`);
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
      
      // Verify data was saved correctly
      const verifyAllData = localStorage.getItem(STORAGE_KEY);
      const verifyTypeData = localStorage.getItem(TYPE_STORAGE_KEY);
      
      if (!verifyAllData || !verifyTypeData) {
        throw new Error('Verification failed: Could not retrieve saved data');
      }
      
      console.log(`Successfully saved calculation to localStorage: ${id} (${type})`);
      console.log(`Total calculations in storage: ${allCalculations.length}`);
      console.log(`Total ${type} calculations: ${typeCalculations.length}`);
      
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
 * Load all saved calculations for a specific calculator type
 * @param type The calculator type to load
 * @returns Array of stored calculations
 */
export const loadSavedCalculations = (type: CalculatorType): StoredCalculation[] => {
  try {
    console.log(`Attempting to load saved calculations for type: ${type}`);
    
    // Ensure we use the correct storage key for each type
    let TYPE_STORAGE_KEY = `${type}_calculations`;
    
    // Handle special case for power-factor (backward compatibility)
    const legacyType = type === 'power-factor' ? 'powerfactor' : null;
    const LEGACY_STORAGE_KEY = legacyType ? `${legacyType}_calculations` : null;
    
    // First try to get from unified storage
    console.log(`Checking unified storage key: ${STORAGE_KEY}`);
    const allCalculations = getStoredCalculations();
    
    // Include both current type and legacy type if applicable
    const unifiedCalcs = allCalculations.filter(calc => 
      calc.type === type || (legacyType && calc.type === legacyType)
    );
    
    // Try to get from type-specific storage
    console.log(`Checking type-specific storage key: ${TYPE_STORAGE_KEY}`);
    let typeSpecificCalcs: StoredCalculation[] = [];
    
    try {
      const typeSpecificData = localStorage.getItem(TYPE_STORAGE_KEY);
      if (typeSpecificData) {
        const parsedData = JSON.parse(typeSpecificData);
        if (Array.isArray(parsedData)) {
          typeSpecificCalcs = parsedData;
          console.log(`Found ${typeSpecificCalcs.length} calculations in type-specific storage`);
        }
      }
    } catch (parseError) {
      console.error(`Error parsing data from ${TYPE_STORAGE_KEY}:`, parseError);
    }
    
    // Also check legacy storage if applicable
    let legacyTypeCalcs: StoredCalculation[] = [];
    if (legacyType && LEGACY_STORAGE_KEY) {
      console.log(`Checking legacy storage key: ${LEGACY_STORAGE_KEY}`);
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
            console.log(`Found ${legacyTypeCalcs.length} calculations in legacy storage`);
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
    
    console.log(`Returning ${combinedCalculations.length} total ${type} calculations`);
    return combinedCalculations;
  } catch (error) {
    console.error(`Error loading calculations of type '${type}':`, error);
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
 * @param type The calculator type
 * @returns Array of calculations of the specified type
 */
export const getCalculationsByType = (type: StoredCalculation['type']): StoredCalculation[] => {
  try {
    const allCalculations = getStoredCalculations();
    return allCalculations.filter(calc => calc.type === type);
  } catch (error) {
    console.error(`Error getting calculations of type '${type}':`, error);
    return [];
  }
};

/**
 * Get a specific calculation by ID
 * 
 * @param id The calculation ID
 * @returns The calculation or null if not found
 */
export const getCalculationById = (id: string): StoredCalculation | null => {
  try {
    const allCalculations = getStoredCalculations();
    return allCalculations.find(calc => calc.id === id) || null;
  } catch (error) {
    console.error(`Error getting calculation with ID '${id}':`, error);
    return null;
  }
};

/**
 * Delete a specific calculation by ID
 * 
 * @param type The calculator type
 * @param id The calculation ID
 * @returns Whether the deletion was successful
 */
export const deleteCalculation = (type: CalculatorType, id: string): boolean => {
  try {
    // Get all calculations
    const allCalculations = getStoredCalculations();
    const updatedAllCalculations = allCalculations.filter(calc => calc.id !== id);
    
    // Get type-specific calculations
    const TYPE_STORAGE_KEY = `${type}_calculations`;
    const typeSpecificData = localStorage.getItem(TYPE_STORAGE_KEY);
    let typeSpecificCalcs: StoredCalculation[] = [];
    
    if (typeSpecificData) {
      typeSpecificCalcs = JSON.parse(typeSpecificData);
    }
    
    const updatedTypeCalcs = typeSpecificCalcs.filter(calc => calc.id !== id);
    
    // Save updated lists
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAllCalculations));
    localStorage.setItem(TYPE_STORAGE_KEY, JSON.stringify(updatedTypeCalcs));
    
    return true;
  } catch (error) {
    console.error(`Error deleting calculation with ID '${id}':`, error);
    return false;
  }
};

/**
 * Delete all calculations of a specific type
 * 
 * @param type The calculator type
 * @returns Whether the deletion was successful
 */
export const deleteCalculationsByType = (type: StoredCalculation['type']): boolean => {
  try {
    // Get all calculations
    const allCalculations = getStoredCalculations();
    const updatedAllCalculations = allCalculations.filter(calc => calc.type !== type);
    
    // Save updated list and clear type-specific storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAllCalculations));
    localStorage.removeItem(`${type}_calculations`);
    
    return true;
  } catch (error) {
    console.error(`Error deleting calculations of type '${type}':`, error);
    return false;
  }
};

/**
 * Clear all stored calculations
 * 
 * @returns Whether the operation was successful
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