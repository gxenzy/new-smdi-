import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { pool } from '../config/database';
import { UserRole } from '../types';

// Import models
import Report from '../models/Report';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    username: string;
    role: UserRole;
  };
}

/**
 * Create a new report
 * @param {AuthenticatedRequest} req - Express request object
 * @param {Response} res - Express response object
 */
export const createReport = async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, type, contents, metadata } = req.body;
    
    // Create report
    const reportId = await Report.create({
      title,
      description,
      type,
      created_by: req.user.id, // Assuming user info is added by auth middleware
      is_template: req.body.is_template || false,
      is_public: req.body.is_public || false
    });

    // Add contents if provided
    if (contents && Array.isArray(contents) && contents.length > 0) {
      await Report.addContents(reportId, contents);
    }

    // Add metadata if provided
    if (metadata) {
      await Report.updateMetadata(reportId, metadata);
    }

    // Get the created report
    const report = await Report.getById(reportId);

    return res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: report
    });
  } catch (error: any) {
    console.error('Error in createReport:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create report',
      error: error.message
    });
  }
};

/**
 * Get a report by ID
 * @param {AuthenticatedRequest} req - Express request object
 * @param {Response} res - Express response object
 */
export const getReportById = async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
  try {
    const reportId = req.params.id;
    const report = await Report.getById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user has permission to access this report
    // If not the creator, check sharing permissions
    if (report.created_by !== req.user.id) {
      const hasAccess = await Report.checkUserAccess(reportId, req.user.id);
      
      if (!hasAccess && !report.is_public) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this report'
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error: any) {
    console.error('Error in getReportById:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve report',
      error: error.message
    });
  }
};

/**
 * Get all reports (with optional filtering)
 * @param {AuthenticatedRequest} req - Express request object
 * @param {Response} res - Express response object
 */
export const getAllReports = async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
  try {
    const filters: any = {
      created_by: req.query.created_by || req.user.id, // Default to current user's reports
      type: req.query.type,
      status: req.query.status,
      is_template: req.query.is_template !== undefined 
        ? req.query.is_template === 'true' 
        : undefined,
      is_public: req.query.is_public !== undefined 
        ? req.query.is_public === 'true' 
        : undefined
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const reports = await Report.getAll(filters);

    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error: any) {
    console.error('Error in getAllReports:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve reports',
      error: error.message
    });
  }
};

/**
 * Update a report
 * @param {AuthenticatedRequest} req - Express request object
 * @param {Response} res - Express response object
 */
export const updateReport = async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
  try {
    const reportId = req.params.id;
    const { title, description, type, contents, metadata, is_template, is_public, status, version } = req.body;

    // Get existing report to check permissions
    const existingReport = await Report.getById(reportId);

    if (!existingReport) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user has permission to update this report
    if (existingReport.created_by !== req.user.id) {
      const hasEditAccess = await Report.checkUserEditAccess(reportId, req.user.id);
      
      if (!hasEditAccess) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this report'
        });
      }
    }

    // Update report metadata
    await Report.update(reportId, {
      title,
      description,
      type,
      is_template,
      is_public,
      status,
      version
    });

    // Update contents if provided
    if (contents && Array.isArray(contents)) {
      // First delete existing contents
      await pool.query('DELETE FROM report_contents WHERE report_id = ?', [reportId]);
      
      // Then add new contents
      if (contents.length > 0) {
        await Report.addContents(Number(reportId), contents);
      }
    }

    // Update metadata if provided
    if (metadata) {
      await Report.updateMetadata(reportId, metadata);
    }

    // Get the updated report
    const updatedReport = await Report.getById(reportId);

    return res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      data: updatedReport
    });
  } catch (error: any) {
    console.error('Error in updateReport:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update report',
      error: error.message
    });
  }
};

/**
 * Delete a report
 * @param {AuthenticatedRequest} req - Express request object
 * @param {Response} res - Express response object
 */
export const deleteReport = async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
  try {
    const reportId = req.params.id;

    // Get existing report to check permissions
    const existingReport = await Report.getById(reportId);

    if (!existingReport) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user has permission to delete this report
    if (existingReport.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this report'
      });
    }

    // Delete the report
    await Report.delete(reportId);

    return res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error: any) {
    console.error('Error in deleteReport:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete report',
      error: error.message
    });
  }
};

/**
 * Share a report with another user
 * @param {AuthenticatedRequest} req - Express request object
 * @param {Response} res - Express response object
 */
export const shareReport = async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
  try {
    const reportId = req.params.id;
    const { userId, permission } = req.body;

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Get existing report to check permissions
    const existingReport = await Report.getById(reportId);

    if (!existingReport) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user has permission to share this report
    if (existingReport.created_by !== req.user.id) {
      const hasAdminAccess = await Report.checkUserAdminAccess(reportId, req.user.id);
      
      if (!hasAdminAccess) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to share this report'
        });
      }
    }

    // Share the report
    await Report.shareWithUser(reportId, userId, permission, req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Report shared successfully'
    });
  } catch (error: any) {
    console.error('Error in shareReport:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to share report',
      error: error.message
    });
  }
};

/**
 * Get reports shared with the current user
 * @param {AuthenticatedRequest} req - Express request object
 * @param {Response} res - Express response object
 */
export const getSharedReports = async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
  try {
    const userId = req.user.id;
    const reports = await Report.getSharedWithUser(userId);

    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error: any) {
    console.error('Error in getSharedReports:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve shared reports',
      error: error.message
    });
  }
}; 