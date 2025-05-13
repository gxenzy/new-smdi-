import express from 'express';
import * as complianceController from '../controllers/complianceController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Compliance Rules routes
router.get('/rules', complianceController.getAllRules);
router.get('/rules/:id', complianceController.getRuleById);
router.post('/rules', complianceController.createRule);
router.put('/rules/:id', complianceController.updateRule);
router.delete('/rules/:id', complianceController.deleteRule);

// Compliance Checklists routes
router.get('/checklists', complianceController.getAllChecklists);
router.get('/checklists/:id', complianceController.getChecklistById);
router.post('/checklists', complianceController.createChecklist);
router.put('/checklists/:id/status', complianceController.updateChecklistStatus);

// Compliance Checks routes (nested under checklists)
router.put('/checklists/:checklistId/checks/:checkId', complianceController.updateCheckStatus);

export default router; 