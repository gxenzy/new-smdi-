const express = require('express');
const router = express.Router();
const Standard = require('../models/Standard');

// Root route handler to avoid 404
router.get('/', async (req, res) => {
  try {
    // Either redirect to standards list or return a basic info response
    res.json({
      message: 'Standards API is running',
      endpoints: [
        '/standards', 
        '/standards/:id',
        '/standards/:standardId/sections',
        '/sections/:id',
        '/search/sections',
        '/lookup/illumination'
      ]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/standards-api/standards
 * @desc    Get all standards
 * @access  Public
 */
router.get('/standards', async (req, res) => {
  try {
    const standards = await Standard.getAll();
    res.json(standards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/standards-api/standards/:id
 * @desc    Get standard by ID
 * @access  Public
 */
router.get('/standards/:id', async (req, res) => {
  try {
    const standard = await Standard.getById(req.params.id);
    
    if (!standard) {
      return res.status(404).json({ message: 'Standard not found' });
    }
    
    res.json(standard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/standards-api/standards/:standardId/sections
 * @desc    Get sections for a standard, optionally filtered by parent section
 * @access  Public
 */
router.get('/standards/:standardId/sections', async (req, res) => {
  try {
    const { parentId } = req.query;
    const sections = await Standard.getSections(req.params.standardId, parentId);
    res.json(sections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/standards-api/sections/:id
 * @desc    Get section by ID
 * @access  Public
 */
router.get('/sections/:id', async (req, res) => {
  try {
    const section = await Standard.getSectionById(req.params.id);
    
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    
    res.json(section);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/standards-api/search/sections
 * @desc    Search sections by query
 * @access  Public
 */
router.get('/search/sections', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 3) {
      return res.status(400).json({ message: 'Search query must be at least 3 characters long' });
    }
    
    // Search sections using MySQL
    const sections = await Standard.searchSections({ query: q });
    res.json(sections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/standards-api/lookup/illumination
 * @desc    Look up illumination requirements by room type
 * @access  Public
 */
router.get('/lookup/illumination', async (req, res) => {
  try {
    const { roomType } = req.query;
    
    if (!roomType) {
      return res.status(400).json({ message: 'Room type is required' });
    }
    
    // Find PEC standard
    const standards = await Standard.getAll();
    const standard = standards.find(s => s.code_name === 'PEC-2017');
    
    if (!standard) {
      return res.status(404).json({ message: 'PEC standard not found' });
    }
    
    // Find Rule 1075 section
    const sections = await Standard.getSections(standard.id);
    const section = sections.find(s => s.section_number === '1075');
    
    if (!section) {
      return res.status(404).json({ message: 'Illumination section not found' });
    }
    
    // Get complete section with tables
    const fullSection = await Standard.getSectionById(section.id);
    
    if (!fullSection || !fullSection.tables || fullSection.tables.length === 0) {
      return res.status(404).json({ message: 'Illumination requirements not found' });
    }
    
    // Search for the room type in all tables
    let requirementFound = null;
    
    fullSection.tables.forEach(table => {
      if (table.content && table.content.rows) {
        const content = typeof table.content === 'string' ? JSON.parse(table.content) : table.content;
        
        content.rows.forEach(row => {
          // Check if this room type matches (case-insensitive partial match)
          if (row[0].toLowerCase().includes(roomType.toLowerCase())) {
            requirementFound = {
              roomType: row[0],
              requiredIlluminance: parseInt(row[1]),
              notes: row[2] || '',
              tableNumber: table.table_number,
              tableTitle: table.title,
              standard: standard.code_name,
              standardFullName: standard.full_name
            };
          }
        });
      }
    });
    
    if (requirementFound) {
      res.json(requirementFound);
    } else {
      res.status(404).json({ message: 'No illumination requirement found for this room type' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 