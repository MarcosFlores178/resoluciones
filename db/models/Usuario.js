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
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    password: {
      type: dataTypes.STRING(100),
      allowNull: false,
    },
    password_temporal: {
      type: dataTypes.STRING(100),
      allowNull: true,
    },
    password_temporal_expira: {
      type: dataTypes.DATE,
      allowNull: true,
    },
    email: {
      type: dataTypes.STRING(100),
      allowNull: false,
      unique: true, // Equivalente a UNIQUE KEY en MySQL
    },
    telefono: {
      type: dataTypes.STRING(100),
      allowNull: true,
      },
     primer_ingreso: {
      type: dataTypes.BOOLEAN,
      defaultValue: true
    },
    sexo_organizador: {
      type: dataTypes.STRING(50),
      allowNull: true,
    },
    titulo_organizador: {
      type: dataTypes.STRING(100),
      allowNull: true,
    },
    articulo_organizador: {
      type: dataTypes.STRING(20),
      allowNull: true,
    },
    token_recuperacion: {
      type: dataTypes.STRING(100),
      allowNull: true,
    },
    token_expiracion: {
      type: dataTypes.DATE,
      allowNull: true,
    },
  };

  let config = {
    tableName: "usuarios",
    timestamps: false,
  };

  const Usuario = sequelize.define(alias, cols, config);
  // Si más adelante querés relaciones, podés agregarlas acá
  Usuario.associate = function (models) {
    Usuario.hasMany(models.Resolucion, {
      as: "resoluciones",
      foreignKey: "id_usuarios", // Campo en Resolucion que referencia a Usuario
    });
  };

  return Usuario;
};
