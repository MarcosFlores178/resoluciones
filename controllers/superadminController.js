const { Usuario } = require('../db/models');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const enviarEmailTemporal = require('../utils/email'); // tu función para enviar email
// import enviarEmailTemporal from '../utils/email.js';

exports.formCrearUsuario = (req, res) => {
  res.render('dashboard', {cssFile: "dashboard.css", mensaje: null, error: null, usuario: req.session.user, passwordTemporal: null });
};

exports.crearUsuario = async (req, res) => {
  console.log("dentro de crear Usuario en superadmincontroller");
  const { email, rol } = req.body;

  //BUscar email ingresado en la base de datos para evitar duplicados
  const usuarioExistente = await Usuario.findOne({ where: { email } });
  if (usuarioExistente) {
    return res.render('dashboard', {
      mensaje: null,
      error: 'El email ya está registrado',
      cssFile: "dashboard.css",
      usuario: req.session.user,
      passwordTemporal: null
    });
  }

  const passwordTemporal = crypto.randomBytes(5).toString('hex');
  const hashed = await bcrypt.hash(passwordTemporal, 10);
  console.log("Contraseña temporal generada:", passwordTemporal);

  try {
    const usuario = await Usuario.create({
      email,
      rol,
      password: hashed,
      primerIngreso: true
    });

    await enviarEmailTemporal(email, passwordTemporal);

    res.render('dashboard', {
      usuario,
      mensaje: `Usuario creado y correo enviado a ${email}`,
      cssFile: "dashboard.css",
      error: null,
      passwordTemporal
    });
  } catch (err) {
    console.error(err);
    res.render('dashboard', { mensaje: 'Error al crear usuario', 
      cssFile: null, 
      error: err.message  });
  }
};
