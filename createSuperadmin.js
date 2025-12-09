const bcrypt = require('bcrypt');
const { Usuario } = require('./db/models'); // Ajustá la ruta si es necesario

console.log('DB Host:', process.env.MYSQLHOST);
console.log('DB User:', process.env.MYSQLUSER);


(async () => {
  const email = 'marcosfabianflores@gmail.com';
  const passwordPlano = 'admin12331591248';
  const hashedPassword = await bcrypt.hash(passwordPlano, 10);

  try {
    await Usuario.create({
      email,
      password: hashedPassword,
      rol: 'superadmin',
      primer_ingreso: false
    });
    console.log('Superadmin creado con éxito.');
  } catch (err) {
    console.error('Error al crear superadmin:', err);
  }
})();
