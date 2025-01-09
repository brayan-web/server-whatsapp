const express = require("express");
require('dotenv').config();
const cors = require("cors");
const { Client } = require('whatsapp-web.js');
const socketIo = require('socket.io')
const qrcode = require('qrcode-terminal');
const client = new Client();
const app = express();

const server = app.listen(4000, () => {
  console.log(`Servidor corriendo en el puerto 4000`);
});


const io = socketIo(server, {
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
   credentials: true
})

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST'],
   credentials: true

}));


client.on('ready', () => {
  console.log('WhatsApp Client is ready!');
  io.emit('connected', '¡Conexión exitosa! El cliente de WhatsApp está listo.');
});


client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  io.emit('qr', qr)
});





client.initialize();


app.post('/send-message', async (req, res) => {
  try {
      const { phoneNumber, pdfLink } = req.body;

      if (!phoneNumber || !pdfLink) {
          return res.status(400).json({ error: 'Faltan parámetros' });
      }
        
    
    // Limpia el número de teléfono
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Obtén el ID del número primero
    const numberId = await client.getNumberId(cleanNumber);
    
    if (!numberId) {
      console.log('No se pudo obtener el ID del número');
      return res.status(400).json({ error: 'Número no válido o no registrado en WhatsApp' });
    }

    const message = `Aquí está tu comprobante: ${pdfLink}`;

    // Usa el ID obtenido para enviar el mensaje
    await client.sendMessage(numberId._serialized, message);
    
    console.log(`Mensaje enviado exitosamente a: ${cleanNumber}`);
    return res.status(200).json({ success: true, message: 'Comprobante enviado correctamente' });

       
  } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al enviar el mensaje' });
  }
});


app.get("/", (req, res) => {
    res.send("El servidor está corriendo correctamente.");
  });


  
  // const PORT = 4000;
  // app.listen(PORT, () => {
  //   console.log(`Servidor corriendo en el puerto ${PORT}`);
  // });