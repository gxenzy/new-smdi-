import express from 'express';
import * as searchController from '../controllers/searchController';

const router = express.Router();

/**
 * @route   GET /api/search/sections
 * @desc    Search sections with full text capabilities
 * @access  Public
 */
router.get('/sections', searchController.searchSections);

/**
 * @route   GET /api/search/recent-terms
 * @desc    Get recent search terms for autocomplete
 * @access  Public
 */
router.get('/recent-terms', searchController.getRecentSearchTerms);

/**
 * @route   GET /api/search/suggestions
 * @desc    Get search suggestions for autocomplete
 * @access  Public
 */
router.get('/suggestions', searchController.getSearchSuggestions);

export default router; 