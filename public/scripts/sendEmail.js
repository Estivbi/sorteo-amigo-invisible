import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
})

export async function sendEmail(to, subject, body) {
  const mailOptions = {
    from: process.env.GMAIL_FROM,
    to,
    subject,
    text: body,
    replyTo: process.env.GMAIL_REPLYTO,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log("Email enviado:", info.response)
    return info
  } catch (error) {
    console.error("Error enviando email:", error)
    if (error && error.response) {
      console.error("Respuesta SMTP:", error.response)
    }
    if (error && error.stack) {
      console.error("Stack:", error.stack)
    }
    throw error
  }
}

// funcion para envar multiples correos
export async function sendBulkEmails(emailsData) {
  const promises = emailsData.map(({ to, subject, body }) =>
    sendEmail(to, subject, body).catch(error => ({
      error: true,
      to,
      message: error.message
    }))
  )
  return await Promise.all(promises)
}

// cerramos el transporter al finalizar la aplicacion
export function closeTransporter() {
  transporter.close()
}