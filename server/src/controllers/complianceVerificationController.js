/**
 * Controller for calculator compliance verification
 */
const StandardModel = require('../models/StandardModel');
const Compliance = require('../models/Compliance');
const BuildingTypeStandard = require('../models/BuildingTypeStandard');
const ProjectTypeStandard = require('../models/ProjectTypeStandard');
const ComplianceRecommendation = require('../models/ComplianceRecommendation');
const ComplianceRule = require('../models/ComplianceRule');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Verify a calculation against applicable compliance rules
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.verifyCalculation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { calculationId, calculationType, calculationData, buildingType, projectType } = req.body;
    
    if (!calculationId || !calculationType || !calculationData) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Get applicable rules for the calculation type
    let rules = await Compliance.getRulesByType(calculationType);
    
    // If no specific rules for the calculation type, get general rules
    if (!rules || rules.length === 0) {
      rules = await Compliance.getGeneralRules();
    }
    
    // Process rules and check for compliance
    const results = await processComplianceRules(rules, calculationType, calculationData, buildingType, projectType);
    
    // Save verification results if user is authenticated
    if (req.user) {
      await Compliance.saveVerificationResults(
        calculationId,
        req.user.id,
        results
      );
    }
    
    return res.json(results);
  } catch (err) {
    logger.error('Error verifying calculation compliance:', err);
    return res.status(500).json({ message: 'Server error during compliance verification' });
  }
};

