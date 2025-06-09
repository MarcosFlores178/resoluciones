const { Resolucion } = require("../db/models");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");

// Reemplaza los {{campos}} de la plantilla
function renderTemplate(templateText, campos) {
  return templateText
    .replace(/{{expediente}}/g, campos.expediente)
    .replace(/{{curso}}/g, campos.curso)
    .replace(/{{cohorte}}/g, campos.cohorte)
    .replace(/{{denominacion_docente}}/g, campos.denominacion_docente)
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
    .replace(/{{numero_resolucion}}/g, campos.numero_resolucion || "")
    .replace(/{{fecha}}/g, campos.fecha || "")
    .replace(
      /{{resolucion_interes_departamental}}/g,
      campos.resolucion_interes_departamental || ""
    );
}

// function renderTemplate(template, variables) {
//   return template.replace(/{{(\w+)}}/g, (_, key) => variables[key] || '');
// }

function dibujarEncabezado(doc) {
  const imagePath = path.join(__dirname, "../public/images/logo.png");

  if (fs.existsSync(imagePath)) {
    // Inserta la imagen a la izquierda del encabezado
    doc.image(imagePath, doc.page.margins.left + 20, 30, { width: 150 });
    doc.moveDown(2.5); // Esto crea espacio antes de la siguiente línea de texto.
  }

  doc
    .font("Times-Bold")
    .fontSize(10)
    .text("DEPARTAMENTO ACADÉMICO DE CIENCIAS EXACTAS, FÍSICAS Y NATURALES", {
      align: "center",
      baseline: "top",
    });

  doc
    .font("Helvetica-BoldOblique")
    .fontSize(10)
    .text("“Año 2025 Con Orden y Unidos por una Nueva UNLaR”", {
      align: "center",
    })
    .moveDown(1);

  // Ajustá la fuente antes de calcular el ancho
  doc.font("Times-Bold").fontSize(11);

  // Definí los textos
  const texto2 = "RESOLUCIÓN INTERNA D.A.C.E.F. y N. Nº";
  const texto1 = "LA RIOJA,";

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
  doc.text(texto1, x, y, { baseline: "top" });
  doc.moveDown(1); // salta a la siguiente línea
  doc.text(texto2, { baseline: "top" }); // NO pongas `x` o `y` y usará la posición siguiente automáticamente
  doc.moveDown(1.5);

  // Si querés podés usar doc.moveDown(1.5) para saltar más espacio debajo.
  doc.moveDown(1.5); // Espacio debajo del encabezado
  doc.x = doc.page.margins.left;
  doc.y = doc.y;
}

function processTemplateLine(doc, line, options = {}) {
  const sangria = "                            ";

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
  const align = isCentered ? "center" : "justify";

  const textOptions = {
    align,
    lineGap: align === "justify" ? 5 : 0, // 👈 Aplica solo si justificado
  };

  if (parts.length > 0) {
    parts.forEach((part, index) => {
      const isFirst = index === 0;
      const isLast = index === parts.length - 1;
      let textToPrint = part.text;

      if (!isLast && !part.text.endsWith(" ")) {
        textToPrint += " ";
      }

      doc
        .font(part.bold ? "Times-Bold" : "Times-Roman")
        .fontSize(12)
        .text((isFirst && !isCentered ? sangria : "") + textToPrint, {
          continued: index < parts.length - 1,
          // align,
          ...textOptions,
        });
    });
    doc.text("", { continued: false }); // Finaliza la línea
    doc.font("Times-Roman").fontSize(12);
  } else {
    // Línea sin negritas
    doc
      .font("Times-Roman")
      .fontSize(12)
      .text((isCentered ? "" : sangria) + content, { ...textOptions });
  }
}

