const { Resolucion } = require('../db/models');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

// Reemplaza los {{campos}} de la plantilla
function renderTemplate(templateText, campos) {
  return templateText
    .replace(/{{expediente}}/g, campos.expediente)
    .replace(/{{curso}}/g, campos.curso)
    .replace(/{{cohorte}}/g, campos.cohorte)
    .replace(/{{docente}}/g, campos.docente)
    .replace(/{{alumnos}}/g, campos.alumnos)
    .replace(/{{objetivos}}/g, campos.objetivos)
    .replace(/{{segundos_objetivos}}/g, campos.segundos_objetivos)
    .replace(/{{horas_totales}}/g, campos.horas_totales)
    .replace(/{{clases}}/g, campos.clases)
    .replace(/{{horas_clase}}/g, campos.horas_clase)
    .replace(/{{minimo}}/g, campos.minimo)
    .replace(/{{maximo}}/g, campos.maximo)
    .replace(/{{mes_curso}}/g, campos.mes_curso)
    .replace(/{{numero_resolucion}}/g, campos.numero_resolucion || '');
}
function renderTemplate(template, variables) {
  return template.replace(/{{(\w+)}}/g, (_, key) => variables[key] || '');
}

function processTemplateLine(doc, line, options = {}) {
  const sangria = '                            ';
  const imageMarker = '[IMAGEN_MEMBRETE_IZQUIERDA]';

  // 1. Verificar si es una línea con imagen
  if (line.includes(imageMarker)) {
    const imagePath = path.join(__dirname, '../public/images/images.jpg');
    if (fs.existsSync(imagePath)) {
      doc.image(imagePath, doc.x, doc.y, { width: 150 });
      doc.moveDown();
    }
    return;
  }

  // 2. Verificar si la línea debe centrarse (quita espacios y chequea [[...]])
  const trimmedLine = line.trim();
  const centerMatch = trimmedLine.match(/^\[\[(.*?)\]\]$/);
  const isCentered = !!centerMatch;
  const content = isCentered ? centerMatch[1].trim() : line;

  // 3. Procesar negritas <bold>...</bold>
  const boldPattern = /<bold>(.*?)<\/bold>/g;
  let match;
  const parts = [];
  let lastIndex = 0;

  while ((match = boldPattern.exec(content)) !== null) {
    // Texto antes de la negrita
    if (match.index > lastIndex) {
      parts.push({ text: content.slice(lastIndex, match.index), bold: false });
    }
    // Texto en negrita
    parts.push({ text: match[1], bold: true });
    lastIndex = boldPattern.lastIndex;
  }

  // Texto restante después de la última etiqueta <bold>
  if (lastIndex < content.length) {
    parts.push({ text: content.slice(lastIndex), bold: false });
  }

  // 4. Dibujar en PDF con alineación y estilo adecuado
  const align = isCentered ? 'center' : 'justify';
  if (parts.length > 0) {
    parts.forEach((part, index) => {
      const isFirst = index === 0;
      doc
        .font(part.bold ? 'Times-Bold' : 'Times-Roman')
        .fontSize(12)
        .text((isFirst && !isCentered ? sangria : '') + part.text, {
          continued: index < parts.length - 1,
          align,
        });
    });
    doc.text('', { continued: false }); // Finaliza la línea
  } else {
    // Línea sin negritas
    doc
      .font('Times-Roman')
      .fontSize(12)
      .text((isCentered ? '' : sangria) + content, { align });
  }
}


module.exports = {
  // Mostrar formulario inicial
  formulario: (req, res) => {
    res.render('form', { datos: null });
  },

  procesarFormulario: 
  
  async (req, res) => {
  const { fecha, expediente, curso, cohorte, docente, alumnos, objetivos, segundos_objetivos, horas_totales, clases, horas_clase, minimo, maximo, mes_curso, numero_resolucion, accion } = req.body;

  const nueva = await Resolucion.create({
    fecha,
    expediente,
    curso,
    cohorte,
    docente,
    alumnos,
    objetivos,
    segundos_objetivos,
    horas_totales,
    clases,
    horas_clase,
    minimo,
    maximo,
    mes_curso,
    numero_resolucion: numero_resolucion || null,
  });

  if (accion === 'guardar') {
    return res.send('Plantilla guardada correctamente.');
  }

  const plantillaPath = path.join(__dirname, '../plantilla.txt');
  const plantilla = fs.readFileSync(plantillaPath, 'utf8');
  const textoFinal = renderTemplate(plantilla, {
    fecha,
    resolucion: numero_resolucion || '',
    expediente,
    cohorte,
    curso,
    docente,
    alumnos,
    objetivos,
    segundos_objetivos,
    horas_totales,
    clases,
    horas_clase,
    minimo,
    maximo,
    mes_curso,
  });

  const doc = new PDFDocument({ margin: 85 });
  const fileName = `resolucion-${nueva.id}.pdf`;
  const filePath = path.join(__dirname, `../pdfs/${fileName}`);
  const stream = fs.createWriteStream(filePath);

  doc.pipe(stream);

  // textoFinal.split('\n').forEach(line => {
  //   processTemplateLine(doc, line);
  //   doc.moveDown(0.5);
  // });

textoFinal.split('\n').forEach(line => {
  line = line.replace(/\r/g, '').trimEnd(); // Limpia cualquier basura invisible //TODO importante para que no salgan caracteres extraños en saltos de linea
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
        expediente: resolucion.expediente,
        curso: resolucion.curso,
        cohorte: resolucion.cohorte,
        docente: resolucion.docente,
        alumnos: resolucion.alumnos,
        objetivos: resolucion.objetivos,
        segundos_objetivos: resolucion.segundos_objetivos,
        horas_totales: resolucion.horas_totales,
        clases: resolucion.clases,
        horas_clase: resolucion.horas_clase,
        minimo: resolucion.minimo,
        maximo: resolucion.maximo,
        mes_curso: resolucion.mes_curso,
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
    const { expediente, curso, cohorte, docente, alumnos, objetivos, segundos_objetivos, horas_totales, clases, horas_clase, minimo, maximo, mes_curso, fecha, numero_resolucion, accion } = req.body;
    const id = req.params.id;

    const resolucion = await Resolucion.findByPk(id);
    if (!resolucion) return res.status(404).send('Resolución no encontrada');

    // Actualizar los datos
    resolucion.expediente = expediente;
    resolucion.curso = curso;
    resolucion.cohorte = cohorte;
    resolucion.docente = docente;
    resolucion.alumnos = alumnos;
    resolucion.objetivos = objetivos;
    resolucion.segundos_objetivos = segundos_objetivos;
    resolucion.horas_totales = horas_totales;
    resolucion.clases = clases;
    resolucion.horas_clase = horas_clase;
    resolucion.minimo = minimo;
    resolucion.maximo = maximo;
    resolucion.mes_curso = mes_curso;
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
      expediente,
      curso,
      cohorte,
      docente,
      alumnos,
      objetivos,
      segundos_objetivos,
      horas_totales,
      clases,
      horas_clase,
      minimo,
      maximo,
      mes_curso,
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
