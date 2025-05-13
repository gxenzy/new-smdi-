import { Request, Response } from 'express';
import { db } from '../database/connection';
import logger from '../utils/logger';
import { 
  createNotFoundError, 
  createValidationError,
  createBadRequestError,
  asyncHandler
} from '../utils/errorHandler';
import { UserRole } from '../types';

// Add interfaces for the request with user
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: UserRole;
  };
}

// Status count type
interface StatusCounts {
  pending: number;
  passed: number;
  failed: number;
  not_applicable: number;
  [key: string]: number; // Index signature for dynamic access
}

/**
 * Get all compliance rules, with optional filtering
 */
export const getAllRules = asyncHandler(async (req: Request, res: Response) => {
  const { 
    section_id, 
    severity, 
    type, 
    active = true
  } = req.query;
  
  logger.info('Fetching compliance rules', { filters: req.query });
  
  // Build the query with optional filters
  let query = db('compliance_rules as cr')
    .join('sections as s', 's.id', '=', 'cr.section_id')
    .join('standards as std', 'std.id', '=', 's.standard_id')
    .select(
      'cr.*',
      's.section_number',
      's.title as section_title',
      'std.code_name as standard_code'
    );
  
  // Apply filters if provided
  if (section_id) {
    query = query.where('cr.section_id', section_id);
  }
  
  if (severity) {
    query = query.where('cr.severity', severity);
  }
  
  if (type) {
    query = query.where('cr.type', type);
  }
  
  // Convert string 'true'/'false' to boolean
  const isActive = active === 'false' ? false : Boolean(active);
  query = query.where('cr.active', isActive);
  
  // Get the rules
  const rules = await query.orderBy('cr.rule_code', 'asc');
  
  return res.json(rules);
});

/**
 * Get a specific compliance rule by ID
 */
export const getRuleById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  logger.info(`Fetching compliance rule with ID: ${id}`);
  
  const rule = await db('compliance_rules as cr')
    .join('sections as s', 's.id', '=', 'cr.section_id')
    .join('standards as std', 'std.id', '=', 's.standard_id')
    .select(
      'cr.*',
      's.section_number',
      's.title as section_title',
      'std.code_name as standard_code'
    )
    .where('cr.id', id)
    .first();
  
  if (!rule) {
    throw createNotFoundError('Compliance rule not found');
  }
  
  return res.json(rule);
});

/**
 * Create a new compliance rule
 */
export const createRule = asyncHandler(async (req: Request, res: Response) => {
  const { 
    section_id, 
    rule_code, 
    title, 
    description, 
    severity, 
    type, 
    verification_method,
    evaluation_criteria,
    failure_impact,
    remediation_advice,
    active
  } = req.body;
  
  // Validate required fields
  if (!section_id) {
    throw createValidationError('Section ID is required');
  }
  
  if (!rule_code) {
    throw createValidationError('Rule code is required');
  }
  
  if (!title) {
    throw createValidationError('Title is required');
  }
  
  if (!description) {
    throw createValidationError('Description is required');
  }
  
  logger.info(`Creating compliance rule: ${rule_code}`);
  
  // Check if section exists
  const section = await db('sections')
    .where('id', section_id)
    .first();
  
  if (!section) {
    throw createNotFoundError('Section not found');
  }
  
  // Check if rule_code already exists
  const existingRule = await db('compliance_rules')
    .where('rule_code', rule_code)
    .first();
  
  if (existingRule) {
    throw createValidationError('Rule code already exists');
  }
  
  // Create rule
  const [ruleId] = await db('compliance_rules')
    .insert({
      section_id,
      rule_code,
      title,
      description,
      severity: severity || 'major',
      type: type || 'mandatory',
      verification_method: verification_method || null,
      evaluation_criteria: evaluation_criteria || null,
      failure_impact: failure_impact || null,
      remediation_advice: remediation_advice || null,
      active: active !== undefined ? active : true,
      created_at: new Date()
    });
  
  // Get the created rule
  const rule = await db('compliance_rules')
    .where('id', ruleId)
    .first();
  
  return res.status(201).json({
    message: 'Compliance rule created successfully',
    rule
  });
});

