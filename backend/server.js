// Servidor principal com Socket.IO
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = require('./app');
const { inicializarSocket } = require('./sockets/pontoSocket');

const PORT = process.env.PORT || 5000;

// Criar servidor HTTP para integrar com Socket.IO
const server = http.createServer(app);

// Inicializar Socket.IO no servidor
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Inicializar eventos do Socket.IO
inicializarSocket(io);

// Exportar io para uso nos controllers (ex: emitir após registro de ponto)
app.set('io', io);

// Iniciar servidor
server.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════╗');
  console.log('║  SISTEMA DE CONTROLE DE FREQUÊNCIA   ║');
  console.log('╠══════════════════════════════════════╣');
  console.log(`║  🚀 Servidor rodando na porta ${PORT}    ║`);
  console.log(`║  📡 Socket.IO ativo                  ║`);
  console.log(`║  🔑 Admin: adm@gmail.com / adm       ║`);
  console.log('╚══════════════════════════════════════╝');
  console.log('');
});
