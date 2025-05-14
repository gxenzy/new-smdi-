import { useRef, useEffect, useCallback } from 'react';

interface FocusManagerOptions {
  /**
   * Whether to focus the first focusable element when the container is shown
   */
  autoFocus?: boolean;
  
  /**
   * Whether to return focus to the previously focused element when the container is closed
   */
  returnFocus?: boolean;
  
  /**
   * Delay in milliseconds before focusing the first element
   */
  focusDelay?: number;
  
  /**
   * Custom selector for finding focusable elements
   */
  focusableSelector?: string;
  
  /**
   * Callback function to run when Escape key is pressed
   */
  onEscapeKey?: () => void;
  
  /**
   * Whether to trap the focus inside the container
   */
  trapFocus?: boolean;
}

/**
 * Hook for managing focus within modals, drawers, and other UI elements
 * 
 * @param isOpen - Whether the container is currently open
 * @param options - Focus management options
 * @returns Object containing ref to attach to the container and key handlers
 */
export const useFocusManagement = (
  isOpen: boolean,
  options: FocusManagerOptions = {}
) => {
  const {
    autoFocus = true,
    returnFocus = true,
    focusDelay = 100,
    focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    onEscapeKey,
    trapFocus = true,
  } = options;
  
  // Reference to the container element
  const containerRef = useRef<HTMLElement>(null);
  
  // Store the element that had focus before opening
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  // Handle initial focus when opening
  useEffect(() => {
    if (!isOpen || !autoFocus || !containerRef.current) return;
    
    // Save the currently focused element to restore later
    if (returnFocus && document.activeElement instanceof HTMLElement) {
      previousFocusRef.current = document.activeElement;
    }
    
    // Focus the first focusable element after a short delay
    const timeoutId = setTimeout(() => {
      if (!containerRef.current) return;
      
      const focusableElements = 
        containerRef.current.querySelectorAll<HTMLElement>(focusableSelector);
      
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      } else {
        // If no focusable elements, focus the container itself
        containerRef.current.setAttribute('tabindex', '-1');
        containerRef.current.focus();
      }
    }, focusDelay);
    
    return () => clearTimeout(timeoutId);
  }, [isOpen, autoFocus, returnFocus, focusableSelector, focusDelay]);
  
  // Return focus when closing
  useEffect(() => {
    if (isOpen || !returnFocus || !previousFocusRef.current) return;
    
    const timeoutId = setTimeout(() => {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [isOpen, returnFocus]);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // Handle escape key
      if (event.key === 'Escape' && onEscapeKey) {
        event.preventDefault();
        onEscapeKey();
        return;
      }
      
      // Handle tab key for focus trapping
      if (event.key === 'Tab' && trapFocus && containerRef.current) {
        const focusableElements = 
          containerRef.current.querySelectorAll<HTMLElement>(focusableSelector);
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // Shift+Tab from first element should move to last element
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
        // Tab from last element should move to first element
        else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    [trapFocus, onEscapeKey, focusableSelector]
  );
  
  // Helper to get all focusable elements
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelector)
    );
  }, [focusableSelector]);
  
  // Helper to focus a specific element by index
  const focusElementByIndex = useCallback((index: number) => {
    const elements = getFocusableElements();
    if (elements.length === 0) return;
    
    const targetIndex = Math.max(0, Math.min(index, elements.length - 1));
    elements[targetIndex].focus();
  }, [getFocusableElements]);
  
  return {
    containerRef,
    handleKeyDown,
    getFocusableElements,
    focusElementByIndex,
    // Helper to focus the first element
    focusFirstElement: () => focusElementByIndex(0),
    // Helper to focus the last element
    focusLastElement: () => {
      const elements = getFocusableElements();
      focusElementByIndex(elements.length - 1);
    }
  };
}; 