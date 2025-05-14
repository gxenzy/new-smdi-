/**
 * Seeder for standards table
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('standards', [
      {
        code_name: 'PEC 2017',
        full_name: 'Philippine Electrical Code',
        version: '2017',
        issuing_body: 'IIEE',
        effective_date: new Date('2017-01-01'),
        description: 'The Philippine Electrical Code (PEC) sets the minimum standards for electrical installations.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code_name: 'ASHRAE 90.1',
        full_name: 'Energy Standard for Buildings Except Low-Rise Residential Buildings',
        version: '2019',
        issuing_body: 'ASHRAE',
        effective_date: new Date('2019-10-31'),
        description: 'ASHRAE 90.1 provides minimum requirements for energy-efficient design of buildings.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code_name: 'IEEE 519',
        full_name: 'IEEE Recommended Practice for Harmonic Control in Electrical Power Systems',
        version: '2014',
        issuing_body: 'IEEE',
        effective_date: new Date('2014-06-11'),
        description: 'IEEE 519-2014 provides guidelines for harmonic control in power systems.',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('standards', null, {});
  }
}; 