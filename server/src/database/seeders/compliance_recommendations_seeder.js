/**
 * Seeder for the compliance_recommendations table
 * Populates recommendation templates for non-compliant results
 */
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get compliance rule IDs for reference
    const rules = await queryInterface.sequelize.query(
      `SELECT id, rule_code FROM compliance_rules 
       WHERE rule_code IN (
         'PEC-1075-ILLUM', 'PEC-1078-PF', 'PEC-1080-HARM', 
         'ASHRAE-90.1-COP', 'DOE-EE-EUI', 'PGBC-LPD',
         'FNANCL-ROI', 'FNANCL-PAYBCK'
       )`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Create a lookup map for rule IDs
    const ruleIdMap = rules.reduce((map, rule) => {
      map[rule.rule_code] = rule.id;
      return map;
    }, {});

    // Define compliance recommendations
    const recommendations = [
      // Illumination recommendations
      {
        rule_id: ruleIdMap['PEC-1075-ILLUM'],
        non_compliance_type: 'below_minimum',
        recommendation_text: 'Increase the number of luminaires or replace existing ones with higher lumen output fixtures. Consider using more efficient LED lighting with appropriate color temperature for the space.',
        priority: 'high',
        calculator_type: 'illumination',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        rule_id: ruleIdMap['PGBC-LPD'],
        non_compliance_type: 'above_maximum',
        recommendation_text: 'Reduce the lighting power density by using more efficient luminaires, optimizing placement, or implementing lighting controls such as occupancy sensors and daylight harvesting.',
        priority: 'medium',
        calculator_type: 'illumination',
        created_at: new Date(),
        updated_at: new Date()
      },
      
      // Power Factor recommendations
      {
        rule_id: ruleIdMap['PEC-1078-PF'],
        non_compliance_type: 'below_minimum',
        recommendation_text: 'Install power factor correction capacitors or filters. For larger systems, consider automatic power factor correction systems. Ensure all new equipment meets minimum power factor requirements.',
        priority: 'high',
        calculator_type: 'power_factor',
        created_at: new Date(),
        updated_at: new Date()
      },
      
      // Harmonic Distortion recommendations
      {
        rule_id: ruleIdMap['PEC-1080-HARM'],
        non_compliance_type: 'above_maximum',
        recommendation_text: 'Install harmonic filters or consider upgrading to equipment with lower harmonic distortion. Review the distribution of non-linear loads and consider redistributing across phases.',
        priority: 'high',
        calculator_type: 'harmonic_distortion',
        created_at: new Date(),
        updated_at: new Date()
      },
      
      // HVAC efficiency recommendations
      {
        rule_id: ruleIdMap['ASHRAE-90.1-COP'],
        non_compliance_type: 'below_minimum',
        recommendation_text: 'Upgrade to higher efficiency HVAC equipment that meets current ASHRAE standards. Consider variable speed drives and improved control systems to optimize performance.',
        priority: 'medium',
        calculator_type: 'hvac',
        created_at: new Date(),
        updated_at: new Date()
      },
      
      // Energy Use Intensity recommendations
      {
        rule_id: ruleIdMap['DOE-EE-EUI'],
        non_compliance_type: 'above_maximum',
        recommendation_text: 'Implement a comprehensive energy efficiency program including envelope improvements, HVAC upgrades, efficient lighting, and smart building controls. Conduct a detailed energy audit to identify specific opportunities.',
        priority: 'high',
        calculator_type: 'energy_efficiency',
        created_at: new Date(),
        updated_at: new Date()
      },
      
      // ROI recommendations
      {
        rule_id: ruleIdMap['FNANCL-ROI'],
        non_compliance_type: 'below_minimum',
        recommendation_text: 'Revise the project scope to focus on measures with higher returns first. Consider available incentives, rebates, and financing options to improve financial performance.',
        priority: 'medium',
        calculator_type: 'roi',
        created_at: new Date(),
        updated_at: new Date()
      },
      
      // Payback period recommendations
      {
        rule_id: ruleIdMap['FNANCL-PAYBCK'],
        non_compliance_type: 'above_maximum',
        recommendation_text: 'Focus on measures with faster payback periods. Evaluate installation costs and explore alternative equipment options. Consider phased implementation starting with quick-payback measures.',
        priority: 'medium',
        calculator_type: 'roi',
        created_at: new Date(),
        updated_at: new Date()
      },
      
      // General recommendations for other calculators
      {
        rule_id: ruleIdMap['PEC-1075-ILLUM'],
        non_compliance_type: 'general',
        recommendation_text: 'Review the lighting design to ensure it meets both energy efficiency goals and appropriate illumination levels for the space function.',
        priority: 'low',
        calculator_type: 'schedule_of_loads',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        rule_id: ruleIdMap['DOE-EE-EUI'],
        non_compliance_type: 'general',
        recommendation_text: 'Incorporate renewable energy sources such as solar PV to offset energy consumption and improve overall building performance.',
        priority: 'medium',
        calculator_type: 'renewable_energy',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        rule_id: ruleIdMap['ASHRAE-90.1-COP'],
        non_compliance_type: 'general',
        recommendation_text: 'Size transformers appropriately for the expected load to maximize efficiency and minimize losses.',
        priority: 'medium',
        calculator_type: 'transformer_sizing',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    return queryInterface.bulkInsert('compliance_recommendations', recommendations);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('compliance_recommendations', null, {});
  }
}; 