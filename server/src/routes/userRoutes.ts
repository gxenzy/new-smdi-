import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  bulkUpdateUsers,
  bulkDeleteUsers
} from '../controllers/userController';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { UserRole } from '../types';

const userRouter = express.Router();

// Apply authentication middleware to all routes
userRouter.use(authenticateToken);

// Get all users (admin only)
userRouter.get('/', authorizeRole([UserRole.ADMIN]), getAllUsers);

// Get user by ID
userRouter.get('/:id', authorizeRole([UserRole.ADMIN]), getUserById);

// Create new user (admin only)
userRouter.post('/', authorizeRole([UserRole.ADMIN]), createUser);

// Update user
userRouter.put('/:id', authorizeRole([UserRole.ADMIN]), updateUser);

// Delete user (admin only)
userRouter.delete('/:id', authorizeRole([UserRole.ADMIN]), deleteUser);

// Toggle user status (admin only)
userRouter.patch('/:id/toggle-status', authorizeRole([UserRole.ADMIN]), toggleUserStatus);

// Bulk update users (admin only)
userRouter.patch('/bulk-update', authorizeRole([UserRole.ADMIN]), bulkUpdateUsers);

// Bulk delete users (admin only)
userRouter.post('/bulk-delete', authorizeRole([UserRole.ADMIN]), bulkDeleteUsers);

export default userRouter; 