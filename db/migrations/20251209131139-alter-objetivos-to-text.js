'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Cambiar ambos campos a TEXT
    await queryInterface.changeColumn('resoluciones', 'objetivos', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
    await queryInterface.changeColumn('resoluciones', 'segundos_objetivos', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },

  async down (queryInterface, Sequelize) {
    // Revertir a VARCHAR(255) si es necesario
    await queryInterface.changeColumn('resoluciones', 'objetivos', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn('resoluciones', 'segundos_objetivos', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  }
};
