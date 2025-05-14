const Report = require('../models/Report');
const { validationResult } = require('express-validator');

/**
 * Controller for handling report-related requests
 */
const reportController = {
  /**
   * Create a new report
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  createReport: async (req, res) => {
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

      res.status(201).json({
        success: true,
        message: 'Report created successfully',
        data: report
      });
    } catch (error) {
      console.error('Error in createReport:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create report',
        error: error.message
      });
    }
  },

  /**
   * Get a report by ID
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  getReportById: async (req, res) => {
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

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Error in getReportById:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve report',
        error: error.message
      });
    }
  },

  /**
   * Get all reports (with optional filtering)
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  getAllReports: async (req, res) => {
    try {
      const filters = {
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

      res.status(200).json({
        success: true,
        count: reports.length,
        data: reports
      });
    } catch (error) {
      console.error('Error in getAllReports:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve reports',
        error: error.message
      });
    }
  },

  /**
   * Update a report
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  updateReport: async (req, res) => {
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
        await Report.deleteContents(reportId);
        
        // Then add new contents
        if (contents.length > 0) {
          await Report.addContents(reportId, contents);
        }
      }

      // Update metadata if provided
      if (metadata) {
        await Report.updateMetadata(reportId, metadata);
      }

      // Get the updated report
      const updatedReport = await Report.getById(reportId);

      res.status(200).json({
        success: true,
        message: 'Report updated successfully',
        data: updatedReport
      });
    } catch (error) {
      console.error('Error in updateReport:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update report',
        error: error.message
      });
    }
  },

  /**
   * Delete a report
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  deleteReport: async (req, res) => {
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

      res.status(200).json({
        success: true,
        message: 'Report deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteReport:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete report',
        error: error.message
      });
    }
  },

  /**
   * Share a report with another user
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  shareReport: async (req, res) => {
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

      res.status(200).json({
        success: true,
        message: 'Report shared successfully'
      });
    } catch (error) {
      console.error('Error in shareReport:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to share report',
        error: error.message
      });
    }
  },

  /**
   * Get reports shared with the current user
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  getSharedReports: async (req, res) => {
    try {
      const userId = req.user.id;
      const reports = await Report.getSharedWithUser(userId);

      res.status(200).json({
        success: true,
        count: reports.length,
        data: reports
      });
    } catch (error) {
      console.error('Error in getSharedReports:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve shared reports',
        error: error.message
      });
    }
  }
};

module.exports = reportController; 