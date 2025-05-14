const express = require('express');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  bulkUpdateUsers,
  resetPassword,
  getUserAuditLogs,
  getProfile,
  updateProfile,
  uploadProfileImg,
  changePassword,
  uploadProfileImage
} = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const userRouter = express.Router();

// Apply authentication middleware to all routes
userRouter.use(authenticateToken);

// Profile routes (authenticated user)
userRouter.get('/profile', getProfile);
userRouter.put('/profile', updateProfile);
userRouter.post('/profile/image', uploadProfileImage, uploadProfileImg);
userRouter.post('/change-password', changePassword);

// Get all users (admin only)
userRouter.get('/', authorizeRole(['admin']), getAllUsers);

// Get user by ID (admin or self)
userRouter.get('/:id', getUserById);

// Create new user (admin only)
userRouter.post('/', authorizeRole(['admin']), createUser);

// Update existing user (admin or self with restrictions)
userRouter.put('/:id', updateUser);

// Delete user (admin only)
userRouter.delete('/:id', authorizeRole(['admin']), deleteUser);

// Toggle user status (admin only)
userRouter.put('/:id/toggle-status', authorizeRole(['admin']), toggleUserStatus);

// Reset password (admin only)
userRouter.post('/:id/reset-password', authorizeRole(['admin']), resetPassword);

// Bulk update users (admin only)
userRouter.patch('/bulk', authorizeRole(['admin']), bulkUpdateUsers);

// Get user audit logs (admin only)
userRouter.get('/:id/audit-logs', authorizeRole(['admin']), getUserAuditLogs);

module.exports = userRouter; 