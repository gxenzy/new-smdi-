import express from 'express';
import * as tagController from '../controllers/tagController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/tags', tagController.getAllTags);
router.get('/sections/:sectionId/tags', tagController.getSectionTags);

// Protected routes - authentication required
router.use(authenticateToken);

// Tag management
router.post('/tags', tagController.createTag);
router.put('/tags/:id', tagController.updateTag);
router.delete('/tags/:id', tagController.deleteTag);

// Tag-section mappings
router.post('/section-tags', tagController.addTagToSection);
router.delete('/sections/:sectionId/tags/:tagId', tagController.removeTagFromSection);

export default router; 