const db = require("../db/models");
const bcrypt = require("bcrypt");
const { Usuario } = db;
const enviarEmailRecuperacion = require('../utils/emailRecuperacion');
const generarCodigoTemporal = require('../utils/generarCodigoTemporal');
const { Op } = require("sequelize");

module.exports = {
  showLogin: (req, res) => {
    res.render("auth/login", {
      error: null, // Puedes pasar un mensaje de error si es necesario
      cssFile: "login.css",
      
    });
  },
  login: async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
    try {
      const usuario = await Usuario.findOne({ where: { email } });
      if (!usuario) {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }
      // Verifica la contraseña
      const passwordMatch = await bcrypt.compare(password, usuario.password);
      if (!passwordMatch) {
        req.flash('error_msg', 'Credenciales inválidas');
        return res.redirect('/auth/login');
      }
//TODO manejar mejor credenciales invalidas
      // Guarda TODOS los datos del usuario en la sesión (incluyendo el rol)
      req.session.user = {
        id_usuarios: usuario.id_usuarios,
        email: usuario.email,
        rol: usuario.rol,
        nombre: usuario.nombre || null, // Asegúrate de que el modelo tenga este campo
        apellido: usuario.apellido || null, // Asegúrate de que el modelo tenga
        primer_ingreso: usuario.primer_ingreso,
        titulo_organizador: usuario.titulo_organizador,
        sexo_organizador: usuario.sexo_organizador
      };
      const rol = req.session.user.rol; // Obtiene el rol del usuario desde la sesión
      console.log("Rol del usuario:", rol);
      console.log("Primer ingreso:", req.session.user.primer_ingreso);
      console.log("id:", req.session.user.id);
      console.log(usuario.nombre);
      console.log(usuario.apellido);

      res.redirect("/"); // Redirige a la ruta principal (que manejará el rol)
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      req.flash('error_msg', 'Error interno del servidor');
      res.redirect('/auth/login');
      // res.status(500).json({ error: "Error interno del servidor" });
    }
  },
  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        req.flash('error_msg', 'Error interno del servidor');
        console.error("Error al cerrar sesión:", err);
        return res.redirect('/');
      }
      res.redirect("/auth/login"); // Redirige al login después de cerrar sesión
    });
  },
  showRegister: (req, res) => {
    res.render("auth/register", {
      usuario: req.session.user,
      error: null, // Puedes pasar un mensaje de error si es necesario
      cssFile: "register.css",
    });
  },
  register: async (req, res) => {
    const { nombre, apellido, password, titulo, sexo_organizador, telefono, confirm_password } = req.body;
    if (password !== confirm_password) {
      req.flash('error_msg', 'Las contraseñas no coinciden');
      return res.redirect('/auth/register');
    }

    if (!nombre || !apellido || !password || !titulo || !sexo_organizador || !telefono) {
      req.flash('error_msg', 'Por favor, completa todos los campos requeridos');
      return res.redirect('/auth/register');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    req.session.user.nombre = nombre;
    req.session.user.apellido = apellido;
    try {
      const [actualizados] = await Usuario.update(
        { nombre, apellido, password: hashedPassword, primer_ingreso: false, titulo_organizador: titulo, sexo_organizador, telefono },
        { where: { id_usuarios: req.session.user.id_usuarios } }
      );
      // req.session.user = nuevoUsuario;
      if (actualizados === 0) {
        req.flash('error_msg', 'Usuario no encontrado');
        return res.redirect('/auth/register');
      }
      res.redirect("/resoluciones/form-resolucion"); // Redirige a la ruta de formulario de resolución
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      req.flash('error_msg', 'Error interno del servidor');
      res.redirect('/auth/register');
    }
  },
mostrarCambiarPassword: async (req, res) => {
    try {
        res.render('auth/cambiar-password', { 
            cssFile: 'cambiarPassword.css',
            titulo: 'Cambiar Contraseña',
            actionUrl: '/auth/change-password',
            textoBoton: 'Guardar nueva contraseña',
            modo: 'cambio',
            urlCancelar: '/usuarios/profile'
        });
    } catch (error) {
        console.error("Error al mostrar el formulario de cambio de contraseña:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
},
cambiarPassword: async (req, res) => {
  try {
    const id_usuarios = req.session.user.id_usuarios;
    const { actual, nueva, confirmar } = req.body;

    // 1️⃣ Buscar el usuario
    const usuario = await Usuario.findByPk(id_usuarios);
    if (!usuario) {
        req.flash('error_msg', 'Usuario no encontrado');
      return res.redirect('/usuarios/change-password');
    }

    // 2️⃣ Verificar que las nuevas contraseñas coincidan
    if (nueva !== confirmar) {
        req.flash('error_msg', 'Las nuevas contraseñas no coinciden');
    //   return res.status(400).send("Las nuevas contraseñas no coinciden");
        return res.redirect('/usuarios/change-password');
    }

    // 3️⃣ Verificar contraseña actual
    const coincide = await bcrypt.compare(actual, usuario.password);
    if (!coincide) {
        req.flash('error_msg', 'La contraseña actual es incorrecta');
        return res.redirect('/usuarios/change-password');
    //
    }

    // 4️⃣ Hashear la nueva contraseña
    const nuevaHasheada = await bcrypt.hash(nueva, 10);

    // 5️⃣ Guardar en BD
    await usuario.update({ password: nuevaHasheada });

    // 6️⃣ Redirigir o responder
     req.flash('success_msg', 'Contraseña cambiada exitosamente');
    res.redirect("/usuarios/profile");
  } catch (error) {
    req.flash('error_msg', 'Error interno del servidor');
    console.error("Error al cambiar la contraseña del usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
},
// En tu authController.js
mostrarCambiarPasswordOlvido: async (req, res) => {
    try {
        const { token } = req.params;

            // Buscar usuario por token válido
    const usuario = await Usuario.findOne({ 
      where: { 
        token_recuperacion: token,
        token_expiracion: { [Op.gt]: new Date() },
        password_temporal: { [Op.not]: null } // Código aún no usado
      }
    });

     if (!usuario) {
      req.flash('error_msg', 'Enlace de recuperación inválido o expirado');
      return res.redirect('/auth/recuperar-password');
    }
        
        res.render('auth/cambiar-password', { 
            cssFile: 'cambiarPassword.css',
            titulo: 'Crear Nueva Contraseña',
            actionUrl: '/auth/cambiar-password-olvido',
            textoBoton: 'Actualizar Contraseña',
            modo: 'olvido',
            email: usuario.email,
            token: token,
            urlCancelar: '/auth/login'
        });
    } catch (error) {
          console.error('Error:', error);
    req.flash('error_msg', 'Error al procesar la solicitud');
    res.redirect('/auth/recuperar-password');
    }
},

changePasswordOlvido: async (req, res) => {
  try {
    const { email, token, codigoTemporal, nueva, confirmar } = req.body;

    // 1. Validar que las contraseñas coincidan
    if (nueva !== confirmar) {
      req.flash('error_msg', 'Las nuevas contraseñas no coinciden');
      return res.redirect(`/auth/cambiar-password/${token}`);
    }

        // Buscar por token Y código temporal
    const usuario = await Usuario.findOne({ 
      where: { 
        email,
        token_recuperacion: token,
        token_expiracion: { [Op.gt]: new Date() }
        
      }
    });

    if (!usuario) {
      req.flash('error_msg', 'Solicitud inválida o expirada');
      return res.redirect('/auth/recuperar-password');
    }

      // ✅ OPCIONAL: Doble verificación que el código fue usado correctamente
    // Pero sin pedirlo al usuario otra vez
    if (!usuario.password_temporal) {
      req.flash('error_msg', 'El código de verificación ya fue utilizado');
      return res.redirect('/auth/recuperar-password');
    }
  // Actualizar contraseña y LIMPIAR tokens
    const nuevaHasheada = await bcrypt.hash(nueva, 10);
    await Usuario.update({ 
      password: nuevaHasheada,
      password_temporal: null,
      password_temporal_expira: null,
      token_recuperacion: null,  // ← Invalidar token
      token_expiracion: null
    }, { where: { id_usuarios: usuario.id_usuarios } });

    req.flash('success_msg', 'Contraseña restablecida exitosamente');
    res.redirect("/auth/login");
    
  } catch (error) {
    req.flash('error_msg', 'Error interno del servidor');
    console.error("Error:", error);
    res.redirect(`/auth/cambiar-password/${token}`);
  }
},
mostrarRecuperacion: (req, res) => {
    res.render('auth/recuperar-password', {
      usuario: req.session.user,
      rol: req.session.user?.rol,
      cssFile: 'recuperarPassword.css'
    });
  },

  // PROCESAR SOLICITUD DE RECUPERACIÓN
  solicitarRecuperacion: async (req, res) => {
    try {
      const { email } = req.body;

      const usuario = await Usuario.findOne({ where: { email } });
      
      if (!usuario) {
        req.flash('error_msg', 'No existe una cuenta con ese email');
        return res.redirect('/auth/recuperar-password');
      }

      // Generar código temporal (6 caracteres)
      const codigoTemporal = generarCodigoTemporal(6);
      const expiracion = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
const tokenRecuperacion = require('crypto').randomBytes(32).toString('hex'); // Token único

      // Guardar en base de datos
      await Usuario.update({
        password_temporal: codigoTemporal,
        password_temporal_expira: expiracion,
        token_recuperacion: tokenRecuperacion,
      token_expiracion: new Date(Date.now() + 30 * 60 * 1000) // 30 min token
      }, { where: { id_usuarios: usuario.id_usuarios } });

      // Enviar email
     await enviarEmailRecuperacion(email, codigoTemporal);

      // Mostrar formulario para ingresar código
      res.render('auth/ingresar-codigo', {
        email: email,
        usuario: req.session.user,
        rol: req.session.user?.rol
      });

    } catch (error) {
      console.error('Error en recuperación:', error);
      req.flash('error_msg', 'Error al procesar la solicitud');
      res.redirect('/auth/recuperar-password');
    }
  },

verificarCodigo: async (req, res) => {
  try {
    const { email, codigoTemporal } = req.body;

    const usuario = await Usuario.findOne({ 
      where: { 
        email,
        password_temporal: codigoTemporal,
        password_temporal_expira: { [Op.gt]: new Date() }
      }
    });

    if (!usuario) {
      req.flash('error_msg', 'Código inválido o expirado');
      return res.render('auth/ingresar-codigo', { email });
    }

    // // REDIRIGIR a la vista reutilizable
    // res.redirect(`/auth/cambiar-password/${email}`);
     // ✅ Redirigir a URL con TOKEN (no con email)
    res.redirect(`/auth/cambiar-password/${usuario.token_recuperacion}`);
    
  } catch (error) {
    console.error('Error verificando código:', error);
    req.flash('error_msg', 'Error al verificar el código');
    res.redirect('/auth/recuperar-password');
  }
}
};
