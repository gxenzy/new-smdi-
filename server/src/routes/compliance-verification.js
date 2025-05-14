const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const complianceVerificationController = require('../controllers/complianceVerificationController');

/**
 * @route   POST /api/compliance/verify-calculation
 * @desc    Verify calculation results against applicable standards
 * @access  Public (auth optional for saving results)
 */
router.post(
  '/verify-calculation',
  [
    check('calculationId', 'Calculation ID is required').not().isEmpty(),
    check('calculationType', 'Calculation type is required').not().isEmpty(),
    check('calculationData', 'Calculation data is required').isObject()
  ],
  auth.optionalAuth,
  complianceVerificationController.verifyCalculation
);

/**
 * @route   GET /api/compliance/rules
 * @desc    Get applicable rules for a calculation type
 * @access  Public
 */
router.get('/rules', complianceVerificationController.getApplicableRules);

/**
 * @route   GET /api/compliance/verification-history
 * @desc    Get verification history for authenticated user
 * @access  Private
 */
router.get('/verification-history', auth, complianceVerificationController.getVerificationHistory);

// Building Type Standards Routes

/**
 * @route   GET /api/compliance/building-standards
 * @desc    Get standards for a building type
 * @access  Public
 */
router.get('/building-standards', complianceVerificationController.getBuildingTypeStandards);

/**
 * @route   GET /api/compliance/building-standards/all
 * @desc    Get all building type standards
 * @access  Private (admin only)
 */
router.get('/building-standards/all', auth, complianceVerificationController.getAllBuildingTypeStandards);

/**
 * @route   POST /api/compliance/building-standards
 * @desc    Create a new building type standard
 * @access  Private (admin only)
 */
router.post(
  '/building-standards',
  [
    auth,
    check('buildingType', 'Building type is required').not().isEmpty(),
    check('standardType', 'Standard type is required').not().isEmpty(),
    check('standardCode', 'Standard code is required').not().isEmpty()
  ],
  complianceVerificationController.createBuildingTypeStandard
);

/**
 * @route   PUT /api/compliance/building-standards/:id
 * @desc    Update a building type standard
 * @access  Private (admin only)
 */
router.put(
  '/building-standards/:id',
  [
    auth,
    check('buildingType', 'Building type is required').not().isEmpty(),
    check('standardType', 'Standard type is required').not().isEmpty(),
    check('standardCode', 'Standard code is required').not().isEmpty()
  ],
  complianceVerificationController.updateBuildingTypeStandard
);

/**
 * @route   DELETE /api/compliance/building-standards/:id
 * @desc    Delete a building type standard
 * @access  Private (admin only)
 */
router.delete('/building-standards/:id', auth, complianceVerificationController.deleteBuildingTypeStandard);

// Project Type Standards Routes

/**
 * @route   GET /api/compliance/project-standards
 * @desc    Get standards for a project type
 * @access  Public
 */
router.get('/project-standards', complianceVerificationController.getProjectTypeStandards);

/**
 * @route   GET /api/compliance/project-standards/all
 * @desc    Get all project type standards
 * @access  Private (admin only)
 */
router.get('/project-standards/all', auth, complianceVerificationController.getAllProjectTypeStandards);

/**
 * @route   POST /api/compliance/project-standards
 * @desc    Create a new project type standard
 * @access  Private (admin only)
 */
router.post(
  '/project-standards',
  [
    auth,
    check('projectType', 'Project type is required').not().isEmpty(),
    check('standardType', 'Standard type is required').not().isEmpty(),
    check('standardCode', 'Standard code is required').not().isEmpty()
  ],
  complianceVerificationController.createProjectTypeStandard
);

/**
 * @route   PUT /api/compliance/project-standards/:id
 * @desc    Update a project type standard
 * @access  Private (admin only)
 */
router.put(
  '/project-standards/:id',
  [
    auth,
    check('projectType', 'Project type is required').not().isEmpty(),
    check('standardType', 'Standard type is required').not().isEmpty(),
    check('standardCode', 'Standard code is required').not().isEmpty()
  ],
  complianceVerificationController.updateProjectTypeStandard
);

/**
 * @route   DELETE /api/compliance/project-standards/:id
 * @desc    Delete a project type standard
 * @access  Private (admin only)
 */
router.delete('/project-standards/:id', auth, complianceVerificationController.deleteProjectTypeStandard);

// Compliance Recommendations Routes

/**
 * @route   GET /api/compliance/recommendations
 * @desc    Get recommendations for non-compliant results
 * @access  Public
 */
router.get('/recommendations', complianceVerificationController.getComplianceRecommendations);

/**
 * @route   GET /api/compliance/recommendations/all
 * @desc    Get all compliance recommendations
 * @access  Private (admin only)
 */
router.get('/recommendations/all', auth, complianceVerificationController.getAllComplianceRecommendations);

/**
 * @route   POST /api/compliance/recommendations
 * @desc    Create a new compliance recommendation
 * @access  Private (admin only)
 */
router.post(
  '/recommendations',
  [
    auth,
    check('ruleId', 'Rule ID is required').isNumeric(),
    check('nonComplianceType', 'Non-compliance type is required').not().isEmpty(),
    check('recommendationText', 'Recommendation text is required').not().isEmpty(),
    check('calculatorType', 'Calculator type is required').not().isEmpty()
  ],
  complianceVerificationController.createComplianceRecommendation
);

/**
 * @route   PUT /api/compliance/recommendations/:id
 * @desc    Update a compliance recommendation
 * @access  Private (admin only)
 */
router.put(
  '/recommendations/:id',
  [
    auth,
    check('ruleId', 'Rule ID is required').isNumeric(),
    check('nonComplianceType', 'Non-compliance type is required').not().isEmpty(),
    check('recommendationText', 'Recommendation text is required').not().isEmpty(),
    check('calculatorType', 'Calculator type is required').not().isEmpty()
  ],
  complianceVerificationController.updateComplianceRecommendation
);

/**
 * @route   DELETE /api/compliance/recommendations/:id
 * @desc    Delete a compliance recommendation
 * @access  Private (admin only)
 */
router.delete('/recommendations/:id', auth, complianceVerificationController.deleteComplianceRecommendation);

// Add a root route handler to avoid 404
router.get('/', async (req, res) => {
  try {
    // Return a basic info response about the API
    res.json({
      message: 'Compliance Verification API is running',
      endpoints: [
        '/rules',
        '/rules/:id',
        '/checklists',
        '/checklists/:id',
        '/checks',
        '/verify/:calculationId'
      ]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 