/**
 * Update an existing compliance rule
 */
export const updateRule = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { 
    section_id, 
    rule_code, 
    title, 
    description, 
    severity, 
    type, 
    verification_method,
    evaluation_criteria,
    failure_impact,
    remediation_advice,
    active
  } = req.body;
  
  logger.info(`Updating compliance rule with ID: ${id}`);
  
  // Check if rule exists
  const rule = await db('compliance_rules')
    .where('id', id)
    .first();
  
  if (!rule) {
    throw createNotFoundError('Compliance rule not found');
  }
  
  // If section_id changed, check if new section exists
  if (section_id && section_id !== rule.section_id) {
    const section = await db('sections')
      .where('id', section_id)
      .first();
    
    if (!section) {
      throw createNotFoundError('Section not found');
    }
  }
  
  // If rule_code changed, check if new code is unique
  if (rule_code && rule_code !== rule.rule_code) {
    const existingRule = await db('compliance_rules')
      .where('rule_code', rule_code)
      .whereNot('id', id)
      .first();
    
    if (existingRule) {
      throw createValidationError('Rule code already exists');
    }
  }
  
  // Update rule
  await db('compliance_rules')
    .where('id', id)
    .update({
      section_id: section_id || rule.section_id,
      rule_code: rule_code || rule.rule_code,
      title: title || rule.title,
      description: description || rule.description,
      severity: severity || rule.severity,
      type: type || rule.type,
      verification_method: verification_method !== undefined ? verification_method : rule.verification_method,
      evaluation_criteria: evaluation_criteria !== undefined ? evaluation_criteria : rule.evaluation_criteria,
      failure_impact: failure_impact !== undefined ? failure_impact : rule.failure_impact,
      remediation_advice: remediation_advice !== undefined ? remediation_advice : rule.remediation_advice,
      active: active !== undefined ? active : rule.active,
      updated_at: new Date()
    });
  
  // Get the updated rule
  const updatedRule = await db('compliance_rules')
    .where('id', id)
    .first();
  
  return res.json({
    message: 'Compliance rule updated successfully',
    rule: updatedRule
  });
});

/**
 * Delete a compliance rule
 */
export const deleteRule = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  logger.info(`Deleting compliance rule with ID: ${id}`);
  
  // Check if rule exists
  const rule = await db('compliance_rules')
    .where('id', id)
    .first();
  
  if (!rule) {
    throw createNotFoundError('Compliance rule not found');
  }
  
  // Check if rule is used in any checklists
  const usedInChecklists = await db('compliance_checks')
    .where('rule_id', id)
    .first();
  
  if (usedInChecklists) {
    // Instead of hard deleting, just mark as inactive
    await db('compliance_rules')
      .where('id', id)
      .update({
        active: false,
        updated_at: new Date()
      });
    
    return res.json({
      message: 'Compliance rule marked as inactive (used in checklists)',
      deactivated: true
    });
  }
  
  // Delete rule
  await db('compliance_rules')
    .where('id', id)
    .delete();
  
  return res.json({
    message: 'Compliance rule deleted successfully'
  });
});

/**
 * Get all compliance checklists
 */
