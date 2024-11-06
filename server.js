// server.js
import http from 'http';
import url from 'url';
import { sendEmail } from './src/scripts/sendEmail.js';

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  console.log(`Solicitud recibida: ${req.method} ${parsedUrl.pathname}`);

  // Configuración de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && parsedUrl.pathname === '/oauth2callback') {
    const code = parsedUrl.query.code;
    if (code) {
      console.log('Código de autorización recibido:', code);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body>
            <h1>Autorización completada</h1>
            <p>Puedes cerrar esta ventana y volver a la aplicación.</p>
          </body>
        </html>
      `);
    } else {
      console.log('No se recibió código de autorización');
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('No se recibió código de autorización');
    }
    return;
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/send-email') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const { to, subject, body: emailBody } = JSON.parse(body);
        console.log(`Intentando enviar correo a ${to} con el asunto "${subject}"`);
        await sendEmail(to, subject, emailBody);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Correo enviado');
        console.log(`Correo enviado a ${to} con el asunto "${subject}"`);
      } catch (error) {
        console.error('Error al enviar el correo:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error al enviar el correo');
      }
    });
    return;
  }

  console.log('Ruta no encontrada:', parsedUrl.pathname);
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});