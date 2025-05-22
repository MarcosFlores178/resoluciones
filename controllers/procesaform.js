// procesarFormulario: async (req, res) => {
//     const { nombre, asignatura, fecha, numero_resolucion, accion } = req.body;

//     
//     const nueva = await Resolucion.create({
//       nombre,
//       asignatura,
//       fecha,
//       numero_resolucion: numero_resolucion || null,
//     });

//     if (accion === 'guardar') {
//       return res.send('Plantilla guardada correctamente.');
//     }

//     // Si se eligió generar PDF
//     const plantillaPath = path.join(__dirname, '../plantilla.txt');
//     const plantilla = fs.readFileSync(plantillaPath, 'utf8');
//     const textoFinal = renderTemplate(plantilla, {
//       nombre,
//       asignatura,
//       fecha,
//       numero_resolucion: numero_resolucion || '',
//     });

    
//     const doc = new PDFDocument({ margin: 80 });
//     // doc.registerFont('jasmine', '/Mega/diplomatura/JasmineUPCRegular/JasmineUPCRegular.ttf');
//     const fileName = `resolucion-${nueva.id}.pdf`;
//     const filePath = path.join(__dirname, `../pdfs/${fileName}`);

//     const stream = fs.createWriteStream(filePath);

//     doc.pipe(stream);
//     doc.font('Times-Roman').text(textoFinal);
//     doc.end();

//     doc.on('finish', () => {
//       res.download(filePath, () => {
//         fs.unlinkSync(filePath); // Borrar luego de enviar
//       });
//     });
   
//     res.redirect('/resoluciones/lista');}}