const db = require('../database/connection');

/**
 * AuditTask Model
 * Represents an audit task in the energy audit workflow
 */
class AuditTask {
  /**
   * Get all audit tasks with optional filtering
   * @param {Object} filters - Optional filters for tasks
   * @param {Number} page - Page number for pagination
   * @param {Number} limit - Number of items per page
   * @returns {Promise<Array>} Array of audit tasks
   */
  static async getAll(filters = {}, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      let query = db('audit_tasks')
        .select(
          'audit_tasks.*',
          'assigned_user.name as assigned_to_name',
          'creator.name as created_by_name',
          'approver.name as approved_by_name',
          db.raw('COUNT(task_comments.id) as comment_count')
        )
        .leftJoin('users as assigned_user', 'audit_tasks.assigned_to', 'assigned_user.id')
        .leftJoin('users as creator', 'audit_tasks.created_by', 'creator.id')
        .leftJoin('users as approver', 'audit_tasks.approved_by', 'approver.id')
        .leftJoin('task_comments', 'audit_tasks.id', 'task_comments.task_id')
        .groupBy('audit_tasks.id');

      // Apply filters if they exist
      if (filters.status) {
        query = query.where('audit_tasks.status', filters.status);
      }

      if (filters.priority) {
        query = query.where('audit_tasks.priority', filters.priority);
      }

      if (filters.approval_status) {
        query = query.where('audit_tasks.approval_status', filters.approval_status);
      }

      if (filters.assigned_to) {
        query = query.where('audit_tasks.assigned_to', filters.assigned_to);
      }

      if (filters.created_by) {
        query = query.where('audit_tasks.created_by', filters.created_by);
      }

      if (filters.search) {
        query = query.where(function() {
          this.where('audit_tasks.title', 'like', `%${filters.search}%`)
            .orWhere('audit_tasks.description', 'like', `%${filters.search}%`);
        });
      }

      // Get total count for pagination
      const countQuery = query.clone();
      const [{ count }] = await countQuery.count('audit_tasks.id as count').groupBy();
      const total = parseInt(count || 0);

      // Apply pagination
      query = query.limit(limit).offset(offset);

      // Apply sorting
      const sortField = filters.sort_by || 'created_at';
      const sortDirection = filters.sort_direction || 'desc';
      query = query.orderBy(`audit_tasks.${sortField}`, sortDirection);

      const tasks = await query;

      return {
        data: tasks,
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting audit tasks:', error);
      throw error;
    }
  }

