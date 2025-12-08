const db = require('../db/models');
const bcrypt = require('bcrypt');
const { Usuario } = db;


const usuariosController = {
    showUsers: async (req, res) => {
        try {
            const usuarios = await Usuario.findAll();
            res.render('users/userList', { usuarios, cssFile:null });
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }


    },

showProfile: async (req, res) => {
    try {
        const id_usuarios = req.session.user.id_usuarios;
      


        const usuario = await Usuario.findByPk(id_usuarios);
        if (!usuario) {
            return res.status(404).send("Usuario no encontrado");
        }

        res.render('users/dataUser', { 
            usuario,
            cssFile: 'datosUsuario.css'});
    } catch (error) {
        console.error("Error al obtener el perfil del usuario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
},
    showEditProfile: async (req, res) => {
       

        try {
            const id_usuarios = req.session.user.id_usuarios;
       


        const usuario = await Usuario.findByPk(id_usuarios);
            if (!usuario) {
                return res.status(404).send("Usuario no encontrado");
            }
            res.render('users/editUser', { usuario, cssFile: 'editUser.css' });
        } catch (error) {
            console.error("Error al obtener el perfil del usuario para editar:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
},
editProfile: async (req, res) => {

    try {
        const id_usuarios = req.session.user.id_usuarios;
        const { nombre, apellido, telefono, email, sexo_organizador, titulo_organizador } = req.body;
        const usuario = await Usuario.findByPk(id_usuarios);
        if (!usuario) {
            return res.status(404).send("Usuario no encontrado");
        }
        await usuario.update({ nombre, apellido, telefono, email, sexo_organizador, titulo_organizador });
        res.redirect('/usuarios/profile');
    } catch (error) {
        console.error("Error al editar el perfil del usuario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}

};

module.exports = usuariosController;
