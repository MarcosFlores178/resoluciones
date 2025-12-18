const { Usuario } = require('../db/models');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
//apiBrevo funciona pero se debe autorizar la IP que puede cambiar en railway

const enviarEmailTemporal = require('../utils/nodemailerBrevo'); // tu función para enviar email
const { sequelize } = require('../db/models');
// import enviarEmailTemporal from '../utils/email.js';

exports.formCrearUsuario = (req, res) => {
  res.render('dashboard', {cssFile: "dashboard.css", mensaje: null, error: null, usuario: req.session.user, passwordTemporal: null });
};

exports.crearUsuario = async (req, res) => {
  const { email, rol } = req.body;
  const transaction = await sequelize.transaction(); // 1. Iniciamos transacción

  try {
    // 2. Buscar email (dentro de la transacción)
    const usuarioExistente = await Usuario.findOne({ 
      where: { email },
      transaction // ← Importante: pasar la transacción
    });
    
    if (usuarioExistente) {
      await transaction.rollback(); // 3. Si existe, revertimos
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

    // 4. Crear usuario (dentro de la transacción)
    const usuario = await Usuario.create({
      email,
      rol,
      password: hashed,
      primerIngreso: true
    }, { transaction }); // ← Pasar la transacción aquí también

    // 5. Intentar enviar email
    await enviarEmailTemporal(email, passwordTemporal);

    // 6. Si TODO sale bien, confirmamos
    await transaction.commit();

    res.render('dashboard', {
      usuario,
      mensaje: `Usuario creado y correo enviado a ${email}`,
      cssFile: "dashboard.css",
      error: null,
      passwordTemporal
    });

  } catch (err) {
    // 7. Si CUALQUIER cosa falla, revertimos TODO
    await transaction.rollback();
    
    console.error('Error en creación de usuario:', err);
    
    // 8. Mensaje amigable según el tipo de error
    let mensajeError = 'Error al crear usuario';
    if (err.message.includes('trial account unique recipients limit')) {
      mensajeError = 'Límite de destinatarios alcanzado. No se creó el usuario.';
    }
    
    res.render('dashboard', { 
      mensaje: null, 
      cssFile: "dashboard.css", 
      error: mensajeError,
      usuario: req.session.user,
      passwordTemporal: null
    });
  }
};
