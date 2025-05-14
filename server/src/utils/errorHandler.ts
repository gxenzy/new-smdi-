import { Request, Response, NextFunction } from 'express';
import logger from './logger';

/**
 * Error types for standardized error handling
 */
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST_ERROR = 'BAD_REQUEST_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
}

/**
 * Application error class for consistent error handling
 */
export class AppError extends Error {
  type: ErrorType;
  statusCode: number;
  details?: any;
  
  constructor(type: ErrorType, message: string, statusCode: number, details?: any) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Format error response consistently
 */
export const formatErrorResponse = (error: AppError) => {
  return {
    error: {
      type: error.type,
      message: error.message,
      details: error.details || {},
    }
  };
};

/**
 * Helper function to create a validation error
 */
export const createValidationError = (message: string, details?: any) => {
  return new AppError(
    ErrorType.VALIDATION_ERROR,
    message,
    400,
    details
  );
};

/**
 * Helper function to create an authentication error
 */
export const createAuthenticationError = (message: string, details?: any) => {
  return new AppError(
    ErrorType.AUTHENTICATION_ERROR,
    message,
    401,
    details
  );
};

/**
 * Helper function to create an authorization error
 */
export const createAuthorizationError = (message: string, details?: any) => {
  return new AppError(
    ErrorType.AUTHORIZATION_ERROR,
    message,
    403,
    details
  );
};

/**
 * Helper function to create a not found error
 */
export const createNotFoundError = (message: string, details?: any) => {
  return new AppError(
    ErrorType.NOT_FOUND_ERROR,
    message,
    404,
    details
  );
};

/**
 * Helper function to create a database error
 */
export const createDatabaseError = (message: string, details?: any) => {
  return new AppError(
    ErrorType.DATABASE_ERROR,
    message,
    500,
    details
  );
};

/**
 * Helper function to create an external API error
 */
export const createExternalApiError = (message: string, details?: any) => {
  return new AppError(
    ErrorType.EXTERNAL_API_ERROR,
    message,
    502,
    details
  );
};

/**
 * Helper function to create an internal server error
 */
export const createInternalServerError = (message: string, details?: any) => {
  return new AppError(
    ErrorType.INTERNAL_SERVER_ERROR,
    message,
    500,
    details
  );
};

/**
 * Helper function to create a bad request error
 */
export const createBadRequestError = (message: string, details?: any) => {
  return new AppError(
    ErrorType.BAD_REQUEST_ERROR,
    message,
    400,
    details
  );
};

/**
 * Helper function to create a conflict error
 */
export const createConflictError = (message: string, details?: any) => {
  return new AppError(
    ErrorType.CONFLICT_ERROR,
    message,
    409,
    details
  );
};

/**
 * Async handler to catch errors in async route handlers
 * This eliminates the need for try/catch blocks in every handler
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * Global error handling middleware
 */
export const errorMiddleware = (err: Error | AppError, req: Request, res: Response, _next: NextFunction) => {
  logger.error('Error handling request:', {
    url: req.url,
    method: req.method,
    errorMessage: err.message,
    errorStack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    errorType: err instanceof AppError ? err.type : 'UNKNOWN'
  });
  
  if (err instanceof AppError) {
    return res
      .status(err.statusCode)
      .json(formatErrorResponse(err));
  } else {
    // For unhandled errors, return a generic 500 error
    const internalError = createInternalServerError(
      process.env.NODE_ENV === 'development' 
        ? err.message 
        : 'An unexpected error occurred'
    );
    
    return res
      .status(500)
      .json(formatErrorResponse(internalError));
  }
};

export default {
  ErrorType,
  AppError,
  createValidationError,
  createAuthenticationError,
  createAuthorizationError,
  createNotFoundError,
  createDatabaseError,
  createExternalApiError,
  createInternalServerError,
  createBadRequestError,
  createConflictError,
  asyncHandler,
  errorMiddleware,
  formatErrorResponse
}; 