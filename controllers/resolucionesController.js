const { Resolucion } = require('../db/models');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

// Reemplaza los {{campos}} de la plantilla
function renderTemplate(templateText, campos) {
  return templateText
    .replace(/{{nombre}}/g, campos.nombre)
    .replace(/{{asignatura}}/g, campos.asignatura)
    .replace(/{{fecha}}/g, campos.fecha)
    .replace(/{{numero_resolucion}}/g, campos.numero_resolucion || '');
}
function renderTemplate(template, variables) {
  return template.replace(/{{(\w+)}}/g, (_, key) => variables[key] || '');
}

function processTemplateLine(doc, line, options = {}) {
  const sangria = '    ';
  const imageMarker = '[IMAGEN_MEMBRETE_IZQUIERDA]';

  if (line.includes(imageMarker)) {
    const imagePath = path.join(__dirname, '../public/img/membrete.png');
    if (fs.existsSync(imagePath)) {
      doc.image(imagePath, doc.x, doc.y, { width: 100 });
      doc.moveDown();
    }
    return;
  }

  const isCentered = line.startsWith('[[') && line.endsWith(']]');
  const content = isCentered ? line.slice(2, -2).trim() : line;

  const matches = content.match(/<bold>(.*?)<\/bold>/g);
  if (matches) {
    const parts = content.split(/(<bold>.*?<\/bold>)/g).filter(Boolean);
    const x = isCentered ? (doc.page.width / 2) : doc.x;
    const align = isCentered ? 'center' : 'left';

    let lineText = parts.map(part => part.replace(/<bold>|<\/bold>/g, '')).join('');
    doc.font('Times-Roman').fontSize(12).text((isCentered ? '' : sangria) + lineText, {
      align,
      continued: false
    });
  } else {
    doc.font('Times-Roman').fontSize(12).text((isCentered ? '' : sangria) + content, {
      align: isCentered ? 'center' : 'left',
      continued: false
    });
  }
}
module.exports = {
  // Mostrar formulario inicial
  formulario: (req, res) => {
    res.render('form', { datos: null });
  },

  procesarFormulario: 
  
  async (req, res) => {
  const { nombre, asignatura, fecha, numero_resolucion, accion } = req.body;

  const nueva = await Resolucion.create({
    nombre,
    asignatura,
    fecha,
    numero_resolucion: numero_resolucion || null,
  });

  if (accion === 'guardar') {
    return res.send('Plantilla guardada correctamente.');
  }

  const plantillaPath = path.join(__dirname, '../plantilla.txt');
  const plantilla = fs.readFileSync(plantillaPath, 'utf8');
  const textoFinal = renderTemplate(plantilla, {
    nombre,
    fecha,
    resolucion: numero_resolucion || '',
    expediente,
    cohorte,
    curso,
    docente,
    alumnos,
    objetivos,
    segundo_objetivos,
    horas_totales,
    clases,
    horas_clase,
    minimo,
    maximo,
    mes_curso,
  });

  const doc = new PDFDocument({ margin: 80 });
  const fileName = `resolucion-${nueva.id}.pdf`;
  const filePath = path.join(__dirname, `../pdfs/${fileName}`);
  const stream = fs.createWriteStream(filePath);

  doc.pipe(stream);

  textoFinal.split('\n').forEach(line => {
    processTemplateLine(doc, line);
    doc.moveDown(0.5);
  });

  doc.end();

  doc.on('finish', () => {
    res.download(filePath, () => {
      fs.unlinkSync(filePath);
    });
  });
},

  //FIXME : al apretar en generar pdf en el home, se duplica el registro en la base de datos y no se crea el pdf
  

  generarPDF: async (req, res) => {
    try {
      const id = req.params.id;
      const resolucion = await Resolucion.findByPk(id);
      if (!resolucion) return res.status(404).send('Resolución no encontrada');

      const plantillaPath = path.join(__dirname, '../plantilla.txt');
      let contenido = fs.readFileSync(plantillaPath, 'utf-8').replace(/\r/g, '');

      // Reemplazo múltiple
      const campos = {
        nombre: resolucion.nombre,
        asignatura: resolucion.asignatura,
        fecha: resolucion.fecha,
        numero_resolucion: resolucion.numero_resolucion || '',
      };
      for (const key in campos) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        contenido = contenido.replace(regex, campos[key]);
      }

      // Crear PDF temporal
      const doc = new PDFDocument({ margin: 80 });
      const fileName = `resolucion-${id}.pdf`;
      const filePath = path.join(__dirname, `../pdfs/${fileName}`);
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);
      doc.text(contenido, { align: 'justify' });
      doc.end();

      stream.on('finish', () => {
        res.download(filePath, () => {
          fs.unlinkSync(filePath);
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al generar el PDF');
    }
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
    //FIXME Al editar y actualizar una resolución, se guarda de nuevo en la base de datos en vez de hacer un update, debo ver dónde está el error

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
      res.render('lista', { resoluciones });
      // res.redirect('/resoluciones/lista');
    } catch (error) {
      res.status(500).send('Error al obtener las resoluciones');
    }
  },
  eliminarResolucion: async (req, res) => {
    try {
      const id = req.params.id;
      await Resolucion.destroy({ where: { id } });
      res.redirect('lista');
    } catch (error) {
      res.status(500).send('Error al eliminar la resolución');
    }
  }


};
