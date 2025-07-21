document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formularioResolucion");
  const botonesAccion = form.querySelectorAll('button[type="submit"]');
  const campos = form.querySelectorAll("input, textarea"); //NUEVO

  let cambioDetectado = false; // Flag para no enviar múltiples veces NUEVO
  let visto_pdf; // Variable para almacenar el estado del PDF visto 
  const idResolucion = form.dataset.idResolucion || null; // ✅ NECESARIO
  
  const consultarVistoPDF = async (idResolucion) => {
    if (!idResolucion) return; // Si no hay ID, no hacemos nada
        const res = await fetch(`/resoluciones/estado-formulario/${idResolucion}`);
        const data = await res.json();
        visto_pdf = data.visto_pdf; 
  }
  // Consultar el estado del PDF visto al cargar la página
  consultarVistoPDF(idResolucion).then(() => {
    console.log("visto_pdf después de consultar:", visto_pdf);
  });

  // Detectar qué botón se clickeó
  botonesAccion.forEach((boton) => {
    boton.addEventListener("click", () => {
      form.dataset.accion = boton.value;
    });
  });

   //NUEVO ABAJO
    const notificarModificacion = async () => {
      
      if (cambioDetectado || !idResolucion) return;

      cambioDetectado = true;


      try {
        await fetch(`/resoluciones/estado-formulario/${idResolucion}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ estado: "modificado" , visto_pdf: false }),
        });
        console.log("Estado actualizado a 'modificado'");
        visto_pdf = false; // Reseteamos el estado del PDF visto
        await actualizarBotonesPorEstado();
        cambioDetectado = false; // Reseteamos el flag para futuras modificaciones
      } catch (error) {
        console.error("Error al notificar modificación:", error);
      }
    };
 const actualizarBotonesPorEstado = async () => {
      if (!idResolucion) return;

      try {
        
        const res = await fetch(`/resoluciones/estado-formulario/${idResolucion}`);
        const data = await res.json();
        //visto_pdf = data.visto_pdf;
        const verBorradorBtn = document.getElementById("ver-borrador-btn");
        const enviarBtn = document.getElementById("enviar-btn");
       
        if (data.estado === "modificado") {
          console.log("dentro del if de modificado");
          verBorradorBtn.disabled = true;
          // enviarBtn.disabled = true;
          //verBorradorBtn.title = "Ya fue modificado, no se puede volver a ver el borrador";
        } else if (data.estado === "guardado") {
          console.log("dentro del if de guardado");
          verBorradorBtn.disabled = false;
          verBorradorBtn.title = "Ver borrador";
        }
        if (visto_pdf === true) {
          console.log("El PDF ha sido visto", visto_pdf);
          enviarBtn.disabled = false;
        } else if (visto_pdf === false) {
          console.log("El PDF no ha sido visto", visto_pdf);
          enviarBtn.disabled = true;
        }
      } catch (err) {
        console.error("Error al obtener estado:", err);
      }
     
        // actualizarBotonesPorEstado();// dispara solo la primera vez
      };
    

    // Al cargar la vista, deshabilitar botones según el estado
    // (async () => {
     
    // })();
    
    actualizarBotonesPorEstado(); // Dispara solo la primera vez
    // Escuchar cambios en cualquier campo del formulario
    campos.forEach((campo) => {
      campo.addEventListener("input", () => {
        notificarModificacion();
      });
    });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
//actualizarBotonesPorEstado(); // Actualizar botones antes de enviar
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
        // await actualizarBotonesPorEstado(); 
        // cambioDetectado = false;
        visto_pdf = true;
        console.log("visto_pdf antes de actualizarBotones",visto_pdf);
        const urlBorrador = `/resoluciones/${data.id_resoluciones}/ver-borrador`;
        window.open(urlBorrador, "_blank");
       
      await actualizarBotonesPorEstado(); 
      cambioDetectado = false;
      console.log("visto_pdf despues de actualizarBotones", visto_pdf);
    
    //      setTimeout(() => {
    //   location.reload();
    // }, 1500);
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
    console.log("dataset.idResolucion =", form.dataset.idResolucion);
    console.log("data.id_resoluciones =", data.id_resoluciones);
    // Enviar los datos al servidor
    try {
  const response = await fetch(url, {
    method: method,
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

  if (result.success) {
    toastr.success(result.message || "¡Tarea realizada con éxito!");

    // ✅ Guardamos el ID en el dataset si recién se creó
    if (!form.dataset.idResolucion && result.id) {
      form.dataset.idResolucion = result.id;
    }
await actualizarBotonesPorEstado();
      cambioDetectado = false;
    // ✅ Redirigir si querés que el usuario vaya al detalle de la resolución
    // Por ejemplo: después de guardar, ir a la vista de edición
  //   if (result.id) {
  //     setTimeout(() => {
  //       window.location.href = `/resoluciones/${result.id}`;
  //     }, 1500); 
  //   }

  // } else {
  //   toastr.error(result.message || "Error desconocido al guardar");
   }

} catch (err) {
  console.error("Excepción en fetch:", err);
  toastr.error("Ocurrió un error al enviar los datos.");
}
  });
});
