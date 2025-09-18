document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formularioResolucion");
  const botonesAccion = form.querySelectorAll('button[type="submit"]');
  const campos = form.querySelectorAll("input, textarea"); //NUEVO
  // const btnRechazar = document.getElementById("btn-rechazar");
  //TODO Capturar estado de resolucion o rol de usuario para desactivar la funcion de cambio de estado

  //TODO Hacer que el botón Ver pdf también implique guardar
 
  const idResolucion = form.dataset.idResolucion || null; // ✅ NECESARIO
  const rolUsuario = form.dataset.rolUsuario || null; // Capturamos el rol del usuario desde el dataset del formulario

 

 

  // Detectar qué botón se clickeó
  botonesAccion.forEach((boton) => {
    boton.addEventListener("click", () => {
      
      form.dataset.accion = boton.value;
     
    });
  });

  
 

  //NUEVO ABAJO
  

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
  // 1️⃣ Guardamos la resolución primero
  const guardarExistente = async () => {
      if (!data.id_resoluciones) {
    toastr.warning("Primero debés guardar la resolución para ver el borrador.");
    return; } else {
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => data[key] = value);
    data.accion = "guardar"; // IMPORTANTE: usar "guardar"
    data.id_resoluciones = form.dataset.idResolucion || null;

    toastr.info("Guardando cambios...");

    try {
      const response = await fetch(`/resoluciones/${data.id_resoluciones}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Error del servidor");
      const result = await response.json();
      if (result.success) {
        toastr.success(result.message || "¡Guardado correctamente!");
        if (!form.dataset.idResolucion && result.id) form.dataset.idResolucion = result.id;
        return result.id;
      }
      toastr.warning(result.message || "No se pudieron guardar los cambios");
      return null;
    } catch (err) {
      console.error("Error en guardarExistente:", err);
      toastr.error("Ocurrió un error al guardar la resolución");
      return null;
    }
  }
  };

  // 2️⃣ Ejecutamos guardado y luego abrimos PDF
  if (!data.id_resoluciones) {
    toastr.warning("Primero debés guardar la resolución para ver el borrador.");
    return;
  } else {
    toastr.info("Guardando cambios...");
    (async () => {
      const id = await guardarExistente();
      if (!id) return;
  
      // 3️⃣ Abrimos el PDF actualizado en una nueva ventana
      const urlBorrador = `/resoluciones/${id}/ver-borrador`;
      window.open(urlBorrador, "_blank");
    })();
  
    return;
  }
}

if (data.accion === "ver_borrador_admin") {
  if (data.id_resoluciones) {
    // visto = true;
    // console.log("visto_pdf antes de actualizarBotones", visto_pdf);
    const urlBorrador = `/resoluciones/${data.id_resoluciones}/ver-borrador`;
    window.open(urlBorrador, "_blank");
  } else {
    toastr.warning("Primero debés guardar la resolución para ver el borrador.");
  }
  return; // 👈 Cortamos acá para que no haga el fetch
}

    // Esta acción sólo puede ser disparada por un organizador que envía la resolución a revisión   

   if (data.accion === "enviar") {
  const enviar = async () => {
    if (!data.id_resoluciones) {
      toastr.warning("Primero debés guardar la resolución para enviarla.");
      return; // corto acá, no muestro confirm
    }

    if (confirm("¿Estás seguro de que deseas enviar esta resolución?")) {
      try {
        const response = await fetch(
          `/resoluciones/${data.id_resoluciones}/enviar`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: "pendiente" }),
          }
        );

        const result = await response.json();
        toastr.info("Enviando resolución...");

        if (result.success) {
          toastr.success(result.message || "¡Tarea realizada con éxito!");
        } else {
          toastr.error(result.message || "Algo salió mal.");
        }

        setTimeout(() => {
          window.location.href = "/resoluciones/lista-resoluciones";
        }, 1500);
      } catch (err) {
        console.error(err);
        toastr.error("Error al enviar la resolución.");
      }
    }
  };

  await enviar();
  return;
}



    // Esta acción sólo puede ser disparada por un administrativo que emite la resolución 
    if (data.accion === "generar_pdf") {
    
      toastr.info("Generando PDF...");

      console.log(idResolucion);
      try {
        const response = await fetch(
          `/resoluciones/emitir-formulario/${idResolucion}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fecha: data.fecha,
              numero_resolucion: data.numero_resolucion,
            }),
          }
        );

        const result = await response.json();
        toastr.info("Enviando resolución...");

        if (result.success) {
          toastr.success(result.message || "¡Tarea realizada con éxito!");
        } else {
          toastr.error(result.message || "Algo salió mal.");
        }
        console.log(`/resoluciones/${idResolucion}/pdf`);
        const resGenerarPdf = await fetch(`/resoluciones/${idResolucion}/pdf`);
        const dataGenerarPdf = await resGenerarPdf.json();

        //HACER UN TIME OUT
        setTimeout(() => {
          window.open(`/pdfs/${dataGenerarPdf.fileName}`, "_blank");
        }, 1500);

        setTimeout(() => {
          console.log("redireccion al listado");
          window.open("/resoluciones/lista-resoluciones", "_self");
        }, 1800);

        if (!dataGenerarPdf) {
          // Cambié esto
          throw new Error("Error al generar PDF");
        }
      } catch (err) {
        console.error(err);
        toastr.error("Error al enviar la resolución.");
      }
      return;
    }

    // Esta acción es generada por el organizador para guardar borrador de formulario
    if (data.accion === "guardar" && !data.id_resoluciones) {
      const guardarNueva = async () => {
      toastr.info("Guardando resolución...");
      console.log("antes del try en guardar");
      try {
        const response = await fetch("/resoluciones/form-resolucion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        // Verificamos si la respuesta fue exitosa
        if (!response.ok) {
          throw new Error("Error del servidor");
        }

        const result = await response.json();
        console.log("redirectTo", result.redirectTo);
        console.log("success", result.success);
        if (result.success) {
          toastr.success(result.message || "¡Tarea realizada con éxito!");

          // ✅ Guardamos el ID en el dataset si recién se creó
          if (!form.dataset.idResolucion && result.id) {
            form.dataset.idResolucion = result.id;
          }
      

            if (result.id) {
              setTimeout(() => {
                window.location.href = result.redirectTo;
              }, 1500);
     
        }
        
        
        }
      } catch (err) {
        console.error("Excepción en fetch:", err);
        toastr.error("Ocurrió un error al enviar los datos en el POST.");
      }
    };
      await guardarNueva();
      return;
    }

    //Guarda la resolución cuando ya fue creada (tiene ID)
    if (data.accion === "guardar" && data.id_resoluciones) {
      const guardarExistenteBoton = async () => {
        console.log("Guardando existente");
        toastr.info("Guardando cambios...");
        try {
          const response = await fetch(`/resoluciones/${data.id_resoluciones}`, {
            method: "PUT",
            headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        // Verificamos si la respuesta fue exitosa
        if (!response.ok) {
          throw new Error("Error del servidor");
        }

        const result = await response.json();
        console.log("redirectTo", result.redirectTo);
        console.log("success", result.success);
        if (result.success) {
          toastr.success(result.message || "¡Tarea realizada con éxito!");

          // ✅ Guardamos el ID en el dataset si recién se creó
          if (!form.dataset.idResolucion && result.id) {
            form.dataset.idResolucion = result.id;
          }
          
         
        }
      } catch (err) {
        console.error("Excepción en fetch:", err);
        toastr.error("Ocurrió un error al enviar los datos en el PUT.");
      }
    }
    await guardarExistenteBoton();
  };
return;
  });
  //BUG Si el usuario deja de estar logueado, no se maneja bien los errores cuando se intenta guardar una resolucion
  
  document
    .getElementById("ver-borrador-btn-admin")
    .addEventListener("click", function () {
   
      const idResolucion = form.dataset.idResolucion;
      // console.log("object", idResolucion);
      if (idResolucion) {
        const urlPDF = `/resoluciones/${idResolucion}/ver-borrador`;
        window.open(urlPDF, "_blank");
      } else {
        toastr.warning(
          "Primero debés guardar la resolución para generar el PDF."
        );
      }
    });

const botonRechazar = document.getElementById(idResolucion);

    botonRechazar.addEventListener("click", async (e) => {
      console.log("click rechazar");

      if (e.target.classList.contains("btn-reject")) {
    console.log("click rechazar");
    const idResolucion = e.target.dataset.id;
    const fila = e.target.closest("tr"); // obtenemos la fila de la tabla
    const celdaEstado = fila.querySelector(".estado");

    console.log("Botón rechazar clickeado para id:", idResolucion);

    try {
      const response = await fetch(`/resoluciones/${idResolucion}/rechazar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "rechazado" }),
      });

      if (response.ok) {
        toastr.success("Resolución rechazada con éxito");

        // ✅ Actualizamos el estado en la tabla
        celdaEstado.textContent = "rechazado";

        // ✅ Eliminamos o deshabilitamos el botón
        // e.target.remove(); 
        // o: e.target.disabled = true;
      } else {
        toastr.error("Error al rechazar la resolución");
      }
    } catch (error) {
      console.error("Error en fetch:", error);
      toastr.error("Error al comunicarse con el servidor");
    }
  }
});
});

//TODO Obligar de alguna manera a que el organizador vea el pdf al menos una vez antes de enviarlo. Usaré variable booleana. 