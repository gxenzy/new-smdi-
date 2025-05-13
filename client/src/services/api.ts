import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

class EnhancedError extends Error {
  response?: any;
  status?: number;
  originalError?: AxiosError;

  constructor(message: string) {
    super(message);
    this.name = 'EnhancedError';
    Object.setPrototypeOf(this, EnhancedError.prototype);
  }
}

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: number;
}

interface ErrorResponse {
  message?: string;
  error?: string;
  code?: string;
  expiredAt?: Date;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Single comprehensive response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    if (!error.config) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as RetryConfig;

    // If the error is a network error or the server is not responding
    if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
      if (!originalRequest._retry || originalRequest._retry < MAX_RETRIES) {
        originalRequest._retry = (originalRequest._retry || 0) + 1;
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        
        console.log(`Retrying request (${originalRequest._retry}/${MAX_RETRIES})...`);
        return api(originalRequest);
      }
    }

    // Handle token expiration
    if (error.response?.status === 401) {
      const isExpiredToken = error.response.data && 
        (error.response.data.code === 'TOKEN_EXPIRED' || 
         error.response.data.message === 'Session expired');
      
      // Only redirect for token expiration, not missing token
      if (isExpiredToken && localStorage.getItem('token')) {
        console.warn('Session expired, redirecting to login');
        
        // Clear the token from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('authUser');
        
        // Show a message to the user
        alert('Your session has expired. Please login again.');
        
        // Redirect to login page - prevent loop by checking current URL
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    // Format error message
    const errorMessage = error.response?.data?.message 
      || error.response?.data?.error
      || error.message 
      || 'An unexpected error occurred';

    // Add more context to the error
    const enhancedError = new EnhancedError(errorMessage);
    enhancedError.response = error.response;
    enhancedError.status = error.response?.status;
    enhancedError.originalError = error;

    return Promise.reject(enhancedError);
  }
);

export default api; 