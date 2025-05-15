const express = require('express');
const router = express.Router();
const auditTaskController = require('../controllers/auditTaskController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all tasks with filtering, sorting, and pagination
router.get('/', auditTaskController.getAllTasks);

// Get a specific task by ID
router.get('/:id', auditTaskController.getTaskById);

// Create a new task
router.post('/', auditTaskController.createTask);

// Update an existing task
router.put('/:id', auditTaskController.updateTask);

// Delete a task
router.delete('/:id', auditTaskController.deleteTask);

// Task comment routes
router.post('/:id/comments', auditTaskController.addComment);

// Task history routes
router.get('/:id/history', auditTaskController.getTaskHistory);

// Task status update route
router.put('/:id/status', auditTaskController.updateTaskStatus);

// Task approval status update route
router.put('/:id/approval', auditTaskController.updateApprovalStatus);

// Task analytics route
router.get('/analytics/summary', auditTaskController.getTaskAnalytics);

module.exports = router; 