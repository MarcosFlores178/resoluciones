module.exports = (sequelize, dataTypes) => {
  let alias = "Usuario";

  let cols = {
    nombre: {
      type: dataTypes.STRING(100),
      allowNull: true,
    },
    apellido: {
      type: dataTypes.STRING(100),
      allowNull: true,
    },
    rol: {
      type: dataTypes.ENUM("superadmin", "organizador", "administrativo"),
      allowNull: false,
    },
    id_usuarios: {
      type: dataTypes.INTEGER(11),
      primaryKey: true,
      autoIncrement: true,
    },
    password: {
      type: dataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: dataTypes.STRING(100),
      allowNull: false,
      unique: true, // Equivalente a UNIQUE KEY en MySQL
    },
     primerIngreso: {
      type: dataTypes.BOOLEAN,
      defaultValue: true
    }
  };

  let config = {
    tableName: "usuarios",
    timestamps: false,
  };

  const Usuario = sequelize.define(alias, cols, config);
  // TODO sacar de la base de datos la fecha de la resolucion y el número de resolución, por ahora. O sacar el allowNull false de la fecha.
  // Si más adelante querés relaciones, podés agregarlas acá
  Usuario.associate = function (models) {
    Usuario.hasMany(models.Resolucion, {
      as: "resoluciones",
      foreignKey: "id_usuarios", // Campo en Resolucion que referencia a Usuario
    });
  };

  return Usuario;
};
