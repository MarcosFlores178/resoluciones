  window.addEventListener("DOMContentLoaded", () => {

  const modal = document.getElementById("modal-rechazo");
  const textareaMotivo = document.getElementById("motivo-rechazo");
  const btnCancelar = document.getElementById("btn-cancelar");
  const btnConfirmar = document.getElementById("btn-confirmar-rechazo");

  // Event delegation: escuchamos clicks en todo el documento
  document.addEventListener("click", (e) => {
    const boton = e.target.closest(".btn-reject");
    if (!boton) return; // no es un botón Rechazar

    // Guardamos el ID en el dataset del modal y abrimos el modal
    modal.dataset.idResolucion = boton.dataset.id;
    modal.dataset.filaId = boton.closest("tr").dataset.id; // opcional, si querés referencia a la fila
    modal.classList.add("show");

    // Limpiamos el textarea
    textareaMotivo.value = "";
  });

  // Cancelar modal
  btnCancelar.addEventListener("click", () => {
    modal.classList.remove("show");
    modal.removeAttribute("data-id-resolucion");
    textareaMotivo.value = "";
  });

  // Confirmar rechazo
  btnConfirmar.addEventListener("click", async () => {
    const idResolucion = modal.dataset.idResolucion;
    const motivo = textareaMotivo.value.trim();

    if (!motivo) {
      toastr.warning("Debes ingresar un motivo del rechazo");
      return;
    }

    try {
      const response = await fetch(`/resoluciones/${idResolucion}/rechazar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "rechazado", motivo })
      });

      if (response.ok) {
        // Actualizamos la fila en la tabla
        const fila = document.querySelector(`tr[data-id="${idResolucion}"]`);
        if (fila) {
          const celdaEstado = fila.querySelector(".estado");
          const linkCompletar = fila.querySelector(".btn-completar");
          const botonRechazar = fila.querySelector(".btn-reject");

          if (celdaEstado) celdaEstado.textContent = "Rechazada";
          if (linkCompletar) linkCompletar.remove(); // o deshabilitar estilo
          if (botonRechazar) botonRechazar.remove();

          // Opcional: agregar tooltip con motivo
          if (celdaEstado) {
            const span = document.createElement("span");
            span.classList.add("tooltip");
            span.dataset.motivo = motivo;
            span.textContent = "📝";
            celdaEstado.appendChild(span);
          }
        }

        toastr.success("Resolución rechazada con éxito");
        modal.classList.remove("show");
        modal.removeAttribute("data-id-resolucion");
      } else {
        toastr.error("Error al rechazar la resolución");
      }
    } catch (error) {
      console.error("Error de fetch:", error);
      toastr.error("Error al comunicarse con el servidor");
    }
  });

});

