import express from 'express';
import { getAuditLogs } from '../controllers/auditLogController';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { UserRole } from '../types';

const router = express.Router();

router.use(authenticateToken());
router.use(authorizeRole([UserRole.ADMIN]));

router.get('/', getAuditLogs);

export default router; 