import express from 'express';
import { createEnergyAudit } from '../controllers/energyAuditController';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { UserRole } from '../types';

const energyAuditRouter = express.Router();

energyAuditRouter.use(authenticateToken);

// Create new energy audit (admin only)
energyAuditRouter.post('/', authorizeRole([UserRole.ADMIN]), createEnergyAudit);

export default energyAuditRouter; 