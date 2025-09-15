'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('resoluciones', {
      id_resoluciones: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      fecha: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      resolucion_interes_departamental: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      numero_resolucion: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      expediente: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cohorte: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      curso: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      denominacion_docente: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      docente: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      alumnos: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      objetivos: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      segundos_objetivos: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      horas_totales: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      clases: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      horas_clase: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      minimo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      maximo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      mes_curso: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      id_usuarios: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id_usuarios'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      estado: {
        type: Sequelize.ENUM("nuevo","guardado","pendiente","emitido","rechazado"),
        allowNull: false,
        defaultValue: "nuevo",
      },
      fecha_creacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      fecha_cambio_estado: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      titulo_organizador: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      motivo_rechazo: {
        type: Sequelize.STRING,
        allowNull: true,
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('resoluciones');
  }
};