import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { apiConfig } from '../config/database';

// Get base URL from config and clean it up
const API_URL = apiConfig.baseUrl;

// Fix API URL - ensure there's only one /api at the end if needed
let BASE_URL = API_URL;
// If URL already ends with /api, use it as is, otherwise check the REACT_APP_API_URL
if (API_URL.endsWith('/api')) {
  // Environment variable already has /api, so don't add another
  console.log('Using environment URL with existing /api');
} else {
  // Add /api only once
  console.log('Adding /api to base URL');
  BASE_URL = `${API_URL}/api`;
}

console.log(`API Service initialized with endpoint: ${BASE_URL}`);

const MAX_RETRIES = apiConfig.retries;
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
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: apiConfig.timeout,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log all API requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
      // Extra logging for login requests
      if (config.url?.includes('login')) {
        console.log('🔑 Login request details:');
        console.log('- URL:', config.url);
        console.log('- Full URL:', `${API_URL}${config.url}`);
        console.log('- Method:', config.method);
        console.log('- Headers:', config.headers);
        console.log('- Data:', config.data ? JSON.stringify(config.data) : 'none');
      }
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
  (response) => {
    // Log all API responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.status} ${response.config.url}`);
      // Extra logging for login responses
      if (response.config.url?.includes('login')) {
        console.log('🔑 Login response:', {
          status: response.status,
          statusText: response.statusText,
          hasData: !!response.data,
          hasToken: !!response.data?.token,
          hasUser: !!response.data?.user
        });
      }
    }
    return response;
  },
  async (error: AxiosError<ErrorResponse>) => {
    if (!error.config) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as RetryConfig;

    // Special handling for login errors
    if (originalRequest.url?.includes('login')) {
      console.error('🔒 Login error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        errorMessage: error.message
      });
      
      // Try alternative login endpoint if original fails
      if (error.response?.status === 404 && !originalRequest._retry) {
        console.log('🔄 Trying alternative login endpoint...');
        originalRequest._retry = 1;
        // Try direct login endpoint
        originalRequest.url = '/login';
        console.log(`Redirecting to: ${originalRequest.url}`);
        return api(originalRequest);
      }
      
      // Try a second alternative if first alternative fails
      if (error.response?.status === 404 && originalRequest._retry === 1) {
        console.log('🔄 Trying second alternative login endpoint...');
        originalRequest._retry = 2;
        // Try api direct login endpoint
        originalRequest.url = '/api/login';
        console.log(`Redirecting to: ${originalRequest.url}`);
        return api(originalRequest);
      }
    }

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
        localStorage.removeItem('currentUser');
        
        // Show a message to the user
        alert('Your session has expired. Please login again.');
        
        // Redirect to login page - prevent loop by checking current URL
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?sessionExpired=true';
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

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`API Error: ${error.response?.status || 'Network Error'} ${originalRequest.url}`, 
        error.response?.data || error.message);
    }

    return Promise.reject(enhancedError);
  }
);

export default api; 