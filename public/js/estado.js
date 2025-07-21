  window.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formularioResolucion");
  const botonesAccion = form.querySelectorAll('button[type="submit"]');

  // Detectar qué botón se clickeó
  botonesAccion.forEach((boton) => {
    boton.addEventListener("click", () => {
      form.dataset.accion = boton.value;
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Construimos el objeto `data` desde el formulario
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    // Agregamos la acción (guardar, generar_pdf, ver_borrador, etc.)
    data.accion = form.dataset.accion;

    // ✅ Agregamos el ID desde el dataset del form (si existe)
    data.id_resoluciones = form.dataset.idResolucion || null;
     const response = await fetch(`/estado-formulario/${data.id_resoluciones}`)
       .then(res => res.json())
       .then(data => {
         const verBorradorBtn = document.getElementById("ver-borrador-btn");
         const enviarBtn = document.getElementById("enviar-btn");

        if (data.estado === "modificado") {
          verBorradorBtn.disabled = true;
        }

        if (data.pdfAbierto) {
          enviarBtn.disabled = true;
        }
      });
  });
});
