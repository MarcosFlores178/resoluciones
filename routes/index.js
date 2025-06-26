const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/auth/login");
  }
  if (req.session.user.primerIngreso) {
    return res.redirect("/auth/primer-ingreso");
  }
  // Redirige según el rol (usando el guardado en sesión)
  switch (req.session.user.rol) {
    case "superadmin":
      return res.redirect("/superadmin");
    case "organizador":
      return res.redirect("resoluciones/form-resolucion");
    case "administrativo":
      return res.redirect("resoluciones/lista-resoluciones");
    default:
      return res.redirect("/auth/login"); //TODO poner mensaje de que el rol no está permitido
  }
});

module.exports = router