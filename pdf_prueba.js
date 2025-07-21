const fs = require("fs");
const PDFDocument = require("pdfkit");

const doc = new PDFDocument();
const writeStream = fs.createWriteStream("test-output.pdf");
doc.pipe(writeStream);

doc.fontSize(16).text("Prueba de PDFKit desde Node.js", { align: "center" });
doc.moveDown();
doc.fontSize(12).text("Este documento fue generado localmente.");

doc.end();

writeStream.on("finish", () => {
  console.log("PDF generado correctamente: test-output.pdf");
});
