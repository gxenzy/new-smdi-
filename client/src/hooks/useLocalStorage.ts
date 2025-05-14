import { useState, useEffect } from 'react';

/**
 * Custom hook for persisting state in localStorage
 * 
 * @param key - The localStorage key to store the value under
 * @param initialValue - The initial value (or function to get the initial value)
 * @returns A stateful value and a function to update it (like useState)
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Get from localStorage on initialization
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Listen for changes to storedValue and update localStorage
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Listen for storage events to keep multiple tabs in sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key) return;
      
      // If the key changed in another tab, update our state
      if (e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing localStorage value for key "${key}":`, error);
        }
      } else {
        // If the key was removed, reset to initial value
        setStoredValue(initialValue);
      }
    };

    // Only add event listener if we're in a browser environment
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [key, initialValue]);

  return [storedValue, setStoredValue];
} 