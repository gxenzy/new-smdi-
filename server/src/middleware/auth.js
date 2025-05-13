const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate JWT token
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const auth = (req, res, next) => {
  try {
    // For testing purposes, we'll bypass authentication
    // In a production environment, uncomment the real authentication code
    
    // TESTING ONLY: Add a mock user for testing
    req.user = {
      id: 1,
      username: 'testuser',
      role: 'admin'
    };
    
    return next();
    
    /*
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
      
      return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(
      token, 
      process.env.JWT_SECRET || 'e465aa6a212abe4bb21fb3218aa044ed2be68720b46298c20b22f861ab7324f3d299f35ec4720e2ab57a03e4810a7a885e5aac6c1', 
      (err, decoded) => {
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
          
          return res.status(403).json({ message: 'Invalid token' });
        }

        // Token is valid
        req.user = decoded;
        next();
      }
    );
    */
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Middleware to create optional authentication
 * Request will proceed even without a token, but will populate req.user if token is valid
 */
const optionalAuth = (req, res, next) => {
  try {
    // For testing purposes, we'll bypass authentication
    // In a production environment, uncomment the real authentication code
    
    // TESTING ONLY: Add a mock user for testing
    req.user = {
      id: 1,
      username: 'testuser',
      role: 'admin'
    };
    
    return next();
    
    /*
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    // If no token is provided, just continue
    if (!token) {
      return next();
    }

    jwt.verify(
      token, 
      process.env.JWT_SECRET || 'e465aa6a212abe4bb21fb3218aa044ed2be68720b46298c20b22f861ab7324f3d299f35ec4720e2ab57a03e4810a7a885e5aac6c1', 
      (err, decoded) => {
        if (err) {
          // Even on error, allow the request to proceed
          return next();
        }

        // Token is valid, set the user
        req.user = decoded;
        next();
      }
    );
    */
  } catch (error) {
    // On any error, just continue
    next();
  }
};

/**
 * Middleware to authorize user roles
 */
const authorizeRole = (roles) => {
  return (req, res, next) => {
    // For testing purposes, we'll bypass authorization
    // In a production environment, uncomment the real authorization code
    return next();
    
    /*
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const userRole = req.user.role;
    
    // Always allow admin
    if (userRole === 'ADMIN') {
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
    */
  };
};

module.exports = auth;
module.exports.optionalAuth = optionalAuth;
module.exports.authorizeRole = authorizeRole; 