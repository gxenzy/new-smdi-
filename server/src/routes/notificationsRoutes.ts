import express from 'express';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead 
} from '../controllers/notificationsController';
import { authenticateToken } from '../middleware/auth';

const notificationsRouter = express.Router();

// Apply authentication middleware to all routes
notificationsRouter.use(authenticateToken);

// Get user's notifications
notificationsRouter.get('/', getNotifications);

// Mark notification as read
notificationsRouter.put('/:notificationId/read', markAsRead);

// Mark all notifications as read
notificationsRouter.put('/read-all', markAllAsRead);

export default notificationsRouter; 