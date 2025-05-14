const express = require('express');
const standardsController = require('../controllers/standardsController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public routes - no authentication required
router.get('/standards', standardsController.getAllStandards);
router.get('/standards/:id', standardsController.getStandardById);
router.get('/standards/:standardId/sections', standardsController.getSections);
router.get('/sections/:id', standardsController.getSectionById);
router.get('/search/sections', standardsController.searchSections);
router.get('/resources', standardsController.getResources);
router.get('/lookup/illumination', standardsController.lookupIlluminationRequirements);

// Standard values lookup routes - public access
router.get('/lookup/:type/categories', standardsController.getStandardCategories);
router.get('/lookup/:type/values/:categoryId', standardsController.getStandardValues);

// Tag routes - public access for reading
router.get('/tags', standardsController.getAllTags);
router.get('/sections/:sectionId/tags', standardsController.getSectionTags);
router.get('/tags/:tagId/sections', standardsController.getSectionsByTag);

// Protected routes - authentication required
router.use(auth.authenticateToken);

// Standard and section management
router.post('/standards', standardsController.createStandard);
router.post('/standards/:standardId/sections', standardsController.createSection);
router.post('/sections/:sectionId/tables', standardsController.addTable);
router.post('/sections/:sectionId/figures', standardsController.addFigure);
router.post('/sections/:sectionId/requirements', standardsController.addComplianceRequirement);
router.post('/sections/:sectionId/resources', standardsController.addResource);

// Tag management - protected routes
router.post('/tags', standardsController.addTag);
router.post('/sections/:sectionId/tags', standardsController.addSectionTag);
router.delete('/sections/:sectionId/tags/:tagId', standardsController.removeSectionTag);

// Bookmarks
router.post('/bookmarks', standardsController.addBookmark);
router.delete('/users/:userId/bookmarks/:sectionId', standardsController.removeBookmark);
router.get('/users/:userId/bookmarks', standardsController.getUserBookmarks);

// Notes
router.post('/notes', standardsController.addNote);
router.put('/notes/:id', standardsController.updateNote);
router.delete('/notes/:id', standardsController.deleteNote);
router.get('/users/:userId/sections/:sectionId/notes', standardsController.getSectionNotes);

module.exports = router; 