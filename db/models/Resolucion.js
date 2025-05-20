module.exports = (sequelize, dataTypes) => {
  let alias = "Resolucion";

  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: dataTypes.STRING,
      allowNull: false
    },
    asignatura: {
      type: dataTypes.STRING,
      allowNull: false
    },
    fecha: {
      type: dataTypes.DATE,
      allowNull: false
    },
    numero_resolucion: {
      type: dataTypes.STRING,
      allowNull: true
    }
  };

  let config = {
    tableName: "resoluciones",
    timestamps: false
  };

  const Resolucion = sequelize.define(alias, cols, config);

  // Si más adelante querés relaciones, podés agregarlas acá
  Resolucion.associate = function(models) {
    // Ejemplo:
    // Resolucion.belongsTo(models.Asignatura, {
    //   as: 'asignatura_relacionada',
    //   foreignKey: 'id_asignatura'
    // });
  };

  return Resolucion;
};
