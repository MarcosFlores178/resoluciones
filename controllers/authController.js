const db = require("../db/models");
const bcrypt = require("bcrypt");
const { Usuario } = db;

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
  showForgotPassword: (req, res) => {
    res.render("auth/recuperarPassword", {
      error: null, // Puedes pasar un mensaje de error si es necesario
      cssFile: "recuperarPassword.css",
    });
  },
  forgotPassword: async (req, res) => {
    const { email, newPassword, confirmNewPassword } = req.body;
    try {
    const findEmail = await Usuario.findOne({ where: { email } });
    if (!findEmail) {
      req.flash('error_msg', 'El correo electrónico no está registrado');
      return res.redirect('/auth/forgot-password');
    }
    if (newPassword !== confirmNewPassword) {
      req.flash('error_msg', 'Las contraseñas no coinciden');
      return res.redirect('/auth/forgot-password');
    }

  }
    catch (error) {
      console.error("Error al restablecer la contraseña:", error);
      req.flash('error_msg', 'Error interno del servidor');
      res.redirect('/auth/forgot-password');
    }
  }
};
