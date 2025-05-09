import express from 'express';
import { getAllSettings, getSetting, upsertSetting } from '../controllers/adminSettingsController';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { UserRole } from '../types';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(authorizeRole([UserRole.ADMIN]));

router.get('/', getAllSettings);
router.get('/:key', getSetting);
router.put('/:key', upsertSetting);

export default router; 