export const getAllChecklists = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;
  
  logger.info('Fetching compliance checklists', { filters: req.query });
  
  // Build the query with optional filters
  let query = db('compliance_checklists as cc')
    .join('users as u', 'u.id', '=', 'cc.created_by')
    .select(
      'cc.*',
      'u.name as creator_name'
    );
  
  // Apply filters if provided
  if (status) {
    query = query.where('cc.status', status);
  }
  
  // Get the checklists
  const checklists = await query.orderBy('cc.created_at', 'desc');
  
  // For each checklist, get summary counts
  const checklistsWithCounts = await Promise.all(
    checklists.map(async (checklist) => {
      const counts = await db('compliance_checks')
        .where('checklist_id', checklist.id)
        .select(db.raw('status, COUNT(*) as count'))
        .groupBy('status');
      
      // Convert counts to an object
      const statusCounts: StatusCounts = {
        pending: 0,
        passed: 0,
        failed: 0,
        not_applicable: 0
      };
      
      counts.forEach((count) => {
        statusCounts[count.status] = count.count;
      });
      
      return {
        ...checklist,
        counts: statusCounts,
        total_rules: Object.values(statusCounts).reduce((sum, count) => sum + count, 0)
      };
    })
  );
  
  return res.json(checklistsWithCounts);
});

/**
 * Get a specific compliance checklist by ID with all its checks
 */
export const getChecklistById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  logger.info(`Fetching compliance checklist with ID: ${id}`);
  
  // Get the checklist
  const checklist = await db('compliance_checklists as cc')
    .join('users as u', 'u.id', '=', 'cc.created_by')
    .select(
      'cc.*',
      'u.name as creator_name'
    )
    .where('cc.id', id)
    .first();
  
  if (!checklist) {
    throw createNotFoundError('Compliance checklist not found');
  }
  
  // Get all checks for this checklist
  const checks = await db('compliance_checks as cc')
    .join('compliance_rules as cr', 'cr.id', '=', 'cc.rule_id')
    .join('sections as s', 's.id', '=', 'cr.section_id')
    .join('standards as std', 'std.id', '=', 's.standard_id')
    .leftJoin('users as u', 'u.id', '=', 'cc.checked_by')
    .select(
      'cc.*',
      'cr.rule_code',
      'cr.title as rule_title',
      'cr.description as rule_description',
      'cr.severity',
      'cr.type',
      'cr.verification_method',
      'cr.evaluation_criteria',
      'cr.failure_impact',
      'cr.remediation_advice',
      's.section_number',
      's.title as section_title',
      'std.code_name as standard_code',
      'u.name as checked_by_name'
    )
    .where('cc.checklist_id', id)
    .orderBy('cr.severity', 'asc')
    .orderBy('cr.rule_code', 'asc');
  
  // Get summary counts
  const counts: StatusCounts = {
    pending: 0,
    passed: 0,
    failed: 0,
    not_applicable: 0
  };
  
  checks.forEach((check) => {
    counts[check.status]++;
  });
  
  return res.json({
    checklist,
    checks,
    counts,
    total_rules: checks.length
  });
});

/**
 * Create a new compliance checklist
 */
export const createChecklist = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { 
    name, 
    description, 
    rule_ids = [] 
  } = req.body;
  
  // Validate required fields
  if (!name) {
    throw createValidationError('Checklist name is required');
  }
  
  if (!rule_ids.length) {
    throw createValidationError('At least one rule ID is required');
  }
  
  // Get user ID from auth token (assuming middleware adds user to req)
  const created_by = req.user?.id;
  
  if (!created_by) {
    throw createValidationError('User ID is required');
  }
  
  logger.info(`Creating compliance checklist: ${name}`);
  
  // Verify all rule IDs exist and are active
  const rules = await db('compliance_rules')
    .whereIn('id', rule_ids)
    .where('active', true);
  
  if (rules.length !== rule_ids.length) {
    throw createValidationError('One or more rule IDs are invalid or inactive');
  }
  
  // Start a transaction
  const trx = await db.transaction();
  
  try {
    // Create checklist
    const [checklistId] = await trx('compliance_checklists')
      .insert({
        name,
        description: description || null,
        created_by,
        status: 'draft',
        created_at: new Date()
      });
    
    // Create checks for each rule
    const checks = rule_ids.map((rule_id: number) => ({
      checklist_id: checklistId,
      rule_id,
      status: 'pending',
      created_at: new Date()
    }));
    
    await trx('compliance_checks').insert(checks);
    
    // Commit transaction
    await trx.commit();
    
    // Get the created checklist with checks
    const checklist = await db('compliance_checklists')
      .where('id', checklistId)
      .first();
    
    return res.status(201).json({
      message: 'Compliance checklist created successfully',
      checklist,
      rule_count: rule_ids.length
    });
  } catch (error) {
    // Rollback transaction
    await trx.rollback();
    throw error;
  }
});

