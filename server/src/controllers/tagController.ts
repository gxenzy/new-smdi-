import { Request, Response } from 'express';
import { db } from '../database/connection';
import logger from '../utils/logger';
import { 
  formatErrorResponse, 
  createNotFoundError, 
  createValidationError, 
  asyncHandler
} from '../utils/errorHandler';

/**
 * Get all tags
 */
export const getAllTags = asyncHandler(async (_req: Request, res: Response) => {
  logger.info('Fetching all tags');
  
  const tags = await db('section_tags')
    .select('*')
    .orderBy('name', 'asc');
  
  return res.json(tags);
});

/**
 * Create a new tag
 */
export const createTag = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw createValidationError('Tag name is required');
  }
  
  logger.info(`Creating new tag: ${name}`);
  
  // Check if tag already exists
  const existingTag = await db('section_tags')
    .where('name', name.trim())
    .first();
  
  if (existingTag) {
    return res.status(409).json(
      formatErrorResponse(
        createValidationError('Tag already exists', { tagId: existingTag.id })
      )
    );
  }
  
  // Create new tag
  const [tagId] = await db('section_tags')
    .insert({
      name: name.trim(),
      created_at: new Date()
    });
  
  return res.status(201).json({ 
    id: tagId,
    name: name.trim(),
    message: 'Tag created successfully' 
  });
});

/**
 * Update a tag
 */
export const updateTag = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw createValidationError('Tag name is required');
  }
  
  logger.info(`Updating tag ${id} to: ${name}`);
  
  // Check if tag exists
  const tag = await db('section_tags')
    .where('id', id)
    .first();
  
  if (!tag) {
    throw createNotFoundError('Tag not found');
  }
  
  // Check if new name already exists in another tag
  const existingTag = await db('section_tags')
    .where('name', name.trim())
    .whereNot('id', id)
    .first();
  
  if (existingTag) {
    return res.status(409).json(
      formatErrorResponse(
        createValidationError('Tag name already in use', { tagId: existingTag.id })
      )
    );
  }
  
  // Update tag
  await db('section_tags')
    .where('id', id)
    .update({
      name: name.trim(),
      updated_at: new Date()
    });
  
  return res.json({ 
    id: Number(id),
    name: name.trim(),
    message: 'Tag updated successfully' 
  });
});

/**
 * Delete a tag
 */
export const deleteTag = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  logger.info(`Deleting tag ${id}`);
  
  // Check if tag exists
  const tag = await db('section_tags')
    .where('id', id)
    .first();
  
  if (!tag) {
    throw createNotFoundError('Tag not found');
  }
  
  // First delete all section-tag associations
  await db('section_tag_mappings')
    .where('tag_id', id)
    .delete();
  
  // Then delete the tag
  await db('section_tags')
    .where('id', id)
    .delete();
  
  return res.json({ 
    message: 'Tag deleted successfully' 
  });
});

/**
 * Get tags for a section
 */
export const getSectionTags = asyncHandler(async (req: Request, res: Response) => {
  const { sectionId } = req.params;
  
  logger.info(`Fetching tags for section ${sectionId}`);
  
  const tags = await db('section_tags as t')
    .join('section_tag_mappings as m', 'm.tag_id', 't.id')
    .where('m.section_id', sectionId)
    .select('t.*')
    .orderBy('t.name', 'asc');
  
  return res.json(tags);
});

/**
 * Add a tag to a section
 */
export const addTagToSection = asyncHandler(async (req: Request, res: Response) => {
  const { sectionId, tagId } = req.body;
  
  if (!sectionId) {
    throw createValidationError('Section ID is required');
  }
  
  if (!tagId) {
    throw createValidationError('Tag ID is required');
  }
  
  logger.info(`Adding tag ${tagId} to section ${sectionId}`);
  
  // Check if section exists
  const section = await db('standard_sections')
    .where('id', sectionId)
    .first();
  
  if (!section) {
    throw createNotFoundError('Section not found');
  }
  
  // Check if tag exists
  const tag = await db('section_tags')
    .where('id', tagId)
    .first();
  
  if (!tag) {
    throw createNotFoundError('Tag not found');
  }
  
  // Check if mapping already exists
  const existingMapping = await db('section_tag_mappings')
    .where({
      section_id: sectionId,
      tag_id: tagId
    })
    .first();
  
  if (existingMapping) {
    return res.status(409).json(
      formatErrorResponse(
        createValidationError('Tag already assigned to this section')
      )
    );
  }
  
  // Create mapping
  await db('section_tag_mappings')
    .insert({
      section_id: sectionId,
      tag_id: tagId,
      created_at: new Date()
    });
  
  return res.status(201).json({ 
    message: 'Tag added to section successfully',
    section_id: sectionId,
    tag_id: tagId,
    tag_name: tag.name
  });
});

/**
 * Remove a tag from a section
 */
export const removeTagFromSection = asyncHandler(async (req: Request, res: Response) => {
  const { sectionId, tagId } = req.params;
  
  logger.info(`Removing tag ${tagId} from section ${sectionId}`);
  
  const deleted = await db('section_tag_mappings')
    .where({
      section_id: sectionId,
      tag_id: tagId
    })
    .delete();
  
  if (deleted === 0) {
    throw createNotFoundError('Tag not assigned to this section');
  }
  
  return res.json({ 
    message: 'Tag removed from section successfully' 
  });
}); 