import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()

export async function sendEmail(to, subject, body) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  })

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