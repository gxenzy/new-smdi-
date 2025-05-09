import { Request, Response, NextFunction } from 'express';
import { Socket } from 'socket.io';

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  code?: string;
  path?: string;
  socketId?: string;
}

export class WebSocketError extends Error implements AppError {
  public status: string;

  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true,
    public socketId?: string,
    public code?: string,
    public path?: string
  ) {
    super(message);
    this.name = 'WebSocketError';
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error details
  const errorLog = {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    statusCode: err.statusCode,
    errorName: err.name,
    message: err.message,
    isOperational: err.isOperational,
    socketId: err.socketId
  };
  
  console.error('[Error]:', errorLog);

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
      path: req.path,
      timestamp: new Date().toISOString()
    });
  } else {
    // Production mode - don't leak error details
    res.status(err.statusCode).json({
      status: err.status,
      message: err.isOperational ? err.message : 'Internal server error',
      code: err.code,
      path: req.path,
      timestamp: new Date().toISOString()
    });
  }
};

export const handleSocketError = (socket: Socket, error: AppError) => {
  const errorResponse = {
    status: 'error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Socket connection error',
    code: error.code,
    timestamp: new Date().toISOString()
  };

  console.error(`[Socket Error] ${socket.id}:`, {
    ...errorResponse,
    stack: error.stack
  });

  // Emit error to the client
  socket.emit('error', errorResponse);

  // If the error is not operational (i.e., programming error), disconnect the socket
  if (!error.isOperational) {
    socket.disconnect(true);
  }
};

// Global uncaught exception handler
process.on('uncaughtException', (error: Error) => {
  console.error('[Uncaught Exception]:', error);
  process.exit(1);
});

// Global unhandled rejection handler
process.on('unhandledRejection', (error: Error) => {
  console.error('[Unhandled Rejection]:', error);
  process.exit(1);
}); 