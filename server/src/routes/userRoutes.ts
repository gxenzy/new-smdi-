import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  bulkUpdateUsers,
  resetPassword,
  getUserAuditLogs
} from '../controllers/userController';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { UserRole } from '../types';

const userRouter = express.Router();

// Apply authentication middleware to all routes
userRouter.use(authenticateToken);

// Get all users (admin only)
userRouter.get('/', authorizeRole([UserRole.ADMIN]), getAllUsers);

// Get user by ID (admin or self)
userRouter.get('/:id', getUserById);

// Create new user (admin only)
userRouter.post('/', authorizeRole([UserRole.ADMIN]), createUser);

// Update existing user (admin or self with restrictions)
userRouter.put('/:id', updateUser);

// Delete user (admin only)
userRouter.delete('/:id', authorizeRole([UserRole.ADMIN]), deleteUser);

// Toggle user status (admin only)
userRouter.put('/:id/toggle-status', authorizeRole([UserRole.ADMIN]), toggleUserStatus);

// Reset password (admin only)
userRouter.post('/:id/reset-password', authorizeRole([UserRole.ADMIN]), resetPassword);

// Bulk update users (admin only)
userRouter.patch('/bulk', authorizeRole([UserRole.ADMIN]), bulkUpdateUsers);

// Get user audit logs (admin only)
userRouter.get('/:id/audit-logs', authorizeRole([UserRole.ADMIN]), getUserAuditLogs);

export default userRouter; 