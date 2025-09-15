require('dotenv').config();

console.log('DB_HOST', process.env.DB_HOST);
console.log('DB_USER', process.env.DB_USER);
console.log('DB_PASS', process.env.DB_PASS);
const useDbUrl = !!process.env.DB_URL; // true si DB_URL está definida

module.exports = {
  development: {
    url: useDbUrl ? process.env.DB_URL : undefined, // usar DB_URL si existe
    username: useDbUrl ? undefined : process.env.DB_USER,
    password: useDbUrl ? undefined : process.env.DB_PASS,
    database: useDbUrl ? undefined : process.env.DB_NAME,
    host: useDbUrl ? undefined : process.env.DB_HOST,
    port: useDbUrl ? undefined : process.env.DB_PORT,
    dialect: 'mysql',
  },
  production: {
     url: useDbUrl ? process.env.DB_URL : undefined, // Railway Private Networking
    username: useDbUrl ? undefined : process.env.DB_USER,
    password: useDbUrl ? undefined : process.env.DB_PASS,
    database: useDbUrl ? undefined : process.env.DB_NAME,
    host: useDbUrl ? undefined : process.env.DB_HOST,
    port: useDbUrl ? undefined : process.env.DB_PORT,
    dialect: 'mysql',
  },
};