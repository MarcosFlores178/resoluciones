require('dotenv').config();
const nodemailer = require('nodemailer');

 // 1. Crear el transportador con las credenciales SMTP de Brevo
    const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false, // Usar 'true' para el puerto 465
        auth: {
            user: process.env.BREVO_USER_ID, // Tu email con el que te registraste en Brevo
            pass: process.env.BREVO_SMTP_KEY // Tu clave SMTP (no la clave API v3)
        }
});

// 2. Verificar conexión (opcional pero recomendado)
// transporter.verify((error, success) => {
//   if (error) {
//     console.error('Error al verificar el transportador:', error);
//   } else {
//     console.log('Servidor de correo listo para enviar mensajes');
//   }
// });

// 3. Función para enviar email
async function enviarEmailTemporal(email, passwordTemporal) {
  try {
    const info = await transporter.sendMail({
      from: '"Sistema de Resoluciones Internas DACEFyN" <marcosfabianflores@gmail.com>',
      to: email,
      subject: 'Acceso al sistema de Resoluciones Internas del DACEFyN',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Bienvenido al Sistema de Resoluciones Internas</h2>
          <p>Se ha creado una cuenta para acceder al sistema.</p>
          <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p><strong>Contraseña temporal:</strong></p>
            <p style="font-size: 18px; font-weight: bold; color: #333;">${passwordTemporal}</p>
          </div>
          <p>Por seguridad, te recomendamos cambiar esta contraseña después de tu primer acceso.</p>
          <p>
            <a href="${process.env.FRONTEND_URL || 'http://127.0.0.1:3000'}/auth/login" 
               style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Ingresar al sistema
            </a>
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Este es un mensaje automático, por favor no responder.
          </p>
        </div>
      `,
      // Versión en texto plano para clientes de email simples
      text: `Bienvenido al Sistema de Resoluciones Internas DACEFyN.\n\nTu contraseña temporal es: ${passwordTemporal}\n\nAccede al sistema aquí: ${process.env.FRONTEND_URL || 'http://127.0.0.1:3000'}/auth/login\n\nEste es un mensaje automático, por favor no responder.`
    });

    console.log('Correo enviado con ID:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    throw new Error(`Error al enviar el correo: ${error.message}`);
  }
}

module.exports = enviarEmailTemporal;