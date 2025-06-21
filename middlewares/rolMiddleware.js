// roleMiddleware.js
const checkRole = (allowedRoles) => { // Ej: ['superadmin', 'organizador']
    return (req, res, next) => {
        const userRole = req.session.user?.role;
        
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).send('Acceso prohibido'); // o redirigir a una página de error
        }
        next(); // Si el rol es válido, continúa
    };
};

module.exports = { checkRole };