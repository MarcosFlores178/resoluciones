// Reemplaza el require de nodemailer por el de Brevo
const brevo = require('@getbrevo/brevo');
// Configura la API Key globalmente
const defaultClient = brevo.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY; // Tu nueva variable de entorno

async function enviarEmailTemporal(email, passwordTemporal) {
  // Crea una instancia de la API de correos transaccionales
  const apiInstance = new brevo.TransactionalEmailsApi();
  const sendSmtpEmail = new brevo.SendSmtpEmail(); // Este es el objeto para construir el email

  // Configura el contenido del correo
  sendSmtpEmail.subject = "Acceso al sistema";
  sendSmtpEmail.htmlContent = `
    <p>Te damos acceso al sistema. Tu contraseña temporal es:</p>
    <p><b>${passwordTemporal}</b></p>
    <p>Ingresá a <a href="http://127.0.0.1:3000/auth/login">este enlace</a> para acceder y completar tu perfil.</p>
  `;
  sendSmtpEmail.sender = { "name": "Marcos Fabian Flores", "email": "marcosfabianflores@gmail.com" };
  sendSmtpEmail.to = [{ "email": email }];
  // Opcional: Configura un parámetro de respuesta
  sendSmtpEmail.replyTo = { "email": "marcosfabianflores@gmail.com", "name": "Marcos Fabian Flores" };

  try {
    // Envía el correo usando la API HTTP de Brevo
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Correo enviado correctamente. ID: ', data.messageId);
  } catch (error) {
    console.error('Error al enviar el correo: ', error);
  }
}

module.exports = enviarEmailTemporal;