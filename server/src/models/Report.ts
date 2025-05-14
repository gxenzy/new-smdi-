import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface ReportData {
  id?: number;
  title: string;
  description?: string;
  type: string;
  created_by: number;
  is_template?: boolean;
  is_public?: boolean;
  status?: string;
  version?: string;
}

interface ReportContent {
  section_id: string;
  section_type: string;
  content: any;
  sort_order?: number;
}

class Report {
  /**
   * Create a new report
   * @param data Report data
   * @returns Report ID
   */
  static async create(data: ReportData): Promise<number> {
    try {
      const { title, description, type, created_by, is_template, is_public } = data;
      
      const query = `
        INSERT INTO reports (title, description, type, created_by, is_template, is_public)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await pool.query<ResultSetHeader>(query, [
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
   * @param id Report ID
   * @returns Report data
   */
  static async getById(id: string | number): Promise<any> {
    try {
      // Get report metadata
      const reportQuery = `
        SELECT r.*, u.username as creator_name
        FROM reports r
        JOIN users u ON r.created_by = u.id
        WHERE r.id = ?
      `;
      
      const [reportResult] = await pool.query<RowDataPacket[]>(reportQuery, [id]);
      
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
      
      const [contentsResult] = await pool.query<RowDataPacket[]>(contentsQuery, [id]);
      
      // Get report metadata
      const metadataQuery = `
        SELECT key, value
        FROM report_metadata
        WHERE report_id = ?
      `;
      
      const [metadataRows] = await pool.query<RowDataPacket[]>(metadataQuery, [id]);
      
      // Format metadata as an object
      const metadata: Record<string, string> = {};
      metadataRows.forEach((row: any) => {
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
   * @param reportId Report ID
   * @param contents Array of content objects
   */
  static async addContents(reportId: number, contents: ReportContent[]): Promise<void> {
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
   * @param id Report ID
   * @param data Updated report data
   */
  static async update(id: number | string, data: Partial<ReportData>): Promise<void> {
    try {
      const validFields = [
        'title', 'description', 'type', 'is_template', 
        'is_public', 'status', 'version'
      ];
      
      // Build the query dynamically based on provided fields
      const updateParts: string[] = [];
      const values: any[] = [];
      
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
   * @param reportId Report ID
   * @param metadata Object containing metadata key-value pairs
   */
  static async updateMetadata(reportId: number | string, metadata: Record<string, any>): Promise<void> {
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
   * @param id Report ID
   */
  static async delete(id: number | string): Promise<void> {
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
   * @param filters Filter criteria
   * @returns Array of reports
   */
  static async getAll(filters: Record<string, any> = {}): Promise<any[]> {
    try {
      const whereConditions: string[] = [];
      const values: any[] = [];
      
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
      
      const [result] = await pool.query<RowDataPacket[]>(query, values);
      return result;
    } catch (error) {
      console.error('Error getting reports:', error);
      throw error;
    }
  }

  /**
   * Check if a user has access to a report
   * @param reportId Report ID
   * @param userId User ID
   * @returns Boolean indicating if the user has access
   */
  static async checkUserAccess(reportId: number | string, userId: number): Promise<boolean> {
    try {
      const query = `
        SELECT * FROM report_shares
        WHERE report_id = ? AND user_id = ?
      `;
      
      const [result] = await pool.query<RowDataPacket[]>(query, [reportId, userId]);
      return result.length > 0;
    } catch (error) {
      console.error('Error checking user access:', error);
      return false;
    }
  }

  /**
   * Check if a user has edit access to a report
   * @param reportId Report ID
   * @param userId User ID
   * @returns Boolean indicating if the user has edit access
   */
  static async checkUserEditAccess(reportId: number | string, userId: number): Promise<boolean> {
    try {
      const query = `
        SELECT * FROM report_shares
        WHERE report_id = ? AND user_id = ? AND permission IN ('edit', 'admin')
      `;
      
      const [result] = await pool.query<RowDataPacket[]>(query, [reportId, userId]);
      return result.length > 0;
    } catch (error) {
      console.error('Error checking user edit access:', error);
      return false;
    }
  }

  /**
   * Check if a user has admin access to a report
   * @param reportId Report ID
   * @param userId User ID
   * @returns Boolean indicating if the user has admin access
   */
  static async checkUserAdminAccess(reportId: number | string, userId: number): Promise<boolean> {
    try {
      const query = `
        SELECT * FROM report_shares
        WHERE report_id = ? AND user_id = ? AND permission = 'admin'
      `;
      
      const [result] = await pool.query<RowDataPacket[]>(query, [reportId, userId]);
      return result.length > 0;
    } catch (error) {
      console.error('Error checking user admin access:', error);
      return false;
    }
  }

  /**
   * Share a report with a user
   * @param reportId Report ID
   * @param userId User ID to share with
   * @param permission Permission level (view, edit, admin)
   * @param sharedBy User ID of the person sharing
   * @returns Created share ID
   */
  static async shareWithUser(
    reportId: number | string, 
    userId: number, 
    permission: 'view' | 'edit' | 'admin',
    sharedBy: number
  ): Promise<number> {
    try {
      // Check if share already exists
      const checkQuery = `
        SELECT id FROM report_shares
        WHERE report_id = ? AND user_id = ?
      `;
      
      const [existingShare] = await pool.query<RowDataPacket[]>(checkQuery, [reportId, userId]);
      
      if (existingShare.length > 0) {
        // Update existing share
        const updateQuery = `
          UPDATE report_shares
          SET permission = ?, updated_at = NOW(), shared_by = ?
          WHERE report_id = ? AND user_id = ?
        `;
        
        await pool.query(updateQuery, [permission, sharedBy, reportId, userId]);
        return existingShare[0].id;
      } else {
        // Create new share
        const insertQuery = `
          INSERT INTO report_shares (report_id, user_id, permission, shared_by)
          VALUES (?, ?, ?, ?)
        `;
        
        const [result] = await pool.query<ResultSetHeader>(insertQuery, [
          reportId,
          userId,
          permission,
          sharedBy
        ]);
        
        return result.insertId;
      }
    } catch (error) {
      console.error('Error sharing report with user:', error);
      throw error;
    }
  }

  /**
   * Get reports shared with a user
   * @param userId User ID
   * @returns Array of shared reports
   */
  static async getSharedWithUser(userId: number): Promise<any[]> {
    try {
      const query = `
        SELECT r.*, u.username as creator_name, s.permission
        FROM reports r
        JOIN users u ON r.created_by = u.id
        JOIN report_shares s ON r.id = s.report_id
        WHERE s.user_id = ?
        ORDER BY s.updated_at DESC
      `;
      
      const [result] = await pool.query<RowDataPacket[]>(query, [userId]);
      return result;
    } catch (error) {
      console.error('Error getting shared reports:', error);
      throw error;
    }
  }
}

export default Report;