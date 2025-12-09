// middlewares/resolucionesMiddleware.js
const { Resolucion, Usuario, sequelize } = require('../db/models');

const cargarResolucionesParaVista = async (req, res, next) => {
  res.locals.tieneResoluciones = false;
  res.locals.tieneResolucionesSistema = false;
  res.locals.conteoResoluciones = 0;
  res.locals.conteoResolucionesSistema = 0;
  
  if (req.session.user && req.session.user.id_usuarios) {
    try {
      const esAdministrador = req.session.user.rol === 'administrador';
      const usuarioId = req.session.user.id_usuarios;
      
      if (esAdministrador) {
        // ADMIN: Total del sistema
        const conteoSistema = await Resolucion.count();
        res.locals.tieneResolucionesSistema = conteoSistema > 0;
        res.locals.conteoResolucionesSistema = conteoSistema;
        
        // Conteo del admin actual (usando id_usuarios)
        const conteoUsuario = await Resolucion.count({
          where: { id_usuarios: usuarioId } // ← CAMBIADO
        });
        res.locals.tieneResoluciones = conteoUsuario > 0;
        res.locals.conteoResoluciones = conteoUsuario;
        
      } else {
        // USUARIO NORMAL: Solo sus resoluciones
        const conteoUsuario = await Resolucion.count({
          where: { id_usuarios: usuarioId } // ← CAMBIADO
        });
        
        res.locals.tieneResoluciones = conteoUsuario > 0;
        res.locals.conteoResoluciones = conteoUsuario;
      }
      
    } catch (error) {
      console.error('Error en middleware de resoluciones:', error);
    }
  }
  
  next();
};

//Se usa llaves porque se puede exportar mas de una cosa
module.exports = {cargarResolucionesParaVista};