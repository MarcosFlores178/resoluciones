// roleMiddleware.js
const checkRole = (allowedRoles) => {
  // Ej: ['superadmin', 'organizador']
  return (req, res, next) => {
    const userRole = req.session.user?.rol;

    if (!allowedRoles.includes(userRole)) {
      //Verifica si el rol del usuario está en la lista de roles permitidos
      return res.status(403).send("Acceso prohibido"); // o redirigir a una página de error
    }
    next(); // Si el rol es válido, continúa
  };
};

module.exports = { checkRole };
