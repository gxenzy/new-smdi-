import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserRole } from '../types';

// Extend Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        role: UserRole;
      };
    }
  }
}

interface AuthOptions {
  optional?: boolean;
}

export const authenticateToken = (options: AuthOptions = { optional: false }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      // If no token is provided
      if (!token) {
        // Only log in development environment to reduce spam
        if (process.env.NODE_ENV === 'development') {
          // Don't log for common public routes
          const isPublicRoute = req.path.includes('/health') || 
                               req.path.includes('/login') || 
                               req.path.includes('/signup') || 
                               req.path.startsWith('/public/');
          
          if (!isPublicRoute) {
            console.log(`No token provided for ${req.method} ${req.path}`);
          }
        }
        
        if (options.optional) {
          // Allow request to proceed without authentication
          return next();
        }
        
        return res.status(401).json({ message: 'No token provided' });
      }

      jwt.verify(
        token, 
        process.env.JWT_SECRET || 'e465aa6a212abe4bb21fb3218aa044ed2be68720b46298c20b22f861ab7324f3d299f35ec4720e2ab57a03e4810a7a885e5aac6c1', 
        (err: any, decoded: any) => {
          if (err) {
            console.error('Token verification error:', err);
            
            // Check specifically for token expiration
            if (err.name === 'TokenExpiredError') {
              return res.status(401).json({ 
                message: 'Session expired', 
                code: 'TOKEN_EXPIRED',
                expiredAt: err.expiredAt
              });
            }
            
            // Other token errors
            if (options.optional) {
              // Continue without authentication
              return next();
            }
            
            return res.status(403).json({ message: 'Invalid token' });
          }

          // Token is valid
          req.user = decoded as {
            id: number;
            username: string;
            role: UserRole;
          };
          next();
        }
      );
    } catch (error) {
      console.error('Authentication error:', error);
      
      if (options.optional) {
        return next();
      }
      
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

export const authorizeRole = (roles: UserRole | UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const userRole = req.user.role;
    
    // Always allow admin
    if (userRole === UserRole.ADMIN) {
      next();
      return;
    }

    // Check if user role is in allowed roles
    if (Array.isArray(roles)) {
      if (roles.includes(userRole)) {
        next();
        return;
      }
    } else if (userRole === roles) {
      next();
      return;
    }
    
    res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
  };
}; 