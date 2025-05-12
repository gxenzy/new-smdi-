import express, { Request, Response, RequestHandler } from 'express';
import { body } from 'express-validator';
import * as reportController from '../controllers/reportControllerTs';
import { authenticateToken } from '../middleware/auth';
import { UserRole } from '../types';

// Define interface for authenticated requests to match controller expectations
interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    username: string;
    role: UserRole;
  };
}

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Helper function to cast controller functions to RequestHandler
const asyncHandler = (fn: (req: AuthenticatedRequest, res: Response) => Promise<any>): RequestHandler => 
  (req, res, next) => Promise.resolve(fn(req as AuthenticatedRequest, res)).catch(next);

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

export default router; 