const { Resolucion } = require("../db/models");
const { Usuario } = require("../db/models");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const { PassThrough } = require("stream");
const { format } = require("date-fns");
const { es } = require("date-fns/locale");
const numeroALetras = require("../numeroALetras");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  },
});

function formatNumber(num) {
  return `${num} (${numeroALetras(num)})`;
}

function formatearConDateFns(fechaOriginal) {
  return format(new Date(fechaOriginal), "dd-MMM-yyyy", {
    locale: es,
  }).toUpperCase();
}
// Reemplaza los {{campos}} de la plantilla
function renderTemplate(templateText, campos) {
  return templateText
    .replace(/{{nombre_organizador}}/g, campos.nombre_organizador)
    .replace(/{{apellido_organizador}}/g, campos.apellido_organizador)
    .replace(/{{expediente}}/g, campos.expediente)
    .replace(/{{curso}}/g, campos.curso)
    .replace(/{{cohorte}}/g, campos.cohorte)
    .replace(/{{genero_docente}}/g, campos.genero_docente)
    .replace(/{{titulo_docente}}/g, campos.titulo_docente)
    .replace(/{{docente}}/g, campos.docente)
    .replace(/{{alumnos}}/g, campos.alumnos)
    .replace(/{{objetivos}}/g, campos.objetivos)
    .replace(/{{segundos_objetivos}}/g, campos.segundos_objetivos)
    .replace(/{{horas_totales_texto}}/g, campos.horas_totales_texto)
    .replace(/{{clases_texto}}/g, campos.clases_texto)
    .replace(/{{horas_clase_texto}}/g, campos.horas_clase_texto)
    .replace(/{{minimo}}/g, campos.minimo)
    .replace(/{{maximo}}/g, campos.maximo)
    .replace(/{{mes_curso}}/g, campos.mes_curso)
    .replace(/{{año_curso}}/g, campos.año_curso)
    .replace(/{{articulo_docente}}/g, campos.articulo_docente)
    .replace(/{{numero_resolucion}}/g, campos.numero_resolucion)
    .replace(/{{fecha}}/g, campos.fecha)
    .replace(
      /{{resolucion_interes_departamental}}/g,
      campos.resolucion_interes_departamental
    )
    .replace(/{{articulo_organizador}}/g, campos.articulo_organizador)
    .replace(/{{titulo_organizador}}/g, campos.titulo_organizador);
}

// function renderTemplate(template, variables) {
//   return template.replace(/{{(\w+)}}/g, (_, key) => variables[key] || '');
// }

//---------------ENCABEZADO---------------

