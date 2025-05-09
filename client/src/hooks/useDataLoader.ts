import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

/**
 * Generic hook for loading data with loading, error, and refetch states
 * 
 * @template T The type of data to be loaded
 * @param url The URL to fetch data from
 * @param config Optional axios request config
 * @param initialData Optional initial data
 * @param dependencies Optional dependencies to trigger refetching (similar to useEffect)
 * @returns Object with data, loading state, error, and refetch function
 */
function useDataLoader<T>(
  url: string, 
  config?: AxiosRequestConfig,
  initialData?: T,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastLoaded, setLastLoaded] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch data function that can be called manually
  const fetchData = useCallback(async (skipLoading = false) => {
    if (!skipLoading) {
      setLoading(true);
    }
    setError(null);
    
    try {
      const response = await axios(url, config);
      setData(response.data);
      setLastLoaded(new Date());
      return response.data;
    } catch (err) {
      const error = err as Error | AxiosError;
      
      // Handle axios errors specifically
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        setError(message);
      } else {
        setError(error.message || 'An unknown error occurred');
      }
      
      return undefined;
    } finally {
      if (!skipLoading) {
        setLoading(false);
      }
    }
  }, [url, config]);
  
  // Refetch with automatic loading state
  const refetch = useCallback(() => {
    return fetchData(false);
  }, [fetchData]);
  
  // Silent refetch without showing loading state
  const silentRefetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);
  
  // Retry with exponential backoff
  const retry = useCallback(() => {
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    
    // Exponential backoff: 1s, 2s, 4s, etc. with max of 30s
    const delay = Math.min(Math.pow(2, newRetryCount - 1) * 1000, 30000);
    
    setTimeout(() => {
      fetchData();
    }, delay);
  }, [fetchData, retryCount]);
  
  // Initial data loading and when dependencies change
  useEffect(() => {
    fetchData();
  }, [...dependencies, url]);

  return {
    data,
    loading,
    error,
    refetch,
    silentRefetch,
    retry,
    lastLoaded,
  };
}

export default useDataLoader; 