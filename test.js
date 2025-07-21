const express = require('express');
const PDFDocument = require('pdfkit');

const app = express();

// Ruta simple para probar PDF
app.get('/test-pdf', (req, res) => {
  console.log('Generando PDF de prueba...');
  
  const doc = new PDFDocument();
  
  // Headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="test.pdf"');
  
  // Pipe directo
  doc.pipe(res);
  
  // Contenido mínimo
  doc.fontSize(20).text('Hola mundo!', 100, 100);
  doc.text('Este es un test simple', 100, 150);
  
  // Finalizar
  doc.end();
  
  console.log('PDF enviado');
});

// Servidor
app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
  console.log('Prueba: http://localhost:3000/test-pdf');
});