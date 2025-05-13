import { Request, Response } from 'express';
import { db } from '../database/connection';
import logger from '../utils/logger';
import { Knex } from 'knex';
import { SearchOptions, SearchSuggestion, SearchTerms } from '../types/search';
import { createBadRequestError, createDatabaseError, asyncHandler } from '../utils/errorHandler';

// Simple cache for search suggestions
interface SuggestionCache {
  [key: string]: {
    suggestions: string[];
    timestamp: number;
  };
}

const suggestionCache: SuggestionCache = {};
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Full text search across standards sections
 */
export const searchSections = asyncHandler(async (req: Request, res: Response) => {
  const {
    q = '',                     // Search query
    standardId = '',            // Filter by standard ID
    exactMatch = false,         // Exact phrase matching
    fields = 'title,content,section_number', // Fields to search in
    page = 1,                   // Pagination
    limit = 20,                 // Results per page
    sort = 'relevance',         // Sort field
    sortDirection = 'desc',     // Sort direction
    relevanceThreshold = 0,     // Minimum relevance score
    tags                        // Filter by tags
  } = req.query as unknown as SearchOptions;

  // Parse fields to search in
  const searchFields = typeof fields === 'string' ? fields.split(',') : ['title', 'content', 'section_number'];
  
  // Parse tags to filter on
  const tagIds = tags ? 
    (Array.isArray(tags) ? tags : typeof tags === 'string' ? [tags] : []).map(Number) 
    : [];
  
  // Handle empty search
  if (!q && !standardId && tagIds.length === 0) {
    logger.warn('Empty search query, no standard ID, and no tags provided');
    throw createBadRequestError('Please provide a search term, standard ID, or at least one tag');
  }

  logger.info(`Searching sections with query: ${q}, fields: ${fields}, standard: ${standardId}, tags: ${tagIds.join(',')}`);

  // Build base query
  let query = db('sections')
    .join('standards', 'sections.standard_id', '=', 'standards.id')
    .select(
      'sections.id',
      'sections.title',
      'sections.section_number',
      'sections.content',
      'sections.standard_id',
      'standards.code_name',
      'standards.full_name'
    );

  // Apply standard filter if provided
  if (standardId) {
    query = query.where('sections.standard_id', standardId);
  }

  // Apply tag filter if provided
  if (tagIds.length > 0) {
    query = query.join('section_tag_mappings as stm', 'sections.id', '=', 'stm.section_id')
      .whereIn('stm.tag_id', tagIds)
      .groupBy('sections.id'); // Group by section ID to avoid duplicates
  }

  // For full text search, modify based on search fields and options
  if (q) {
    // Simulate full text search with relevance scoring using LIKE
    // In a real database, we would use proper full-text search capabilities
    query = query.where(function(this: Knex.QueryBuilder) {
      if (searchFields.includes('title')) {
        this.orWhere('sections.title', 'like', exactMatch ? q : `%${q}%`);
      }
      
      if (searchFields.includes('content')) {
        this.orWhere('sections.content', 'like', exactMatch ? q : `%${q}%`);
      }
      
      if (searchFields.includes('section_number')) {
        this.orWhere('sections.section_number', 'like', exactMatch ? q : `%${q}%`);
      }
    });
    
    // Add a pseudo-relevance score calculation
    // In a real full-text search, the DB would handle this
    query = query.select(db.raw(`
      CASE
        WHEN sections.title LIKE ? THEN 3
        WHEN sections.section_number LIKE ? THEN 2
        WHEN sections.content LIKE ? THEN 1
        ELSE 0
      END as relevance
    `, [`%${q}%`, `%${q}%`, `%${q}%`]));
  } else {
    // If only filtering by standard or tags, add a default relevance
    query = query.select(db.raw('1 as relevance'));
  }
  
  // Apply sorting
  if (sort === 'relevance' && q) {
    query = query.orderBy('relevance', sortDirection === 'asc' ? 'asc' : 'desc');
  } else if (sort === 'title') {
    query = query.orderBy('sections.title', sortDirection === 'asc' ? 'asc' : 'desc');
  } else if (sort === 'section_number') {
    query = query.orderBy('sections.section_number', sortDirection === 'asc' ? 'asc' : 'desc');
  } else if (sort === 'standard') {
    query = query.orderBy('standards.code_name', sortDirection === 'asc' ? 'asc' : 'desc');
  }
  
  // Add secondary sort by section number for deterministic results
  if (sort !== 'section_number') {
    query = query.orderBy('sections.section_number', 'asc');
  }
  
  // Apply pagination
  const offset = (Number(page) - 1) * Number(limit);
  query = query.offset(offset).limit(Number(limit));
  
  // Execute the query
  const results = await query;
  
  // Check if results are empty
  if (results.length === 0) {
    logger.info(`No search results found for query: ${q}`);
    return res.json([]);
  }
  
  // Filter by relevance threshold if set
  const filteredResults = relevanceThreshold
    ? results.filter(r => r.relevance >= Number(relevanceThreshold))
    : results;
  
  // Add tag information to each result
  const resultsWithTags = await Promise.all(
    filteredResults.map(async (result) => {
      const tags = await db('section_tags as t')
        .join('section_tag_mappings as m', 'm.tag_id', 't.id')
        .where('m.section_id', result.id)
        .select('t.id', 't.name');
      
      return {
        ...result,
        // Strip HTML for content preview
        content: result.content.replace(/<[^>]+>/g, ' ').substring(0, 300) + '...',
        tags
      };
    })
  );
  
  logger.info(`Returning ${resultsWithTags.length} search results for query: ${q}`);
  
  // Return the results
  return res.json(resultsWithTags);
});

