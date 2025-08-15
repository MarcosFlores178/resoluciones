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

router.patch('/estado-formulario/:id', resolucionesController.actualizarEstadoFormulario);  

router.patch('/emitir-formulario/:id', resolucionesController.emitirFormulario);  

router.get('/:id', resolucionesController.mostrarResolucion);
//Editar resolucion
router.put('/:id', resolucionesController.actualizarResolucion);


router.delete('/:id', resolucionesController.eliminarResolucion);

router.get('/:id/pdf', resolucionesController.generarPDF);

router.get('/:id/ver-borrador', resolucionesController.verBorrador);

// router.get('/:id/enviar', resolucionesController.enviarResolucion);

// router.get('/estado-formulario/:id', resolucionesController.estadoFormulario);
router.get('/estado-formulario/:id', resolucionesController.obtenerEstadoFormulario);

router.patch('/:id/enviar', resolucionesController.enviarResolucion);

module.exports = router;
