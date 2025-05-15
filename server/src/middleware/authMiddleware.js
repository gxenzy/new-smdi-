const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

/**
 * Authentication middleware to protect routes
 * Verifies the JWT token from the request header and attaches the user to the request
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user by ID
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid token. User not found.' });
      }
      
      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Server error during authentication.' });
  }
};

module.exports = authMiddleware; 