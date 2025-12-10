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

function habilitarCampos() {
    const elementos = document.querySelectorAll("input[disabled], select[disabled], textarea[disabled]");
    elementos.forEach(el => {
        el.disabled = false; // ya es seguro
    });
}
  //Manejo del submit del formulario

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    habilitarCampos();

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
          toastr.warning(
            "Primero debés guardar la resolución para ver el borrador."
          );
          return;
        } else {
          const formData = new FormData(form);
          const data = {};
          formData.forEach((value, key) => (data[key] = value));
          data.accion = "guardar"; // IMPORTANTE: usar "guardar"
          data.id_resoluciones = form.dataset.idResolucion || null;

          toastr.info("Guardando cambios...");

          try {
            const response = await fetch(
              `/resoluciones/${data.id_resoluciones}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              }
            );

            if (!response.ok) throw new Error("Error del servidor");
            const result = await response.json();
            if (result.success) {
              toastr.success(result.message || "¡Guardado correctamente!");
              if (!form.dataset.idResolucion && result.id)
                form.dataset.idResolucion = result.id;
              return result.id;
            }
            toastr.warning(
              result.message || "No se pudieron guardar los cambios"
            );
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
        toastr.warning(
          "Primero debés guardar la resolución para ver el borrador."
        );
        return;
      } else {
        toastr.info("Generando PDF...");
        (async () => {
          const id = await guardarExistente();
          if (!id) return;

          // 3️⃣ Abrimos el PDF actualizado en una nueva ventana
           // Espera 1.5 segundos (1500 ms)
    await new Promise(resolve => setTimeout(resolve, 1200));

          const urlBorrador = `/resoluciones/${id}/ver-borrador`;
          window.open(urlBorrador, "_blank");
        })();

        return;
      }
    }

    if (data.accion === "ver_borrador_admin") {
      if (data.id_resoluciones) {
        try {
        
          const response = await fetch(
            `/resoluciones/borrador/${data.id_resoluciones}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                fecha: data.fecha,
              numero_resolucion: data.numero_resolucion,
              expediente: data.expediente,
              resolucion_interes_departamental:
                data.resolucion_interes_departamental,

              curso: data.curso ? data.curso : null,
              cohorte: data.cohorte ? data.cohorte : null,
              titulo_docente: data.titulo_docente ? data.titulo_docente : null,

              docente: data.docente ? data.docente : null,
              sexo_docente: data.sexo_docente ? data.sexo_docente : null,
              alumnos: data.alumnos ? data.alumnos : null,
              segundos_objetivos: data.segundos_objetivos
                ? data.segundos_objetivos
                : null,
              objetivos: data.objetivos ? data.objetivos : null,
              clases_numero: data.clases_numero ? data.clases_numero : null,
              horas_clase_numero: data.horas_clase_numero
                ? data.horas_clase_numero
                : null,
              minimo: data.minimo ? data.minimo : null,
              maximo: data.maximo ? data.maximo : null,
              mes_curso: data.mes_curso ? data.mes_curso : null,
              año_curso: data.año_curso ? data.año_curso : null,
            
                  
              }),
            }
          );
        } catch (err) {
          console.error(err);
          toastr.error("Error al preparar la resolución.");
        }
        if (response.ok) {
          toastr.success("Borrador preparado con éxito.");
        } else {
          toastr.error("Error al preparar el borrador.");
          return;
        }
        // visto = true;
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
  habilitarCampos();
  toastr.info("Generando PDF...");
 

  try {
    // Construir payload de forma limpia usando ?? para valores nulos
    const payload = {
      fecha: data.fecha,
      numero_resolucion: data.numero_resolucion,
      expediente: data.expediente,
      resolucion_interes_departamental: data.resolucion_interes_departamental,
      curso: data.curso ?? null,
      cohorte: data.cohorte ?? null,
      titulo_docente: data.titulo_docente ?? null,
      docente: data.docente ?? null,
      sexo_docente: data.sexo_docente ?? null,
      alumnos: data.alumnos ?? null,
      segundos_objetivos: data.segundos_objetivos ?? null,
      objetivos: data.objetivos ?? null,
      clases_numero: data.clases_numero ?? null,
      horas_clase_numero: data.horas_clase_numero ?? null,
      minimo: data.minimo ?? null,
      maximo: data.maximo ?? null,
      mes_curso: data.mes_curso ?? null,
      año_curso: data.año_curso ?? null,
    };

    // Primer PATCH: emitir formulario
    const responseEmitir = await fetch(`/resoluciones/emitir-formulario/${idResolucion}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!responseEmitir.ok) throw new Error(`Error en emitir formulario: ${responseEmitir.status}`);

    const resultEmitir = await responseEmitir.json();
   
    toastr.info("Enviando resolución...");

    if (!resultEmitir.success) {
      throw new Error(resultEmitir.message || "Error al generar resolución");
    }

    // Segundo PATCH: generar PDF
    const responsePdf = await fetch(`/resoluciones/${idResolucion}/pdf`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!responsePdf.ok) throw new Error(`Error en generar PDF: ${responsePdf.status}`);

    const dataPdf = await responsePdf.json();

    if (!dataPdf.success || !dataPdf.pdfUrl) {
      throw new Error(dataPdf.message || "Error al generar PDF");
    }
    // toastr.success("PDF creado correctamente.");
    // console.log("antes del window open");

    // Abrir PDF en nueva pestaña
    const nuevaVentana = window.open("", "_blank");
    nuevaVentana.location.href = dataPdf.pdfUrl;
    // console.log("Antes del set timeout");
    // Redirección después de un pequeño delay
    setTimeout(() => {
      window.location.href = "/resoluciones/lista-resoluciones";
    }, 400);

    // toastr.success(resultEmitir.message || "¡Tarea realizada con éxito!");

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
      
        toastr.info("Guardando cambios...");
        try {
          const response = await fetch(
            `/resoluciones/${data.id_resoluciones}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            }
          );

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
          }
        } catch (err) {
          console.error("Excepción en fetch:", err);
          toastr.error("Ocurrió un error al enviar los datos en el PUT.");
        }
      };
      await guardarExistenteBoton();
    }
    return;
  });
  //BUG Si el usuario deja de estar logueado, no se maneja bien los errores cuando se intenta guardar una resolucion

  document
    .getElementById("ver-borrador-btn-admin")
    .addEventListener("click", async function () {
      habilitarCampos();
      

      const idResolucion = form.dataset.idResolucion;

      if (idResolucion) {
        try {
        

          // Obtener los datos del formulario
          const formData = new FormData(form);
          const data = Object.fromEntries(formData.entries());

          const response = await fetch(
            `/resoluciones/borrador/${idResolucion}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                fecha: data.fecha,
            numero_resolucion: data.numero_resolucion,
            expediente: data.expediente,
            resolucion_interes_departamental:
              data.resolucion_interes_departamental,

            curso: data.curso ? data.curso : null,
            cohorte: data.cohorte ? data.cohorte : null,
            titulo_docente: data.titulo_docente ? data.titulo_docente : null,

            docente: data.docente ? data.docente : null,
            sexo_docente: data.sexo_docente ? data.sexo_docente : null,
            alumnos: data.alumnos ? data.alumnos : null,
            segundos_objetivos: data.segundos_objetivos
              ? data.segundos_objetivos
              : null,
            objetivos: data.objetivos ? data.objetivos : null,
            clases_numero: data.clases_numero ? data.clases_numero : null,
            horas_clase_numero: data.horas_clase_numero
              ? data.horas_clase_numero
              : null,
            minimo: data.minimo ? data.minimo : null,
            maximo: data.maximo ? data.maximo : null,
            mes_curso: data.mes_curso ? data.mes_curso : null,
            año_curso: data.año_curso ? data.año_curso : null
              }),
            }
          
         
          );
          
          //  const nuevaVentana = window.open("", "_blank");
          //   nuevaVentana.location.href = data.pdfUrl;
          

          if (response.ok) {

            toastr.success("Borrador preparado con éxito.");
            // Abrir el borrador después de actualizar
            const urlBorrador = `/resoluciones/${idResolucion}/ver-borrador`;
            setTimeout(() => {
            window.open(urlBorrador, "_blank")}, 800) ;
          } else {
            toastr.error("Error al preparar el borrador.");
          }
        } catch (err) {
          console.error(err);
          toastr.error("Error al preparar la resolución.");
        }
      } else {
        toastr.warning(
          "Primero debés guardar la resolución para ver el borrador."
        );
      }
    });

  const botonRechazar = document.getElementById(idResolucion);

  botonRechazar.addEventListener("click", async (e) => {
    

    if (e.target.classList.contains("btn-reject")) {
      const idResolucion = e.target.dataset.id;
      const fila = e.target.closest("tr"); // obtenemos la fila de la tabla
      const celdaEstado = fila.querySelector(".estado");

   

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
