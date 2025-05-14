const { pool } = require('../config/database');

/**
 * Report model for handling report-related database operations
 */
class Report {
  /**
   * Create a new report
   * @param {Object} data Report data
   * @returns {Promise<number>} Report ID
   */
  static async create(data) {
    try {
      const { title, description, type, created_by, is_template, is_public } = data;
      
      const query = `
        INSERT INTO reports (title, description, type, created_by, is_template, is_public)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await pool.query(query, [
        title, 
        description || null, 
        type, 
        created_by, 
        is_template || false, 
        is_public || false
      ]);
      
      return result.insertId;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  }
  
  /**
   * Get a report by ID
   * @param {string|number} id Report ID
   * @returns {Promise<Object|null>} Report data
   */
  static async getById(id) {
    try {
      // Get report metadata
      const reportQuery = `
        SELECT r.*, u.username as creator_name
        FROM reports r
        JOIN users u ON r.created_by = u.id
        WHERE r.id = ?
      `;
      
      const [reportResult] = await pool.query(reportQuery, [id]);
      
      if (!reportResult || !reportResult.length) {
        return null;
      }
      
      const report = reportResult[0];
      
      // Get report contents
      const contentsQuery = `
        SELECT id, section_id, section_type, content, sort_order
        FROM report_contents
        WHERE report_id = ?
        ORDER BY sort_order ASC
      `;
      
      const [contentsResult] = await pool.query(contentsQuery, [id]);
      
      // Get report metadata
      const metadataQuery = `
        SELECT key, value
        FROM report_metadata
        WHERE report_id = ?
      `;
      
      const [metadataRows] = await pool.query(metadataQuery, [id]);
      
      // Format metadata as an object
      const metadata = {};
      metadataRows.forEach((row) => {
        metadata[row.key] = row.value;
      });
      
      return {
        ...report,
        contents: contentsResult,
        metadata
      };
    } catch (error) {
      console.error('Error getting report by ID:', error);
      throw error;
    }
  }
  
  /**
   * Add contents to a report
   * @param {number} reportId Report ID
   * @param {Array<Object>} contents Array of content objects
   * @returns {Promise<void>}
   */
  static async addContents(reportId, contents) {
    try {
      for (const content of contents) {
        const query = `
          INSERT INTO report_contents (report_id, section_id, section_type, content, sort_order)
          VALUES (?, ?, ?, ?, ?)
        `;
        
        await pool.query(query, [
          reportId,
          content.section_id,
          content.section_type,
          JSON.stringify(content.content),
          content.sort_order || 0
        ]);
      }
    } catch (error) {
      console.error('Error adding report contents:', error);
      throw error;
    }
  }
  
  /**
   * Update a report
   * @param {number|string} id Report ID
   * @param {Object} data Updated report data
   * @returns {Promise<void>}
   */
  static async update(id, data) {
    try {
      const validFields = [
        'title', 'description', 'type', 'is_template', 
        'is_public', 'status', 'version'
      ];
      
      // Build the query dynamically based on provided fields
      const updateParts = [];
      const values = [];
      
      for (const [key, value] of Object.entries(data)) {
        if (validFields.includes(key) && value !== undefined) {
          updateParts.push(`${key} = ?`);
          values.push(value);
        }
      }
      
      if (updateParts.length === 0) {
        return; // Nothing to update
      }
      
      // Add updated_at timestamp
      updateParts.push(`updated_at = NOW()`);
      
      const query = `
        UPDATE reports
        SET ${updateParts.join(', ')}
        WHERE id = ?
      `;
      
      values.push(id);
      await pool.query(query, values);
    } catch (error) {
      console.error('Error updating report:', error);
      throw error;
    }
  }
  
  /**
   * Update report metadata
   * @param {number|string} reportId Report ID
   * @param {Object} metadata Object containing metadata key-value pairs
   * @returns {Promise<void>}
   */
  static async updateMetadata(reportId, metadata) {
    try {
      // First delete existing metadata
      await pool.query('DELETE FROM report_metadata WHERE report_id = ?', [reportId]);
      
      // Then add new metadata
      for (const [key, value] of Object.entries(metadata)) {
        const query = `
          INSERT INTO report_metadata (report_id, key, value)
          VALUES (?, ?, ?)
        `;
        
        await pool.query(query, [
          reportId,
          key,
          typeof value === 'object' ? JSON.stringify(value) : value
        ]);
      }
    } catch (error) {
      console.error('Error updating report metadata:', error);
      throw error;
    }
  }
  
  /**
   * Delete a report
   * @param {number|string} id Report ID
   * @returns {Promise<void>}
   */
  static async delete(id) {
    try {
      // Report table has CASCADE delete constraints, so this will delete all related data
      await pool.query('DELETE FROM reports WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  }
  
  /**
   * Get all reports with optional filtering
   * @param {Object} filters Filter criteria
   * @returns {Promise<Array>} Array of reports
   */
  static async getAll(filters = {}) {
    try {
      const whereConditions = [];
      const values = [];
      
      // Build WHERE conditions based on filters
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined) {
          whereConditions.push(`r.${key} = ?`);
          values.push(value);
        }
      }
      
      const whereClause = whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';
      
      const query = `
        SELECT r.*, u.username as creator_name
        FROM reports r
        JOIN users u ON r.created_by = u.id
        ${whereClause}
        ORDER BY r.created_at DESC
      `;
      
      const [reports] = await pool.query(query, values);
      return reports;
    } catch (error) {
      console.error('Error getting all reports:', error);
      throw error;
    }
  }

  /**
   * Check if user has access to a report
   * @param {number|string} reportId Report ID
   * @param {number} userId User ID
   * @returns {Promise<boolean>} Whether the user has access
   */
  static async checkUserAccess(reportId, userId) {
    try {
      const query = `
        SELECT permission FROM report_sharing
        WHERE report_id = ? AND user_id = ?
      `;
      
      const [result] = await pool.query(query, [reportId, userId]);
      return result.length > 0;
    } catch (error) {
      console.error('Error checking user access:', error);
      throw error;
    }
  }

  /**
   * Check if user has edit access to a report
   * @param {number|string} reportId Report ID
   * @param {number} userId User ID
   * @returns {Promise<boolean>} Whether the user has edit access
   */
  static async checkUserEditAccess(reportId, userId) {
    try {
      const query = `
        SELECT permission FROM report_sharing
        WHERE report_id = ? AND user_id = ? AND permission IN ('edit', 'admin')
      `;
      
      const [result] = await pool.query(query, [reportId, userId]);
      return result.length > 0;
    } catch (error) {
      console.error('Error checking user edit access:', error);
      throw error;
    }
  }

  /**
   * Check if user has admin access to a report
   * @param {number|string} reportId Report ID
   * @param {number} userId User ID
   * @returns {Promise<boolean>} Whether the user has admin access
   */
  static async checkUserAdminAccess(reportId, userId) {
    try {
      const query = `
        SELECT permission FROM report_sharing
        WHERE report_id = ? AND user_id = ? AND permission = 'admin'
      `;
      
      const [result] = await pool.query(query, [reportId, userId]);
      return result.length > 0;
    } catch (error) {
      console.error('Error checking user admin access:', error);
      throw error;
    }
  }

  /**
   * Share a report with a user
   * @param {number|string} reportId Report ID
   * @param {number} userId User ID
   * @param {string} permission Permission level ('view', 'edit', 'admin')
   * @param {number} sharedBy User ID of the person sharing
   * @returns {Promise<number>} Sharing record ID
   */
  static async shareWithUser(reportId, userId, permission, sharedBy) {
    try {
      // Check if sharing already exists
      const checkQuery = `
        SELECT id FROM report_sharing
        WHERE report_id = ? AND user_id = ?
      `;
      
      const [existing] = await pool.query(checkQuery, [reportId, userId]);
      
      if (existing.length > 0) {
        // Update existing sharing
        const updateQuery = `
          UPDATE report_sharing
          SET permission = ?, updated_at = NOW(), shared_by = ?
          WHERE id = ?
        `;
        
        await pool.query(updateQuery, [permission, sharedBy, existing[0].id]);
        return existing[0].id;
      } else {
        // Create new sharing
        const insertQuery = `
          INSERT INTO report_sharing (report_id, user_id, permission, shared_by)
          VALUES (?, ?, ?, ?)
        `;
        
        const [result] = await pool.query(insertQuery, [reportId, userId, permission, sharedBy]);
        return result.insertId;
      }
    } catch (error) {
      console.error('Error sharing report with user:', error);
      throw error;
    }
  }

  /**
   * Get reports shared with a user
   * @param {number} userId User ID
   * @returns {Promise<Array>} Array of shared reports
   */
  static async getSharedWithUser(userId) {
    try {
      const query = `
        SELECT r.*, u.username as creator_name, rs.permission, 
          u2.username as shared_by_username
        FROM reports r
        JOIN report_sharing rs ON r.id = rs.report_id
        JOIN users u ON r.created_by = u.id
        JOIN users u2 ON rs.shared_by = u2.id
        WHERE rs.user_id = ?
        ORDER BY rs.created_at DESC
      `;
      
      const [reports] = await pool.query(query, [userId]);
      return reports;
    } catch (error) {
      console.error('Error getting shared reports:', error);
      throw error;
    }
  }

  /**
   * Delete all contents for a report
   * @param {number|string} reportId Report ID
   * @returns {Promise<void>}
   */
  static async deleteContents(reportId) {
    try {
      await pool.query('DELETE FROM report_contents WHERE report_id = ?', [reportId]);
    } catch (error) {
      console.error('Error deleting report contents:', error);
      throw error;
    }
  }
}

module.exports = Report; 