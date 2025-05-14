module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('energy_audits', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('Pending', 'Completed'),
        defaultValue: 'Pending',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      assignedTo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      findings: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('energy_audits');
  },
}; 