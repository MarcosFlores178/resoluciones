const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");

// Configurar MailerSend
const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

const sentFrom = new Sender("marcosflores@test-68zxl270p2m4j905.mlsender.net", "Marcos Fabian Flores");

async function enviarEmailRecuperacion(email, codigoTemporal) {
  try {
    // Crear recipiente
    const recipients = [
      new Recipient(email, "") // El segundo parámetro es el nombre (opcional)
    ];

    // Configurar el email
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject("Código de recuperación de password")
      .setHtml(`
        <p>Te enviamos el código temporal para recuperar tu contraseña. Tu código temporal es:</p>
        <p style="font-size: 18px; font-weight: bold; color: #2563eb;">${codigoTemporal}</p>
        <p>Ingresá este código para poder seguír el proceso de recuperación de password.</p>
        <br>
        <p><small>Este es un mensaje automático, por favor no respondas a este correo.</small></p>
      `)
      .setText(`
        Te enviamos el código temporal para recuperar tu contraseña. Tu código temporal es: ${codigoTemporal}
        
        Ingresá este código para poder seguír el proceso de recuperación de password.
        
        Este es un mensaje automático, por favor no respondas a este correo.
      `);

    // Enviar el email
    const response = await mailerSend.email.send(emailParams);
    console.log('✅ Email enviado correctamente');
    return response;
    
  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    throw error;
  }
}

module.exports = enviarEmailRecuperacion;