/**
 * Get verification history for a user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getVerificationHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await Compliance.getVerificationHistory(userId);
    return res.json(history);
  } catch (err) {
    logger.error('Error getting verification history:', err);
    return res.status(500).json({ message: 'Server error getting verification history' });
  }
};

/**
 * Get applicable standards for a building type
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getBuildingTypeStandards = async (req, res) => {
  try {
    const { buildingType, standardType } = req.query;
    
    if (!buildingType) {
      return res.status(400).json({ message: 'Building type is required' });
    }
    
    let standards;
    if (standardType) {
      standards = await BuildingTypeStandard.getStandardsByTypeAndBuilding(buildingType, standardType);
    } else {
      standards = await BuildingTypeStandard.getStandardsByBuildingType(buildingType);
    }
    
    return res.json(standards);
  } catch (err) {
    logger.error('Error getting building type standards:', err);
    return res.status(500).json({ message: 'Server error getting standards' });
  }
};

/**
 * Get all building type standards
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getAllBuildingTypeStandards = async (req, res) => {
  try {
    const standards = await BuildingTypeStandard.findAll();
    return res.json(standards);
  } catch (err) {
    logger.error('Error getting all building type standards:', err);
    return res.status(500).json({ message: 'Server error getting all standards' });
  }
};

/**
 * Create a new building type standard
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.createBuildingTypeStandard = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      buildingType,
      standardType,
      standardCode,
      minimumValue,
      maximumValue,
      unit,
      sourceStandardId,
      description
    } = req.body;

    // Check if standard already exists
    const existingStandard = await BuildingTypeStandard.findOne({
      where: {
        building_type: buildingType,
        standard_type: standardType,
        standard_code: standardCode
      }
    });

    if (existingStandard) {
      return res.status(400).json({ message: 'Standard already exists for this building type' });
    }

    // Create new standard
    const newStandard = await BuildingTypeStandard.create({
      buildingType,
      standardType,
      standardCode,
      minimumValue,
      maximumValue,
      unit,
      sourceStandardId,
      description
    });

    return res.status(201).json(newStandard);
  } catch (err) {
    logger.error('Error creating building type standard:', err);
    return res.status(500).json({ message: 'Server error creating standard' });
  }
};

/**
 * Update a building type standard
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.updateBuildingTypeStandard = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const standardId = req.params.id;
    const {
      buildingType,
      standardType,
      standardCode,
      minimumValue,
      maximumValue,
      unit,
      sourceStandardId,
      description
    } = req.body;

    // Check if standard exists
    const standard = await BuildingTypeStandard.findByPk(standardId);
    if (!standard) {
      return res.status(404).json({ message: 'Standard not found' });
    }

    // Update standard
    standard.buildingType = buildingType;
    standard.standardType = standardType;
    standard.standardCode = standardCode;
    standard.minimumValue = minimumValue;
    standard.maximumValue = maximumValue;
    standard.unit = unit;
    standard.sourceStandardId = sourceStandardId;
    standard.description = description;

    await standard.save();

    return res.json(standard);
  } catch (err) {
    logger.error('Error updating building type standard:', err);
    return res.status(500).json({ message: 'Server error updating standard' });
  }
};

/**
 * Delete a building type standard
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.deleteBuildingTypeStandard = async (req, res) => {
  try {
    const standardId = req.params.id;

    // Check if standard exists
    const standard = await BuildingTypeStandard.findByPk(standardId);
    if (!standard) {
      return res.status(404).json({ message: 'Standard not found' });
    }

    // Delete standard
    await standard.destroy();

    return res.json({ message: 'Standard deleted successfully' });
  } catch (err) {
    logger.error('Error deleting building type standard:', err);
    return res.status(500).json({ message: 'Server error deleting standard' });
  }
};

/**
 * Get applicable standards for a project type
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getProjectTypeStandards = async (req, res) => {
  try {
    const { projectType, standardType } = req.query;
    
    if (!projectType) {
      return res.status(400).json({ message: 'Project type is required' });
    }
    
    let standards;
    if (standardType) {
      standards = await ProjectTypeStandard.getStandardsByTypeAndProject(projectType, standardType);
    } else {
      standards = await ProjectTypeStandard.getStandardsByProjectType(projectType);
    }
    
    return res.json(standards);
  } catch (err) {
    logger.error('Error getting project type standards:', err);
    return res.status(500).json({ message: 'Server error getting standards' });
  }
};

/**
 * Get all project type standards
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getAllProjectTypeStandards = async (req, res) => {
  try {
    const standards = await ProjectTypeStandard.findAll();
    return res.json(standards);
  } catch (err) {
    logger.error('Error getting all project type standards:', err);
    return res.status(500).json({ message: 'Server error getting all standards' });
  }
};

/**
 * Create a new project type standard
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.createProjectTypeStandard = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      projectType,
      standardType,
      standardCode,
      minimumValue,
      maximumValue,
      unit,
      sourceStandardId,
      description
    } = req.body;

    // Check if standard already exists
    const existingStandard = await ProjectTypeStandard.findOne({
      where: {
        project_type: projectType,
        standard_type: standardType,
        standard_code: standardCode
      }
    });

    if (existingStandard) {
      return res.status(400).json({ message: 'Standard already exists for this project type' });
    }

    // Create new standard
    const newStandard = await ProjectTypeStandard.create({
      projectType,
      standardType,
      standardCode,
      minimumValue,
      maximumValue,
      unit,
      sourceStandardId,
      description
    });

    return res.status(201).json(newStandard);
  } catch (err) {
    logger.error('Error creating project type standard:', err);
    return res.status(500).json({ message: 'Server error creating standard' });
  }
};

/**
 * Update a project type standard
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.updateProjectTypeStandard = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const standardId = req.params.id;
    const {
      projectType,
      standardType,
      standardCode,
      minimumValue,
      maximumValue,
      unit,
      sourceStandardId,
      description
    } = req.body;

    // Check if standard exists
    const standard = await ProjectTypeStandard.findByPk(standardId);
    if (!standard) {
      return res.status(404).json({ message: 'Standard not found' });
    }

    // Update standard
    standard.projectType = projectType;
    standard.standardType = standardType;
    standard.standardCode = standardCode;
    standard.minimumValue = minimumValue;
    standard.maximumValue = maximumValue;
    standard.unit = unit;
    standard.sourceStandardId = sourceStandardId;
    standard.description = description;

    await standard.save();

    return res.json(standard);
  } catch (err) {
    logger.error('Error updating project type standard:', err);
    return res.status(500).json({ message: 'Server error updating standard' });
  }
};

/**
 * Delete a project type standard
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.deleteProjectTypeStandard = async (req, res) => {
  try {
    const standardId = req.params.id;

    // Check if standard exists
    const standard = await ProjectTypeStandard.findByPk(standardId);
    if (!standard) {
      return res.status(404).json({ message: 'Standard not found' });
    }

    // Delete standard
    await standard.destroy();

    return res.json({ message: 'Standard deleted successfully' });
  } catch (err) {
    logger.error('Error deleting project type standard:', err);
    return res.status(500).json({ message: 'Server error deleting standard' });
  }
};

/**
 * Get recommendations for non-compliant results
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getComplianceRecommendations = async (req, res) => {
  try {
    const { ruleId, calculatorType, nonComplianceType } = req.query;
    
    let recommendations = [];
    
    if (ruleId && nonComplianceType) {
      // Get specific recommendation for a rule and non-compliance type
      const recommendation = await ComplianceRecommendation.getSpecificRecommendation(ruleId, nonComplianceType);
      if (recommendation) {
        recommendations = [recommendation];
      }
    } else if (calculatorType) {
      // Get recommendations for a calculator type
      recommendations = await ComplianceRecommendation.getRecommendationsByCalculatorType(calculatorType);
    } else {
      return res.status(400).json({ message: 'Missing required query parameters' });
    }
    
    return res.json(recommendations);
  } catch (err) {
    logger.error('Error getting compliance recommendations:', err);
    return res.status(500).json({ message: 'Server error getting recommendations' });
  }
};

/**
 * Get all compliance recommendations
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getAllComplianceRecommendations = async (req, res) => {
  try {
    const recommendations = await ComplianceRecommendation.findAll();
    return res.json(recommendations);
  } catch (err) {
    logger.error('Error getting all compliance recommendations:', err);
    return res.status(500).json({ message: 'Server error getting all recommendations' });
  }
};

/**
 * Create a new compliance recommendation
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.createComplianceRecommendation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      ruleId,
      nonComplianceType,
      recommendationText,
      priority,
      calculatorType
    } = req.body;

    // Check if recommendation already exists
    const existingRecommendation = await ComplianceRecommendation.findOne({
      where: {
        rule_id: ruleId,
        non_compliance_type: nonComplianceType,
        calculator_type: calculatorType
      }
    });

    if (existingRecommendation) {
      return res.status(400).json({ message: 'Recommendation already exists for this rule and non-compliance type' });
    }

    // Create new recommendation
    const newRecommendation = await ComplianceRecommendation.create({
      ruleId,
      nonComplianceType,
      recommendationText,
      priority: priority || 'medium',
      calculatorType
    });

    return res.status(201).json(newRecommendation);
  } catch (err) {
    logger.error('Error creating compliance recommendation:', err);
    return res.status(500).json({ message: 'Server error creating recommendation' });
  }
};

/**
 * Update a compliance recommendation
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.updateComplianceRecommendation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const recommendationId = req.params.id;
    const {
      ruleId,
      nonComplianceType,
      recommendationText,
      priority,
      calculatorType
    } = req.body;

    // Check if recommendation exists
    const recommendation = await ComplianceRecommendation.findByPk(recommendationId);
    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    // Update recommendation
    recommendation.ruleId = ruleId;
    recommendation.nonComplianceType = nonComplianceType;
    recommendation.recommendationText = recommendationText;
    recommendation.priority = priority || 'medium';
    recommendation.calculatorType = calculatorType;

    await recommendation.save();

    return res.json(recommendation);
  } catch (err) {
    logger.error('Error updating compliance recommendation:', err);
    return res.status(500).json({ message: 'Server error updating recommendation' });
  }
};

/**
 * Delete a compliance recommendation
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.deleteComplianceRecommendation = async (req, res) => {
  try {
    const recommendationId = req.params.id;

    // Check if recommendation exists
    const recommendation = await ComplianceRecommendation.findByPk(recommendationId);
    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    // Delete recommendation
    await recommendation.destroy();

    return res.json({ message: 'Recommendation deleted successfully' });
  } catch (err) {
    logger.error('Error deleting compliance recommendation:', err);
    return res.status(500).json({ message: 'Server error deleting recommendation' });
  }
};

/**
 * Get applicable rules for a calculation type
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getApplicableRules = async (req, res) => {
  try {
    const { calculationType } = req.query;
    
    if (!calculationType) {
      return res.status(400).json({ message: 'Calculation type is required' });
    }
    
    const rules = await Compliance.getRulesByType(calculationType);
    return res.json(rules);
  } catch (err) {
    logger.error('Error getting applicable rules:', err);
    return res.status(500).json({ message: 'Server error getting applicable rules' });
  }
};

/**
 * Process rules against calculation data to determine compliance
 * @param {Array} rules - Array of compliance rules
 * @param {String} calculationType - Type of calculation
 * @param {Object} calculationData - Calculation result data
 * @param {String} buildingType - Type of building (optional)
 * @param {String} projectType - Type of project (optional)
 * @returns {Object} Compliance verification results
 */
