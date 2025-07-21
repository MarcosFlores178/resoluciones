module.exports = (sequelize, dataTypes) => {
  let alias = "Resolucion";

  let cols = {
    id_resoluciones: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fecha: {
      type: dataTypes.DATE,
      allowNull: true,
    },
    resolucion_interes_departamental: {
      type: dataTypes.STRING,
      allowNull: true,
    },
    numero_resolucion: {
      type: dataTypes.STRING,
      allowNull: true,
    },
    expediente: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    cohorte: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    curso: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    denominacion_docente: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    docente: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    alumnos: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    objetivos: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    segundos_objetivos: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    horas_totales: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    clases: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    horas_clase: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    minimo: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    maximo: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    mes_curso: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    id_usuarios: {
      type: dataTypes.INTEGER,
      allowNull: false, // Opcional: si siempre debe tener un usuario
      references: {
        model: "usuarios", // Nombre de la tabla en la BD
        key: "id_usuarios", // Campo referenciado
      },
    },
    estado: {
      type: dataTypes.ENUM("nuevo","guardado","modificado","pendiente","emitido"),
      defaultValue: "nuevo", // Valor por defecto
      allowNull: false,
    },
    visto_pdf: {
      type: dataTypes.BOOLEAN,
      defaultValue: false, // Por defecto, no visto
    },
  };

  let config = {
    tableName: "resoluciones",
    timestamps: false,
  };

  const Resolucion = sequelize.define(alias, cols, config);
  // TODO sacar de la base de datos la fecha de la resolucion y el número de resolución, por ahora. O sacar el allowNull false de la fecha.
  // Si más adelante querés relaciones, podés agregarlas acá
  Resolucion.associate = function (models) {
    Resolucion.belongsTo(models.Usuario, {
      as: "autor",
      foreignKey: "id_usuarios", // Campo en Resolucion que referencia a Usuario
    });
  };

  return Resolucion;
};
