'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   // Poner DATEONLY
    await queryInterface.changeColumn('resoluciones', 'fecha', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    // Deshacer cambios
    await queryInterface.changeColumn('resoluciones', 'fecha', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
  }
};
