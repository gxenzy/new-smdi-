import api from './api';

/**
 * Service for interacting with the audit task API
 */
const auditWorkflowService = {
  /**
   * Get all audit tasks with optional filtering
   * @param {Object} filters - Filter options
   * @param {String} filters.status - Filter by status
   * @param {String} filters.priority - Filter by priority
   * @param {String} filters.approval_status - Filter by approval status
   * @param {Number} filters.assigned_to - Filter by assigned user ID
   * @param {Number} filters.created_by - Filter by creator user ID
   * @param {String} filters.search - Search in title and description
   * @param {String} filters.sort_by - Sort field
   * @param {String} filters.sort_direction - Sort direction (asc/desc)
   * @param {Number} page - Page number
   * @param {Number} limit - Items per page
   * @returns {Promise<Object>} Task list with pagination
   */
  getAllTasks: async (filters = {}, page = 1, limit = 10) => {
    try {
      // Build query params
      const queryParams = new URLSearchParams();
      
      // Add filters
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });
      
      // Add pagination
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      
      const response = await api.get(`/audit/tasks?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  /**
   * Get a task by ID
   * @param {Number} id - Task ID
   * @returns {Promise<Object>} Task details
   */
  getTaskById: async (id) => {
    try {
      const response = await api.get(`/audit/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @returns {Promise<Object>} Created task response
   */
  createTask: async (taskData) => {
    try {
      const response = await api.post('/audit/tasks', taskData);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  /**
   * Update a task
   * @param {Number} id - Task ID
   * @param {Object} taskData - Updated task data
   * @returns {Promise<Object>} Update response
   */
  updateTask: async (id, taskData) => {
    try {
      const response = await api.put(`/audit/tasks/${id}`, taskData);
      return response.data;
    } catch (error) {
      console.error(`Error updating task ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a task
   * @param {Number} id - Task ID
   * @returns {Promise<Object>} Delete response
   */
  deleteTask: async (id) => {
    try {
      const response = await api.delete(`/audit/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error);
      throw error;
    }
  },

  /**
   * Add a comment to a task
   * @param {Number} taskId - Task ID
   * @param {String} comment - Comment text
   * @returns {Promise<Object>} Add comment response
   */
  addComment: async (taskId, comment) => {
    try {
      const response = await api.post(`/audit/tasks/${taskId}/comments`, { comment });
      return response.data;
    } catch (error) {
      console.error(`Error adding comment to task ${taskId}:`, error);
      throw error;
    }
  },

  /**
   * Get task history
   * @param {Number} taskId - Task ID
   * @returns {Promise<Array>} Task history
   */
  getTaskHistory: async (taskId) => {
    try {
      const response = await api.get(`/audit/tasks/${taskId}/history`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching history for task ${taskId}:`, error);
      throw error;
    }
  },

  /**
   * Update task status
   * @param {Number} taskId - Task ID
   * @param {String} status - New status
   * @returns {Promise<Object>} Update response
   */
  updateTaskStatus: async (taskId, status) => {
    try {
      const response = await api.put(`/audit/tasks/${taskId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating status for task ${taskId}:`, error);
      throw error;
    }
  },

  /**
   * Update task approval status
   * @param {Number} taskId - Task ID
   * @param {String} approvalStatus - New approval status
   * @param {String} comment - Optional comment
   * @returns {Promise<Object>} Update response
   */
  updateApprovalStatus: async (taskId, approvalStatus, comment = null) => {
    try {
      const response = await api.put(`/audit/tasks/${taskId}/approval`, { 
        approval_status: approvalStatus,
        comment
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating approval status for task ${taskId}:`, error);
      throw error;
    }
  },

  /**
   * Get task analytics data
   * @returns {Promise<Object>} Analytics data
   */
  getTaskAnalytics: async () => {
    try {
      const response = await api.get('/audit/tasks/analytics/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching task analytics:', error);
      throw error;
    }
  }
};

export default auditWorkflowService; 