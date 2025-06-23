const express = require('express');
const router = express.Router();
const resolucionesController = require('../controllers/resolucionesController');
const {checkRole} = require('../middlewares/rolMiddleware');

router.use(checkRole(['superadmin', 'organizador']));

// Mostrar el formulario vacío
router.get('/', resolucionesController.formulario);

// Procesar formulario
router.post('/', resolucionesController.procesarFormulario);

router.get('/lista', resolucionesController.listarResoluciones);
// Ver PDF o editar más adelante (opcional)
router.get('/:id', resolucionesController.mostrarResolucion);

//Editar resolucion
router.put('/:id', resolucionesController.actualizarResolucion);


router.delete('/:id', resolucionesController.eliminarResolucion);

router.get('/:id/pdf', resolucionesController.generarPDF);


module.exports = router;
