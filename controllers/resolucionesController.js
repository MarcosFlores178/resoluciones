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
    .replace(/{{numero_resolucion}}/g, campos.numero_resolucion || '')
    .replace(/{{fecha}}/g, campos.fecha || '')
    .replace(/{{resolucion_interes_departamental}}/g, campos.resolucion_interes_departamental || '')
}

// function renderTemplate(template, variables) {
//   return template.replace(/{{(\w+)}}/g, (_, key) => variables[key] || '');
// }

function dibujarEncabezado(doc) {
  const imagePath = path.join(__dirname, '../public/images/logo.png');

  if (fs.existsSync(imagePath)) {
    // Inserta la imagen a la izquierda del encabezado
    doc.image(imagePath, doc.page.margins.left+20, 30, { width: 150 });
    doc.moveDown(2.5);  // Esto crea espacio antes de la siguiente línea de texto.

  }

  doc
    .font('Times-Bold')
    .fontSize(10)
    .text('DEPARTAMENTO ACADÉMICO DE CIENCIAS EXACTAS, FÍSICAS Y NATURALES', {
      align: 'center',
      baseline: 'top'
    });
    
    doc
    .font('Helvetica-BoldOblique')
    .fontSize(10)
    .text('“Año 2025 Con Orden y Unidos por una Nueva UNLaR”', {
      align: 'center'
    })
    .moveDown(1);
    
    // doc
    //   .font('Times-Bold')
    //   .fontSize(11)
    //   .text('RESOLUCIÓN INTERNA D.A.C.E.F. y N. Nº', {
    //     align: 'center',
    //     baseline: 'top'
    //   });
    // doc
    //   .font('Times-Bold')
    //   .fontSize(11)
    //   .text('LA RIOJA,', {
    //     align: 'center',
    //     baseline: 'top'
    //   });
   
// Ajustá la fuente antes de calcular el ancho
doc.font('Times-Bold').fontSize(11);

// Definí los textos
const texto2 = 'RESOLUCIÓN INTERNA D.A.C.E.F. y N. Nº';
const texto1 = 'LA RIOJA,';

// Calculá el ancho del texto más largo (para alinear ambos)
const anchoTexto1 = doc.widthOfString(texto1);
const anchoTexto2 = doc.widthOfString(texto2);

// Tomá el ancho máximo
const anchoMax = Math.max(anchoTexto1, anchoTexto2);

// Calculá la posición X para centrar ambos textos
const pageWidth = doc.page.width;
const leftMargin = doc.page.margins.left;
const rightMargin = doc.page.margins.right;
const contentWidth = pageWidth - leftMargin - rightMargin;
const x = leftMargin + (contentWidth - anchoMax) / 2;

// Definí la coordenada Y donde empezar (puede ser la posición actual de doc.y o algo como 150)
let y = doc.y;

// Dibujá el primer texto
doc.text(texto1, x, y, { baseline: 'top' });
doc.moveDown(1); // salta a la siguiente línea
doc.text(texto2, { baseline: 'top' }); // NO pongas `x` o `y` y usará la posición siguiente automáticamente
doc.moveDown(1.5);

// Si querés podés usar doc.moveDown(1.5) para saltar más espacio debajo.
  doc.moveDown(1.5); // Espacio debajo del encabezado
  doc.x = doc.page.margins.left;
  doc.y = doc.y;
}


function processTemplateLine(doc, line, options = {}) {
  const sangria = '                            ';
 

  // 1. Verificar si es una línea con imagen
  // if (line.includes(imageMarker)) {
  //   const imagePath = path.join(__dirname, '../public/images/logo.png');
  //   if (fs.existsSync(imagePath)) {
  //     doc.image(imagePath, doc.x, doc.y, { width: 150 });
  //     doc.moveDown();
  //   }
  //   return;
  // }

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
      .lineGap(6)
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
  const { fecha, expediente, curso, cohorte, docente, alumnos, objetivos, segundos_objetivos, horas_totales, clases, horas_clase, minimo, maximo, mes_curso, numero_resolucion, resolucion_interes_departamental, accion } = req.body;

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
    resolucion_interes_departamental
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
    resolucion_interes_departamental
  });

  const doc = new PDFDocument({
  margins: {
    top: 42.52,     // 1.5 cm
    left: 113,    // 3 cm
    right: 42.52,   // 1.5 cm
    bottom: 70.88   // 2.5 cm
  }
});
  const fileName = `resolucion-${nueva.id}.pdf`;
  const filePath = path.join(__dirname, `../pdfs/${fileName}`);
  const stream = fs.createWriteStream(filePath);

  doc.pipe(stream);

  // textoFinal.split('\n').forEach(line => {
  //   processTemplateLine(doc, line);
  //   doc.moveDown(0.5);
  // });
dibujarEncabezado(doc);

doc.on('pageAdded', () => {
  dibujarEncabezado(doc);
});

textoFinal.split('\n').forEach(line => {
  line = line.replace(/\r/g, '').trimEnd(); // Limpia cualquier basura invisible //TODO importante para que no salgan caracteres extraños en saltos de linea
  processTemplateLine(doc, line);
  doc.moveDown(0.5);
});

  doc.end();

  stream.on('finish', () => {
    console.log('PDF terminado, iniciando descarga...');
    res.download(filePath, (err) => {
        if (err) {
      console.error('Error al enviar el archivo:', err);
    } else {
      console.log('Descarga enviada correctamente.');
      fs.unlinkSync(filePath);
    }
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
        resolucion_interes_departamental: resolucion.resolucion_interes_departamental || '' 
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
    resolucion.resolucion_interes_departamental = req.body.resolucion_interes_departamental || null;
    await resolucion.save();

    if (accion === 'guardar') {
      return res.send('Plantilla actualizada correctamente.');
    }
    //FIXME Al editar y actualizar una resolución, se guarda de nuevo en la base de datos en vez de hacer un update, debo ver dónde está el error

    // Si se eligió generar PDF
    // const path = require('path');
    // const fs = require('fs');
    // const PDFDocument = require('pdfkit');

    // const plantillaPath = path.join(__dirname, '../plantilla.txt');
    // const plantilla = fs.readFileSync(plantillaPath, 'utf8');
    // const textoFinal = renderTemplate(plantilla, {
    //   expediente,
    //   curso,
    //   cohorte,
    //   docente,
    //   alumnos,
    //   objetivos,
    //   segundos_objetivos,
    //   horas_totales,
    //   clases,
    //   horas_clase,
    //   minimo,
    //   maximo,
    //   mes_curso,
    //   fecha,
    //   numero_resolucion: numero_resolucion || '',
    //   resolucion_interes_departamental: resolucion_interes_departamental || ''
    // });

    // const doc = new PDFDocument({ margin: 80 });
    // const fileName = `resolucion-${resolucion.id}.pdf`;
    // const filePath = path.join(__dirname, `../pdfs/${fileName}`);
    // const stream = fs.createWriteStream(filePath);

    // doc.pipe(stream);
    // doc.text(textoFinal);
    // doc.end();

    // doc.on('finish', () => {
    //   res.download(filePath, () => {
    //     fs.unlinkSync(filePath);
    //   });
    // });
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
