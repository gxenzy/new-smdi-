const { Op } = require('sequelize');
const sequelize = require('../database/sequelize');
const ComplianceRule = require('./ComplianceRule');
const ComplianceRecommendation = require('./ComplianceRecommendation');
const logger = require('../utils/logger');

/**
 * Compliance Model
 * Handles database interactions for compliance rules, checks, and verification
 */
class Compliance {
  /**
   * Get rules for a specific calculation type
   * @param {String} calculationType - Type of calculation
   * @returns {Promise<Array>} - Array of rules
   */
  static async getRulesByType(calculationType) {
    try {
      let rules;
      
      if (calculationType === 'illumination') {
        rules = await ComplianceRule.findAll({
          where: {
            rule_code: { [Op.like]: '%PEC-IL%' },
            active: true
          }
        });
      } else if (calculationType === 'lpd') {
        rules = await ComplianceRule.findAll({
          where: {
            rule_code: { [Op.like]: '%PGBC-LPD%' },
            active: true
          }
        });
      } else if (calculationType === 'power_factor') {
        rules = await ComplianceRule.findAll({
          where: {
            rule_code: { [Op.like]: '%PEC-1078%' },
            active: true
          }
        });
      } else if (calculationType === 'roi' || calculationType === 'payback' || calculationType === 'npv' || calculationType === 'irr') {
        rules = await ComplianceRule.findAll({
          where: {
            rule_code: { [Op.like]: '%FNANCL%' },
            active: true
          }
        });
      }
      
      return rules || [];
    } catch (error) {
      logger.error('Error getting rules by type:', error);
      throw error;
    }
  }

  /**
   * Get general rules when specific rules are not available
   * @returns {Promise<Array>} - Array of general rules
   */
  static async getGeneralRules() {
    try {
      return await ComplianceRule.findAll({
        where: {
          type: 'mandatory',
          active: true
        },
        limit: 5
      });
    } catch (error) {
      logger.error('Error getting general rules:', error);
      throw error;
    }
  }

  /**
   * Create a ComplianceVerification model
   */
  static defineVerificationModel() {
    if (!Compliance.VerificationModel) {
      Compliance.VerificationModel = sequelize.define('ComplianceVerification', {
        id: {
          type: sequelize.Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        calculationId: {
          type: sequelize.Sequelize.STRING(36),
          allowNull: false,
          field: 'calculation_id'
        },
        userId: {
          type: sequelize.Sequelize.INTEGER,
          allowNull: false,
          field: 'user_id'
        },
        resultData: {
          type: sequelize.Sequelize.TEXT('long'),
          allowNull: false,
          field: 'result_data',
          get() {
            const rawValue = this.getDataValue('resultData');
            return rawValue ? JSON.parse(rawValue) : null;
          },
          set(value) {
            this.setDataValue('resultData', JSON.stringify(value));
          }
        },
        compliantCount: {
          type: sequelize.Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'compliant_count'
        },
        nonCompliantCount: {
          type: sequelize.Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'non_compliant_count'
        },
        status: {
          type: sequelize.Sequelize.STRING(20),
          allowNull: false,
          defaultValue: 'needs_review'
        },
        createdAt: {
          type: sequelize.Sequelize.DATE,
          allowNull: false,
          defaultValue: sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
          field: 'created_at'
        },
        updatedAt: {
          type: sequelize.Sequelize.DATE,
          allowNull: false,
          defaultValue: sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
          field: 'updated_at'
        }
      }, {
        tableName: 'compliance_verifications',
        underscored: true
      });
    }
    
    return Compliance.VerificationModel;
  }

  /**
   * Save verification results
   * @param {String} calculationId - ID of the calculation
   * @param {Number} userId - ID of the user
   * @param {Object} results - Verification results
   * @returns {Promise<Object>} - Saved verification results
   */
  static async saveVerificationResults(calculationId, userId, results) {
    try {
      const VerificationModel = this.defineVerificationModel();
      
      const verification = await VerificationModel.create({
        calculationId,
        userId,
        resultData: results,
        compliantCount: results.compliantCount || 0,
        nonCompliantCount: results.nonCompliantCount || 0,
        status: results.status || 'needs_review'
      });
      
      return {
        id: verification.id,
        calculationId,
        userId,
        results
      };
    } catch (error) {
      logger.error('Error saving verification results:', error);
      throw error;
    }
  }

  /**
   * Get verification history for a user
   * @param {Number} userId - User ID
   * @returns {Promise<Array>} - Verification history
   */
  static async getVerificationHistory(userId) {
    try {
      const VerificationModel = this.defineVerificationModel();
      
      const verifications = await VerificationModel.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit: 50
      });
      
      return verifications.map(v => ({
        id: v.id,
        calculationId: v.calculationId,
        userId: v.userId,
        compliantCount: v.compliantCount,
        nonCompliantCount: v.nonCompliantCount,
        status: v.status,
        createdAt: v.createdAt
      }));
    } catch (error) {
      logger.error('Error getting verification history:', error);
      throw error;
    }
  }

  /**
   * Get verification details by ID
   * @param {Number} verificationId - Verification ID
   * @returns {Promise<Object>} - Verification details
   */
  static async getVerificationById(verificationId) {
    try {
      const VerificationModel = this.defineVerificationModel();
      
      const verification = await VerificationModel.findByPk(verificationId);
      
      if (!verification) {
        throw new Error(`Verification not found with ID: ${verificationId}`);
      }
      
      return {
        id: verification.id,
        calculationId: verification.calculationId,
        userId: verification.userId,
        results: verification.resultData,
        compliantCount: verification.compliantCount,
        nonCompliantCount: verification.nonCompliantCount,
        status: verification.status,
        createdAt: verification.createdAt
      };
    } catch (error) {
      logger.error('Error getting verification by ID:', error);
      throw error;
    }
  }
}

// Initialize the VerificationModel property
Compliance.VerificationModel = null;

module.exports = Compliance; 