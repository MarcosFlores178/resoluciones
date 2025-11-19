// Reemplaza el require de nodemailer por el de Brevo
// const brevo = require('@getbrevo/brevo');
// import { SendSmtpEmail, TransactionalEmailsApi, 
// TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';
require('dotenv').config();
// const {SendSmtpEmail, TransactionalEmailsApi, TransactionalEmailsApiApiKeys} = require('@getbrevo/brevo');

const brevo = require('@getbrevo/brevo');
// let defaultClient = brevo.ApiClient.instance;

// let apiKey = defaultClient.authentications['api-key'];
// apiKey.apiKey = process.env.BREVO_API_KEY;

// let apiInstance = new brevo.TransactionalEmailsApi();
// let sendSmtpEmail = new brevo.SendSmtpEmail();

// Configura la API Key globalmente
// console.log(brevo.ApiClient);
// const defaultClient = brevo.ApiClient.instance;
// const defaultClient = new TransactionalEmailsApiApiKeys();
// defaultClient.setApiKey(
  //   TransactionalEmailsApiApiKeys.apiKey,
  //   process.env.BREVO_API_KEY ?? ''
  // );
  
  // defaultClient.apiKey.apiKey = process.env.BREVO_API_KEY;
  
  async function enviarEmailTemporal(email, passwordTemporal) {
  console.log("Objeto brevo:", brevo);
  console.log("Objeto brevo api client:", brevo.ApiClient);
    console.log("OBJETO TRANSACTIONAL:", TransactionalEmailsApiApiKeys);
  console.log("Dentro de email temporal");
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