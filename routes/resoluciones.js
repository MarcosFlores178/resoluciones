const express = require('express');
const router = express.Router();
const resolucionesController = require('../controllers/resolucionesController');
const {checkRole} = require('../middlewares/roleMiddleware');

// router.use(checkRole(['superadmin', 'organizador']));

// Mostrar el formulario vacío
router.get('/form-resolucion', checkRole(['superadmin', 'organizador']),resolucionesController.formulario);

// Procesar formulario
router.post('/form-resolucion', checkRole(['superadmin', 'organizador']), resolucionesController.procesarFormulario);

router.get('/lista-resoluciones', checkRole(['superadmin', 'organizador', 'administrativo']), resolucionesController.listarResoluciones);
// Ver PDF o editar más adelante (opcional)
router.get('/:id', resolucionesController.mostrarResolucion);

//Editar resolucion
router.put('/:id', resolucionesController.actualizarResolucion);


router.delete('/:id', resolucionesController.eliminarResolucion);

router.get('/:id/pdf', resolucionesController.generarPDF);


module.exports = router;
