require('dotenv').config();
const nodemailer = require('nodemailer');

async function enviarEmailTemporal(email, passwordTemporal) {
  await transporter.sendMail({
    from: '"Marcos Fabian Flores" <marcosfabianflores@gmail.com>',
    to: email,
    subject: 'Acceso al sistema',
    html: `
      <p>Te damos acceso al sistema. Tu contraseña temporal es:</p>
      <p><b>${passwordTemporal}</b></p>
      <p>Ingresá a <a href="http://127.0.0.1:3000/auth/login">este enlace</a> para acceder y completar tu perfil.</p>
    `
  });
}
const transporter = nodemailer.createTransport({
  // host: 'smtp.tusitio.com',
  // port: 587,
  service: 'gmail',
  //secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
}); 
transporter.verify((error, success) => {
  if (error) {
    console.error('Error al verificar el transportador:', error);
  } else {
    console.log('Transportador listo para enviar correos electrónicos');
  }
});
module.exports = enviarEmailTemporal;