async function processComplianceRules(rules, calculationType, calculationData, buildingType, projectType) {
  const results = {
    compliantCount: 0,
    nonCompliantCount: 0,
    needsReviewCount: 0,
    status: 'needs_review',
    rules: []
  };
  
  // Process each rule
  for (const rule of rules) {
    let status = 'needs_review';
    let details = 'Manual verification required';
    let recommendation = null;
    
    // Process based on calculation type
    if (calculationType === 'illumination') {
      if (rule.rule_code.includes('PEC-1075')) {
        // Check illumination level compliance using building type standard
        let requiredLux = 0;
        
        if (buildingType) {
          const illuminationStandard = await BuildingTypeStandard.findOne({
            where: {
              building_type: buildingType,
              standard_type: 'illumination',
              standard_code: 'PEC-1075-ILLUM'
            }
          });
          
          if (illuminationStandard) {
            requiredLux = illuminationStandard.minimumValue;
          } else {
            // Fallback to extracting from rule if no standard found
            requiredLux = extractRequiredLux(rule.evaluation_criteria);
          }
        } else {
          // Fallback to extracting from rule if no building type provided
          requiredLux = extractRequiredLux(rule.evaluation_criteria);
        }
        
        const calculatedLux = calculationData.calculatedLux || 0;
        
        if (calculatedLux >= requiredLux) {
          status = 'compliant';
          details = `Calculated illumination (${calculatedLux} lux) meets the required minimum (${requiredLux} lux)`;
        } else {
          status = 'non_compliant';
          details = `Calculated illumination (${calculatedLux} lux) is below the required minimum (${requiredLux} lux)`;
          
          // Get recommendation for this non-compliance
          const recommendationData = await ComplianceRecommendation.getSpecificRecommendation(
            rule.id,
            'below_minimum'
          );
          
          if (recommendationData) {
            recommendation = recommendationData.recommendationText;
          }
        }
      } else if (rule.rule_code.includes('PGBC-LPD')) {
        // Check LPD compliance using building type standard
        let maxLPD = 0;
        
        if (buildingType) {
          const lpdStandard = await BuildingTypeStandard.getLPDStandard(buildingType);
          
          if (lpdStandard) {
            maxLPD = lpdStandard.maximumValue;
          } else {
            // Fallback to extracting from rule if no standard found
            maxLPD = extractMaxLPD(rule.evaluation_criteria);
          }
        } else {
          // Fallback to extracting from rule if no building type provided
          maxLPD = extractMaxLPD(rule.evaluation_criteria);
        }
        
        const calculatedLPD = calculationData.calculatedLPD || 0;
        
        if (calculatedLPD <= maxLPD) {
          status = 'compliant';
          details = `Calculated LPD (${calculatedLPD} W/m²) is within the maximum allowed (${maxLPD} W/m²)`;
        } else {
          status = 'non_compliant';
          details = `Calculated LPD (${calculatedLPD} W/m²) exceeds the maximum allowed (${maxLPD} W/m²)`;
          
          // Get recommendation for this non-compliance
          const recommendationData = await ComplianceRecommendation.getSpecificRecommendation(
            rule.id,
            'above_maximum'
          );
          
          if (recommendationData) {
            recommendation = recommendationData.recommendationText;
          }
        }
      }
    } else if (calculationType === 'power_factor') {
      if (rule.rule_code.includes('PEC-1078')) {
        const minPF = extractMinPowerFactor(rule.evaluation_criteria);
        const calculatedPF = calculationData.powerFactor || 0;
        
        if (calculatedPF >= minPF) {
          status = 'compliant';
          details = `Calculated power factor (${calculatedPF}) meets the required minimum (${minPF})`;
        } else {
          status = 'non_compliant';
          details = `Calculated power factor (${calculatedPF}) is below the required minimum (${minPF})`;
          
          // Get recommendation for this non-compliance
          const recommendationData = await ComplianceRecommendation.getSpecificRecommendation(
            rule.id,
            'below_minimum'
          );
          
          if (recommendationData) {
            recommendation = recommendationData.recommendationText;
          }
        }
      }
    } else if (calculationType === 'roi' && projectType) {
      if (rule.rule_code.includes('FNANCL-ROI')) {
        // Check ROI compliance using project type standard
        const roiStandard = await ProjectTypeStandard.getROIStandard(projectType);
        
        if (roiStandard) {
          const minROI = roiStandard.minimumValue;
          const calculatedROI = calculationData.roi || 0;
          
          if (calculatedROI >= minROI) {
            status = 'compliant';
            details = `Calculated ROI (${calculatedROI}%) meets the required minimum (${minROI}%)`;
          } else {
            status = 'non_compliant';
            details = `Calculated ROI (${calculatedROI}%) is below the required minimum (${minROI}%)`;
            
            // Get recommendation for this non-compliance
            const recommendationData = await ComplianceRecommendation.getSpecificRecommendation(
              rule.id,
              'below_minimum'
            );
            
            if (recommendationData) {
              recommendation = recommendationData.recommendationText;
            }
          }
        }
      } else if (rule.rule_code.includes('FNANCL-PAYBCK')) {
        // Check payback period compliance using project type standard
        const paybackStandard = await ProjectTypeStandard.getPaybackStandard(projectType);
        
        if (paybackStandard) {
          const maxPayback = paybackStandard.maximumValue;
          const calculatedPayback = calculationData.paybackPeriod || 0;
          
          if (calculatedPayback <= maxPayback) {
            status = 'compliant';
            details = `Calculated payback period (${calculatedPayback} years) is within the maximum allowed (${maxPayback} years)`;
          } else {
            status = 'non_compliant';
            details = `Calculated payback period (${calculatedPayback} years) exceeds the maximum allowed (${maxPayback} years)`;
            
            // Get recommendation for this non-compliance
            const recommendationData = await ComplianceRecommendation.getSpecificRecommendation(
              rule.id,
              'above_maximum'
            );
            
            if (recommendationData) {
              recommendation = recommendationData.recommendationText;
            }
          }
        }
      }
    }
    
    // Add rule result to the results array
    results.rules.push({
      ruleId: rule.id,
      ruleCode: rule.rule_code,
      title: rule.title,
      status,
      details,
      recommendation
    });
    
    // Update counts
    if (status === 'compliant') {
      results.compliantCount++;
    } else if (status === 'non_compliant') {
      results.nonCompliantCount++;
    } else {
      results.needsReviewCount++;
    }
  }
  
  // Determine overall status
  if (results.nonCompliantCount > 0) {
    results.status = 'non_compliant';
  } else if (results.needsReviewCount === 0) {
    results.status = 'compliant';
  }
  
  return results;
}

