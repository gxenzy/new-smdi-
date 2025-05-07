import express from 'express';
import { 
  getAllFindings, 
  createFinding, 
  updateFinding, 
  deleteFinding,
  assignFinding
} from '../controllers/findingsController';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { UserRole } from '../types';

const findingsRouter = express.Router();

// Apply authentication middleware to all routes
findingsRouter.use(authenticateToken);

// Get all findings
findingsRouter.get('/', getAllFindings);

// Create new finding (admin only)
findingsRouter.post('/', authorizeRole([UserRole.ADMIN]), createFinding);

// Update finding (admin only)
findingsRouter.put('/:id', authorizeRole([UserRole.ADMIN]), updateFinding);

// Delete finding (admin only)
findingsRouter.delete('/:id', authorizeRole([UserRole.ADMIN]), deleteFinding);

// Assign finding (admin only)
findingsRouter.post('/:id/assign', authorizeRole([UserRole.ADMIN]), assignFinding);

export default findingsRouter; 