let express = require('express');
const {checkRole} = require('../middlewares/roleMiddleware');
let router = express.Router();
const usuariosController = require('../controllers/usuariosController');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/profile', checkRole(['superadmin', 'organizador', 'administrativo']), usuariosController.showProfile);

module.exports = router;
