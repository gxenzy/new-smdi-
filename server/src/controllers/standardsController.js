const Standard = require('../models/Standard');

/**
 * Get all standards
 */
const getAllStandards = async (_req, res) => {
  try {
    const standards = await Standard.getAll();
    res.json(standards);
  } catch (error) {
    console.error('Error getting all standards:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get a standard by ID
 */
const getStandardById = async (req, res) => {
  try {
    const standard = await Standard.getById(req.params.id);
    
    if (!standard) {
      res.status(404).json({ message: 'Standard not found' });
      return;
    }
    
    res.json(standard);
  } catch (error) {
    console.error('Error getting standard by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Create a new standard
 */
const createStandard = async (req, res) => {
  try {
    const standardId = await Standard.create(req.body);
    res.status(201).json({ 
      id: standardId,
      message: 'Standard created successfully' 
    });
  } catch (error) {
    console.error('Error creating standard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get sections for a standard
 */
const getSections = async (req, res) => {
  try {
    const standardId = req.params.standardId;
    const parentId = req.query.parentId ? Number(req.query.parentId) : undefined;
    
    const sections = await Standard.getSections(standardId, parentId);
    res.json(sections);
  } catch (error) {
    console.error('Error getting sections:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get a section by ID
 */
const getSectionById = async (req, res) => {
  try {
    const section = await Standard.getSectionById(req.params.id);
    
    if (!section) {
      res.status(404).json({ message: 'Section not found' });
      return;
    }
    
    res.json(section);
  } catch (error) {
    console.error('Error getting section by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Create a new section
 */
const createSection = async (req, res) => {
  try {
    const sectionId = await Standard.addSection(req.body);
    res.status(201).json({ 
      id: sectionId,
      message: 'Section created successfully' 
    });
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Search sections
 */
const searchSections = async (req, res) => {
  try {
    const query = req.query.q || '';
    const standardId = req.query.standardId ? Number(req.query.standardId) : undefined;
    const exactMatch = req.query.exactMatch === 'true';
    const fields = req.query.fields ? req.query.fields.split(',') : ['title', 'content', 'section_number'];
    
    if (!query && !standardId) {
      res.status(400).json({ message: 'Search query or standardId is required' });
      return;
    }
    
    const results = await Standard.searchSections({ 
      query,
      standard_id: standardId,
      exactMatch,
      fields
    });
    
    // Sort results by relevance score if searching by query
    if (query) {
      // Basic relevance scoring
      results.forEach(result => {
        let relevance = 0;
        
        // Add to score based on where the match was found
        if (fields.includes('title') && result.title && result.title.toLowerCase().includes(query.toLowerCase())) {
          relevance += 3; // Title matches have high relevance
        }
        
        if (fields.includes('section_number') && result.section_number && result.section_number.toLowerCase().includes(query.toLowerCase())) {
          relevance += 4; // Section number matches have highest relevance
        }
        
        if (fields.includes('content') && result.content && result.content.toLowerCase().includes(query.toLowerCase())) {
          relevance += 1; // Content matches have lower relevance
          
          // Add more relevance if it appears multiple times
          const occurrences = (result.content.toLowerCase().match(new RegExp(query.toLowerCase(), 'g')) || []).length;
          relevance += Math.min(occurrences / 2, 2); // Cap the bonus at 2
        }
        
        // Exact matches get a boost
        if (exactMatch) {
          if (fields.includes('title') && result.title && result.title.toLowerCase() === query.toLowerCase()) {
            relevance += 3;
          }
          if (fields.includes('section_number') && result.section_number && result.section_number.toLowerCase() === query.toLowerCase()) {
            relevance += 4;
          }
        }
        
        result.relevance = relevance;
      });
      
      // Sort by relevance score (highest first)
      results.sort((a, b) => b.relevance - a.relevance);
    }
    
    res.json(results);
  } catch (error) {
    console.error('Error searching sections:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Add a table to a section
 */
const addTable = async (req, res) => {
  try {
    const tableId = await Standard.addTable(req.body);
    res.status(201).json({ 
      id: tableId,
      message: 'Table added successfully' 
    });
  } catch (error) {
    console.error('Error adding table:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Add a figure to a section
 */
const addFigure = async (req, res) => {
  try {
    const figureId = await Standard.addFigure(req.body);
    res.status(201).json({ 
      id: figureId,
      message: 'Figure added successfully' 
    });
  } catch (error) {
    console.error('Error adding figure:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Add a compliance requirement
 */
const addComplianceRequirement = async (req, res) => {
  try {
    const requirementId = await Standard.addComplianceRequirement(req.body);
    res.status(201).json({ 
      id: requirementId,
      message: 'Compliance requirement added successfully' 
    });
  } catch (error) {
    console.error('Error adding compliance requirement:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Add an educational resource
 */
const addResource = async (req, res) => {
  try {
    const resourceId = await Standard.addResource(req.body);
    res.status(201).json({ 
      id: resourceId,
      message: 'Educational resource added successfully' 
    });
  } catch (error) {
    console.error('Error adding educational resource:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get educational resources
 */
const getResources = async (req, res) => {
  try {
    const sectionId = req.query.sectionId ? Number(req.query.sectionId) : undefined;
    const resourceType = req.query.type;
    const difficulty = req.query.difficulty;
    
    const resources = await Standard.getResources({
      section_id: sectionId,
      resource_type: resourceType,
      difficulty
    });
    
    res.json(resources);
  } catch (error) {
    console.error('Error getting resources:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Add a bookmark
 */
const addBookmark = async (req, res) => {
  try {
    const { userId, sectionId } = req.body;
    
    if (!userId || !sectionId) {
      res.status(400).json({ message: 'User ID and section ID are required' });
      return;
    }
    
    const bookmarkId = await Standard.addBookmark(userId, sectionId);
    
    if (bookmarkId === null) {
      res.status(409).json({ message: 'Bookmark already exists' });
      return;
    }
    
    res.status(201).json({ 
      id: bookmarkId,
      message: 'Bookmark added successfully' 
    });
  } catch (error) {
    console.error('Error adding bookmark:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Remove a bookmark
 */
const removeBookmark = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const sectionId = Number(req.params.sectionId);
    
    const success = await Standard.removeBookmark(userId, sectionId);
    
    if (!success) {
      res.status(404).json({ message: 'Bookmark not found' });
      return;
    }
    
    res.json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get user bookmarks
 */
const getUserBookmarks = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const bookmarks = await Standard.getUserBookmarks(userId);
    
    res.json(bookmarks);
  } catch (error) {
    console.error('Error getting user bookmarks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Add a note
 */
const addNote = async (req, res) => {
  try {
    const noteId = await Standard.addNote(req.body);
    res.status(201).json({ 
      id: noteId,
      message: 'Note added successfully' 
    });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update a note
 */
const updateNote = async (req, res) => {
  try {
    const noteId = Number(req.params.id);
    const { content } = req.body;
    
    if (!content) {
      res.status(400).json({ message: 'Note content is required' });
      return;
    }
    
    const success = await Standard.updateNote(noteId, content);
    
    if (!success) {
      res.status(404).json({ message: 'Note not found' });
      return;
    }
    
    res.json({ message: 'Note updated successfully' });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Delete a note
 */
const deleteNote = async (req, res) => {
  try {
    const noteId = Number(req.params.id);
    const success = await Standard.deleteNote(noteId);
    
    if (!success) {
      res.status(404).json({ message: 'Note not found' });
      return;
    }
    
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get section notes for a user
 */
const getSectionNotes = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const sectionId = Number(req.params.sectionId);
    
    const notes = await Standard.getSectionNotes(userId, sectionId);
    res.json(notes);
  } catch (error) {
    console.error('Error getting section notes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Look up illumination requirements by room type
 */
const lookupIlluminationRequirements = async (req, res) => {
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
    console.error('Error looking up illumination requirements:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all available tags
 */
const getAllTags = async (_req, res) => {
  try {
    const tags = await Standard.getAllTags();
    res.json(tags);
  } catch (error) {
    console.error('Error getting all tags:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Add a tag
 */
const addTag = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Tag name is required' });
    }
    
    const tagId = await Standard.addTag(name.trim());
    
    res.status(201).json({ 
      id: tagId,
      message: 'Tag added successfully' 
    });
  } catch (error) {
    console.error('Error adding tag:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get tags for a section
 */
const getSectionTags = async (req, res) => {
  try {
    const sectionId = Number(req.params.sectionId);
    const tags = await Standard.getSectionTags(sectionId);
    
    res.json(tags);
  } catch (error) {
    console.error('Error getting section tags:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Add a tag to a section
 */
const addSectionTag = async (req, res) => {
  try {
    const sectionId = Number(req.params.sectionId);
    const { tagId, tagName } = req.body;
    
    let actualTagId = tagId;
    
    // If tagName is provided but not tagId, create or get tag
    if (!tagId && tagName) {
      actualTagId = await Standard.addTag(tagName.trim());
    }
    
    if (!actualTagId) {
      return res.status(400).json({ message: 'Tag ID or tag name is required' });
    }
    
    const success = await Standard.addSectionTag(sectionId, actualTagId);
    
    if (success) {
      res.status(201).json({ message: 'Tag added to section successfully' });
    } else {
      res.status(500).json({ message: 'Failed to add tag to section' });
    }
  } catch (error) {
    console.error('Error adding tag to section:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Remove a tag from a section
 */
const removeSectionTag = async (req, res) => {
  try {
    const sectionId = Number(req.params.sectionId);
    const tagId = Number(req.params.tagId);
    
    const success = await Standard.removeSectionTag(sectionId, tagId);
    
    if (success) {
      res.json({ message: 'Tag removed from section successfully' });
    } else {
      res.status(404).json({ message: 'Tag not found for this section' });
    }
  } catch (error) {
    console.error('Error removing tag from section:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get sections by tag
 */
const getSectionsByTag = async (req, res) => {
  try {
    const tagId = Number(req.params.tagId);
    const sections = await Standard.getSectionsByTag(tagId);
    
    res.json(sections);
  } catch (error) {
    console.error('Error getting sections by tag:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get general standard value categories based on type
 */
const getStandardCategories = async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!type) {
      return res.status(400).json({ message: 'Type parameter is required' });
    }
    
    let categories = [];
    
    switch (type) {
      case 'illumination':
        categories = [
          { id: 'offices', name: 'Offices & Administrative Spaces' },
          { id: 'educational', name: 'Educational Facilities' },
          { id: 'industrial', name: 'Industrial Areas' },
          { id: 'commercial', name: 'Commercial & Retail' },
          { id: 'healthcare', name: 'Healthcare Facilities' }
        ];
        break;
      case 'power-factor':
        categories = [
          { id: 'requirements', name: 'Required Power Factor Values' },
          { id: 'recommendations', name: 'Recommended Values' },
          { id: 'equipment', name: 'Equipment-Specific Values' }
        ];
        break;
      case 'harmonic-distortion':
        categories = [
          { id: 'current', name: 'Current Harmonic Limits' },
          { id: 'voltage', name: 'Voltage Harmonic Limits' },
          { id: 'system-types', name: 'System Type Classifications' }
        ];
        break;
      case 'voltage-drop':
        categories = [
          { id: 'branch-circuits', name: 'Branch Circuits' },
          { id: 'feeders', name: 'Feeders' },
          { id: 'combined', name: 'Combined Voltage Drop' }
        ];
        break;
      case 'conductor-sizing':
        categories = [
          { id: 'ampacity', name: 'Ampacity Tables' },
          { id: 'adjustment-factors', name: 'Adjustment Factors' },
          { id: 'correction-factors', name: 'Correction Factors' }
        ];
        break;
      default:
        return res.status(400).json({ message: 'Unsupported standard type' });
    }
    
    res.json(categories);
  } catch (error) {
    console.error(`Error getting standard categories for ${req.params.type}:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get standard values for a specific category
 */
const getStandardValues = async (req, res) => {
  try {
    const { type, categoryId } = req.params;
    
    if (!type || !categoryId) {
      return res.status(400).json({ message: 'Type and category parameters are required' });
    }
    
    let values = [];
    
    // In a real implementation, these would come from a database
    // For now, we'll provide sample data based on the PEC 2017 and other standards
    
    if (type === 'illumination') {
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
      
      // Categorize room types based on categoryId
      const roomTypeCategories = {
        'offices': ['office', 'conference', 'meeting', 'administrative', 'reception'],
        'educational': ['classroom', 'lecture', 'laboratory', 'library', 'school'],
        'industrial': ['assembly', 'manufacturing', 'workshop', 'factory', 'production'],
        'commercial': ['retail', 'shop', 'store', 'mall', 'display'],
        'healthcare': ['hospital', 'medical', 'clinic', 'examination', 'patient']
      };
      
      const categoryKeywords = roomTypeCategories[categoryId] || [];
      
      // Search for room types matching the category
      fullSection.tables.forEach(table => {
        if (table.content && table.content.rows) {
          const content = typeof table.content === 'string' ? JSON.parse(table.content) : table.content;
          
          content.rows.forEach(row => {
            const roomType = row[0].toLowerCase();
            // Check if this room type matches any keyword in the category
            if (categoryKeywords.some(keyword => roomType.includes(keyword.toLowerCase()))) {
              values.push({
                id: `room_${roomType.replace(/\s+/g, '_')}`,
                value: parseInt(row[1]),
                unit: 'lux',
                description: row[0],
                notes: row[2] || '',
                source: 'PEC 2017',
                reference: `Rule 1075, Table ${table.table_number}`
              });
            }
          });
        }
      });
    } else if (type === 'power-factor') {
      // Sample power factor values from PEC 2017 Section 4.30
      if (categoryId === 'requirements') {
        values = [
          { 
            id: 'pf_minimum', 
            value: 0.85, 
            description: 'Minimum power factor for installations above 5 kW',
            source: 'PEC 2017',
            reference: 'Section 4.30'
          },
          { 
            id: 'pf_commercial', 
            value: 0.90, 
            description: 'Power factor for commercial buildings',
            source: 'PEC 2017',
            reference: 'Section 4.30'
          }
        ];
      } else if (categoryId === 'recommendations') {
        values = [
          { 
            id: 'pf_recommended', 
            value: 0.95, 
            description: 'Recommended power factor for energy efficiency',
            source: 'PEC 2017',
            reference: 'Section 4.30'
          },
          { 
            id: 'pf_optimal', 
            value: 0.98, 
            description: 'Optimal power factor to avoid penalties',
            source: 'Industry Standard',
            reference: 'Energy Efficiency Guidelines'
          }
        ];
      }
    } else if (type === 'harmonic-distortion') {
      // Sample harmonic distortion limits from IEEE 519-2014
      if (categoryId === 'current') {
        values = [
          { 
            id: 'thd_isc_20', 
            value: 5.0, 
            unit: '%',
            description: 'THD limit for Isc/IL < 20',
            source: 'IEEE 519-2014',
            reference: 'Table 2'
          },
          { 
            id: 'thd_isc_50', 
            value: 8.0, 
            unit: '%',
            description: 'THD limit for 20 < Isc/IL < 50',
            source: 'IEEE 519-2014',
            reference: 'Table 2'
          },
          { 
            id: 'thd_isc_100', 
            value: 12.0, 
            unit: '%',
            description: 'THD limit for 50 < Isc/IL < 100',
            source: 'IEEE 519-2014',
            reference: 'Table 2'
          }
        ];
      } else if (categoryId === 'voltage') {
        values = [
          { 
            id: 'thd_v_69kv', 
            value: 5.0, 
            unit: '%',
            description: 'Voltage THD limit for V ≤ 69 kV',
            source: 'IEEE 519-2014',
            reference: 'Table 1'
          },
          { 
            id: 'thd_v_161kv', 
            value: 2.5, 
            unit: '%',
            description: 'Voltage THD limit for 69 kV < V ≤ 161 kV',
            source: 'IEEE 519-2014',
            reference: 'Table 1'
          }
        ];
      }
    }
    
    if (values.length === 0) {
      return res.status(404).json({ 
        message: `No standard values found for ${type} category ${categoryId}` 
      });
    }
    
    res.json(values);
  } catch (error) {
    console.error(`Error getting standard values for ${req.params.type}/${req.params.categoryId}:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllStandards,
  getStandardById,
  createStandard,
  getSections,
  getSectionById,
  createSection,
  searchSections,
  addTable,
  addFigure,
  addComplianceRequirement,
  addResource,
  getResources,
  addBookmark,
  removeBookmark,
  getUserBookmarks,
  addNote,
  updateNote,
  deleteNote,
  getSectionNotes,
  lookupIlluminationRequirements,
  getAllTags,
  addTag,
  getSectionTags,
  addSectionTag,
  removeSectionTag,
  getSectionsByTag,
  getStandardCategories,
  getStandardValues
}; 