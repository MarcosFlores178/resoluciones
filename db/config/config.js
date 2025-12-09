require('dotenv').config();

module.exports = {
  development: {
    url: process.env.DB_URL || null,
    username: process.env.DB_USER || process.env.MYSQLUSER,
    password: process.env.DB_PASS || process.env.MYSQLPASSWORD,
    database: process.env.DB_NAME || process.env.MYSQLDATABASE,
    host: process.env.DB_HOST || process.env.MYSQLHOST,
    port: process.env.DB_PORT || process.env.MYSQLPORT,
    dialect: "mysql",
  },

  production: {
    // Opción 1: Usar la URL completa de Railway
    // url: process.env.MYSQL_URL, // ← Esta variable la inyecta Railway automáticamente
    username: process.env.MYSQLUSER || process.env.DB_USER,
    password: process.env.MYSQLPASSWORD || process.env.DB_PASS,
    database: process.env.MYSQLDATABASE || process.env.DB_NAME,
    host: process.env.MYSQLHOST ||process.env.DB_HOST,
    port: process.env.MYSQLPORT || process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || "mysql",

    // Opción 2: Usar la configuración por partes de Railway

    // Railway sometimes needs this
    // dialectOptions: {
    //   ssl: {
    //     require: false,
    //   }
    // }
  }
};
