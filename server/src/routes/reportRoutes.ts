import express from 'express';
import { body } from 'express-validator';
import * as reportController from '../controllers/reportControllerTs';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Create a new report
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('type').notEmpty().withMessage('Report type is required'),
  ],
  reportController.createReport
);

// Get all reports (with optional filtering)
router.get('/', reportController.getAllReports);

// Get a report by ID
router.get('/:id', reportController.getReportById);

// Update a report
router.put('/:id', reportController.updateReport);

// Delete a report
router.delete('/:id', reportController.deleteReport);

// Share a report with another user
router.post(
  '/:id/share',
  [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('permission').isIn(['view', 'edit', 'admin']).withMessage('Valid permission is required'),
  ],
  reportController.shareReport
);

// Get reports shared with the current user
router.get('/shared/list', reportController.getSharedReports);

export default router; 