function dibujarEncabezado(doc, numeroResolucion, fechaResolucion) {
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
  const texto2 = `RESOLUCIÓN INTERNA D.A.C.E.F. y N. Nº ${numeroResolucion}`;
  const texto1 = `LA RIOJA, ${fechaResolucion}`;

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

//--------------PROCESAR CUERPO DEL TEXTO-------------------

function processTemplateLine(doc, line, options = {}) {
  const sangria = "                            ";

  // 1. Detectar si la línea empieza con "--" (no lleva sangría)
  const noIndent = line.startsWith("--");
  let rawLine = noIndent ? line.slice(2).trim() : line;

  // 2. Verificar si la línea debe centrarse (quita espacios y chequea [[...]])
  const trimmedLine = rawLine.trim();
  const centerMatch = trimmedLine.match(/^\[\[(.*?)\]\]$/);
  const isCentered = !!centerMatch;

  // 3. El contenido final
  const content = isCentered ? centerMatch[1].trim() : rawLine;

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
        .text(
          (isFirst && !isCentered && !noIndent ? sangria : "") + textToPrint,
          {
            continued: index < parts.length - 1,
            // align,
            ...textOptions,
          }
        );
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
    const usuario = req.session.user;
    let rellenaFormulario = false; // Inicialmente no se rellena el formulario
    if (usuario.rol === "organizador") {
      rellenaFormulario = true;
    }
    res.render("resolutions/form", {
      datos: null,
      cssFile: "form.css",
      usuario,
      rellenaFormulario,
    });
  },

  // Procesar formulario
  procesarFormulario: async (req, res) => {
    const {
      fecha,
      expediente,
      curso,
      cohorte,
      titulo_docente,
      sexo_docente,
      docente,
      alumnos,
      objetivos,
      segundos_objetivos,
      clases_numero,
      horas_clase_numero,
      minimo,
      maximo,
      mes_curso,
      año_curso,
      numero_resolucion,
      resolucion_interes_departamental,
      accion
    } = req.body;

    const usuario = req.session.user;

    const horas_totales_numero =
      parseInt(clases_numero) * parseInt(horas_clase_numero); //se usa parseInt porque
    const horasTotalesTexto = formatNumber(horas_totales_numero);

    const clasesTexto = formatNumber(clases_numero);
    const horasClaseTexto = formatNumber(horas_clase_numero);

    const articulo_docente = sexo_docente === "femenino" ? "la" : "el";

    const articulo_organizador =
      usuario.sexo_organizador === "femenino" ? "la" : "el";

    const genero_docente = sexo_docente === "femenino" ? "de la" : "del";

    console.log(horasClaseTexto);

    try {
      // Crear la resolución en la base de datos
      const nueva = await Resolucion.create({
        id_usuarios: req.session.user.id_usuarios, // Asegúrate de que el ID del usuario esté en la sesión
        fecha: fecha || null,
        expediente,
        curso,
        cohorte,
        sexo_docente: sexo_docente,
        genero_docente: genero_docente,
        titulo_docente,
        docente,
        alumnos,
        objetivos,
        segundos_objetivos,
        horas_totales_numero,
        clases_numero,
        horas_clase_numero,
        horas_totales_texto: horasTotalesTexto,
        clases_texto: clasesTexto,
        horas_clase_texto: horasClaseTexto,
        minimo,
        maximo,
        mes_curso,
        año_curso,
        numero_resolucion: numero_resolucion || null,
        resolucion_interes_departamental,
        estado: "guardado",
        fecha_creacion: new Date(), // Fecha de creación
        fecha_cambio_estado: new Date(), // Se registra la fecha del guardado
        titulo_organizador: usuario.titulo_organizador,
        articulo_docente: articulo_docente,
        articulo_organizador: articulo_organizador,
        // Asegúrate de que este campo esté en el formulario
      });
      console.log("procesarFormulario", nueva.fecha);

      // Si la acción es 'guardar', responde con JSON
      if (accion === "guardar") {
        console.log("dentro del guardar", nueva.id_resoluciones);
        return res.json({
          success: true,
          message: "Resolución guardada con éxito",
          redirectTo: `/resoluciones/${nueva.id_resoluciones}`, // El cliente maneja la redirección
          id: nueva.id_resoluciones,
        });
      }
      //BUG Nunca va a entrar acá abajo porque la acción generar-PDF entra por otro controlador
      // Si la acción es generar PDF, continúa:
    } catch (error) {
      console.error("Error en el controlador:", error);
      res.status(500).json({
        success: false,
        message: "Ocurrió un error al procesar el formulario.",
      });
    }
  },

  generarPDF1: async (req, res) => {
    try {
      console.log("dentro de generar pdf");
      const id = req.params.id;
      const resolucion = await Resolucion.findByPk(id, {
        include: [
          {
            model: Usuario,
            as: "autor",
            attributes: ["id_usuarios", "nombre", "apellido", "sexo_organizador", "titulo_organizador"], // Campos específicos
          },
        ],
      });
      //TODO traer el nombre y apellido del autor de la resolucion
      if (!resolucion)
        return res.status(404).json({
          success: false,
          message: "Resolución no encontrada",
        });

     
      const articulo_organizador =
        resolucion.autor.sexo_organizador === "femenino" ? "la" : "el";
      const plantillaPath = path.join(__dirname, "../plantilla.txt");
      let plantilla = fs.readFileSync(plantillaPath, "utf-8");
      // .replace(/\r/g, "");
      console.log("generarPDF", resolucion.fecha);
      console.log(articulo_organizador);
      // Reemplazo múltiple
      const campos = {
        nombre_organizador: resolucion.autor.nombre,
        apellido_organizador: resolucion.autor.apellido,
        expediente: resolucion.expediente,
        curso: resolucion.curso,
        cohorte: resolucion.cohorte,
        titulo_docente: resolucion.titulo_docente,
        genero_docente: resolucion.genero_docente,
        docente: resolucion.docente,
        alumnos: resolucion.alumnos,
        objetivos: resolucion.objetivos,
        segundos_objetivos: resolucion.segundos_objetivos,
        horas_totales_texto: resolucion.horas_totales_texto,
        clases_texto: resolucion.clases_texto,
        horas_clase_texto: resolucion.horas_clase_texto,
        minimo: resolucion.minimo,
        maximo: resolucion.maximo,
        mes_curso: resolucion.mes_curso,
        año_curso: resolucion.año_curso,
        fecha: formatearConDateFns(resolucion.fecha) || "", // Usamos la función para formatear la fecha
        numero_resolucion: resolucion.numero_resolucion || "",
        resolucion_interes_departamental:
          resolucion.resolucion_interes_departamental,
        titulo_organizador: resolucion.autor.titulo_organizador || "titulo",
        articulo_docente: resolucion.articulo_docente || "el",
        articulo_organizador: articulo_organizador,
      };
      console.log("campos: ", campos);
      const textoFinal = renderTemplate(plantilla, campos);

      const doc = new PDFDocument({
        margins: {
          top: 42.52, // 1.5 cm
          left: 113, // 3 cm
          right: 42.52, // 1.5 cm
          bottom: 70.88, // 2.5 cm
        },
      });

      const filePath1 = path.join(__dirname, "..", "archivo-de-pruebas.txt");

      fs.writeFile(filePath1, "Esto es una prueba", (err) => {
        if (err) {
          console.error("Error al crear el archivo:", err);
          return res.status(500).json({ error: "Error al crear archivo" });
        }
        //  res.status(200).json({ mensaje: "Archivo creado correctamente" });
      });
      console.log("filePath1: ", filePath1);

      const fileName = `resolucion-${resolucion.id_resoluciones}.pdf`;
      const filePath = path.join(__dirname, `../public/pdfs/${fileName}`);
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // textoFinal.split('\n').forEach(line => {
      //   processTemplateLine(doc, line);
      //   doc.moveDown(0.5);
      // });
      dibujarEncabezado(doc, resolucion.numero_resolucion, campos.fecha);

      doc.on("pageAdded", () => {
        dibujarEncabezado(doc, resolucion.numero_resolucion, resolucion.fecha);
        doc.text("", { continued: false }); //Es para evitar que el inicio de la nueva página se comporte raro
        doc.font("Times-Roman").fontSize(12);
      });

      textoFinal.split("\n").forEach((line) => {
        line = line.replace(/\r/g, "").trimEnd(); // Limpia cualquier basura invisible importante para que no salgan caracteres extraños en saltos de linea
        processTemplateLine(doc, line);
        doc.moveDown(0.5);
      });

      doc.end();

      stream.on("finish", () => {
        console.log("PDF terminado, iniciando descarga...");
        res.json({ pdfUrl: `../pdfs/${fileName}`, fileName });
        // res.download(filePath, (err) => {
        //   if (err) {
        //     console.error("Error al enviar el archivo:", err);
        //   } else {
        //     console.log("Descarga enviada correctamente.");
        // fs.unlinkSync(filePath);
        // }
        // });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al generar el PDF");
    }
  },
  generarPDF: async (req, res) => {
  try {
    console.log("dentro de generar pdf");
    const id = req.params.id;
    const resolucion = await Resolucion.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: "autor",
          attributes: ["id_usuarios", "nombre", "apellido", "sexo_organizador", "titulo_organizador"],
        },
      ],
    });

    if (!resolucion)
      return res.status(404).json({
        success: false,
        message: "Resolución no encontrada",
      });

    const articulo_organizador = resolucion.autor.sexo_organizador === "femenino" ? "la" : "el";
    const plantillaPath = path.join(__dirname, "../plantilla.txt");
    let plantilla = fs.readFileSync(plantillaPath, "utf-8");

    console.log("generarPDF", resolucion.fecha);
    console.log(articulo_organizador);

    const campos = {
      nombre_organizador: resolucion.autor.nombre,
      apellido_organizador: resolucion.autor.apellido,
      expediente: resolucion.expediente,
      curso: resolucion.curso,
      cohorte: resolucion.cohorte,
      titulo_docente: resolucion.titulo_docente,
      genero_docente: resolucion.genero_docente,
      docente: resolucion.docente,
      alumnos: resolucion.alumnos,
      objetivos: resolucion.objetivos,
      segundos_objetivos: resolucion.segundos_objetivos,
      horas_totales_texto: resolucion.horas_totales_texto,
      clases_texto: resolucion.clases_texto,
      horas_clase_texto: resolucion.horas_clase_texto,
      minimo: resolucion.minimo,
      maximo: resolucion.maximo,
      mes_curso: resolucion.mes_curso,
      año_curso: resolucion.año_curso,
      fecha: formatearConDateFns(resolucion.fecha) || "",
      numero_resolucion: resolucion.numero_resolucion || "",
      resolucion_interes_departamental: resolucion.resolucion_interes_departamental,
      titulo_organizador: resolucion.autor.titulo_organizador || "titulo",
      articulo_docente: resolucion.articulo_docente || "el",
      articulo_organizador: articulo_organizador,
    };

    console.log("campos: ", campos);
    const textoFinal = renderTemplate(plantilla, campos);

    const doc = new PDFDocument({
      margins: {
        top: 42.52,
        left: 113,
        right: 42.52,
        bottom: 70.88,
      },
    });

    // ✅ CORRECCIÓN: Definir pdfChunks ANTES de usarlo
    const pdfChunks = [];
    
    // Capturar los datos del PDF
    doc.on('data', (chunk) => pdfChunks.push(chunk));

    // Dibujar contenido del PDF
    dibujarEncabezado(doc, resolucion.numero_resolucion, campos.fecha);

    doc.on("pageAdded", () => {
      dibujarEncabezado(doc, resolucion.numero_resolucion, resolucion.fecha);
      doc.text("", { continued: false });
      doc.font("Times-Roman").fontSize(12);
    });

    textoFinal.split("\n").forEach((line) => {
      line = line.replace(/\r/g, "").trimEnd();
      processTemplateLine(doc, line);
      doc.moveDown(0.5);
    });

    doc.end();

    // ✅ CORRECCIÓN: Esperar a que termine el PDF
    doc.on('end', async () => {
      try {
        // Ahora pdfChunks está definido
        const pdfBuffer = Buffer.concat(pdfChunks);
        const fileName = `resolucion-${resolucion.id_resoluciones}.pdf`;
        
        // Subir a Cloudflare R2
        const uploadParams = {
          Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
          Key: fileName,
          Body: pdfBuffer,
          ContentType: 'application/pdf',
        };

        await s3Client.send(new PutObjectCommand(uploadParams));
        
        console.log("PDF subido a Cloudflare R2 correctamente");
        
        // Retornar URL pública del PDF
        const publicUrl = `${process.env.CLOUDFLARE_PUBLIC_URL}/${fileName}`;  
        req.flash('success_msg', 'PDF generado y subido correctamente');
        
        res.json({ 
          success: true,
          pdfUrl: publicUrl, 
          fileName 
        });
        
      } catch (uploadError) {
        console.error("Error al subir a Cloudflare R2:", uploadError);
        req.flash('error_msg', 'Error al guardar el PDF en la nube');
        res.redirect('/resoluciones/form-resolucion');
      }
    });

  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al generar el PDF');
    res.redirect('/resoluciones/form-resolucion');
  }
},
  // Mostrar + ya guardados (para edición o generación posterior)
  mostrarResolucion: async (req, res) => {
    const usuario = req.session.user;
    let rellenaFormulario = false; // Inicialmente no se rellena el formulario
    if (usuario.rol === "organizador") {
      rellenaFormulario = true;
    }
    const resolucion = await Resolucion.findByPk(req.params.id);
    if (!resolucion) {
      req.flash('error_msg', 'Resolución no encontrada');
      return res.redirect('/resoluciones/form-resolucion');
    }
    res.render("resolutions/form", {
      datos: resolucion,
      cssFile: "form.css",
      usuario,
      rellenaFormulario,
    });
  },

  actualizarResolucion: async (req, res) => {
    const {
      expediente,
      curso,
      cohorte,
      sexo_docente,
      titulo_docente,
      docente,
      alumnos,
      objetivos,
      segundos_objetivos,
      clases_numero,
      horas_clase_numero,
      minimo,
      maximo,
      mes_curso,
      año_curso,
      fecha,
      numero_resolucion,
      accion,
      resolucion_interes_departamental,
    } = req.body;
    const usuario = req.session.user;
    const id = req.params.id;
    const resolucion = await Resolucion.findByPk(id,  {
  include: [{
    model: Usuario,
    as: 'autor',
    attributes: ['id_usuarios', 'nombre', 'email', 'sexo_organizador', 'titulo_organizador'] // Campos específicos
  }]
});
    const horas_totales_numero =
      parseInt(clases_numero) * parseInt(horas_clase_numero); //se usa parseInt porque
    const horasTotalesTexto = formatNumber(horas_totales_numero);
    const clasesTexto = formatNumber(clases_numero);
    const horasClaseTexto = formatNumber(horas_clase_numero);
    const articulo_organizador =
      resolucion.autor.sexo_organizador === "femenino" ? "la" : "el";
    if (!resolucion)
      return res.status(404).json({
        success: false,
        message: "Resolución no encontrada",
      });
    const genero_docente = sexo_docente === "femenino" ? "de la" : "del";
    // Actualizar los datos
    resolucion.expediente = expediente;
    resolucion.curso = curso;
    resolucion.cohorte = cohorte;
    resolucion.titulo_docente = titulo_docente;
    resolucion.sexo_docente = sexo_docente;
    resolucion.genero_docente = genero_docente;
    resolucion.docente = docente;
    resolucion.alumnos = alumnos;
    resolucion.objetivos = objetivos;
    resolucion.segundos_objetivos = segundos_objetivos;
    resolucion.horas_totales_texto = horasTotalesTexto.trim();
    resolucion.clases_texto = clasesTexto.trim();
    resolucion.horas_clase_texto = horasClaseTexto.trim();
    resolucion.minimo = minimo;
    resolucion.maximo = maximo;
    resolucion.mes_curso = mes_curso;
    resolucion.año_curso = año_curso;
    resolucion.fecha = fecha || null;
    resolucion.numero_resolucion = numero_resolucion || null;
    resolucion.resolucion_interes_departamental =
      resolucion_interes_departamental;
    resolucion.estado = "guardado";
    resolucion.fecha_cambio_estado = new Date(); // Se registra la fecha del guardado
    resolucion.titulo_organizador = resolucion.autor.titulo_organizador || "titulo"; // Asegúrate de que este campo esté en el formulario
    resolucion.articulo_organizador = articulo_organizador;

    if (resolucion.changed()) {
      console.log("entró al changed");
      await resolucion.save();
    }
    // await resolucion.save();

    if (accion === "guardar") {
      // return res.send("Plantilla actualizada correctamente.");
      //Acá se cambia el estado a guardado

      return res.json({
        success: true,
        message: "Plantilla actualizada correctamente.",
        id: resolucion.id_resoluciones,
      });
    } else if (accion === "generar_pdf") {
      console.log("dentro de generar pdf (actualizarResolucion controller)");
      const plantillaPath = path.join(__dirname, "../plantilla.txt");
      let plantilla = fs.readFileSync(plantillaPath, "utf-8");
      // .replace(/\r/g, "");
      console.log("Datos antes de const campos: ", numero_resolucion, fecha);
      // Reemplazo múltiple
      const campos = {
        expediente: resolucion.expediente,
        curso: resolucion.curso,
        cohorte: resolucion.cohorte,
        titulo_docente: resolucion.titulo_docente,
        genero_docente: resolucion.genero_docente,
        docente: resolucion.docente,
        alumnos: resolucion.alumnos,
        objetivos: resolucion.objetivos,
        segundos_objetivos: resolucion.segundos_objetivos,
        horas_totales_texto: resolucion.horas_totales_texto,
        clases_texto: resolucion.clases_texto,
        horas_clase_texto: resolucion.horas_clase_texto,
        minimo: resolucion.minimo,
        maximo: resolucion.maximo,
        mes_curso: resolucion.mes_curso,
        fecha: resolucion.fecha || "",
        numero_resolucion: resolucion.numero_resolucion || "",
        resolucion_interes_departamental:
          resolucion.resolucion_interes_departamental,
        titulo_organizador: resolucion.titulo_organizador || "titulo",
      };
      console.log("Datos despues de const campos: ", numero_resolucion, fecha);
      console.log(
        "Datos resolucion despues de const campos: ",
        resolucion.numero_resolucion,
        resolucion.fecha
      );
      console.log("campos: ", campos);
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
      dibujarEncabezado(doc, resolucion.numero_resolucion, resolucion.fecha);

      doc.on("pageAdded", () => {
        dibujarEncabezado(doc, resolucion.numero_resolucion, resolucion.fecha);
        doc.text("", { continued: false }); //Es para evitar que el inicio de la nueva página se comporte raro
        doc.font("Times-Roman").fontSize(12);
      });

      textoFinal.split("\n").forEach((line) => {
        line = line.replace(/\r/g, "").trimEnd(); // Limpia cualquier basura invisible importante para que no salgan caracteres extraños en saltos de linea
        processTemplateLine(doc, line);
        doc.moveDown(0.5);
      });

      doc.end();

      stream.on("finish", () => {
        console.log("PDF terminado");
        // OPCIÓN 1: Devolver JSON con la URL del archivo
        return res.json({
          success: true,
          message: "PDF generado correctamente.",
          pdfUrl: `/pdfs/${fileName}`, // Asegúrate de que esta ruta sea accesible desde el cliente
        });
      });
    }
  },
  listarResoluciones: async (req, res) => {
    const usuario = req.session.user;
    let rellenaFormulario = false; // Inicialmente no se rellena el formulario
    if (usuario.rol === "organizador") {
      rellenaFormulario = true;
    }
    try {
      const resoluciones = await Resolucion.findAll({
        include: [
          {
            model: Usuario,
            as: "autor", // Asegúrate de que el alias coincida con tu modelo
            attributes: ["nombre", "apellido", "telefono", "email"],
          },
        ],
        order: [["fecha_creacion", "DESC"]],
      });

      console.log("esto sale despues del try y antes del res render");
      res.render("resolutions/lista", {
        resoluciones,
        cssFile: "lista.css",
        mensaje: null,
        error: null,
        usuario: req.session.user,
        rellenaFormulario,
      }); //cssFile debe ser igual a lista.css
      console.log("esto sale despues del res render");

      // res.redirect('/resoluciones/lista');
    } catch (error) {
      req.flash('error_msg', 'Error al obtener las resoluciones');
      console.error("Error al obtener las resoluciones:", error);
      res.redirect('/resoluciones/form-resolucion');
    }
  },
  eliminarResolucion: async (req, res) => {
    try {
      const id_resoluciones = req.params.id;
      await Resolucion.destroy({ where: { id_resoluciones } });
      res.redirect("lista-resoluciones");
    } catch (error) {
      console.error("Error completo:", error);
      console.error("Nombre del error:", error.name);
      console.error("Mensaje:", error.message);
      console.error("SQL:", error.sql);
      res.status(500).send("Error: " + error.message);
      res.status(500).send("Error al eliminar la resolución");
    }
  },

  verBorrador: async (req, res) => {
    try {
      
      const id = req.params.id;
      console.log("El id es:", id);

      const resolucion = await Resolucion.findByPk(id, {
        include: [
          {
            model: Usuario,
            as: "autor",
            attributes: ["id_usuarios", "nombre", "apellido", "sexo_organizador", "titulo_organizador"], // Campos específicos
          },
        ],
      });

      if (!resolucion) {
        return res.status(404).json({
          success: false,
          message: "Resolución no encontrada",
        });
      }
      const horas_totales_numero =
        parseInt(resolucion.clases_numero) *
        parseInt(resolucion.horas_clase_numero); //se usa parseInt porque
      const horasTotalesTexto = formatNumber(horas_totales_numero);
      const clasesTexto = formatNumber(resolucion.clases_numero);
      const horasClaseTexto = formatNumber(resolucion.horas_clase_numero);
      const articulo_organizador =
        resolucion.autor.sexo_organizador === "femenino" ? "la" : "el";
      // Validar sesión
      if (!req.session.user) {
        return res.status(401).send("Sesión expirada o no autenticada");
      }

      const plantillaPath = path.join(__dirname, "../plantilla.txt");
      const plantilla = fs.readFileSync(plantillaPath, "utf-8");

      const campos = {
        nombre_organizador: resolucion.autor.nombre,
        apellido_organizador: resolucion.autor.apellido,
        expediente: resolucion.expediente,
        curso: resolucion.curso,
        cohorte: resolucion.cohorte,
        genero_docente: resolucion.genero_docente,
        titulo_docente: resolucion.titulo_docente,
        docente: resolucion.docente,
        alumnos: resolucion.alumnos,
        objetivos: resolucion.objetivos,
        segundos_objetivos: resolucion.segundos_objetivos,
        horas_totales_texto: horasTotalesTexto,
        clases_texto: clasesTexto,
        horas_clase_texto: horasClaseTexto,
        minimo: resolucion.minimo,
        maximo: resolucion.maximo,
        mes_curso: resolucion.mes_curso,
        año_curso: resolucion.año_curso,
        articulo_docente: resolucion.articulo_docente,
        fecha: resolucion.fecha || "N/A",
        numero_resolucion: resolucion.numero_resolucion || "N/A",
        resolucion_interes_departamental:
          resolucion.resolucion_interes_departamental,
        titulo_organizador: resolucion.titulo_organizador,
        articulo_organizador: articulo_organizador,
      };

      const textoFinal = renderTemplate(plantilla, campos);

      // Guardar antes de enviar el PDF

      await resolucion.save();

      const doc = new PDFDocument({
        margins: {
          top: 42.52,
          left: 113,
          right: 42.52,
          bottom: 70.88,
        },
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="resolucion-${resolucion.id}.pdf"`
      );

      doc.pipe(res);

      dibujarEncabezado(doc, resolucion.numero_resolucion, resolucion.fecha);

      doc.on("pageAdded", () => {
        dibujarEncabezado(doc, resolucion.numero_resolucion, resolucion.fecha);
        doc.text("", { continued: false });
        doc.font("Times-Roman").fontSize(12);
      });

      textoFinal.split("\n").forEach((line) => {
        line = line.replace(/\r/g, "").trimEnd();
        processTemplateLine(doc, line);
        doc.moveDown(0.5);
      });

      doc.end();
    } catch (error) {
      console.error("Error general:", error);
      if (!res.headersSent) {
        res.status(500).send("Error al procesar la solicitud");
      }
    }
  },

  enviarResolucion: async (req, res) => {
    // await this.actualizarResolucion(req, res);
    console.log("en el controller enviarResolucion");
    const { id } = req.params;
    const { estado } = req.body;
    console.log("id de parametros:id", id);
    console.log("estado recibido:", estado);

    try {
      const resultado = await Resolucion.update(
        { estado, fecha_cambio_estado: new Date() }, // Actualiza el estado y la fecha de cambio
        { where: { id_resoluciones: id } }
      );

      if (resultado[0] === 0) {
        return res.status(404).json({ message: "Resolución no encontrada" });
      }
      console.log("Resultado update:", resultado);

      res.json({ success: true, message: `Resolución enviada con éxito` });
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar el estado" });
    }
  },
  estadoFormulario1: async (req, res) => {
    const id = req.params.id;
    const resolucion = await Resolucion.findByPk(id);
    if (!resolucion)
      return res.status(404).json({
        success: false,
        message: "Resolución no encontrada",
      });

    res.json({
      estado: resolucion.estado, // "nuevo", "guardado", "emitido"
    });
  },
  obtenerEstadoFormulario: async (req, res) => {
    try {
      const { id } = req.params;

      const resolucion = await Resolucion.findOne({
        where: { id_resoluciones: id }, // usás 'id_resoluciones', no 'id'
        attributes: ["estado"],
      });

      if (!resolucion) {
        return res.status(404).json({ error: "Resolución no encontrada" });
      }

      // res.json(resolucion); // Devuelve { estado: "...", visto_pdf: true/false }
      res.json({
        estado: resolucion.estado, // "nuevo", "guardado", "emitido"
      });
    } catch (error) {
      console.error("Error al obtener estado de la resolución:", error);
      res
        .status(500)
        .json({ error: "Error al obtener estado de la resolución" });
    }
  },
  actualizarEstadoFormulario: async (req, res) => {
    try {
      const { id } = req.params;

      await Resolucion.update(
        {
          estado: "modificado",

          fecha_cambio_estado: new Date(), // Actualiza la fecha de cambio de estado
        },
        {
          where: { id_resoluciones: id },
        }
      );

      res.sendStatus(204); // OK, sin contenido
    } catch (error) {
      console.error("Error al marcar como modificado:", error);
      res.status(500).json({ error: "Error al actualizar estado" });
    }
  },
  emitirFormulario: async (req, res) => {
    try {
      const { id } = req.params;
      const { fecha, numero_resolucion, expediente, resolucion_interes_departamental } = req.body;

      await Resolucion.update(
        {
          fecha,
          numero_resolucion,
          estado: "emitido",
          fecha_cambio_estado: new Date(), // Actualiza la fecha de cambio de estado
          expediente,
          resolucion_interes_departamental
          
        },
        {
          where: { id_resoluciones: id },
        }
      );

      res.json({
        success: true,
        message: "Resolución emitida con éxito",
        id: id,
      });
    } catch (error) {
      console.error("Error al marcar como modificado:", error);
      res.status(500).json({ error: "Error al actualizar estado" });
    }
  },
  rechazarResolucion: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado, motivo } = req.body;

      console.log("id de parametros:id", id);
      console.log("estado recibido:", estado);

      await Resolucion.update(
        {
          estado: "rechazado",
          fecha_cambio_estado: new Date(),
          motivo_rechazo: motivo || null,
        },
        {
          where: { id_resoluciones: id },
        }
      );

      res.json({
        success: true,
        message: "Resolución rechazada con éxito",
        id: id,
      });
    } catch (error) {
      console.error("Error al rechazar la resolución:", error);
      res.status(500).json({ error: "Error al rechazar la resolución" });
    }
  },
  actualizarBorrador: async (req, res) => {
    try {
      const { id } = req.params;
      const { expediente, resolucion_interes_departamental, fecha, numero_resolucion } = req.body;

      console.log("id de parametros:id", id);
     

      await Resolucion.update(
        {
          expediente,
          resolucion_interes_departamental,
          fecha, 
          numero_resolucion
        },
        {
          where: { id_resoluciones: id },
        }
      );

      res.json({
        success: true,
        message: "Borrador actualizado con éxito",
        id: id,
      });
    } catch (error) {
      console.error("Error al actualizar borrador:", error);
      res.status(500).json({ error: "Error al actualizar el borrador de la resolución" });
    }
  },
};
