/**
 * Seeder for compliance_rules table
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('compliance_rules', [
      {
        rule_code: 'PEC-1075-ILLUM',
        title: 'Minimum Illumination Levels',
        description: 'Illumination levels must meet minimum requirements specified in PEC 2017.',
        severity: 'critical',
        type: 'mandatory',
        verification_method: 'On-site measurement with calibrated light meter',
        evaluation_criteria: 'Minimum of 500 lux for office spaces',
        failure_impact: 'Inadequate lighting can lead to eye strain, reduced productivity, and safety hazards.',
        remediation_advice: 'Increase lighting levels by adding fixtures or replacing with higher output lamps.',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        rule_code: 'PGBC-LPD-2019',
        title: 'Maximum Lighting Power Density',
        description: 'LPD must not exceed maximum values specified in green building standards.',
        severity: 'major',
        type: 'performance',
        verification_method: 'Calculate total wattage per square meter',
        evaluation_criteria: 'Maximum of 10 W/m² for office spaces',
        failure_impact: 'Excessive power consumption, increased operating costs, and unnecessary heat generation.',
        remediation_advice: 'Replace fixtures with more efficient options or reduce fixture quantity where appropriate.',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        rule_code: 'PEC-1078-PF',
        title: 'Power Factor Requirements',
        description: 'Power factor must meet minimum requirements to avoid penalties and ensure efficient system operation.',
        severity: 'major',
        type: 'mandatory',
        verification_method: 'Measurement with power quality analyzer',
        evaluation_criteria: 'Minimum of 0.9 power factor for industrial facilities',
        failure_impact: 'Low power factor results in higher utility bills, reduced system capacity, and potential penalties.',
        remediation_advice: 'Install power factor correction capacitors or upgrade equipment with poor power factor.',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        rule_code: 'FNANCL-ROI-2022',
        title: 'Minimum ROI for Energy Projects',
        description: 'Energy retrofits should meet minimum ROI requirements to ensure financial viability.',
        severity: 'major',
        type: 'performance',
        verification_method: 'Financial calculation based on energy savings and implementation costs',
        evaluation_criteria: 'Minimum ROI of 15% for lighting retrofits',
        failure_impact: 'Projects with insufficient ROI may not be financially sustainable or justify the investment.',
        remediation_advice: 'Reassess project scope, consider additional energy conservation measures, or seek incentives.',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        rule_code: 'FNANCL-PAYBCK-2022',
        title: 'Maximum Payback Period',
        description: 'Energy projects should have payback periods within acceptable limits.',
        severity: 'moderate',
        type: 'performance',
        verification_method: 'Financial calculation of time to recoup investment',
        evaluation_criteria: 'Maximum of 3 years payback for lighting retrofits',
        failure_impact: 'Long payback periods may result in delayed financial benefits and increased financial risk.',
        remediation_advice: 'Optimize project scope, target areas with highest energy usage first, or explore financing options.',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('compliance_rules', null, {});
  }
}; 