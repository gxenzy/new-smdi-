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
    const query = req.query.q;
    const standardId = req.query.standardId ? Number(req.query.standardId) : undefined;
    
    if (!query && !standardId) {
      res.status(400).json({ message: 'Search query or standardId is required' });
      return;
    }
    
    const results = await Standard.searchSections({ 
      query,
      standard_id: standardId
    });
    
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
  getSectionNotes
}; 