module.exports = {
  // Mostrar formulario inicial
  formulario: (req, res) => {
    res.render("form", { datos: null });
  },

  // Procesar formulario
  procesarFormulario: async (req, res) => {
    const {
      fecha,
      expediente,
      curso,
      cohorte,
      denominacion_docente,
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
      numero_resolucion,
      resolucion_interes_departamental,
      accion,
    } = req.body;

    try {
      // Crear la resolución en la base de datos
      const nueva = await Resolucion.create({
        fecha,
        expediente,
        curso,
        cohorte,
        denominacion_docente,
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
        resolucion_interes_departamental,
      });

      // Si la acción es 'guardar', responde con JSON
      if (accion === "guardar") {
        return res.json({
          success: true,
          message: "Resolución guardada con éxito",
          id: nueva.id, // 👈 devolvemos el ID recién creado
        });
      }

      // Si la acción es generar PDF, continúa:
      const plantillaPath = path.join(__dirname, "../plantilla.txt");
      const plantilla = fs.readFileSync(plantillaPath, "utf8");
      const textoFinal = renderTemplate(plantilla, {
        fecha,
        resolucion: numero_resolucion || "",
        expediente,
        cohorte,
        curso,
        denominacion_docente,
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
        resolucion_interes_departamental,
      });

      const doc = new PDFDocument({
        margins: {
          top: 42.52,
          left: 113,
          right: 42.52,
          bottom: 70.88,
        },
      });

      const fileName = `resolucion-${nueva.id}.pdf`;
      const filePath = path.join(__dirname, `../pdfs/${fileName}`);
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Encabezado
      dibujarEncabezado(doc);

      // Nueva página
      doc.on("pageAdded", () => {
        dibujarEncabezado(doc);
        doc.text("", { continued: false });
        doc.font("Times-Roman").fontSize(12);
      });

      textoFinal.split("\n").forEach((line) => {
        line = line.replace(/\r/g, "").trimEnd();
        processTemplateLine(doc, line);
        doc.moveDown(0.5);
      });

      doc.end();

      stream.on("finish", () => {
        const pdfUrl = `/pdfs/${fileName}`; // 👈 Asegúrate de servir la carpeta /pdfs
        return res.json({
          success: true,
          message: "PDF generado correctamente.",
          pdfUrl: pdfUrl,
        });
      });
    } catch (error) {
      console.error("Error en el controlador:", error);
      res.status(500).json({
        success: false,
        message: "Ocurrió un error al procesar el formulario.",
      });
    }
  },

  //FIXME : al apretar en generar pdf en el home, se duplica el registro en la base de datos y no se crea el pdf

  generarPDF: async (req, res) => {
    try {
      const id = req.params.id;
      const resolucion = await Resolucion.findByPk(id);
      if (!resolucion) return res.status(404).send("Resolución no encontrada");

      const plantillaPath = path.join(__dirname, "../plantilla.txt");
      let plantilla = fs
        .readFileSync(plantillaPath, "utf-8")
        .replace(/\r/g, "");

      // Reemplazo múltiple
      const campos = {
        expediente: resolucion.expediente,
        curso: resolucion.curso,
        cohorte: resolucion.cohorte,
        denominacion_docente: resolucion.denominacion_docente,
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
        numero_resolucion: resolucion.numero_resolucion || "",
        resolucion_interes_departamental:
          resolucion.resolucion_interes_departamental || "",
      };

      const textoFinal = renderTemplate(plantilla, campos);

      const doc = new PDFDocument({
        margins: {
          top: 42.52, // 1.5 cm
          left: 113, // 3 cm
          right: 42.52, // 1.5 cm
          bottom: 70.88, // 2.5 cm
        },
      });
      const fileName = `resolucion-${resolucion.id}.pdf`;
      const filePath = path.join(__dirname, `../pdfs/${fileName}`);
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // textoFinal.split('\n').forEach(line => {
      //   processTemplateLine(doc, line);
      //   doc.moveDown(0.5);
      // });
      dibujarEncabezado(doc);

      doc.on("pageAdded", () => {
        dibujarEncabezado(doc);
        doc.text("", { continued: false }); //Es para evitar que el inicio de la nueva página se comporte raro
        doc.font("Times-Roman").fontSize(12);
      });

      textoFinal.split("\n").forEach((line) => {
        line = line.replace(/\r/g, "").trimEnd(); // Limpia cualquier basura invisible //TODO importante para que no salgan caracteres extraños en saltos de linea
        processTemplateLine(doc, line);
        doc.moveDown(0.5);
      });

      doc.end();

      stream.on("finish", () => {
        console.log("PDF terminado, iniciando descarga...");
        res.download(filePath, (err) => {
          if (err) {
            console.error("Error al enviar el archivo:", err);
          } else {
            console.log("Descarga enviada correctamente.");
            fs.unlinkSync(filePath);
          }
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al generar el PDF");
    }
  },

  // Mostrar datos ya guardados (para edición o generación posterior)
  mostrarResolucion: async (req, res) => {
    const resolucion = await Resolucion.findByPk(req.params.id);
    if (!resolucion) return res.status(404).send("No encontrada");

    res.render("form", { datos: resolucion });
  },

  actualizarResolucion: async (req, res) => {
    const {
      expediente,
      curso,
      cohorte,
      denominacion_docente,
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
      numero_resolucion,
      accion,
    } = req.body;
    const id = req.params.id;

    const resolucion = await Resolucion.findByPk(id);
    if (!resolucion) return res.status(404).send("Resolución no encontrada");

    // Actualizar los datos
    resolucion.expediente = expediente;
    resolucion.curso = curso;
    resolucion.cohorte = cohorte;
    resolucion.denominacion_docente = denominacion_docente;
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
    resolucion.resolucion_interes_departamental =
      req.body.resolucion_interes_departamental || null;
    await resolucion.save();

    if (accion === "guardar") {
      // return res.send("Plantilla actualizada correctamente.");
      return res.json({
        success: true,
        message: "Plantilla actualizada correctamente.",
        id: resolucion.id,
      });
    } else if (accion === "generar_pdf") {
      const plantillaPath = path.join(__dirname, "../plantilla.txt");
      let plantilla = fs
        .readFileSync(plantillaPath, "utf-8")
        .replace(/\r/g, "");

      // Reemplazo múltiple
      const campos = {
        expediente: resolucion.expediente,
        curso: resolucion.curso,
        cohorte: resolucion.cohorte,
        denominacion_docente: resolucion.denominacion_docente,
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
        numero_resolucion: resolucion.numero_resolucion || "",
        resolucion_interes_departamental:
          resolucion.resolucion_interes_departamental || "",
      };

      const textoFinal = renderTemplate(plantilla, campos);

      const doc = new PDFDocument({
        margins: {
          top: 42.52, // 1.5 cm
          left: 113, // 3 cm
          right: 42.52, // 1.5 cm
          bottom: 70.88, // 2.5 cm
        },
      });
      const fileName = `resolucion-${resolucion.id}.pdf`;
      const filePath = path.join(__dirname, `../pdfs/${fileName}`);
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // textoFinal.split('\n').forEach(line => {
      //   processTemplateLine(doc, line);
      //   doc.moveDown(0.5);
      // });
      dibujarEncabezado(doc);

      doc.on("pageAdded", () => {
        dibujarEncabezado(doc);
        doc.text("", { continued: false }); //Es para evitar que el inicio de la nueva página se comporte raro
        doc.font("Times-Roman").fontSize(12);
      });

      textoFinal.split("\n").forEach((line) => {
        line = line.replace(/\r/g, "").trimEnd(); // Limpia cualquier basura invisible //TODO importante para que no salgan caracteres extraños en saltos de linea
        processTemplateLine(doc, line);
        doc.moveDown(0.5);
      });

      doc.end();

      stream.on("finish", () => {
         console.log('PDF terminado');
    // OPCIÓN 1: Devolver JSON con la URL del archivo
    return res.json({
      success: true,
      message: 'PDF generado correctamente.',
      pdfUrl: `/pdfs/${fileName}`, // Asegúrate de que esta ruta sea accesible desde el cliente
    });
          }
      );
    }

    //FIXME Al editar y actualizar una resolución, se guarda de nuevo en la base de datos en vez de hacer un update, debo ver dónde está el error
  },
  listarResoluciones: async (req, res) => {
    try {
      const resoluciones = await Resolucion.findAll({
        order: [["id", "DESC"]],
      });
      res.render("lista", { resoluciones });
      // res.redirect('/resoluciones/lista');
    } catch (error) {
      res.status(500).send("Error al obtener las resoluciones");
    }
  },
  eliminarResolucion: async (req, res) => {
    try {
      const id = req.params.id;
      await Resolucion.destroy({ where: { id } });
      res.redirect("lista");
    } catch (error) {
      res.status(500).send("Error al eliminar la resolución");
    }
  },
};
