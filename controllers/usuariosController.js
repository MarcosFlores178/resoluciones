const db = require('../db/models');
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
        const userId = req.session.userId;
        const usuario = await Usuario.findByPk(userId);
        if (!usuario) {
            return res.status(404).send("Usuario no encontrado");
        }

        res.render('users/dataUser', { usuario });
    } catch (error) {
        console.error("Error al obtener el perfil del usuario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
},
    editProfile: async (req, res) => {
        const datos = req.body;

        try {
            const userId = req.session.userId;
            const usuario = await Usuario.findByPk(userId);
            if (!usuario) {
                return res.status(404).send("Usuario no encontrado");
            }
            res.render('users/editProfile', { usuario });
        } catch (error) {
            console.error("Error al obtener el perfil del usuario para editar:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
}
};

module.exports = usuariosController;
