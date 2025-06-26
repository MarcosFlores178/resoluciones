const bcrypt = require('bcrypt');
const { Usuario } = require('./db/models'); // Ajustá la ruta si es necesario

(async () => {
  const email = 'marcosfabianflores@gmail.com';
  const passwordPlano = 'admin123';
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
