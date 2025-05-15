const AuditTask = require('../models/AuditTask');

/**
 * Controller for managing audit tasks
 */
const auditTaskController = {
  /**
   * Get all audit tasks with filtering, sorting, and pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllTasks: async (req, res) => {
    try {
      // Extract query parameters for filtering, sorting, and pagination
      const {
        status,
        priority,
        approval_status,
        assigned_to,
        created_by,
        search,
        sort_by,
        sort_direction,
        page = 1,
        limit = 10
      } = req.query;

      // Build filters object
      const filters = {
        status,
        priority,
        approval_status,
        assigned_to: assigned_to ? parseInt(assigned_to) : undefined,
        created_by: created_by ? parseInt(created_by) : undefined,
        search,
        sort_by,
        sort_direction
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

      // Get tasks with pagination
      const result = await AuditTask.getAll(
        filters,
        parseInt(page),
        parseInt(limit)
      );

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getAllTasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  },

  /**
   * Get a specific task by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getTaskById: async (req, res) => {
    try {
      const { id } = req.params;
      const task = await AuditTask.getById(parseInt(id));

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.status(200).json(task);
    } catch (error) {
      console.error(`Error in getTaskById for task ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to fetch task' });
    }
  },

  /**
   * Create a new audit task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createTask: async (req, res) => {
    try {
      const taskData = req.body;
      
      // Validate required fields
      if (!taskData.title) {
        return res.status(400).json({ error: 'Task title is required' });
      }

      // Get the user ID from the authenticated user
      const userId = req.user.id;

      const taskId = await AuditTask.create(taskData, userId);
      res.status(201).json({ id: taskId, message: 'Task created successfully' });
    } catch (error) {
      console.error('Error in createTask:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  },

  /**
   * Update an existing task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateTask: async (req, res) => {
    try {
      const { id } = req.params;
      const taskData = req.body;
      const userId = req.user.id;

      const success = await AuditTask.update(parseInt(id), taskData, userId);
      
      if (!success) {
        return res.status(404).json({ error: 'Task not found or update failed' });
      }

      res.status(200).json({ message: 'Task updated successfully' });
    } catch (error) {
      console.error(`Error in updateTask for task ${req.params.id}:`, error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Failed to update task' });
    }
  },

  /**
   * Delete a task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteTask: async (req, res) => {
    try {
      const { id } = req.params;
      const success = await AuditTask.delete(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ error: 'Task not found or delete failed' });
      }

      res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error(`Error in deleteTask for task ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  },

  /**
   * Add a comment to a task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  addComment: async (req, res) => {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const userId = req.user.id;

      if (!comment) {
        return res.status(400).json({ error: 'Comment text is required' });
      }

      const commentId = await AuditTask.addComment(parseInt(id), comment, userId);
      res.status(201).json({ id: commentId, message: 'Comment added successfully' });
    } catch (error) {
      console.error(`Error in addComment for task ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to add comment' });
    }
  },

  /**
   * Get task history
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getTaskHistory: async (req, res) => {
    try {
      const { id } = req.params;
      const history = await AuditTask.getHistory(parseInt(id));
      res.status(200).json(history);
    } catch (error) {
      console.error(`Error in getTaskHistory for task ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to fetch task history' });
    }
  },

  /**
   * Update task status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateTaskStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.id;

      if (!status || !['not_started', 'in_progress', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Valid status is required' });
      }

      const success = await AuditTask.updateStatus(parseInt(id), status, userId);
      
      if (!success) {
        return res.status(404).json({ error: 'Task not found or update failed' });
      }

      res.status(200).json({ message: 'Task status updated successfully' });
    } catch (error) {
      console.error(`Error in updateTaskStatus for task ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to update task status' });
    }
  },

  /**
   * Update task approval status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateApprovalStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { approval_status, comment } = req.body;
      const userId = req.user.id;

      if (!approval_status || !['not_submitted', 'pending', 'approved', 'rejected'].includes(approval_status)) {
        return res.status(400).json({ error: 'Valid approval status is required' });
      }

      const success = await AuditTask.updateApprovalStatus(parseInt(id), approval_status, userId, comment);
      
      if (!success) {
        return res.status(404).json({ error: 'Task not found or update failed' });
      }

      res.status(200).json({ message: 'Task approval status updated successfully' });
    } catch (error) {
      console.error(`Error in updateApprovalStatus for task ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to update approval status' });
    }
  },

  /**
   * Get task analytics data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getTaskAnalytics: async (req, res) => {
    try {
      // Get task counts by status
      const statusCounts = await AuditTask.getStatusCounts();
      
      // Get task counts by priority
      const priorityCounts = await AuditTask.getPriorityCounts();
      
      // Get approval statistics
      const approvalStats = await AuditTask.getApprovalStats();
      
      // Get task completion trend (last 30 days)
      const completionTrend = await AuditTask.getCompletionTrend();
      
      res.status(200).json({
        statusCounts,
        priorityCounts,
        approvalStats,
        completionTrend
      });
    } catch (error) {
      console.error('Error in getTaskAnalytics:', error);
      res.status(500).json({ error: 'Failed to fetch task analytics' });
    }
  }
};

module.exports = auditTaskController; 