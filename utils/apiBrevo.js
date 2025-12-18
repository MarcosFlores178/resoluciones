require('dotenv').config();

async function enviarEmailTemporal(email, passwordTemporal) {
    // 1. Obtener tu API Key de Brevo desde las variables de entorno de Railway
    const brevoApiKey = process.env.BREVO_API_KEY; // Ejemplo: 'xkeysib-xxxxxxxxxxxx...'

    // 2. Construir la petición HTTP para la API de Brevo
    const url = 'https://api.brevo.com/v3/smtp/email';
    const options = {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': brevoApiKey,
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            sender: {
                name: 'Sistema DACEFyN',
                email: 'marcosfabianflores@gmail.com' // REEMPLAZAR con un email VERIFICADO en Brevo
            },
            to: [{ email: email }],
            subject: 'Acceso al sistema de Resoluciones Internas del DACEFyN',
            htmlContent: `
                <p>Te damos acceso al sistema. Tu contraseña temporal es:</p>
                <p><strong>${passwordTemporal}</strong></p>
                <p>Ingresá a <a href="${process.env.FRONTEND_URL || 'http://127.0.0.1:3000'}/auth/login">este enlace</a> para acceder y completar tu perfil.</p>
            `
        })
    };

    // 3. Enviar la petición
    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Brevo API Error: ${JSON.stringify(data)}`);
        }

        console.log('✅ Correo enviado con éxito. ID:', data.messageId);
        return { success: true, messageId: data.messageId };
    } catch (error) {
        console.error('❌ Error al enviar el correo vía API:', error);
        throw new Error(`Error al enviar el correo: ${error.message}`);
    }
}

module.exports = enviarEmailTemporal;