/**
 * Update a compliance check status
 */
export const updateCheckStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { checklistId, checkId } = req.params;
  const { 
    status, 
    notes, 
    evidence 
  } = req.body;
  
  // Validate status
  const validStatuses = ['pending', 'passed', 'failed', 'not_applicable'];
  if (!validStatuses.includes(status)) {
    throw createValidationError(`Status must be one of: ${validStatuses.join(', ')}`);
  }
  
  logger.info(`Updating compliance check ${checkId} with status: ${status}`);
  
  // Check if check exists and belongs to the checklist
  const check = await db('compliance_checks')
    .where('id', checkId)
    .where('checklist_id', checklistId)
    .first();
  
  if (!check) {
    throw createNotFoundError('Compliance check not found or does not belong to the specified checklist');
  }
  
  // Get user ID from auth token (assuming middleware adds user to req)
  const checked_by = req.user?.id;
  
  if (!checked_by) {
    throw createValidationError('User ID is required');
  }
  
  // Update check
  await db('compliance_checks')
    .where('id', checkId)
    .update({
      status,
      notes: notes || check.notes,
      evidence: evidence || check.evidence,
      checked_by,
      checked_at: new Date(),
      updated_at: new Date()
    });
  
  // Get the updated check
  const updatedCheck = await db('compliance_checks')
    .where('id', checkId)
    .first();
  
  // Check if all checks are completed, and if so, update checklist status
  const pendingChecksResult = await db('compliance_checks')
    .where('checklist_id', checklistId)
    .where('status', 'pending')
    .count('id as count')
    .first();
  
  const pendingCount = pendingChecksResult ? Number(pendingChecksResult.count) : 0;
  
  if (pendingCount === 0) {
    await db('compliance_checklists')
      .where('id', checklistId)
      .update({
        status: 'active',
        updated_at: new Date()
      });
  }
  
  return res.json({
    message: 'Compliance check updated successfully',
    check: updatedCheck
  });
});

/**
 * Update checklist status (draft/active/archived)
 */
export const updateChecklistStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  
  // Validate status
  const validStatuses = ['draft', 'active', 'archived'];
  if (!validStatuses.includes(status)) {
    throw createValidationError(`Status must be one of: ${validStatuses.join(', ')}`);
  }
  
  logger.info(`Updating compliance checklist ${id} status to: ${status}`);
  
  // Check if checklist exists
  const checklist = await db('compliance_checklists')
    .where('id', id)
    .first();
  
  if (!checklist) {
    throw createNotFoundError('Compliance checklist not found');
  }
  
  // If setting to active, check if all checks are completed
  if (status === 'active') {
    const pendingChecksResult = await db('compliance_checks')
      .where('checklist_id', id)
      .where('status', 'pending')
      .count('id as count')
      .first();
    
    const pendingCount = pendingChecksResult ? Number(pendingChecksResult.count) : 0;
    
    if (pendingCount > 0) {
      throw createBadRequestError('Cannot set checklist to active while it has pending checks');
    }
  }
  
  // Update checklist
  await db('compliance_checklists')
    .where('id', id)
    .update({
      status,
      updated_at: new Date()
    });
  
  // Get the updated checklist
  const updatedChecklist = await db('compliance_checklists')
    .where('id', id)
    .first();
  
  return res.json({
    message: 'Compliance checklist status updated successfully',
    checklist: updatedChecklist
  });
}); 