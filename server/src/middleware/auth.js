const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate JWT token
 */
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log('No token provided');
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    console.log('Verifying token...');
    jwt.verify(
      token, 
      process.env.JWT_SECRET || 'e465aa6a212abe4bb21fb3218aa044ed2be68720b46298c20b22f861ab7324f3d299f35ec4720e2ab57a03e4810a7a885e5aac6c1', 
      (err, decoded) => {
        if (err) {
          console.error('Token verification error:', err);
          res.status(403).json({ message: 'Invalid token' });
          return;
        }

        console.log('Token verified, user:', decoded);
        req.user = decoded;
        next();
      }
    );
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Middleware to authorize user roles
 */
const authorizeRole = (roles) => {
  return (req, res, next) => {
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
  };
};

module.exports = {
  authenticateToken,
  authorizeRole
}; 