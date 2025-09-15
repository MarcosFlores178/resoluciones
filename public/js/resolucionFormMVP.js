document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formularioResolucion");
  const botonesAccion = form.querySelectorAll('button[type="submit"]');
  const campos = form.querySelectorAll("input, textarea"); //NUEVO
  //TODO Capturar estado de resolucion o rol de usuario para desactivar la funcion de cambio de estado

  //TODO Hacer que el botón Ver pdf también implique guardar
 
  const idResolucion = form.dataset.idResolucion || null; // ✅ NECESARIO
  const rolUsuario = form.dataset.rolUsuario || null; // Capturamos el rol del usuario desde el dataset del formulario

 

 

  // Detectar qué botón se clickeó
  botonesAccion.forEach((boton) => {
    boton.addEventListener("click", () => {
      form.dataset.accion = boton.value;
      console.log("Submit de botones");
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
      if (data.id_resoluciones) {
        
        visto = true;
        // console.log("visto_pdf antes de actualizarBotones", visto_pdf);
        const urlBorrador = `/resoluciones/${data.id_resoluciones}/ver-borrador`;
        window.open(urlBorrador, "_blank");

       
      } else {
        toastr.warning(
          "Primero debés guardar la resolución para ver el borrador."
        );
      }

      return; // 👈 Cortamos acá para que no haga el fetch
    }

    if (data.accion === "enviar") {
      //alert para confirmar si quiere enviar
      if (confirm("¿Estás seguro de que deseas enviar esta resolución?")) {
        if (data.id_resoluciones) {
          try {
            const response = await fetch(
              `/resoluciones/${data.id_resoluciones}/enviar`,
              {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
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
        }}
      } else {
        toastr.warning("Primero debés guardar la resolución para enviarla.");
      }

      //hago un set time de 2 segundos y luego lo redirecciono a /resoluciones/lista-resoluciones

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
          // await actualizarBotonesPorEstado();
          // cambioDetectado = false;

            if (result.id) {
              setTimeout(() => {
                window.location.href = result.redirectTo;
              }, 1500);
          // window.location.href = result.redirectTo;
        }
        return;
        }
      } catch (err) {
        console.error("Excepción en fetch:", err);
        toastr.error("Ocurrió un error al enviar los datos en el POST.");
      }
    }

    //Guarda la resolución cuando ya fue creada (tiene ID)
    if (data.accion === "guardar" && data.id_resoluciones) {
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

    
  });
  //BUG Si el usuario deja de estar logueado, no se maneja bien los errores cuando se intenta guardar una resolucion
  
  document
    .getElementById("ver-borrador-btn-admin")
    .addEventListener("click", function () {
      const idResolucion = form.dataset.idResolucion;
      console.log("object", idResolucion);
      if (idResolucion) {
        const urlPDF = `/resoluciones/${idResolucion}/ver-borrador`;
        window.open(urlPDF, "_blank");
      } else {
        toastr.warning(
          "Primero debés guardar la resolución para generar el PDF."
        );
      }
    });
});

//TODO Obligar de alguna manera a que el organizador vea el pdf al menos una vez antes de enviarlo. Usaré variable booleana. 