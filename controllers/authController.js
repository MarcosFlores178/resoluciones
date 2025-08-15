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
        return res.status(401).json({ error: "Credenciales inválidas" });
      }

      // Guarda TODOS los datos del usuario en la sesión (incluyendo el rol)
      req.session.user = {
        id_usuarios: usuario.id_usuarios,
        email: usuario.email,
        rol: usuario.rol,
        nombre: usuario.nombre || null, // Asegúrate de que el modelo tenga este campo
        apellido: usuario.apellido || null, // Asegúrate de que el modelo tenga
        primer_ingreso: usuario.primer_ingreso, // Asegúrate de que el modelo tenga este campo
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
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error al cerrar sesión:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }
      res.redirect("/auth/login"); // Redirige al login después de cerrar sesión
    });
  },
  showRegister: (req, res) => {
    res.render("auth/register", {
      error: null, // Puedes pasar un mensaje de error si es necesario
      cssFile: null,
    });
  },
  register: async (req, res) => {
    const { nombre, apellido, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    req.session.user.nombre = nombre;
    req.session.user.apellido = apellido;
    try {
      const [actualizados] = await Usuario.update(
        { nombre, apellido, password: hashedPassword, primer_ingreso: false },
        { where: { id_usuarios: req.session.user.id_usuarios } }
      );
      // req.session.user = nuevoUsuario;
      if (actualizados === 0) {
        return res.status(404).send("Usuario no encontrado");
      }
      res.redirect("/resoluciones/form-resolucion"); // Redirige a la ruta de formulario de resolución
      //BUG luego del primer ingreso, no redirigió hasta form-resolucion y si lo hago manualmente, sale error al momento de guardar resolucion
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
};
