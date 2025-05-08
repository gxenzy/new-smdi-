import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getTotalEnergyUsage,
  getActiveUsers,
  getCompletedAudits,
  getAlertsCount,
  getEnergyUsageTrend,
  getRecentActivity,
  getAllEnergyAudits
} from '../controllers/dashboardController';

const router = express.Router();

router.get('/energy-usage/total', authenticateToken, getTotalEnergyUsage);
router.get('/users/active', authenticateToken, getActiveUsers);
router.get('/audits/completed', authenticateToken, getCompletedAudits);
router.get('/alerts/count', authenticateToken, getAlertsCount);
router.get('/energy-usage/trend', authenticateToken, getEnergyUsageTrend);
router.get('/activity/recent', authenticateToken, getRecentActivity);
router.get('/energy-audits', authenticateToken, getAllEnergyAudits);

export default router; 