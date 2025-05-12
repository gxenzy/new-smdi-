import express from 'express';
import * as standardsController from '../controllers/standardsController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes - no authentication required
router.get('/standards', standardsController.getAllStandards);
router.get('/standards/:id', standardsController.getStandardById);
router.get('/standards/:standardId/sections', standardsController.getSections);
router.get('/sections/:id', standardsController.getSectionById);
router.get('/search/sections', standardsController.searchSections);
router.get('/resources', standardsController.getResources);

// Protected routes - authentication required
router.use(authenticateToken);

// Standard and section management
router.post('/standards', standardsController.createStandard);
router.post('/standards/:standardId/sections', standardsController.createSection);
router.post('/sections/:sectionId/tables', standardsController.addTable);
router.post('/sections/:sectionId/figures', standardsController.addFigure);
router.post('/sections/:sectionId/requirements', standardsController.addComplianceRequirement);
router.post('/sections/:sectionId/resources', standardsController.addResource);

// Bookmarks
router.post('/bookmarks', standardsController.addBookmark);
router.delete('/users/:userId/bookmarks/:sectionId', standardsController.removeBookmark);
router.get('/users/:userId/bookmarks', standardsController.getUserBookmarks);

// Notes
router.post('/notes', standardsController.addNote);
router.put('/notes/:id', standardsController.updateNote);
router.delete('/notes/:id', standardsController.deleteNote);
router.get('/users/:userId/sections/:sectionId/notes', standardsController.getSectionNotes);

export default router; 