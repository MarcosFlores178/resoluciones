const { Resolucion } = require('../models');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

// Reemplaza los {{campos}} de la plantilla
function renderTemplate(templateText, campos) {
  return templateText
    .replace('{{nombre}}', campos.nombre)
    .replace('{{asignatura}}', campos.asignatura)
    .replace('{{fecha}}', campos.fecha)
    .replace('{{numero_resolucion}}', campos.numero_resolucion || '');
}

module.exports = {
  // Mostrar formulario inicial
  formulario: (req, res) => {
    res.render('resolucion-form', { datos: null });
  },

  // Procesar POST del formulario
  procesarFormulario: async (req, res) => {
    const { nombre, asignatura, fecha, numero_resolucion, accion } = req.body;

    // Guardar en base de datos
    const nueva = await Resolucion.create({
      nombre,
      asignatura,
      fecha,
      numero_resolucion: numero_resolucion || null,
    });

    if (accion === 'guardar') {
      return res.send('Plantilla guardada correctamente.');
    }

    // Si se eligió generar PDF
    const plantillaPath = path.join(__dirname, '../plantilla.txt');
    const plantilla = fs.readFileSync(plantillaPath, 'utf8');
    const textoFinal = renderTemplate(plantilla, {
      nombre,
      asignatura,
      fecha,
      numero_resolucion: numero_resolucion || '',
    });

    // Crear PDF
    const doc = new PDFDocument({ margin: 80 });
    const fileName = `resolucion-${nueva.id}.pdf`;
    const filePath = path.join(__dirname, `../pdfs/${fileName}`);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);
    doc.text(textoFinal);
    doc.end();

    doc.on('finish', () => {
      res.download(filePath, () => {
        fs.unlinkSync(filePath); // Borrar luego de enviar
      });
    });
  },

  // Mostrar datos ya guardados (para edición o generación posterior)
  mostrarResolucion: async (req, res) => {
    const resolucion = await Resolucion.findByPk(req.params.id);
    if (!resolucion) return res.status(404).send('No encontrada');

    res.render('form', { datos: resolucion });
  },

  actualizarResolucion: async (req, res) => {
  const { nombre, asignatura, fecha, numero_resolucion, accion } = req.body;
  const id = req.params.id;

  const resolucion = await Resolucion.findByPk(id);
  if (!resolucion) return res.status(404).send('Resolución no encontrada');

  // Actualizar los datos
  resolucion.nombre = nombre;
  resolucion.asignatura = asignatura;
  resolucion.fecha = fecha;
  resolucion.numero_resolucion = numero_resolucion || null;
  await resolucion.save();

  if (accion === 'guardar') {
    return res.send('Plantilla actualizada correctamente.');
  }

  // Si se eligió generar PDF
  const path = require('path');
  const fs = require('fs');
  const PDFDocument = require('pdfkit');

  const plantillaPath = path.join(__dirname, '../plantilla.txt');
  const plantilla = fs.readFileSync(plantillaPath, 'utf8');
  const textoFinal = renderTemplate(plantilla, {
    nombre,
    asignatura,
    fecha,
    numero_resolucion: numero_resolucion || '',
  });

  const doc = new PDFDocument({ margin: 80 });
  const fileName = `resolucion-${resolucion.id}.pdf`;
  const filePath = path.join(__dirname, `../pdfs/${fileName}`);
  const stream = fs.createWriteStream(filePath);

  doc.pipe(stream);
  doc.text(textoFinal);
  doc.end();

  doc.on('finish', () => {
    res.download(filePath, () => {
      fs.unlinkSync(filePath);
    });
  });
},
listarResoluciones: async (req, res) => {
  try {
    const resoluciones = await Resolucion.findAll({ order: [['id', 'DESC']] });
    res.render('resoluciones/lista', { resoluciones });
  } catch (error) {
    res.status(500).send('Error al obtener las resoluciones');
  }
}

};
