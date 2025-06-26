const express = require('express');
const router = express.Router();
const superadminController = require('../controllers/superadminController');
console.log(superadminController); 
const { isAuthenticated } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

// router.get('/', isAuthenticated, checkRole('superadmin'), superadminController.index);
router.get('/superadmin', isAuthenticated, checkRole('superadmin'), superadminController.formCrearUsuario);
router.post('/superadmin', isAuthenticated, checkRole('superadmin'), superadminController.crearUsuario);

module.exports = router;
