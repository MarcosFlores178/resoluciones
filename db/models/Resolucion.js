module.exports = (sequelize, dataTypes) => {
  let alias = "Resolucion";

  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    fecha: {
      type: dataTypes.DATE,
      allowNull: false
    },
    resolucion_interes_departamental: {
      type: dataTypes.STRING,
      allowNull: true
    },
    numero_resolucion: {
      type: dataTypes.STRING,
      allowNull: true
    },
    expediente: {
      type: dataTypes.STRING,
      allowNull: false
    },
    cohorte: {
      type: dataTypes.STRING,
      allowNull: false
    },
    curso: {
      type: dataTypes.STRING,
      allowNull: false
    },
    docente: {
      type: dataTypes.STRING,
      allowNull: false
    },
    alumnos: {
      type: dataTypes.STRING,
      allowNull: false
    },
    objetivos: {
      type: dataTypes.STRING,
      allowNull: false
    },
    segundos_objetivos: {
      type: dataTypes.STRING,
      allowNull: false
    },
    horas_totales: {
      type: dataTypes.STRING,
      allowNull: false
    },
    clases: {
      type: dataTypes.STRING,
      allowNull: false
    },
    horas_clase: {
      type: dataTypes.STRING,
      allowNull: false
    },
    minimo: {
      type: dataTypes.STRING,
      allowNull: false
    },
    maximo: {
      type: dataTypes.STRING,
      allowNull: false
    },
    mes_curso: {
      type: dataTypes.STRING,
      allowNull: false
    },
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
