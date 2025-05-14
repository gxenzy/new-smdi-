import { Request, Response } from 'express';
import Standard from '../models/Standard';

/**
 * Get all standards
 */
export const getAllStandards = async (_req: Request, res: Response): Promise<void> => {
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
export const getStandardById = async (req: Request, res: Response): Promise<void> => {
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
export const createStandard = async (req: Request, res: Response): Promise<void> => {
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
export const getSections = async (req: Request, res: Response): Promise<void> => {
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
export const getSectionById = async (req: Request, res: Response): Promise<void> => {
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
export const createSection = async (req: Request, res: Response): Promise<void> => {
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
export const searchSections = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;
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
export const addTable = async (req: Request, res: Response): Promise<void> => {
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
export const addFigure = async (req: Request, res: Response): Promise<void> => {
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
export const addComplianceRequirement = async (req: Request, res: Response): Promise<void> => {
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
export const addResource = async (req: Request, res: Response): Promise<void> => {
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
export const getResources = async (req: Request, res: Response): Promise<void> => {
  try {
    const sectionId = req.query.sectionId ? Number(req.query.sectionId) : undefined;
    const resourceType = req.query.type as string | undefined;
    const difficulty = req.query.difficulty as string | undefined;
    
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
export const addBookmark = async (req: Request, res: Response): Promise<void> => {
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
export const removeBookmark = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.userId);
    const sectionId = Number(req.params.sectionId);
    
    const result = await Standard.removeBookmark(userId, sectionId);
    
    if (!result) {
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
export const getUserBookmarks = async (req: Request, res: Response): Promise<void> => {
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
export const addNote = async (req: Request, res: Response): Promise<void> => {
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
export const updateNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const noteId = Number(req.params.id);
    const { noteText, userId } = req.body;
    
    if (!noteText) {
      res.status(400).json({ message: 'Note text is required' });
      return;
    }
    
    const result = await Standard.updateNote(noteId, noteText, userId);
    
    if (!result) {
      res.status(404).json({ message: 'Note not found or you do not have permission to update it' });
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
export const deleteNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const noteId = Number(req.params.id);
    const userId = Number(req.params.userId);
    
    const result = await Standard.deleteNote(noteId, userId);
    
    if (!result) {
      res.status(404).json({ message: 'Note not found or you do not have permission to delete it' });
      return;
    }
    
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get notes for a section
 */
export const getSectionNotes = async (req: Request, res: Response): Promise<void> => {
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