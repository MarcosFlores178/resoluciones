const { Usuario } = require('../db/models');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const enviarEmailTemporal = require('../utils/email'); // tu función para enviar email

exports.formCrearUsuario = (req, res) => {
  res.render('dashboard', {cssFile:null, mensaje: null, error: null, usuario: req.session.user});
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

    res.render('admin/crearUsuario', {
      mensaje: `Usuario creado y correo enviado a ${email}`
    });
  } catch (err) {
    console.error(err);
    res.render('admin/crearUsuario', { mensaje: 'Error al crear usuario' });
  }
};
