require('dotenv').config();

console.log('DB_HOST', process.env.DB_HOST);
console.log('DB_USER', process.env.DB_USER);
console.log('DB_PASS', process.env.DB_PASS);


module.exports = {
  development: {
    url: process.env.DB_URL, // usar DB_URL si existe
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
  },
  production: {
    url: process.env.DB_URL, // Railway Private Networking
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
  },
};