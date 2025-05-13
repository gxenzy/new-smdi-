/**
 * Building Type Standards Seeder
 * 
 * Populates the building_type_standards table with illumination standards
 * based on PEC 2017 Rule 1075.
 */

const sequelize = require('../../database/sequelize');
const logger = require('../../utils/logger');
const BuildingTypeStandard = require('../../models/BuildingTypeStandard');

async function seedBuildingTypeStandards() {
  try {
    logger.info('Starting to seed building type standards...');
    
    // Get the standard ID for PEC 2017
    const [standardResult] = await sequelize.query(`
      SELECT id FROM standards WHERE code_name = 'PEC' AND version = '2017'
    `);
    
    let standardId = 1; // Default if not found
    if (standardResult && standardResult.length > 0) {
      standardId = standardResult[0].id;
      logger.info(`Found PEC 2017 with ID: ${standardId}`);
    } else {
      logger.warn('PEC 2017 standard not found, using default ID: 1');
    }
    
    // Illumination standards based on PEC 2017 Rule 1075
    const illuminationStandards = [
      {
        buildingType: 'office',
        standardType: 'illumination',
        standardCode: 'PEC1075-OFFICE',
        minimumValue: 500,
        maximumValue: null,
        unit: 'lux',
        description: 'Illumination level for offices',
        sourceStandardId: standardId
      },
      {
        buildingType: 'office',
        standardType: 'lpd',
        standardCode: 'PGBC-LPD-OFFICE',
        minimumValue: null,
        maximumValue: 10.5,
        unit: 'W/m²',
        description: 'Lighting Power Density for offices',
        sourceStandardId: standardId
      },
      {
        buildingType: 'classroom',
        standardType: 'illumination',
        standardCode: 'PEC1075-CLASSROOM',
        minimumValue: 500,
        maximumValue: null,
        unit: 'lux',
        description: 'Illumination level for classrooms',
        sourceStandardId: standardId
      },
      {
        buildingType: 'classroom',
        standardType: 'lpd',
        standardCode: 'PGBC-LPD-CLASSROOM',
        minimumValue: null,
        maximumValue: 10.5,
        unit: 'W/m²',
        description: 'Lighting Power Density for classrooms',
        sourceStandardId: standardId
      },
      {
        buildingType: 'hospital',
        standardType: 'illumination',
        standardCode: 'PEC1075-HOSPITAL',
        minimumValue: 300,
        maximumValue: null,
        unit: 'lux',
        description: 'Illumination level for hospital wards',
        sourceStandardId: standardId
      },
      {
        buildingType: 'hospital',
        standardType: 'lpd',
        standardCode: 'PGBC-LPD-HOSPITAL',
        minimumValue: null,
        maximumValue: 11.2,
        unit: 'W/m²',
        description: 'Lighting Power Density for hospitals',
        sourceStandardId: standardId
      },
      {
        buildingType: 'retail',
        standardType: 'illumination',
        standardCode: 'PEC1075-RETAIL',
        minimumValue: 750,
        maximumValue: null,
        unit: 'lux',
        description: 'Illumination level for retail areas',
        sourceStandardId: standardId
      },
      {
        buildingType: 'retail',
        standardType: 'lpd',
        standardCode: 'PGBC-LPD-RETAIL',
        minimumValue: null,
        maximumValue: 14.5,
        unit: 'W/m²',
        description: 'Lighting Power Density for retail areas',
        sourceStandardId: standardId
      },
      {
        buildingType: 'industrial',
        standardType: 'illumination',
        standardCode: 'PEC1075-INDUSTRIAL',
        minimumValue: 500,
        maximumValue: null,
        unit: 'lux',
        description: 'Illumination level for industrial work areas',
        sourceStandardId: standardId
      },
      {
        buildingType: 'industrial',
        standardType: 'lpd',
        standardCode: 'PGBC-LPD-INDUSTRIAL',
        minimumValue: null,
        maximumValue: 12.8,
        unit: 'W/m²',
        description: 'Lighting Power Density for industrial areas',
        sourceStandardId: standardId
      }
    ];
    
    // Check if data already exists
    const existingCount = await BuildingTypeStandard.count();
    
    if (existingCount > 0) {
      logger.info(`${existingCount} building type standards already exist, skipping seed.`);
      return;
    }
    
    // Insert data
    await BuildingTypeStandard.bulkCreate(illuminationStandards);
    
    logger.info(`Successfully seeded ${illuminationStandards.length} building type standards.`);
  } catch (error) {
    logger.error('Error seeding building type standards:', error);
    throw error;
  }
}

module.exports = seedBuildingTypeStandards; 