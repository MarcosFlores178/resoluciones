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
      return res.redirect("/dashboard");
    case "organizador":
      return res.redirect("/resoluciones");
    case "administrativo":
      return res.redirect("/lista");
    default:
      return res.redirect("/auth/login"); //TODO poner mensaje de que el rol no está permitido
  }
});
