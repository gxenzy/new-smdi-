import express from 'express';
import { getSystemSettings, updateSystemSettings } from '../controllers/systemSettingsController';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { UserRole } from '../types';

const router = express.Router();

// Require admin authentication for all settings routes
router.use(authenticateToken);
router.use(authorizeRole([UserRole.ADMIN]));

// Settings routes
router.get('/', getSystemSettings);
router.put('/', updateSystemSettings);

export default router; 