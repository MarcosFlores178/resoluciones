document.addEventListener('DOMContentLoaded', () => {
  // Inicializamos Toastr para notificaciones
  const form = document.getElementById('formularioResolucion');
  const botonesAccion = form.querySelectorAll('button[type="submit"]');

  botonesAccion.forEach(boton => {
    boton.addEventListener('click', (e) => {
      // Guardamos el valor del botón pulsado
      form.dataset.accion = boton.value;
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    data.accion = form.dataset.accion;

    if (data.accion === 'guardar') {
    toastr.info('Guardando resolución...');
  } else if (data.accion === 'generar_pdf') {
    toastr.info('Generando PDF...');
  }

    let url = '/resoluciones/form-resolucion';
    let method = 'POST';

    // Si existe ID, es edición
    if (data.id_resoluciones) {
      url = `/resoluciones/${data.id_resoluciones}`;
      method = 'PUT';
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        toastr.success(result.message || '¡Tarea realizada con éxito!');
      } else {
        toastr.error(result.message || 'Ocurrió un error.');
      }

      // Si se pidió PDF, podrías redirigir o abrir en otra pestaña:
      if (data.accion === 'generar_pdf' && result.pdfUrl) {
        // window.open(result.pdfUrl, '_blank');
        setTimeout(() => {
          window.open(result.pdfUrl, '_blank');
        }, 1500);
      }

    } catch (error) {
      toastr.error('Error al comunicarse con el servidor.');
      //BUG La resolucion se actualiza, el update anda bien pero se muestra este error que no debe salir porque el put funciona
      console.error(error);
    }
  });

});
// Este script se ejecuta cuando el DOM está completamente cargado