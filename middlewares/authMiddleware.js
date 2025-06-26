// authMiddleware.js
const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login'); // o res.status(401).json({ error: 'No autorizado' })
    }
    next(); // Si hay sesión, continúa
};

module.exports = { isAuthenticated };