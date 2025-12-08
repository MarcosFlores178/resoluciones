function validarPassword(pass) {
  if (!pass) return "La contraseña es obligatoria.";

  if (pass.length < 8)
    return "La contraseña debe tener al menos 8 caracteres.";

  if (!/[A-Za-z]/.test(pass))
    return "Debe incluir al menos una letra.";

  // Nº o símbolo, cualquiera de los dos
  if (!/[\d\W]/.test(pass))
    return "Debe incluir al menos un número o un símbolo.";

  return null; // OK
}

module.exports = validarPassword;