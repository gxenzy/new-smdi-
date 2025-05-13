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
    'voltage-regulation': 'Voltage Regulation'
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
  let success = false;
  
  // Delete from type-specific storage (legacy approach)
  const savedCalculations = loadSavedCalculations(type);
  const updatedCalculations = savedCalculations.filter(calc => calc.id !== id);
  
  if (updatedCalculations.length !== savedCalculations.length) {
    localStorage.setItem(`${type}_calculations`, JSON.stringify(updatedCalculations));
    success = true;
  }
  
  // Also delete from unified storage
  const allCalculations = getStoredCalculations();
  const updatedAllCalculations = allCalculations.filter(calc => calc.id !== id);
  
  if (updatedAllCalculations.length !== allCalculations.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAllCalculations));
    success = true;
  }
  
  return success;
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