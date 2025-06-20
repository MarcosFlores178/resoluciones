const db = require('../db/models');
const { Usuario } = db;


const usuariosController = {
    showLogin: (req, res) => {
        res.render('login');
    },
    login: async (req, res) => {
        const { email, password } = req.body;
        try {
            const usuario = await Usuario.findOne({ where: { email } });
            if (usuario) {
                req.session.user = usuario;
                if(usuario.rol === 'superadmin') {
                    req.session.rol = 'superadmin';
                    res.redirect('/dashboard'); //TODO Hacer ruta dashboard
                } else if(usuario.rol === 'organizador') {
                    req.session.rol = 'organizador';
                    res.redirect("/resoluciones");
                } else if(usuario.rol === 'administrativo') {
                    req.session.rol = 'administrativo';
                    res.redirect("/lista");
                }

            } else {
                res.status(401).json({ error: 'Credenciales inválidas' });
            }
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }

    },
    showRegister: (req, res) => {
        res.render('register');
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
    },
  listar: async (req, res) => {
    try {
      const usuarios = await Usuario.findAll();
      res.json(usuarios);
    } catch (error) {
      console.error("Error al listar usuarios:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
};

module.exports = usuariosController;
