const express = require('express');
const router = express.Router();
const {checkRole} = require('../middlewares/roleMiddleware');

const authController = require('../controllers/authController');


// router.get('/firstLogin', usuariosController.firstLogin);
// router.post('/firstLogin', usuariosController.firstLoginPost);

router.get('/register', authController.showRegister);
router.post('/register', authController.register);
router.get('/login', authController.showLogin);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// CAMBIO VOLUNTARIO (desde perfil)
router.get('/cambiar-password', checkRole(['superadmin', 'organizador', 'administrativo']), authController.mostrarCambiarPassword);
router.post('/cambiar-password', checkRole(['superadmin', 'organizador', 'administrativo']), authController.cambiarPassword);

// RECUPERACIÓN DE CONTRASEÑA
router.get('/recuperar-password', authController.mostrarRecuperacion);
router.post('/solicitar-recuperacion', authController.solicitarRecuperacion);
router.get('/ingresar-codigo/:token', authController.mostrarVerificarCodigo); // Con token
router.post('/verificar-codigo', authController.verificarCodigo);
router.get('/cambiar-password/:token', authController.mostrarCambiarPasswordOlvido);
router.post('/cambiar-password-olvido', authController.changePasswordOlvido);

// router.get('/listar', usuariosController.listar);
// router.get('/listar/:id', usuariosController.listarPorId);

// router.put('/actualizar/:id', usuariosController.actualizar);

// router.delete('/eliminar/:id', usuariosController.eliminar);


module.exports = router;
