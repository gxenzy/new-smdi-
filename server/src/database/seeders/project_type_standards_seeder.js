/**
 * Seeder for the project_type_standards table
 * Populates standard values for different project types
 */
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Define project type standards
    const projectTypeStandards = [
      // ROI standards for different project types
      {
        project_type: 'lighting_retrofit',
        standard_type: 'financial',
        standard_code: 'FNANCL-ROI',
        minimum_value: 15.0, // percentage
        maximum_value: null,
        unit: '%',
        source_standard_id: null,
        description: 'Minimum Return on Investment for lighting retrofit projects',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        project_type: 'hvac_upgrade',
        standard_type: 'financial',
        standard_code: 'FNANCL-ROI',
        minimum_value: 12.0, // percentage
        maximum_value: null,
        unit: '%',
        source_standard_id: null,
        description: 'Minimum Return on Investment for HVAC upgrade projects',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        project_type: 'renewable_energy',
        standard_type: 'financial',
        standard_code: 'FNANCL-ROI',
        minimum_value: 8.0, // percentage
        maximum_value: null,
        unit: '%',
        source_standard_id: null,
        description: 'Minimum Return on Investment for renewable energy projects',
        created_at: new Date(),
        updated_at: new Date()
      },
      
      // Payback period standards
      {
        project_type: 'lighting_retrofit',
        standard_type: 'financial',
        standard_code: 'FNANCL-PAYBCK',
        minimum_value: null,
        maximum_value: 3.0, // years
        unit: 'years',
        source_standard_id: null,
        description: 'Maximum payback period for lighting retrofit projects',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        project_type: 'hvac_upgrade',
        standard_type: 'financial',
        standard_code: 'FNANCL-PAYBCK',
        minimum_value: null,
        maximum_value: 5.0, // years
        unit: 'years',
        source_standard_id: null,
        description: 'Maximum payback period for HVAC upgrade projects',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        project_type: 'renewable_energy',
        standard_type: 'financial',
        standard_code: 'FNANCL-PAYBCK',
        minimum_value: null,
        maximum_value: 7.0, // years
        unit: 'years',
        source_standard_id: null,
        description: 'Maximum payback period for renewable energy projects',
        created_at: new Date(),
        updated_at: new Date()
      },
      
      // NPV ratio standards
      {
        project_type: 'lighting_retrofit',
        standard_type: 'financial',
        standard_code: 'FNANCL-NPV',
        minimum_value: 1.2, // ratio
        maximum_value: null,
        unit: 'ratio',
        source_standard_id: null,
        description: 'Minimum NPV ratio for lighting retrofit projects',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        project_type: 'hvac_upgrade',
        standard_type: 'financial',
        standard_code: 'FNANCL-NPV',
        minimum_value: 1.1, // ratio
        maximum_value: null,
        unit: 'ratio',
        source_standard_id: null,
        description: 'Minimum NPV ratio for HVAC upgrade projects',
        created_at: new Date(),
        updated_at: new Date()
      },
      
      // IRR standards
      {
        project_type: 'lighting_retrofit',
        standard_type: 'financial',
        standard_code: 'FNANCL-IRR',
        minimum_value: 18.0, // percentage
        maximum_value: null,
        unit: '%',
        source_standard_id: null,
        description: 'Minimum Internal Rate of Return for lighting retrofit projects',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        project_type: 'hvac_upgrade',
        standard_type: 'financial',
        standard_code: 'FNANCL-IRR',
        minimum_value: 15.0, // percentage
        maximum_value: null,
        unit: '%',
        source_standard_id: null,
        description: 'Minimum Internal Rate of Return for HVAC upgrade projects',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        project_type: 'renewable_energy',
        standard_type: 'financial',
        standard_code: 'FNANCL-IRR',
        minimum_value: 10.0, // percentage
        maximum_value: null,
        unit: '%',
        source_standard_id: null,
        description: 'Minimum Internal Rate of Return for renewable energy projects',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    return queryInterface.bulkInsert('project_type_standards', projectTypeStandards);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('project_type_standards', null, {});
  }
}; 