/**
 * Get recent search terms for autocomplete
 */
export const getRecentSearchTerms = asyncHandler(async (_req: Request, res: Response) => {
  try {
    // In a real app, this would fetch from a search history table
    // For now, we'll return a mock response
    const terms: SearchTerms = [
      'illumination',
      'emergency lighting',
      'harmonic distortion',
      'voltage regulation',
      'feeder sizing',
      'grounding requirements'
    ];
    
    logger.debug('Returning mock recent search terms');
    return res.json(terms);
  } catch (error) {
    logger.error('Error in getRecentSearchTerms:', error);
    throw createDatabaseError('An error occurred while fetching search terms', { 
      originalError: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * Get search suggestions for autocomplete
 */
export const getSearchSuggestions = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;
  
  if (!q || typeof q !== 'string') {
    logger.warn('Missing or invalid search term for suggestions');
    throw createBadRequestError('Search term is required');
  }
  
  // Check cache first
  const cacheKey = q.toLowerCase();
  const now = Date.now();
  
  try {
    if (suggestionCache[cacheKey] && 
        (now - suggestionCache[cacheKey].timestamp) < CACHE_TTL) {
      // Cache hit
      logger.debug(`Cache hit for suggestions with query: ${q}`);
      return res.json(suggestionCache[cacheKey].suggestions);
    }
  } catch (cacheError) {
    // If there's an issue with the cache, log it but continue with database query
    logger.error('Cache error for suggestions:', cacheError);
  }
  
  // Cache miss, query the database
  logger.debug(`Cache miss for suggestions with query: ${q}`);
  
  // Query for matching terms in titles and section numbers
  const suggestions = await db('sections')
    .select('title')
    .where('title', 'like', `%${q}%`)
    .orWhere('section_number', 'like', `%${q}%`)
    .limit(10);
  
  // Also include tag suggestions
  const tagSuggestions = await db('section_tags')
    .select('name as title')
    .where('name', 'like', `%${q}%`)
    .limit(5);
  
  // Combine both suggestion types
  const combinedSuggestions = [...suggestions, ...tagSuggestions];
  const suggestionList = combinedSuggestions.map((s: SearchSuggestion) => s.title);
  
  // Store in cache
  try {
    suggestionCache[cacheKey] = {
      suggestions: suggestionList,
      timestamp: now
    };
  } catch (cacheError) {
    logger.error('Error storing suggestions in cache:', cacheError);
  }
  
  logger.debug(`Returning ${suggestionList.length} search suggestions for query: ${q}`);
  return res.json(suggestionList);
}); 