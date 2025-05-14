const express = require('express');
const { body } = require('express-validator');
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Helper function to handle async controller functions
const asyncHandler = (fn) => 
  (req, res, next) => Promise.resolve(fn(req, res)).catch(next);

// Create a new report
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('type').notEmpty().withMessage('Report type is required'),
  ],
  asyncHandler(reportController.createReport)
);

// Get all reports (with optional filtering)
router.get('/', asyncHandler(reportController.getAllReports));

// Get a report by ID
router.get('/:id', asyncHandler(reportController.getReportById));

// Update a report
router.put('/:id', asyncHandler(reportController.updateReport));

// Delete a report
router.delete('/:id', asyncHandler(reportController.deleteReport));

// Share a report with another user
router.post(
  '/:id/share',
  [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('permission').isIn(['view', 'edit', 'admin']).withMessage('Valid permission is required'),
  ],
  asyncHandler(reportController.shareReport)
);

// Get reports shared with the current user
router.get('/shared/list', asyncHandler(reportController.getSharedReports));

module.exports = router; 