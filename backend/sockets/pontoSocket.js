// Socket.IO - Monitoramento em tempo real de funcionários online
const pool = require('../config/database');

/**
 * Inicializa os eventos do Socket.IO.
 * Emite a lista de funcionários online a cada 30 segundos.
 */
const inicializarSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id}`);

    // Enviar dados imediatamente ao conectar
    enviarFuncionariosOnline(socket);

    // Atualizar a cada 30 segundos para este cliente
    const intervalo = setInterval(() => {
      enviarFuncionariosOnline(socket);
    }, 30000);

    socket.on('disconnect', () => {
      clearInterval(intervalo);
      console.log(`🔌 Cliente desconectado: ${socket.id}`);
    });

    // Evento manual de atualização
    socket.on('solicitar-online', () => {
      enviarFuncionariosOnline(socket);
    });
  });
};

/**
 * Busca e emite lista de funcionários que estão trabalhando agora.
 */
const enviarFuncionariosOnline = async (socket) => {
  try {
    const hoje = new Date().toISOString().split('T')[0];

    const [registros] = await pool.query(`
      SELECT r.funcionario_id, r.tipo, r.data_hora,
        f.nome, d.nome AS departamento
      FROM registros r
      INNER JOIN funcionarios f ON f.id = r.funcionario_id
      INNER JOIN departamentos d ON d.id = f.departamento_id
      WHERE DATE(r.data_hora) = ?
      ORDER BY r.funcionario_id, r.data_hora ASC
    `, [hoje]);

    const funcionariosMap = {};
    for (const reg of registros) {
      if (!funcionariosMap[reg.funcionario_id]) {
        funcionariosMap[reg.funcionario_id] = {
          nome: reg.nome,
          departamento: reg.departamento,
          registros: []
        };
      }
      funcionariosMap[reg.funcionario_id].registros.push(reg);
    }

    const agora = new Date();
    const online = [];

    for (const [id, func] of Object.entries(funcionariosMap)) {
      const entradas = func.registros.filter(r => r.tipo === 'ENTRADA').length;
      const saidas = func.registros.filter(r => r.tipo === 'SAIDA').length;

      if (entradas > saidas) {
        const ultimaEntrada = func.registros.filter(r => r.tipo === 'ENTRADA').at(-1);
        const entradaTime = new Date(ultimaEntrada.data_hora);
        const diffMs = agora - entradaTime;
        const horas = Math.floor(diffMs / 3600000);
        const minutos = Math.floor((diffMs % 3600000) / 60000);

        online.push({
          funcionario_id: id,
          nome: func.nome,
          departamento: func.departamento,
          hora_entrada: entradaTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          tempo_trabalhado: `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`
        });
      }
    }

    socket.emit('funcionarios-online', online);
  } catch (err) {
    console.error('Erro ao buscar funcionários online:', err.message);
  }
};

/**
 * Emite atualização para TODOS os clientes conectados.
 * Chamado após cada registro de ponto.
 */
const emitirAtualizacaoGeral = async (io) => {
  // Reutilizar lógica acima para todos os sockets
  io.emit('atualizar-online');
};

module.exports = { inicializarSocket, emitirAtualizacaoGeral };
