const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');

router.get('/login', usuariosController.showLogin);
router.post('/login', usuariosController.login);
router.post('/logout', usuariosController.logout);

router.get('/register', usuariosController.showRegister);
router.post('/register', usuariosController.register);

router.get('/listar', usuariosController.listar);
router.get('/listar/:id', usuariosController.listarPorId);