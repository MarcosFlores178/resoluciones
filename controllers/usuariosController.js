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

       
    }
};

module.exports = usuariosController;
