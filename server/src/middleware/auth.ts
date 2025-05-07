import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types';

// Extend Express Request type
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

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('[Auth] Incoming request:', req.method, req.originalUrl);
  console.log('[Auth] Authorization header:', authHeader);

  if (!token) {
    console.log('[Auth] No token provided');
    return res.status(401).json({ message: 'Authentication token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret-key') as {
      id: number;
      username: string;
      role: UserRole;
    };
    req.user = decoded;
    console.log('[Auth] Token decoded, user:', decoded);
    return next();
  } catch (error) {
    console.log('[Auth] Invalid or expired token:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const authorizeRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    return next();
  };
}; 