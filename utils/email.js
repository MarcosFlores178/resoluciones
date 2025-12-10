const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");

// Configurar MailerSend
const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

const sentFrom = new Sender("marcosflores@test-68zxl270p2m4j905.mlsender.net", "Marcos Fabian Flores");

async function enviarEmailTemporal(email, passwordTemporal) {
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
      .setSubject("Acceso al sistema")
      .setHtml(`
        <p>Te damos acceso al sistema. Tu contraseña temporal es:</p>
        <p style="font-size: 18px; font-weight: bold; color: #2563eb;">${passwordTemporal}</p>
        <p>Ingresá a <a href="https://resoluciones-production.up.railway.app/auth/login">este enlace</a> para acceder y completar tu perfil.</p>
        <br>
        <p><small>Este es un mensaje automático, por favor no respondas a este correo.</small></p>
      `)
      .setText(`
        Te damos acceso al sistema. Tu contraseña temporal es: ${passwordTemporal}
        
        Ingresá a https://resoluciones-production.up.railway.app/auth/login para acceder y completar tu perfil.
        
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

module.exports = enviarEmailTemporal;