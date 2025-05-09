import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
}

/**
 * Custom hook to track window size and responsive breakpoints
 * @returns WindowSize object with width, height, and boolean flags for different device sizes
 */
function useWindowSize(): WindowSize {
  // Initialize with reasonable defaults for SSR
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLargeDesktop: false,
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Update breakpoint flags
      setWindowSize({
        width,
        height,
        isMobile: width < 600,
        isTablet: width >= 600 && width < 960,
        isDesktop: width >= 960 && width < 1280,
        isLargeDesktop: width >= 1280,
      });
    }
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures effect runs only on mount and unmount

  return windowSize;
}

export default useWindowSize; 