const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// router.get('/firstLogin', usuariosController.firstLogin);
// router.post('/firstLogin', usuariosController.firstLoginPost);

router.get('/register', authController.showRegister);
router.post('/register', authController.register);

router.get('/login', authController.showLogin);
router.post('/login', authController.login);

router.get('/logout', authController.logout);


// router.get('/listar', usuariosController.listar);
// router.get('/listar/:id', usuariosController.listarPorId);

// router.put('/actualizar/:id', usuariosController.actualizar);

// router.delete('/eliminar/:id', usuariosController.eliminar);


module.exports = router;
// This code defines the routes for user authentication and management in an Express application.