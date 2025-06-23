const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');

router.get('/firstLogin', usuariosController.firstLogin);
router.post('/firstLogin', usuariosController.firstLoginPost);

router.get('/register', usuariosController.showRegister);
router.post('/register', usuariosController.register);

router.get('/login', usuariosController.showLogin);
router.post('/login', usuariosController.login);

router.post('/logout', usuariosController.logout);


router.get('/listar', usuariosController.listar);
router.get('/listar/:id', usuariosController.listarPorId);

router.put('/actualizar/:id', usuariosController.actualizar);

router.delete('/eliminar/:id', usuariosController.eliminar);


module.exports = router;
// This code defines the routes for user authentication and management in an Express application.