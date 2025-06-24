const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireLogin, checkRole } = require('../middlewares/auth');

router.get('/', requireLogin, checkRole('superadmin'), adminController.index);
router.get('/usuarios', requireLogin, checkRole('superadmin'), adminController.formCrearUsuario);
router.post('/usuarios', requireLogin, checkRole('superadmin'), adminController.crearUsuario);

module.exports = router;
