import { useState, useCallback } from 'react';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

/**
 * Hook for making API requests with standardized response handling
 * 
 * @returns Object with sendRequest function and loading state
 */
export const useApiRequest = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sendRequest = useCallback(async <T>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    setLoading(true);
    setError(null);
    
    try {
      const fullConfig: AxiosRequestConfig = {
        ...config,
        method,
        url,
        data: method !== 'GET' ? data : undefined,
        params: method === 'GET' ? data : undefined,
      };
      
      const response = await axios(fullConfig);
      
      setLoading(false);
      
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (err) {
      setLoading(false);
      
      const error = err as Error | AxiosError;
      let errorMessage = 'An unknown error occurred';
      let status = 500;
      
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
        status = error.response?.status || 500;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      return {
        success: false,
        message: errorMessage,
        status
      };
    }
  }, []);

  return {
    sendRequest,
    loading,
    error,
    setError
  };
};

export default useApiRequest; 