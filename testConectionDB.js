// db/connection.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'mysql',
  logging: false, // opcional, para no mostrar queries en consola
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la DB exitosa');
  } catch (err) {
    console.error('❌ Error al conectar a la DB:', err);
  }
})();

module.exports = sequelize;
