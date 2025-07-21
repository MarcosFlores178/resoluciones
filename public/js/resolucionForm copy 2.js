document.addEventListener("DOMContentLoaded", () => {
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

    // 🧪 Acción ver_borrador (no hace fetch, solo abre ventana)
    if (data.accion === "ver_borrador") {
      if (data.id_resoluciones) {
        const urlBorrador = `/resoluciones/${data.id_resoluciones}/ver-borrador`;
        window.open(urlBorrador, "_blank");
      } else {
        toastr.warning("Primero debés guardar la resolución para ver el borrador.");
      }
      return; // 👈 Cortamos acá para que no haga el fetch
    }

    // 🪧 Mensaje de estado según la acción
    if (data.accion === "guardar") {
      toastr.info("Guardando resolución...");
    } else if (data.accion === "generar_pdf") {
      toastr.info("Generando PDF...");
    }
    // Determinar URL y método según si es nuevo o edición
    let url = "/resoluciones/form-resolucion";
    let method = "POST";
    
    if (data.id_resoluciones) {
      url = `/resoluciones/${data.id_resoluciones}`;
      method = "PUT";
    }
    console.log(method);
    // Enviar los datos al servidor
    try {
  const response = await fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  // ✅ Si la respuesta no es OK, intentamos ver qué devolvió
  if (!response.ok) {
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const errorJson = await response.json();
      toastr.error(errorJson.message || "Error del servidor.");
    } else {
      const errorText = await response.text();
      console.error("Respuesta inesperada:", errorText);
      toastr.error("Error inesperado del servidor.");
    }
    return; // ⚠️ Detener ejecución si hubo error
  }

  // ✅ Si todo bien, parseamos como JSON
  const result = await response.json();

  if (result.success) {
    toastr.success(result.message || "¡Tarea realizada con éxito!");

    // ✅ Guardar el ID en el dataset si recién se creó
    if (!form.dataset.idResolucion && result.id) {
      form.dataset.idResolucion = result.id;

      // También podés crear un input oculto si lo necesitás
      const hiddenInput = document.createElement("input");
      hiddenInput.type = "hidden";
      hiddenInput.name = "id_resoluciones";
      hiddenInput.value = result.id;
      form.appendChild(hiddenInput);
    }
  } else {
    toastr.error(result.message || "Ocurrió un error.");
  }

  // Si se pidió PDF, abrirlo
  if (data.accion === "generar_pdf" && result.pdfUrl) {
    setTimeout(() => {
      window.open(result.pdfUrl, "_blank");
    }, 1500);
  }

} catch (error) {
  toastr.error("Error al comunicarse con el servidor.");
  console.error("Excepción en fetch:", error);
}

  });
});
