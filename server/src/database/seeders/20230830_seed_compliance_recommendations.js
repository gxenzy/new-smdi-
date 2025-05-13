/**
 * Seeder for compliance_recommendations table
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, query the rule IDs from compliance_rules to ensure referential integrity
    const rules = await queryInterface.sequelize.query(
      'SELECT id, rule_code FROM compliance_rules',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Map rule codes to their IDs for reference
    const ruleMap = {};
    rules.forEach(rule => {
      ruleMap[rule.rule_code] = rule.id;
    });

    // Create recommendations with proper rule_id references
    const recommendations = [];

    // Illumination recommendations
    if (ruleMap['PEC-1075-ILLUM']) {
      recommendations.push({
        rule_id: ruleMap['PEC-1075-ILLUM'],
        non_compliance_type: 'below_minimum',
        recommendation_text: 'Increase lighting levels by adding fixtures or increasing lamp wattage to meet the minimum illumination requirement. Consider LED upgrades for energy efficiency.',
        priority: 'high',
        calculator_type: 'illumination',
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // LPD recommendations
    if (ruleMap['PGBC-LPD-2019']) {
      recommendations.push({
        rule_id: ruleMap['PGBC-LPD-2019'],
        non_compliance_type: 'above_maximum',
        recommendation_text: 'Reduce lighting power density by replacing fixtures with more efficient options, reducing fixture quantity, or implementing lighting controls such as occupancy sensors.',
        priority: 'medium',
        calculator_type: 'lpd',
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // Power factor recommendations
    if (ruleMap['PEC-1078-PF']) {
      recommendations.push({
        rule_id: ruleMap['PEC-1078-PF'],
        non_compliance_type: 'below_minimum',
        recommendation_text: 'Install power factor correction capacitors near inductive loads or upgrade equipment with poor power factor characteristics to improve overall system efficiency.',
        priority: 'medium',
        calculator_type: 'power_factor',
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // ROI recommendations
    if (ruleMap['FNANCL-ROI-2022']) {
      recommendations.push({
        rule_id: ruleMap['FNANCL-ROI-2022'],
        non_compliance_type: 'below_minimum',
        recommendation_text: 'Review project financials to improve ROI through increased energy savings or reduced implementation costs. Consider alternative equipment options or phase implementation.',
        priority: 'medium',
        calculator_type: 'roi',
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // Payback period recommendations
    if (ruleMap['FNANCL-PAYBCK-2022']) {
      recommendations.push({
        rule_id: ruleMap['FNANCL-PAYBCK-2022'],
        non_compliance_type: 'above_maximum',
        recommendation_text: 'Optimize project scope to reduce initial costs or increase energy savings. Target measures with fastest payback periods first or explore utility incentives to improve payback.',
        priority: 'medium',
        calculator_type: 'payback',
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // Insert all recommendations
    return queryInterface.bulkInsert('compliance_recommendations', recommendations);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('compliance_recommendations', null, {});
  }
}; 