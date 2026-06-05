// Controller de Registro de Ponto
// Identifica automaticamente se é ENTRADA ou SAÍDA com base no histórico do dia
const pool = require('../config/database');

/**
 * POST /api/ponto
 * Registra entrada ou saída de um funcionário pelo token único.
 * Alterna automaticamente: ENTRADA → SAÍDA → ENTRADA → SAÍDA
 */
const registrar = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token || token.trim() === '') {
      return res.status(400).json({ message: 'Token é obrigatório.' });
    }

    // Buscar funcionário pelo token
    const [funcionarios] = await pool.query(
      `SELECT f.id, f.nome, d.nome AS departamento
       FROM funcionarios f
       INNER JOIN departamentos d ON d.id = f.departamento_id
       WHERE f.token = ?`,
      [token.trim()]
    );

    if (funcionarios.length === 0) {
      return res.status(404).json({ message: 'Token inválido. Funcionário não encontrado.' });
    }

    const funcionario = funcionarios[0];

    // Buscar registros de hoje para determinar próximo tipo
    const hoje = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const [registrosHoje] = await pool.query(
      `SELECT tipo FROM registros
       WHERE funcionario_id = ? AND DATE(data_hora) = ?
       ORDER BY data_hora ASC`,
      [funcionario.id, hoje]
    );

    // Determina o tipo: par = ENTRADA, ímpar = SAÍDA
    const totalRegistros = registrosHoje.length;
    const tipo = totalRegistros % 2 === 0 ? 'ENTRADA' : 'SAIDA';

    // Inserir registro
    const agora = new Date();
    await pool.query(
      'INSERT INTO registros (funcionario_id, tipo, data_hora) VALUES (?, ?, ?)',
      [funcionario.id, tipo, agora]
    );

    // Formatar hora para exibição
    const horaFormatada = agora.toLocaleTimeString('pt-BR', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    return res.status(201).json({
      message: `${tipo} registrada com sucesso!`,
      funcionario: funcionario.nome,
      departamento: funcionario.departamento,
      tipo,
      hora: horaFormatada,
      data: agora.toLocaleDateString('pt-BR')
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/ponto/historico/:funcionario_id
 * Retorna histórico de registros de um funcionário.
 */
const historico = async (req, res, next) => {
  try {
    const { funcionario_id } = req.params;
    const { data_inicio, data_fim } = req.query;

    let query = `
      SELECT r.id, r.tipo, r.data_hora,
        f.nome AS funcionario_nome
      FROM registros r
      INNER JOIN funcionarios f ON f.id = r.funcionario_id
      WHERE r.funcionario_id = ?
    `;
    const params = [funcionario_id];

    if (data_inicio) {
      query += ' AND DATE(r.data_hora) >= ?';
      params.push(data_inicio);
    }
    if (data_fim) {
      query += ' AND DATE(r.data_hora) <= ?';
      params.push(data_fim);
    }

    query += ' ORDER BY r.data_hora DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

module.exports = { registrar, historico };
