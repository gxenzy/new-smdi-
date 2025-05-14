/**
 * Storage Utilities
 * Helper functions for working with localStorage with type safety
 */

/**
 * Save an item to localStorage with JSON stringification
 * @param key Storage key
 * @param value Value to store
 */
export const setItem = (key: string, value: any): void => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(`Error saving to localStorage [${key}]:`, error);
  }
};

/**
 * Get an item from localStorage with JSON parsing
 * @param key Storage key
 * @param defaultValue Default value if key doesn't exist
 * @returns Parsed value or defaultValue if not found
 */
export const getItem = <T = any>(key: string, defaultValue: T | null = null): T | null => {
  try {
    const serializedValue = localStorage.getItem(key);
    if (serializedValue === null) {
      return defaultValue;
    }
    return JSON.parse(serializedValue);
  } catch (error) {
    console.error(`Error reading from localStorage [${key}]:`, error);
    return defaultValue;
  }
};

/**
 * Remove an item from localStorage
 * @param key Storage key to remove
 */
export const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage [${key}]:`, error);
  }
};

/**
 * Clear all items from localStorage
 */
export const clearStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

/**
 * Get all keys from localStorage
 * @returns Array of keys
 */
export const getAllKeys = (): string[] => {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== null) {
        keys.push(key);
      }
    }
    return keys;
  } catch (error) {
    console.error('Error getting keys from localStorage:', error);
    return [];
  }
};

/**
 * Check if a key exists in localStorage
 * @param key Storage key to check
 * @returns True if key exists
 */
export const hasKey = (key: string): boolean => {
  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error(`Error checking localStorage for key [${key}]:`, error);
    return false;
  }
};

/**
 * Get the total size of data in localStorage (approximate)
 * @returns Size in bytes
 */
export const getStorageSize = (): number => {
  try {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== null) {
        totalSize += (localStorage.getItem(key) || '').length * 2; // UTF-16 = 2 bytes per char
      }
    }
    return totalSize;
  } catch (error) {
    console.error('Error calculating localStorage size:', error);
    return 0;
  }
};

/**
 * Storage with expiration
 * @param key Storage key
 * @param value Value to store
 * @param expiryMs Expiry time in milliseconds
 */
export const setItemWithExpiry = (key: string, value: any, expiryMs: number): void => {
  try {
    const item = {
      value,
      expiry: Date.now() + expiryMs
    };
    setItem(key, item);
  } catch (error) {
    console.error(`Error saving to localStorage with expiry [${key}]:`, error);
  }
};

/**
 * Get item with expiration check
 * @param key Storage key
 * @returns Value if not expired, null otherwise
 */
export const getItemWithExpiry = <T = any>(key: string): T | null => {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
      return null;
    }
    
    const item = JSON.parse(itemStr);
    
    // Check for expiration
    if (item.expiry && Date.now() > item.expiry) {
      removeItem(key);
      return null;
    }
    
    return item.value;
  } catch (error) {
    console.error(`Error reading from localStorage with expiry [${key}]:`, error);
    return null;
  }
}; 