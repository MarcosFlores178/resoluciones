const { Usuario } = require('../db/models');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const enviarEmailTemporal = require('../utils/email'); // tu función para enviar email

exports.formCrearUsuario = (req, res) => {
  res.render('dashboard', {cssFile: "dashboard.css", mensaje: null, error: null, usuario: req.session.user});
};

exports.crearUsuario = async (req, res) => {
  const { email, rol } = req.body;

  const passwordTemporal = crypto.randomBytes(5).toString('hex');
  const hashed = await bcrypt.hash(passwordTemporal, 10);

  try {
    const nuevoUsuario = await Usuario.create({
      email,
      rol,
      password: hashed,
      primerIngreso: true
    });

    await enviarEmailTemporal(email, passwordTemporal);

    res.render('dashboard', {
      mensaje: `Usuario creado y correo enviado a ${email}`,
      cssFile: "dashboard.css",
      error: null,
    });
  } catch (err) {
    console.error(err);
    res.render('dashboard', { mensaje: 'Error al crear usuario', 
      cssFile: null, 
      error: err.message  });
  }
};
