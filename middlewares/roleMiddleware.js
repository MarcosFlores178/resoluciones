// roleMiddleware.js
const checkRole = (allowedRoles) => {
  // Ej: ['superadmin', 'organizador']
  return (req, res, next) => {
    const userRole = req.session.user?.rol;
    const userName = req.session.user?.nombre || 'Usuario';

    if (!allowedRoles.includes(userRole)) {
  // Mensaje específico según el rol del usuario
      let mensajeError = '';
      
      if (!userRole) {
        mensajeError = `${userName}, no tienes un rol asignado en el sistema.`;
      } else if (userRole === 'superadmin') {
        mensajeError = `${userName}, como SuperAdmin no puedes acceder a esta sección de organizadores.`;
      } else if (userRole === 'organizador') {
        mensajeError = `${userName}, esta sección es exclusiva para administradores.`;
      } else {
        mensajeError = `${userName}, no tienes permisos para acceder a esta sección.`;
      }

      req.flash('error_msg', mensajeError);
      
      // 3. Redirigir inteligentemente según el rol
      const redirectPaths = {
        'superadmin': '/admin/dashboard',
        'administrativo': '/resoluciones/lista-resoluciones',
        'organizador': '/resoluciones/form-resolucion',
        'default': '/'
      };

      const redirectTo = redirectPaths[userRole] || redirectPaths.default;
      return res.redirect(redirectTo);
    }
    next(); // Si el rol es válido, continúa
  };
};

module.exports = { checkRole };
