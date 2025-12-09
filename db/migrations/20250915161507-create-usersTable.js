'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
      id_usuarios: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      apellido: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      rol: {
        type: Sequelize.ENUM("superadmin", "organizador", "administrativo"),
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
       password_temporal: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    password_temporal_expira: {
      type: Sequelize.DATE,
      allowNull: true,
    },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
       telefono: {
      type: Sequelize.STRING(100),
      allowNull: true,
      },
      primer_ingreso: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
          sexo_organizador: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
    titulo_organizador: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    articulo_organizador: {
      type: Sequelize.STRING(20),
      allowNull: true,
    },
    token_recuperacion: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    token_expiracion: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('usuarios');
  }
};