  /**
   * Get a single audit task by ID with related data
   * @param {Number} id - The task ID
   * @returns {Promise<Object>} The task with related data
   */
  static async getById(id) {
    try {
      const task = await db('audit_tasks')
        .select(
          'audit_tasks.*',
          'assigned_user.name as assigned_to_name',
          'creator.name as created_by_name',
          'approver.name as approved_by_name'
        )
        .leftJoin('users as assigned_user', 'audit_tasks.assigned_to', 'assigned_user.id')
        .leftJoin('users as creator', 'audit_tasks.created_by', 'creator.id')
        .leftJoin('users as approver', 'audit_tasks.approved_by', 'approver.id')
        .where('audit_tasks.id', id)
        .first();

      if (!task) {
        return null;
      }

      // Get comments
      task.comments = await db('task_comments')
        .select(
          'task_comments.*',
          'users.name as author_name'
        )
        .leftJoin('users', 'task_comments.user_id', 'users.id')
        .where('task_id', id)
        .orderBy('created_at', 'desc');

      // Get attachments
      task.attachments = await db('task_attachments')
        .select(
          'task_attachments.*',
          'users.name as uploaded_by_name'
        )
        .leftJoin('users', 'task_attachments.uploaded_by', 'users.id')
        .where('task_id', id);

      // Get categories
      task.categories = await db('task_categories')
        .select('task_categories.*')
        .join('task_category_assignments', 'task_categories.id', 'task_category_assignments.category_id')
        .where('task_category_assignments.task_id', id);

      // Get related items
      task.related_items = await db('task_related_items')
        .where('task_id', id);

      return task;
    } catch (error) {
      console.error(`Error getting audit task with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new audit task
   * @param {Object} taskData - The task data
   * @param {Number} userId - The ID of the user creating the task
   * @returns {Promise<Number>} The ID of the newly created task
   */
  static async create(taskData, userId) {
    try {
      const trx = await db.transaction();

      try {
        // Set the created_by field to the current user
        taskData.created_by = userId;
        
        // Insert the task
        const [taskId] = await trx('audit_tasks').insert({
          title: taskData.title,
          description: taskData.description,
          status: taskData.status || 'not_started',
          priority: taskData.priority || 'medium',
          assigned_to: taskData.assigned_to,
          created_by: taskData.created_by,
          due_date: taskData.due_date,
          approval_status: 'not_submitted'
        });

        // Add categories if provided
        if (taskData.categories && Array.isArray(taskData.categories) && taskData.categories.length > 0) {
          const categoryAssignments = taskData.categories.map(categoryId => ({
            task_id: taskId,
            category_id: categoryId
          }));
          
          await trx('task_category_assignments').insert(categoryAssignments);
        }

        // Add related items if provided
        if (taskData.related_items && Array.isArray(taskData.related_items) && taskData.related_items.length > 0) {
          const relatedItems = taskData.related_items.map(item => ({
            task_id: taskId,
            related_type: item.related_type,
            related_id: item.related_id
          }));
          
          await trx('task_related_items').insert(relatedItems);
        }

        // Add initial comment if provided
        if (taskData.initial_comment) {
          await trx('task_comments').insert({
            task_id: taskId,
            comment: taskData.initial_comment,
            user_id: userId
          });
        }

        // Record the task creation in the history
        await trx('task_history').insert({
          task_id: taskId,
          field_name: 'created',
          new_value: JSON.stringify({
            title: taskData.title,
            status: taskData.status || 'not_started',
            priority: taskData.priority || 'medium'
          }),
          changed_by: userId
        });

        await trx.commit();
        return taskId;
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error creating audit task:', error);
      throw error;
    }
  }

  /**
   * Update an existing audit task
   * @param {Number} id - The task ID
   * @param {Object} taskData - The new task data
   * @param {Number} userId - The ID of the user updating the task
   * @returns {Promise<Boolean>} Success indicator
   */
  static async update(id, taskData, userId) {
    try {
      const trx = await db.transaction();

      try {
        // Get the current task for history tracking
        const currentTask = await trx('audit_tasks').where('id', id).first();
        
        if (!currentTask) {
          throw new Error(`Task with ID ${id} not found`);
        }

        // Prepare the update data
        const updateData = {};
        const historyEntries = [];
        
        // Check which fields are being updated and prepare history entries
        const trackableFields = [
          'title', 'description', 'status', 'priority',
          'assigned_to', 'due_date', 'approval_status'
        ];
        
        trackableFields.forEach(field => {
          if (taskData[field] !== undefined && taskData[field] !== currentTask[field]) {
            updateData[field] = taskData[field];
            
            historyEntries.push({
              task_id: id,
              field_name: field,
              old_value: currentTask[field] ? String(currentTask[field]) : null,
              new_value: taskData[field] ? String(taskData[field]) : null,
              changed_by: userId
            });
          }
        });
        
        // Handle special cases
        if (taskData.status === 'completed' && currentTask.status !== 'completed') {
          updateData.completed_date = new Date();
          historyEntries.push({
            task_id: id,
            field_name: 'completed_date',
            old_value: null,
            new_value: updateData.completed_date.toISOString(),
            changed_by: userId
          });
        }
        
        if (taskData.approval_status === 'approved' && currentTask.approval_status !== 'approved') {
          updateData.approved_by = userId;
          updateData.approved_date = new Date();
          historyEntries.push({
            task_id: id,
            field_name: 'approval',
            old_value: currentTask.approval_status,
            new_value: `approved by user ${userId}`,
            changed_by: userId
          });
        }
        
        // Only update if there are changes
        if (Object.keys(updateData).length > 0) {
          // Always update the updated_at timestamp
          updateData.updated_at = new Date();
          
          await trx('audit_tasks').where('id', id).update(updateData);
          
          // Record the changes in history
          if (historyEntries.length > 0) {
            await trx('task_history').insert(historyEntries);
          }
        }
        
        // Update categories if provided
        if (taskData.categories && Array.isArray(taskData.categories)) {
          // First delete existing category assignments
          await trx('task_category_assignments').where('task_id', id).delete();
          
          // Then add the new ones
          if (taskData.categories.length > 0) {
            const categoryAssignments = taskData.categories.map(categoryId => ({
              task_id: id,
              category_id: categoryId
            }));
            
            await trx('task_category_assignments').insert(categoryAssignments);
          }
          
          historyEntries.push({
            task_id: id,
            field_name: 'categories',
            old_value: 'previous categories',
            new_value: JSON.stringify(taskData.categories),
            changed_by: userId
          });
        }
        
        // Update related items if provided
        if (taskData.related_items && Array.isArray(taskData.related_items)) {
          // First delete existing related items
          await trx('task_related_items').where('task_id', id).delete();
          
          // Then add the new ones
          if (taskData.related_items.length > 0) {
            const relatedItems = taskData.related_items.map(item => ({
              task_id: id,
              related_type: item.related_type,
              related_id: item.related_id
            }));
            
            await trx('task_related_items').insert(relatedItems);
          }
          
          historyEntries.push({
            task_id: id,
            field_name: 'related_items',
            old_value: 'previous related items',
            new_value: JSON.stringify(taskData.related_items),
            changed_by: userId
          });
        }
        
        await trx.commit();
        return true;
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    } catch (error) {
      console.error(`Error updating audit task with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an audit task
   * @param {Number} id - The task ID
   * @returns {Promise<Boolean>} Success indicator
   */
  static async delete(id) {
    try {
      const trx = await db.transaction();

      try {
        // Delete related records
        await trx('task_comments').where('task_id', id).delete();
        await trx('task_history').where('task_id', id).delete();
        await trx('task_attachments').where('task_id', id).delete();
        await trx('task_category_assignments').where('task_id', id).delete();
        await trx('task_related_items').where('task_id', id).delete();
        
        // Delete the task itself
        await trx('audit_tasks').where('id', id).delete();
        
        await trx.commit();
        return true;
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    } catch (error) {
      console.error(`Error deleting audit task with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Add a comment to a task
   * @param {Number} taskId - The task ID
   * @param {String} comment - The comment text
   * @param {Number} userId - The user ID of the commenter
   * @returns {Promise<Number>} The ID of the new comment
   */
  static async addComment(taskId, comment, userId) {
    try {
      const [commentId] = await db('task_comments').insert({
        task_id: taskId,
        comment,
        user_id: userId
      });
      
      // Update task history
      await db('task_history').insert({
        task_id: taskId,
        field_name: 'comment_added',
        new_value: comment.substring(0, 50) + (comment.length > 50 ? '...' : ''),
        changed_by: userId
      });
      
      return commentId;
    } catch (error) {
      console.error(`Error adding comment to task with ID ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Get task history
   * @param {Number} taskId - The task ID
   * @returns {Promise<Array>} Array of history entries
   */
  static async getHistory(taskId) {
    try {
      return await db('task_history')
        .select(
          'task_history.*',
          'users.name as changed_by_name'
        )
        .leftJoin('users', 'task_history.changed_by', 'users.id')
        .where('task_id', taskId)
        .orderBy('changed_at', 'desc');
    } catch (error) {
      console.error(`Error getting history for task with ID ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Update task status
   * @param {Number} taskId - The task ID
   * @param {String} status - The new status
   * @param {Number} userId - The user ID making the change
   * @returns {Promise<Boolean>} Success indicator
   */
  static async updateStatus(taskId, status, userId) {
    try {
      const task = await db('audit_tasks').where('id', taskId).first();
      
      if (!task) {
        throw new Error(`Task with ID ${taskId} not found`);
      }
      
      const updateData = { status, updated_at: new Date() };
      
      // If completing the task, set the completed date
      if (status === 'completed' && task.status !== 'completed') {
        updateData.completed_date = new Date();
      }
      
      await db('audit_tasks').where('id', taskId).update(updateData);
      
      // Record the change in history
      await db('task_history').insert({
        task_id: taskId,
        field_name: 'status',
        old_value: task.status,
        new_value: status,
        changed_by: userId
      });
      
      return true;
    } catch (error) {
      console.error(`Error updating status for task with ID ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Update task approval status
   * @param {Number} taskId - The task ID
   * @param {String} approvalStatus - The new approval status
   * @param {Number} userId - The user ID making the change
   * @param {String} comment - Optional comment about the approval decision
   * @returns {Promise<Boolean>} Success indicator
   */
  static async updateApprovalStatus(taskId, approvalStatus, userId, comment = null) {
    try {
      const task = await db('audit_tasks').where('id', taskId).first();
      
      if (!task) {
        throw new Error(`Task with ID ${taskId} not found`);
      }
      
      const updateData = {
        approval_status: approvalStatus,
        updated_at: new Date()
      };
      
      // If approving the task, set the approved_by and approved_date fields
      if (approvalStatus === 'approved') {
        updateData.approved_by = userId;
        updateData.approved_date = new Date();
      }
      
      await db('audit_tasks').where('id', taskId).update(updateData);
      
      // Record the change in history
      await db('task_history').insert({
        task_id: taskId,
        field_name: 'approval_status',
        old_value: task.approval_status,
        new_value: approvalStatus,
        changed_by: userId
      });
      
      // Add comment if provided
      if (comment) {
        await this.addComment(taskId, comment, userId);
      }
      
      return true;
    } catch (error) {
      console.error(`Error updating approval status for task with ID ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Get task counts by status
   * @returns {Promise<Object>} Status counts
   */
  static async getStatusCounts() {
    try {
      const counts = await db('audit_tasks')
        .select('status')
        .count('* as count')
        .groupBy('status');
      
      // Convert to an object with status as keys
      return counts.reduce((result, item) => {
        result[item.status] = parseInt(item.count);
        return result;
      }, {
        not_started: 0,
        in_progress: 0,
        completed: 0
      });
    } catch (error) {
      console.error('Error getting task status counts:', error);
      throw error;
    }
  }

  /**
   * Get task counts by priority
   * @returns {Promise<Object>} Priority counts
   */
  static async getPriorityCounts() {
    try {
      const counts = await db('audit_tasks')
        .select('priority')
        .count('* as count')
        .groupBy('priority');
      
      // Convert to an object with priority as keys
      return counts.reduce((result, item) => {
        result[item.priority] = parseInt(item.count);
        return result;
      }, {
        low: 0,
        medium: 0,
        high: 0
      });
    } catch (error) {
      console.error('Error getting task priority counts:', error);
      throw error;
    }
  }

  /**
   * Get approval statistics
   * @returns {Promise<Object>} Approval statistics
   */
  static async getApprovalStats() {
    try {
      const counts = await db('audit_tasks')
        .select('approval_status')
        .count('* as count')
        .groupBy('approval_status');
      
      // Convert to an object with approval status as keys
      return counts.reduce((result, item) => {
        result[item.approval_status] = parseInt(item.count);
        return result;
      }, {
        not_submitted: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      });
    } catch (error) {
      console.error('Error getting task approval stats:', error);
      throw error;
    }
  }

  /**
   * Get task completion trend for the last 30 days
   * @returns {Promise<Array>} Daily completion data
   */
  static async getCompletionTrend() {
    try {
      // Generate dates for the last 30 days
      const today = new Date();
      const dates = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }
      
      // Format dates for the database query (depends on the database type)
      const completedTasks = await db('audit_tasks')
        .select(db.raw('DATE(completed_date) as date'))
        .count('* as count')
        .whereNotNull('completed_date')
        .whereRaw('completed_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)')
        .groupByRaw('DATE(completed_date)');
      
      // Create a map for quick lookups
      const dateMap = completedTasks.reduce((map, item) => {
        map[item.date] = parseInt(item.count);
        return map;
      }, {});
      
      // Create the final array with all dates
      return dates.map(date => ({
        date,
        completed: dateMap[date] || 0
      }));
    } catch (error) {
      console.error('Error getting task completion trend:', error);
      throw error;
    }
  }
}

module.exports = AuditTask; 