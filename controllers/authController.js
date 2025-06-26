const db = require('../db/models');
const bcrypt = require('bcrypt');
const { Usuario } = db;

module.exports = {
    showLogin: (req, res) => {
        res.render('auth/login', {
            error: null // Puedes pasar un mensaje de error si es necesario
        , cssFile: null });
    },
    login: async (req, res) => {
        const { email, password } = req.body;
        console.log(email, password);
        try {
            const usuario = await Usuario.findOne({ where: { email } });
            if (!usuario) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }
            // Verifica la contraseña
            const passwordMatch = await bcrypt.compare(password, usuario.password);
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            // Guarda TODOS los datos del usuario en la sesión (incluyendo el rol)
            req.session.user = {
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol // Asegúrate de que el modelo tenga este campo
            };
            const rol = req.session.user.rol; // Obtiene el rol del usuario desde la sesión
            console.log("Rol del usuario:", rol);
            
            res.redirect('/'); // Redirige a la ruta principal (que manejará el rol)

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
            res.redirect('/auth/login'); // Redirige al login después de cerrar sesión
        });
    },
    showRegister: (req, res) => {
        res.render('auth/register', {
            error: null // Puedes pasar un mensaje de error si es necesario
        , cssFile:null });
    },
    register: async (req, res) => {
        const { nombre, apellido, rol, email, password } = req.body;
        try {
            const nuevoUsuario = await Usuario.create({ nombre, apellido, rol, email, password });
            req.session.user = nuevoUsuario;
            res.redirect('/resoluciones');
        } catch (error) {
            console.error("Error al registrar usuario:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }
}