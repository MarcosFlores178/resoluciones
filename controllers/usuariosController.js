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
        console.log(req.session);
        console.log(req.session.user.id_usuarios);
        console.log(id_usuarios);


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
        console.log(req.session);
        console.log(req.session.user.id_usuarios);
        console.log(id_usuarios);


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
        const { nombre, apellido, telefono, email, sexo, titulo_organizador } = req.body;
        const usuario = await Usuario.findByPk(id_usuarios);
        if (!usuario) {
            return res.status(404).send("Usuario no encontrado");
        }
        await usuario.update({ nombre, apellido, telefono, email, sexo, titulo_organizador });
        res.redirect('/usuarios/profile');
    } catch (error) {
        console.error("Error al editar el perfil del usuario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
},
showChangePassword: async (req, res) => {
    try {
        res.render('users/changePassword', { cssFile: 'changePassword.css' });
    } catch (error) {
        console.error("Error al mostrar el formulario de cambio de contraseña:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
},
changePassword: async (req, res) => {
  try {
    const id_usuarios = req.session.user.id_usuarios;
    const { actual, nueva, confirmar } = req.body;

    // 1️⃣ Buscar el usuario
    const usuario = await Usuario.findByPk(id_usuarios);
    if (!usuario) {
      return res.status(404).send("Usuario no encontrado");
    }

    // 2️⃣ Verificar que las nuevas contraseñas coincidan
    if (nueva !== confirmar) {
      return res.status(400).send("Las nuevas contraseñas no coinciden");
    }

    // 3️⃣ Verificar contraseña actual
    const coincide = await bcrypt.compare(actual, usuario.password);
    if (!coincide) {
      return res.status(400).send("La contraseña actual es incorrecta");
    }

    // 4️⃣ Hashear la nueva contraseña
    const nuevaHasheada = await bcrypt.hash(nueva, 10);

    // 5️⃣ Guardar en BD
    await usuario.update({ password: nuevaHasheada });

    // 6️⃣ Redirigir o responder
    res.redirect("/usuarios/profile");
  } catch (error) {
    console.error("Error al cambiar la contraseña del usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

};

module.exports = usuariosController;