/**
 * Extract required lux value from rule criteria
 * @param {String} criteria - Rule evaluation criteria
 * @returns {Number} Required lux value
 */
function extractRequiredLux(criteria) {
  // Default minimum lux if not found
  let requiredLux = 300;
  
  if (criteria) {
    const luxMatch = criteria.match(/minimum\s+of\s+(\d+)\s+lux/i);
    if (luxMatch && luxMatch[1]) {
      requiredLux = parseInt(luxMatch[1], 10);
    }
  }
  
  return requiredLux;
}

/**
 * Extract maximum LPD value from rule criteria
 * @param {String} criteria - Rule evaluation criteria
 * @returns {Number} Maximum LPD value
 */
function extractMaxLPD(criteria) {
  // Default maximum LPD if not found
  let maxLPD = 10;
  
  if (criteria) {
    const lpdMatch = criteria.match(/maximum\s+of\s+(\d+(?:\.\d+)?)\s+W\/m²/i);
    if (lpdMatch && lpdMatch[1]) {
      maxLPD = parseFloat(lpdMatch[1]);
    }
  }
  
  return maxLPD;
}

/**
 * Extract minimum power factor from rule criteria
 * @param {String} criteria - Rule evaluation criteria
 * @returns {Number} Minimum power factor
 */
function extractMinPowerFactor(criteria) {
  // Default minimum power factor if not found
  let minPF = 0.9;
  
  if (criteria) {
    const pfMatch = criteria.match(/minimum\s+of\s+(\d+(?:\.\d+)?)/i);
    if (pfMatch && pfMatch[1]) {
      minPF = parseFloat(pfMatch[1]);
    }
  }
  
  return minPF;
} 